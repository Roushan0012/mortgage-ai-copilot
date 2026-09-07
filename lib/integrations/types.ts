import {
  Customer,
  Meeting,
  IntegrationStatusLevel,
  ExecutionState,
  DocumentStatus,
  LOSStage,
  VerificationState,
  DocumentItem,
  IntegrationEvent,
} from "@/types";

export interface IntegrationSystemInfo {
  id: string;
  name: string;
  vendor: string;
  category: "crm" | "los" | "documents" | "communications" | "ppe" | "underwriting" | "credit" | "title";
  status: IntegrationStatusLevel;
  description: string;
  lastSyncTime?: string;
  apiVersion: string;
  endpoint: string;
  isSimulated: boolean;
  requiresApproval: boolean;
}

// ============================================================================
// CRM Types & Contracts (Salesforce Financial Services Cloud Aligned)
// ============================================================================

export interface CRMCustomerRecord {
  leadId: string;
  contactId: string;
  fullName: string;
  email: string;
  phone: string;
  stage: string;
  owner: string;
  lastActivityId?: string;
  lastSyncedAt: string;
}

export interface CRMActivityRecord {
  activityId: string;
  leadId: string;
  subject: string;
  meetingType: string;
  durationMinutes: number;
  outcome: string;
  notes: string;
  nextAction: string;
  complianceFlagsCount: number;
  createdDate: string;
}

export interface CRMTaskRecord {
  taskId: string;
  leadId: string;
  title: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  dueDate: string;
  assignedTo: string;
  status: "Not Started" | "In Progress" | "Completed";
  reason: string;
}

export interface CRMSyncPayload {
  meetingId: string;
  customerId: string;
  leadStage: string;
  outcome: string;
  nextAction: string;
  notes: string;
  tasks: Array<{
    title: string;
    priority: "Low" | "Normal" | "High" | "Urgent";
    dueDate: string;
    reason: string;
  }>;
}

export interface CRMSyncResult {
  state: ExecutionState;
  crmLeadId: string;
  activityId: string;
  createdTaskIds: string[];
  lastSyncedAt: string;
  event: IntegrationEvent;
  isIdempotentReplay?: boolean;
  errorMessage?: string;
}

export interface ICRMAdapter {
  systemInfo: IntegrationSystemInfo;
  findOrCreateCustomer(customer: Customer): Promise<CRMCustomerRecord>;
  updateMeetingActivity(
    meeting: Meeting,
    customer: Customer,
    notes: string,
    nextAction: string,
    outcome?: string
  ): Promise<CRMActivityRecord>;
  createFollowUpTask(
    leadId: string,
    title: string,
    priority: "Low" | "Normal" | "High" | "Urgent",
    dueDate: string,
    reason: string
  ): Promise<CRMTaskRecord>;
  syncConsultation(
    meeting: Meeting,
    customer: Customer,
    payload: CRMSyncPayload
  ): Promise<CRMSyncResult>;
}

// ============================================================================
// LOS Types & Contracts (ICE Encompass MISMO 3.4 Aligned)
// ============================================================================

export interface LOSStatedFinancialField<T> {
  value: T;
  verificationState: VerificationState; // Crucial STATED vs VERIFIED distinction
  source: string;
  notes?: string;
}

export interface LOSDraftApplication {
  applicationId: string;
  loanIdentifier: string;
  mismoVersion: "3.4";
  stage: LOSStage;
  borrowers: Array<{
    borrowerId: string;
    isPrimary: boolean;
    name: string;
    maskedSSN: string;
    statedMonthlyIncome: LOSStatedFinancialField<number>;
    verifiedMonthlyIncome?: LOSStatedFinancialField<number>;
    employment: {
      employer: string;
      title: string;
      employmentType: string;
      statedTenureYears: number;
      verificationStatus: string;
    };
    liabilities: Array<{
      creditor: string;
      type: string;
      monthlyPayment: number;
      unpaidBalance: number;
      isStated: boolean;
      isExcluded: boolean;
      exclusionReason?: string;
    }>;
  }>;
  loanGoal: {
    purpose: string;
    occupancy: string;
    purchasePrice: number;
    targetLoanAmount: number;
    downPaymentAmount: number;
    desiredLoanType: string;
    desiredTermMonths: number;
    targetClosingTimeline: string;
  };
  statedDTI: {
    frontEnd: number;
    backEnd: number;
    status: "STATED_ESTIMATE_ONLY";
  };
  outstandingConditionsCount: number;
  lastUpdatedAt: string;
}

export interface LOSSyncPayload {
  meetingId: string;
  customerId: string;
  targetStage: LOSStage; // Normally 'Information Collection' or 'Documentation Pending'
  officerAttestation: boolean;
  officerNMLS: string;
}

export interface LOSSyncResult {
  state: ExecutionState;
  applicationId: string;
  loanIdentifier: string;
  stage: LOSStage;
  mismoPayload: LOSDraftApplication;
  lastUpdatedAt: string;
  event: IntegrationEvent;
  isIdempotentReplay?: boolean;
  errorMessage?: string;
}

export interface ILOSAdapter {
  systemInfo: IntegrationSystemInfo;
  createOrUpdateDraftApplication(
    meeting: Meeting,
    customer: Customer,
    payload: LOSSyncPayload
  ): Promise<LOSSyncResult>;
  getApplication(applicationId: string): Promise<LOSDraftApplication | null>;
}

// ============================================================================
// Document Management Types & Contracts
// ============================================================================

export interface DocumentVerificationRequest {
  requestId: string;
  customerId: string;
  applicationId: string;
  documents: DocumentItem[];
  instructions: string;
  deliveryMethod: "borrower_portal" | "secure_email" | "sms_link";
  status: "DRAFT" | "PENDING_APPROVAL" | "DISPATCHED" | "CANCELLED";
  createdAt: string;
  approvedByOfficer?: string;
}

export interface DocumentRequestResult {
  state: ExecutionState;
  requestId: string;
  requestedDocumentsCount: number;
  documents: DocumentItem[];
  portalLink: string;
  event: IntegrationEvent;
  isIdempotentReplay?: boolean;
  errorMessage?: string;
}

export interface IDocumentAdapter {
  systemInfo: IntegrationSystemInfo;
  identifyPotentialDocuments(customer: Customer, meeting: Meeting): DocumentItem[];
  createDocumentRequest(
    customer: Customer,
    applicationId: string,
    documents: DocumentItem[],
    officerId: string
  ): Promise<DocumentRequestResult>;
  updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    notes?: string
  ): Promise<DocumentItem>;
}

// ============================================================================
// Communication Gateway Types & Contracts
// ============================================================================

export interface CustomerMessageDraft {
  messageId: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: "email" | "sms" | "portal_notification";
  subject: string;
  body: string;
  templateId: string;
  approvalRequired: true; // Hard security constraint
  status: "DRAFT" | "READY_FOR_APPROVAL" | "APPROVED" | "SENT" | "REJECTED";
  disclaimer: string;
}

export interface CommunicationDispatchResult {
  state: ExecutionState;
  messageId: string;
  sentAt?: string;
  event: IntegrationEvent;
  isIdempotentReplay?: boolean;
  errorMessage?: string;
}

export interface ICommunicationAdapter {
  systemInfo: IntegrationSystemInfo;
  draftFollowUpEmail(customer: Customer, meeting: Meeting): CustomerMessageDraft;
  draftDocumentRequestNotification(
    customer: Customer,
    documentCount: number,
    portalUrl: string
  ): CustomerMessageDraft;
  dispatchApprovedCommunication(
    draft: CustomerMessageDraft,
    approvedBy: string
  ): Promise<CommunicationDispatchResult>;
}

// ============================================================================
// Idempotency & Unified Execution Models
// ============================================================================

export interface IdempotencyRecord<T = unknown> {
  key: string;
  system: string;
  action: string;
  timestamp: string;
  result: T;
}
