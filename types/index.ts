/**
 * Darwix AI — Core Data Models & Domain Types
 * Mortgage Sales AI Copilot
 */

// ============================================================================
// 1. Borrower & Financial Profiles (Fannie Mae Form 1003 Aligned)
// ============================================================================

export type MaritalStatus = 'married' | 'unmarried' | 'separated';
export type EmploymentType = 'W2_FullTime' | 'W2_PartTime' | '1099_Contractor' | 'SelfEmployed' | 'Retired' | 'Military' | 'Other';
export type AssetType = 'checking' | 'savings' | 'investment' | 'retirement_401k' | 'gift_funds' | 'equity_proceeds';
export type LiabilityType = 'mortgage' | 'auto_loan' | 'auto_lease' | 'student_loan' | 'credit_card' | 'personal_loan' | 'alimony_child_support';
export type PropertyType = 'single_family' | 'condominium' | 'townhouse' | 'multi_family_2_4' | 'manufactured';
export type OccupancyType = 'primary_residence' | 'second_home' | 'investment_property';
export type LoanType = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo';
export type LoanTermMonths = 180 | 240 | 360; // 15, 20, 30 years

export interface EmploymentProfile {
  id: string;
  employerName: string;
  jobTitle: string;
  employmentType: EmploymentType;
  yearsOnJob: number;
  yearsInProfession: number;
  monthlyBaseIncome: number;
  monthlyOvertimeBonus?: number;
  monthlyCommission?: number;
  isCurrent: boolean;
  verificationStatus: 'unverified' | 'verbal_verified' | 'voe_requested' | 'documented';
}

export interface AssetRecord {
  id: string;
  institutionName: string;
  assetType: AssetType;
  verifiedBalance: number;
  isDownPaymentSource: boolean;
}

export interface Liability {
  id: string;
  borrowerId: string;
  creditorName: string;
  liabilityType: LiabilityType;
  monthlyPayment: number;
  unpaidBalance: number;
  monthsRemaining?: number;
  isExcludedFromDTI: boolean;
  exclusionReason?: string;
}

export interface FinancialProfile {
  id: string;
  borrowerId: string;
  creditScoreFICO: number;
  creditTier: 'exceptional' | 'very_good' | 'good' | 'fair' | 'poor';
  grossMonthlyIncome: number;
  statedMonthlyIncome?: number;
  verifiedMonthlyIncome?: number;
  incomeVerificationStatus?: 'verified' | 'required' | 'pending' | 'unverified';
  totalMonthlyLiabilities: number;
  totalMonthlyDebtStatus?: 'verified' | 'unverified' | 'conflicted';
  debtConflictDetails?: {
    johnAmount: number;
    sarahAmount: number;
    status: 'conflicted' | 'resolved';
    resolvedAmount?: number;
  };
  frontEndDTI: number; // Housing ratio (%)
  backEndDTI: number; // Total obligations ratio (%)
  totalLiquidAssets: number;
  verifiedReserveMonths: number;
  assets: AssetRecord[];
  liabilities: Liability[];
}

export interface Borrower {
  id: string;
  isPrimary: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  maskedSSN: string; // e.g. ***-**-6789 (Gramm-Leach-Bliley Act compliant)
  maritalStatus: MaritalStatus;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    housingStatus: 'own' | 'rent' | 'living_with_family';
    monthlyRentMortgage: number;
    yearsAtAddress: number;
  };
  employmentHistory: EmploymentProfile[];
  financialProfile: FinancialProfile;
}

export interface MortgageGoal {
  id: string;
  customerId: string;
  purpose: 'purchase' | 'rate_term_refinance' | 'cash_out_refinance';
  targetPropertyType: PropertyType;
  occupancyType: OccupancyType;
  targetPurchasePrice: number;
  targetDownPaymentAmount: number;
  targetDownPaymentPercent: number;
  targetLoanAmount: number;
  desiredLoanType: LoanType;
  desiredTermMonths: LoanTermMonths;
  targetClosingTimelineWeeks: number;
  firstTimeHomebuyer: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  primaryBorrower: Borrower;
  coBorrower?: Borrower;
  mortgageGoal: MortgageGoal;
  stage: 'lead' | 'consultation_scheduled' | 'consultation_in_progress' | 'pre_approved' | 'application_submitted' | 'processing' | 'underwriting' | 'closed';
  assignedLoanOfficerId: string;
  assignedLoanOfficerName: string;
  createdAt: string;
  updatedAt: string;
  crmLeadId?: string;
  losApplicationId?: string;
}

// ============================================================================
// 2. Meeting & Live Transcript Models
// ============================================================================

export type MeetingStatus = 
  | 'scheduled' 
  | 'upcoming'
  | 'in_preparation'
  | 'in_progress' 
  | 'paused' 
  | 'completed' 
  | 'follow_up_required'
  | 'cancelled';

export type MeetingAttentionFlag = 
  | 'missing_information' 
  | 'follow_up_due' 
  | 'compliance_review' 
  | 'documentation_pending';

export type SpeakerRole = 'loan_officer' | 'primary_borrower' | 'co_borrower' | 'system';

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  timestamp: string;
  speakerRole: SpeakerRole;
  speakerName: string;
  text: string;
  confidenceScore: number;
  isComplianceFlagged?: boolean;
  highlightCategory?: InterventionCategory;
  durationMs?: number;
}

export type FactCategory = 
  | 'income' 
  | 'asset' 
  | 'liability' 
  | 'property_goal' 
  | 'credit_history' 
  | 'timeline' 
  | 'co_borrower_intent'
  | 'competitor_quote';

export interface ExtractedFact {
  id: string;
  meetingId: string;
  transcriptSegmentId: string;
  category: FactCategory;
  fieldPath: string; // e.g., 'primaryBorrower.employmentHistory[0].monthlyBaseIncome'
  fieldName: string; // e.g., 'Primary Base Income'
  rawValue: string;
  normalizedValue: number | string | boolean;
  confidence: number;
  verifiedByOfficer: boolean;
  officerAcceptedAt?: string;
  rejectionReason?: string;
  form1003Section: 'Section 1: Borrower Information' | 'Section 2: Financial Info - Assets' | 'Section 3: Financial Info - Liabilities' | 'Section 4: Loan and Property Information';
  timestamp: string;
}

export interface Meeting {
  id: string;
  customerId: string;
  title: string;
  borrowerNames?: string;
  scheduledStartTime: string;
  timeSlot?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: MeetingStatus;
  attentionFlags?: MeetingAttentionFlag[];
  purposeDescription?: string;
  targetPurchaseTimeline?: string;
  assignedLoanOfficerId: string;
  assignedLoanOfficerName: string;
  meetingChannel: 'in_person' | 'video_call' | 'phone_call';
  meetingUrl?: string;
  transcriptSegments: TranscriptSegment[];
  extractedFacts: ExtractedFact[];
  activeInterventions: AIIntervention[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 3. AI Interventions & Compliance Engine Models
// ============================================================================

export type InterventionSeverity =
  | 'info'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'INFO'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type InterventionCategory =
  | 'profiling'
  | 'missing_information'
  | 'product_guidance'
  | 'product_explanation'
  | 'objection'
  | 'customer_objection'
  | 'compliance'
  | 'compliance_warning'
  | 'conflict'
  | 'conflicting_borrower_info'
  | 'next_best_question'
  | 'next_best_action'
  | 'income_verification'
  | 'competitive_statement'
  // Advanced Assessment Situations
  | 'informal_approval_statement'
  | 'indicative_interest_rate_statement'
  | 'suggesting_exclusion_of_liability'
  | 'unverifiable_income_discussion'
  | 'promise_to_beat_competitor'
  | 'missed_profiling_question'
  | 'closing_without_next_action';

export type InterventionType = 
  | 'WARNING'
  | 'SUGGESTION'
  | 'QUESTION'
  | 'CAPTURE'
  | 'CONFLICT'
  | 'COMPLIANCE'
  | 'NEXT_ACTION'
  | 'question' 
  | 'alert' 
  | 'action_recommendation' 
  | 'compliance_violation' 
  | 'knowledge_lookup';

export type InterventionSource = 
  | 'RULE'
  | 'AI'
  | 'HYBRID'
  | 'deterministic_rule' 
  | 'ai_inference' 
  | 'hybrid';

export type InterventionStatus = 'pending' | 'accepted' | 'dismissed' | 'escalated' | 'executed';

export type AgentActionType = 
  | 'accept' 
  | 'dismiss' 
  | 'ask_question' 
  | 'view_evidence' 
  | 'escalate'
  | 'mark_verification'
  | 'create_followup'
  | 'mark_review';

export interface AIIntervention {
  id: string;
  title: string;
  category: InterventionCategory;
  severity: InterventionSeverity;
  trigger: string;
  detectedEvidence?: string;
  evidence: string;
  exactMessage: string;
  suggestedResponse?: string;
  reason: string;
  source: InterventionSource;
  confidence: number;
  confidenceLevel?: ConfidenceLevel;
  interventionType: InterventionType;
  availableActions: AgentActionType[];
  escalationRequired?: boolean;
  requiresEscalation: boolean;
  generatedSystemAction?: string | null;
  systemAction?: string | null;
  generatedInformation?: string;
  riskIfIncorrect: string;
  status: InterventionStatus;
  timestamp: string;
  dismissalReason?: string;
  // Contextual links
  meetingId?: string;
  transcriptSegmentId?: string;
  ruleCitation?: string; // e.g. '12 CFR § 1026.19(e) / TRID'
}

export interface ComplianceAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  regulatoryBody: 'CFPB' | 'FTC' | 'FDIC' | 'FannieMae' | 'FreddieMac' | 'StateLendingBoard';
  regulationCitation: string;
  severity: 'high' | 'critical';
  detectedStatement: string;
  mandatoryCorrectiveScript: string;
  explanationOfRisk: string;
  potentialPenalty: string;
  requiresSupervisorAcknowledgment: boolean;
  timestamp: string;
}

export interface AgentAction {
  id: string;
  interventionId: string;
  meetingId: string;
  actionType: AgentActionType;
  loanOfficerId: string;
  rationale?: string;
  modifiedValue?: string;
  clientTimestamp: string;
  serverTimestamp: string;
}

// ============================================================================
// 4. Post-Meeting Summary & Follow-Ups
// ============================================================================

export interface FollowUpTask {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  assignedTo: 'loan_officer' | 'borrower' | 'processor' | 'underwriter';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  syncDestination?: 'salesforce' | 'encompass' | 'email';
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  customerId: string;
  executiveSummary: string;
  borrowerGoalsRecap: string;
  keyFinancialFindings: {
    qualifyingIncomeTotal: number;
    monthlyDebtsTotal: number;
    estimatedDTI: number;
    targetLoanAmount: number;
    recommendedProduct: string;
  };
  complianceStatus: {
    hasUnresolvedViolations: boolean;
    totalAlertsRaised: number;
    resolvedAlertsCount: number;
    escalatedAlertsCount: number;
    auditStatus: 'passed_clean' | 'passed_with_exceptions' | 'supervisor_review_required';
  };
  confirmed1003FactsCount: number;
  pending1003FactsCount: number;
  followUpTasks: FollowUpTask[];
  generatedAt: string;
  officerSignOffTimestamp?: string;
}

// ============================================================================
// 5. Manager & Operational Visibility
// ============================================================================

export interface ManagerMetric {
  metricId: string;
  name: string;
  value: number;
  unit: 'percentage' | 'count' | 'currency' | 'seconds';
  trendDirection: 'up' | 'down' | 'neutral';
  trendPercent: number;
  targetBenchmark?: number;
  category: 'compliance' | 'sales_velocity' | 'data_capture_accuracy' | 'officer_adoption';
}

export interface LoanOfficerOverview {
  officerId: string;
  name: string;
  branch: string;
  activeMeetingsToday: number;
  completedThisWeek: number;
  averageInterventionAcceptanceRate: number; // e.g. 88%
  complianceInfractionCount: number;
  riskRating: 'low' | 'moderate' | 'elevated';
}

// ============================================================================
// 6. Enterprise Integrations & Audit Logging
// ============================================================================

export type IntegrationType =
  | 'salesforce_crm'
  | 'encompass_los'
  | 'document_system'
  | 'communication_gateway'
  | 'optimal_blue_ppe'
  | 'credit_bureau'
  | 'aus_underwriting'
  | 'title_escrow';

export type IntegrationStatus = 'idle' | 'in_progress' | 'succeeded' | 'failed';

export type IntegrationStatusLevel = 'LIVE' | 'MOCKED' | 'FUTURE' | 'DISABLED' | 'ERROR';

export type ExecutionState = 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYABLE';

export type DocumentStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'MISSING';

export type LOSStage =
  | 'Discovery'
  | 'Information Collection'
  | 'Documentation Pending'
  | 'Application Started'
  | 'Verification'
  | 'Underwriting'
  | 'Approved'
  | 'Closed';

export type VerificationState = 'STATED' | 'VERIFIED' | 'CONFLICTED' | 'UNVERIFIED';

export interface DocumentItem {
  id: string;
  name: string;
  borrowerName: string;
  category: 'income' | 'asset' | 'identity' | 'liability' | 'property' | 'competitive';
  status: DocumentStatus;
  reason: string;
  potentialOnly: boolean; // "Potential documents to verify"
  requestedAt?: string;
  uploadedAt?: string;
  fileSize?: string;
  reviewNotes?: string;
}

export interface PostMeetingAction {
  id: string;
  action: string;
  title: string;
  reason: string;
  owner: string;
  dueDate: string;
  source: 'ai_recommendation' | 'compliance_engine' | 'agent_manual' | 'los_rule';
  approvalRequired: boolean;
  status: 'ready_for_approval' | 'approved' | 'completed' | 'dismissed';
  category: 'crm' | 'los' | 'documents' | 'communication' | 'compliance';
  payload?: Record<string, unknown>;
  executedAt?: string;
  executionResult?: string;
}

export interface IntegrationEvent {
  id: string;
  integration: IntegrationType;
  eventType:
    | 'sync_1003_payload'
    | 'create_follow_up_task'
    | 'update_lead_status'
    | 'request_rate_scenario'
    | 'sync_crm'
    | 'sync_los'
    | 'request_documents'
    | 'dispatch_communication';
  status: IntegrationStatus;
  payloadSummary: string;
  rawPayload?: Record<string, unknown>;
  responseMessage?: string;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  eventType: 
    | 'INTERVENTION_SHOWN'
    | 'INTERVENTION_ACCEPTED'
    | 'INTERVENTION_DISMISSED'
    | 'INTERVENTION_ESCALATED'
    | 'QUESTION_SUGGESTED'
    | 'FIELD_MARKED_FOR_VERIFICATION'
    | 'FOLLOWUP_CREATED'
    | 'meeting_started' 
    | 'compliance_rule_triggered' 
    | 'ai_intervention_generated' 
    | 'agent_action_taken' 
    | 'intervention_escalated' 
    | 'summary_generated' 
    | 'crm_los_synced'
    | 'crm_sync_approved'
    | 'crm_sync_completed'
    | 'crm_sync_failed'
    | 'los_update_approved'
    | 'los_draft_updated'
    | 'los_sync_failed'
    | 'document_request_prepared'
    | 'document_request_approved'
    | 'document_request_dispatched'
    | 'communication_approved'
    | 'communication_sent'
    | 'action_dismissed';
  meetingId: string;
  actor: {
    userId: string;
    role: string;
    ipAddress?: string;
  };
  details: {
    category?: string;
    ruleCitation?: string;
    actionTaken?: string;
    priorState?: unknown;
    newState?: unknown;
    notes?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  // Section 19 unified audit event properties
  actorType?: 'loan_officer' | 'system' | 'underwriter' | 'borrower' | 'manager';
  action?: string;
  entityType?: 'meeting' | 'customer' | 'lead' | 'loan_application' | 'document' | 'task';
  entityId?: string;
  source?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

