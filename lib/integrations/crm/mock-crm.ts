import {
  Customer,
  Meeting,
  IntegrationEvent,
} from "@/types";
import {
  ICRMAdapter,
  CRMCustomerRecord,
  CRMActivityRecord,
  CRMTaskRecord,
  CRMSyncPayload,
  CRMSyncResult,
  IntegrationSystemInfo,
} from "./crm-adapter";

/**
 * Mock Salesforce Financial Services Cloud Adapter
 * Realistic enterprise adapter generating deterministic CRM records, activities, and tasks.
 */
export class MockCRMAdapter implements ICRMAdapter {
  public systemInfo: IntegrationSystemInfo = {
    id: "salesforce_crm",
    name: "Salesforce Financial Services Cloud (FSC)",
    vendor: "Salesforce, Inc.",
    category: "crm",
    status: "MOCKED",
    description: "Enterprise mortgage CRM adapter managing leads, opportunities, activities, and tasks.",
    lastSyncTime: new Date().toISOString(),
    apiVersion: "v59.0 (REST/Bulk API)",
    endpoint: "https://darwix-mortgage-demo.my.salesforce.com/services/data/v59.0",
    isSimulated: true,
    requiresApproval: true,
  };

  private customerStore = new Map<string, CRMCustomerRecord>();
  private activityStore = new Map<string, CRMActivityRecord>();
  private taskStore = new Map<string, CRMTaskRecord[]>();
  private failureSimulated = false;

  constructor() {
    // Seed default John & Sarah customer record
    this.customerStore.set("cust_miller_001", {
      leadId: "CRM-LEAD-10482",
      contactId: "CRM-CON-94021",
      fullName: "John & Sarah Miller",
      email: "john.miller.demo@example.com",
      phone: "(555) 234-8901",
      stage: "Mortgage Discovery",
      owner: "Alex Vance (NMLS #1489201)",
      lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
    });
  }

  public setFailureSimulation(fail: boolean) {
    this.failureSimulated = fail;
  }

  public async findOrCreateCustomer(customer: Customer): Promise<CRMCustomerRecord> {
    const existing = this.customerStore.get(customer.id);
    if (existing) return existing;

    const leadId = customer.crmLeadId || `CRM-LEAD-${Math.floor(10000 + Math.random() * 89999)}`;
    const record: CRMCustomerRecord = {
      leadId,
      contactId: `CRM-CON-${Math.floor(10000 + Math.random() * 89999)}`,
      fullName: `${customer.primaryBorrower.firstName} ${customer.coBorrower ? `& ${customer.coBorrower.firstName} ` : ""}${customer.primaryBorrower.lastName}`,
      email: customer.primaryBorrower.email,
      phone: customer.primaryBorrower.phone,
      stage: "Mortgage Discovery",
      owner: customer.assignedLoanOfficerName,
      lastSyncedAt: new Date().toISOString(),
    };
    this.customerStore.set(customer.id, record);
    return record;
  }

  public async updateMeetingActivity(
    meeting: Meeting,
    customer: Customer,
    notes: string,
    nextAction: string,
    outcome = "Qualified / Needs Documentation"
  ): Promise<CRMActivityRecord> {
    const customerRecord = await this.findOrCreateCustomer(customer);
    const activityId = `CRM-ACT-${Math.floor(20000 + Math.random() * 79999)}`;

    const activity: CRMActivityRecord = {
      activityId,
      leadId: customerRecord.leadId,
      subject: `Mortgage Consultation — ${customerRecord.fullName}`,
      meetingType: meeting.meetingChannel === "video_call" ? "Video Consultation" : "In-Person Consultation",
      durationMinutes: 45,
      outcome,
      notes,
      nextAction,
      complianceFlagsCount: meeting.activeInterventions.filter((i) => i.severity === "high" || i.severity === "critical" || i.severity === "HIGH" || i.severity === "CRITICAL").length,
      createdDate: new Date().toISOString(),
    };

    this.activityStore.set(activityId, activity);
    customerRecord.lastActivityId = activityId;
    customerRecord.stage = outcome;
    customerRecord.lastSyncedAt = activity.createdDate;
    return activity;
  }

  public async createFollowUpTask(
    leadId: string,
    title: string,
    priority: "Low" | "Normal" | "High" | "Urgent" = "Normal",
    dueDate: string,
    reason: string
  ): Promise<CRMTaskRecord> {
    const taskId = `CRM-TASK-${Math.floor(30000 + Math.random() * 69999)}`;
    const task: CRMTaskRecord = {
      taskId,
      leadId,
      title,
      priority,
      dueDate,
      assignedTo: "Alex Vance",
      status: "Not Started",
      reason,
    };

    const existingTasks = this.taskStore.get(leadId) || [];
    existingTasks.push(task);
    this.taskStore.set(leadId, existingTasks);
    return task;
  }

  public async syncConsultation(
    meeting: Meeting,
    customer: Customer,
    payload: CRMSyncPayload
  ): Promise<CRMSyncResult> {
    if (this.failureSimulated) {
      return {
        state: "FAILED",
        crmLeadId: customer.crmLeadId || "CRM-LEAD-10482",
        activityId: "",
        createdTaskIds: [],
        lastSyncedAt: new Date().toISOString(),
        errorMessage: "Salesforce REST API timeout: Service endpoint temporarily unavailable (503 Service Unavailable). Retryable error.",
        event: {
          id: `evt_crm_${Date.now()}`,
          integration: "salesforce_crm",
          eventType: "sync_crm",
          status: "failed",
          payloadSummary: "Failed to push consultation notes and tasks to Salesforce FSC due to gateway timeout.",
          responseMessage: "503 Service Unavailable — Gateway Timeout. Marked as RETRYABLE.",
          timestamp: new Date().toISOString(),
        },
      };
    }

    const customerRecord = await this.findOrCreateCustomer(customer);
    const activity = await this.updateMeetingActivity(
      meeting,
      customer,
      payload.notes,
      payload.nextAction,
      payload.outcome || payload.leadStage
    );

    const taskIds: string[] = [];
    for (const t of payload.tasks) {
      const task = await this.createFollowUpTask(
        customerRecord.leadId,
        t.title,
        t.priority,
        t.dueDate,
        t.reason
      );
      taskIds.push(task.taskId);
    }

    this.systemInfo.lastSyncTime = new Date().toISOString();

    const event: IntegrationEvent = {
      id: `evt_crm_${Date.now()}`,
      integration: "salesforce_crm",
      eventType: "sync_crm",
      status: "succeeded",
      payloadSummary: `Synchronized consultation activity (${activity.activityId}) and ${taskIds.length} follow-up tasks to Salesforce Lead ${customerRecord.leadId}.`,
      rawPayload: {
        leadId: customerRecord.leadId,
        contactId: customerRecord.contactId,
        stage: payload.leadStage,
        activityId: activity.activityId,
        createdTaskIds: taskIds,
        nextAction: payload.nextAction,
      },
      responseMessage: "201 Created — Salesforce Financial Services Cloud SObject Lead and Task tree updated successfully.",
      timestamp: new Date().toISOString(),
    };

    return {
      state: "SUCCESS",
      crmLeadId: customerRecord.leadId,
      activityId: activity.activityId,
      createdTaskIds: taskIds,
      lastSyncedAt: this.systemInfo.lastSyncTime,
      event,
    };
  }

  public getLead(leadId: string): CRMCustomerRecord | undefined {
    for (const c of this.customerStore.values()) {
      if (c.leadId === leadId) return c;
    }
    return undefined;
  }

  public getActivities(leadId: string): CRMActivityRecord[] {
    return Array.from(this.activityStore.values()).filter((a) => a.leadId === leadId);
  }

  public getTasks(leadId: string): CRMTaskRecord[] {
    return this.taskStore.get(leadId) || [];
  }
}

export const mockCRMAdapter = new MockCRMAdapter();
