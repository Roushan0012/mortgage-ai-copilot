import {
  Customer,
  Meeting,
  DocumentItem,
} from "@/types";

import {
  IntegrationSystemInfo,
  CRMSyncPayload,
  CRMSyncResult,
  LOSSyncPayload,
  LOSSyncResult,
  DocumentRequestResult,
  CommunicationDispatchResult,
  CustomerMessageDraft,
  IdempotencyRecord,
} from "./types";
import { mockCRMAdapter } from "./crm/mock-crm";
import { mockLOSAdapter } from "./los/mock-los";
import { mockDocumentSystemAdapter } from "./documents/mock-document-system";
import { mockCommunicationAdapter } from "./communications/mock-communication";
import { repository } from "@/lib/data/repository";

/**
 * Enterprise Integrations Manager
 * Orchestrates adapter dispatch, manages idempotency keys, enforces approval gates,
 * logs audit events, and maintains system health status across enterprise services.
 */
export class IntegrationManager {
  private idempotencyRegistry = new Map<string, IdempotencyRecord>();

  // Registry of enterprise integration endpoints and their statuses
  private systems: IntegrationSystemInfo[] = [
    {
      id: "salesforce_crm",
      name: "Salesforce Financial Services Cloud",
      vendor: "Salesforce, Inc.",
      category: "crm",
      status: "MOCKED",
      description: "Demo environment — simulated enterprise integration for Lead and Activity management.",
      apiVersion: "v59.0 (REST/Bulk API)",
      endpoint: "https://darwix-mortgage-demo.my.salesforce.com/services/data/v59.0",
      isSimulated: true,
      requiresApproval: true,
      lastSyncTime: new Date().toISOString(),
    },
    {
      id: "encompass_los",
      name: "ICE Encompass Loan Origination System",
      vendor: "ICE Mortgage Technology",
      category: "los",
      status: "MOCKED",
      description: "Demo environment — simulated enterprise integration for Form 1003 loan applications and conditions (MISMO 3.4).",
      apiVersion: "MISMO v3.4 / Encompass REST API v24.2",
      endpoint: "https://api.elliemae.com/encompass/v3/loans",
      isSimulated: true,
      requiresApproval: true,
      lastSyncTime: new Date().toISOString(),
    },
    {
      id: "document_system",
      name: "Enterprise Document Vault & Verification Hub",
      vendor: "Blend / Roostify Document Gateway",
      category: "documents",
      status: "MOCKED",
      description: "Demo environment — simulated enterprise integration for secure borrower portal and document verification.",
      apiVersion: "v2.4 (Secure Enclave)",
      endpoint: "https://docs.darwix-mortgage-demo.com/api/v2",
      isSimulated: true,
      requiresApproval: true,
      lastSyncTime: new Date().toISOString(),
    },
    {
      id: "communication_gateway",
      name: "Enterprise Communications Hub (Twilio / SendGrid)",
      vendor: "Twilio SendGrid & SMS Gateway",
      category: "communications",
      status: "MOCKED",
      description: "Demo environment — simulated enterprise integration for borrower email and SMS dispatch.",
      apiVersion: "v3.1 (Transactional Email/SMS API)",
      endpoint: "https://api.sendgrid.com/v3/mail/send",
      isSimulated: true,
      requiresApproval: true,
      lastSyncTime: new Date().toISOString(),
    },
    {
      id: "optimal_blue_ppe",
      name: "Optimal Blue Product & Pricing Engine (PPE)",
      vendor: "Optimal Blue LLC",
      category: "ppe",
      status: "FUTURE",
      description: "Live secondary marketing engine for automated rate lock, investor pricing matrices, and LLPAs.",
      apiVersion: "PPE API v4 (Planned)",
      endpoint: "https://api.optimalblue.com/v4/pricing",
      isSimulated: false,
      requiresApproval: false,
    },
    {
      id: "aus_underwriting",
      name: "Fannie Mae Desktop Underwriter (DU) / Freddie Mac LPA",
      vendor: "Fannie Mae / Freddie Mac",
      category: "underwriting",
      status: "FUTURE",
      description: "Automated Underwriting System (AUS) for instant Approve/Eligible recommendation determinations.",
      apiVersion: "DU Integration Direct v10.2 (Planned)",
      endpoint: "https://api.fanniemae.com/du/v10",
      isSimulated: false,
      requiresApproval: true,
    },
    {
      id: "credit_bureau",
      name: "CoreLogic Tri-Merge Credit Bureau Gateway",
      vendor: "CoreLogic Credit Services",
      category: "credit",
      status: "FUTURE",
      description: "Equifax, Experian, and TransUnion automated tri-merge credit report pull and soft inquiry engine.",
      apiVersion: "CreditDirect v2 (Planned)",
      endpoint: "https://credit.corelogic.com/api/v2",
      isSimulated: false,
      requiresApproval: true,
    },
    {
      id: "title_escrow",
      name: "First American Title & Closing Gateway",
      vendor: "First American Title Insurance",
      category: "title",
      status: "FUTURE",
      description: "Automated title search ordering, closing fee calculation, and wire fraud validation.",
      apiVersion: "TitleFlow v1 (Planned)",
      endpoint: "https://api.firstam.com/title/v1",
      isSimulated: false,
      requiresApproval: false,
    },
  ];

  public getSystems(): IntegrationSystemInfo[] {
    return [...this.systems];
  }

  public getSystem(id: string): IntegrationSystemInfo | undefined {
    return this.systems.find((s) => s.id === id);
  }

  public setFailureSimulation(systemId: string, shouldFail: boolean) {
    if (systemId === "salesforce_crm") {
      mockCRMAdapter.setFailureSimulation(shouldFail);
    } else if (systemId === "encompass_los") {
      mockLOSAdapter.setFailureSimulation(shouldFail);
    } else if (systemId === "document_system") {
      mockDocumentSystemAdapter.setFailureSimulation(shouldFail);
    } else if (systemId === "communication_gateway") {
      mockCommunicationAdapter.setFailureSimulation(shouldFail);
    }
  }

  /**
   * Enforces strict approval gate on sensitive operations
   */
  private checkApprovalGate(operationName: string, isApproved: boolean) {
    if (!isApproved) {
      throw new Error(
        `Approval Gate Blocked: "${operationName}" requires explicit Loan Officer approval before executing.`
      );
    }
  }

  /**
   * Checks idempotency record for duplicate protection
   */
  public getIdempotentResult<T>(key: string): IdempotencyRecord<T> | undefined {
    return this.idempotencyRegistry.get(key) as IdempotencyRecord<T> | undefined;
  }

  public recordIdempotency<T>(key: string, system: string, action: string, result: T): void {
    this.idempotencyRegistry.set(key, {
      key,
      system,
      action,
      timestamp: new Date().toISOString(),
      result,
    });
  }

  // ============================================================================
  // CRM Sync Execution with Approval Gate & Idempotency
  // ============================================================================

  public async syncCRM(params: {
    meeting: Meeting;
    customer: Customer;
    payload: CRMSyncPayload;
    isApproved: boolean;
    officerId?: string;
  }): Promise<CRMSyncResult> {
    const { meeting, customer, payload, isApproved, officerId = "lo_avance_402" } = params;

    // 1. Approval Gate Check
    this.checkApprovalGate("Salesforce CRM Sync", isApproved);

    // 2. Idempotency Check
    const idempotencyKey = `${meeting.id}:crm_sync`;
    const cached = this.getIdempotentResult<CRMSyncResult>(idempotencyKey);
    if (cached && cached.result.state === "SUCCESS") {
      return {
        ...cached.result,
        isIdempotentReplay: true,
      };
    }

    // 3. Execute through CRM Adapter
    const result = await mockCRMAdapter.syncConsultation(meeting, customer, payload);

    // 4. Audit Trail Recording
    if (result.state === "SUCCESS") {
      this.recordIdempotency(idempotencyKey, "salesforce_crm", "sync_crm", result);

      const audit = repository.addAuditEvent({
        eventType: "crm_sync_completed",
        meetingId: meeting.id,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_SALESFORCE_CRM",
          crmLeadId: result.crmLeadId,
          activityId: result.activityId,
          notes: result.event.payloadSummary,
        },
      });
      // Attach Section 19 unified audit event properties
      audit.actorType = "loan_officer";
      audit.action = "CRM_SYNC_COMPLETED";
      audit.entityType = "lead";
      audit.entityId = result.crmLeadId;
      audit.source = "salesforce_crm";
      audit.status = "SUCCESS";
      audit.metadata = {
        tasksCount: result.createdTaskIds.length,
        leadStage: payload.leadStage,
      };
    } else {
      const audit = repository.addAuditEvent({
        eventType: "crm_sync_failed",
        meetingId: meeting.id,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_SALESFORCE_CRM_FAILED",
          error: result.errorMessage,
        },
      });
      audit.actorType = "loan_officer";
      audit.action = "CRM_SYNC_FAILED";
      audit.entityType = "lead";
      audit.entityId = result.crmLeadId;
      audit.source = "salesforce_crm";
      audit.status = "FAILED";
      audit.metadata = { retryable: true, error: result.errorMessage };
    }

    return result;
  }

  // ============================================================================
  // LOS Update Execution with Approval Gate & Idempotency
  // ============================================================================

  public async syncLOS(params: {
    meeting: Meeting;
    customer: Customer;
    payload: LOSSyncPayload;
    isApproved: boolean;
    officerId?: string;
  }): Promise<LOSSyncResult> {
    const { meeting, customer, payload, isApproved, officerId = "lo_avance_402" } = params;

    // 1. Approval Gate Check
    this.checkApprovalGate("ICE Encompass LOS Draft Update", isApproved);

    // 2. Idempotency Check
    const idempotencyKey = `${meeting.id}:los_sync`;
    const cached = this.getIdempotentResult<LOSSyncResult>(idempotencyKey);
    if (cached && cached.result.state === "SUCCESS") {
      return {
        ...cached.result,
        isIdempotentReplay: true,
      };
    }

    // 3. Execute through LOS Adapter
    const result = await mockLOSAdapter.createOrUpdateDraftApplication(meeting, customer, payload);

    // 4. Audit Trail Recording
    if (result.state === "SUCCESS") {
      this.recordIdempotency(idempotencyKey, "encompass_los", "sync_los", result);

      const audit = repository.addAuditEvent({
        eventType: "los_draft_updated",
        meetingId: meeting.id,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_ENCOMPASS_LOS",
          loanIdentifier: result.loanIdentifier,
          applicationId: result.applicationId,
          stage: result.stage,
          notes: result.event.payloadSummary,
        },
      });
      audit.actorType = "loan_officer";
      audit.action = "LOS_DRAFT_UPDATED";
      audit.entityType = "loan_application";
      audit.entityId = result.loanIdentifier;
      audit.source = "encompass_los";
      audit.status = "SUCCESS";
      audit.metadata = {
        stage: result.stage,
        borrowerCount: result.mismoPayload.borrowers.length,
        statedIncomeStatus: "STATED — NOT VERIFIED",
      };
    } else {
      const audit = repository.addAuditEvent({
        eventType: "los_sync_failed",
        meetingId: meeting.id,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_ENCOMPASS_LOS_FAILED",
          error: result.errorMessage,
        },
      });
      audit.actorType = "loan_officer";
      audit.action = "LOS_SYNC_FAILED";
      audit.entityType = "loan_application";
      audit.entityId = result.loanIdentifier;
      audit.source = "encompass_los";
      audit.status = "FAILED";
      audit.metadata = { retryable: true, error: result.errorMessage };
    }

    return result;
  }

  // ============================================================================
  // Document Request Execution with Approval Gate & Idempotency
  // ============================================================================

  public async requestDocuments(params: {
    customer: Customer;
    applicationId: string;
    meetingId: string;
    documents: DocumentItem[];
    isApproved: boolean;
    officerId?: string;
  }): Promise<DocumentRequestResult> {
    const {
      customer,
      applicationId,
      meetingId,
      documents,
      isApproved,
      officerId = "lo_avance_402",
    } = params;

    // 1. Approval Gate Check
    this.checkApprovalGate("Document Verification Request", isApproved);

    // 2. Idempotency Check
    const idempotencyKey = `${meetingId}:doc_request`;
    const cached = this.getIdempotentResult<DocumentRequestResult>(idempotencyKey);
    if (cached && cached.result.state === "SUCCESS") {
      return {
        ...cached.result,
        isIdempotentReplay: true,
      };
    }

    // 3. Execute through Document Adapter
    const result = await mockDocumentSystemAdapter.createDocumentRequest(
      customer,
      applicationId,
      documents,
      officerId
    );

    // 4. Audit Trail Recording
    if (result.state === "SUCCESS") {
      this.recordIdempotency(idempotencyKey, "document_system", "request_documents", result);

      const audit = repository.addAuditEvent({
        eventType: "document_request_dispatched",
        meetingId,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "DISPATCH_DOCUMENT_REQUEST",
          requestId: result.requestId,
          documentsCount: result.requestedDocumentsCount,
          notes: result.event.payloadSummary,
        },
      });
      audit.actorType = "loan_officer";
      audit.action = "DOCUMENT_REQUEST_DISPATCHED";
      audit.entityType = "document";
      audit.entityId = result.requestId;
      audit.source = "document_system";
      audit.status = "SUCCESS";
      audit.metadata = {
        portalLink: result.portalLink,
        documents: documents.map((d) => d.name),
      };
    }

    return result;
  }

  // ============================================================================
  // Communication Dispatch with Approval Gate
  // ============================================================================

  public async sendCommunication(params: {
    draft: CustomerMessageDraft;
    meetingId: string;
    isApproved: boolean;
    officerId?: string;
  }): Promise<CommunicationDispatchResult> {
    const { draft, meetingId, isApproved, officerId = "lo_avance_402" } = params;

    this.checkApprovalGate("Customer Outbound Notification", isApproved);

    draft.status = "APPROVED";
    const result = await mockCommunicationAdapter.dispatchApprovedCommunication(draft, officerId);

    if (result.state === "SUCCESS") {
      const audit = repository.addAuditEvent({
        eventType: "communication_sent",
        meetingId,
        actor: { userId: officerId, role: "Loan Officer" },
        details: {
          actionTaken: "DISPATCH_COMMUNICATION",
          messageId: result.messageId,
          recipient: draft.recipientEmail,
          channel: draft.channel,
          notes: result.event.payloadSummary,
        },
      });
      audit.actorType = "loan_officer";
      audit.action = "COMMUNICATION_SENT";
      audit.entityType = "customer";
      audit.entityId = draft.recipientEmail;
      audit.source = "communication_gateway";
      audit.status = "SUCCESS";
      audit.metadata = {
        subject: draft.subject,
        channel: draft.channel,
      };
    }

    return result;
  }

  // ============================================================================
  // Backwards-Compatible Helpers for Phase 1-4 Callers
  // ============================================================================

  public async syncToEncompassLOS(meeting: Meeting, customer: Customer) {
    const res = await this.syncLOS({
      meeting,
      customer,
      payload: {
        meetingId: meeting.id,
        customerId: customer.id,
        targetStage: "Documentation Pending",
        officerAttestation: true,
        officerNMLS: "1489201",
      },
      isApproved: true,
    });
    return {
      success: res.state === "SUCCESS",
      event: res.event,
      externalRecordId: res.loanIdentifier,
    };
  }

  public async syncToSalesforceCRM(meeting: Meeting, customer: Customer) {
    const res = await this.syncCRM({
      meeting,
      customer,
      payload: {
        meetingId: meeting.id,
        customerId: customer.id,
        leadStage: "Qualified / Needs Documentation",
        outcome: "Qualified / Needs Documentation",
        nextAction: "Collect income and liability documents",
        notes: `Consultation concluded. Identified BMW lease obligation ($590/mo), W-2 and Schedule C income. Rate discussion on 30Y conventional fixed.`,
        tasks: [
          {
            title: "Request Sarah Miller 2024 & 2025 Schedule C Tax Returns",
            priority: "High",
            dueDate: "Tomorrow",
            reason: "Verify stated $38k net self-employment earnings under Dodd-Frank QM.",
          },
          {
            title: "Collect Official Written Loan Estimate from Rocket Mortgage",
            priority: "Normal",
            dueDate: "In 2 days",
            reason: "Substantiate price match request on 6.125% quote.",
          },
        ],
      },
      isApproved: true,
    });
    return {
      success: res.state === "SUCCESS",
      event: res.event,
      externalRecordId: res.crmLeadId,
    };
  }

  public async queryOptimalBluePPE(params: {
    loanAmount: number;
    purchasePrice: number;
    ficoScore: number;
    propertyType: string;
  }) {
    const rate = 6.375;
    const monthlyRate = rate / 100 / 12;
    const n = 360;
    const monthlyPI = Number(
      (
        (params.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1)
      ).toFixed(2)
    );

    return {
      rate,
      apr: 6.495,
      monthlyPI: monthlyPI || 3119.54,
      points: 0.125,
      investor: `Fannie Mae 30Y Conf Fixed (${params.propertyType || "Single Family"})`,
    };
  }

  public resetIdempotency() {
    this.idempotencyRegistry.clear();
  }

  public resetAll() {
    this.idempotencyRegistry.clear();
    mockCRMAdapter.setFailureSimulation(false);
    mockLOSAdapter.setFailureSimulation(false);
    mockDocumentSystemAdapter.setFailureSimulation(false);
    mockCommunicationAdapter.setFailureSimulation(false);
  }
}

export const integrationManager = new IntegrationManager();
export const integrationsHub = integrationManager;

// Register subscriber with repository for synchronized demo resets
repository.onReset(() => {
  integrationManager.resetAll();
});
