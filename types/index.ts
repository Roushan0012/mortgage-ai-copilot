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
  totalMonthlyLiabilities: number;
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

export type MeetingStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
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
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: MeetingStatus;
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

export type InterventionSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type InterventionCategory =
  | 'profiling'
  | 'missing_information'
  | 'product_explanation'
  | 'customer_objection'
  | 'compliance_warning'
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
  | 'question' 
  | 'alert' 
  | 'action_recommendation' 
  | 'compliance_violation' 
  | 'knowledge_lookup';

export type InterventionSource = 'deterministic_rule' | 'ai_inference' | 'hybrid';

export type InterventionStatus = 'pending' | 'accepted' | 'dismissed' | 'escalated' | 'executed';

export type AgentActionType = 
  | 'accept' 
  | 'dismiss' 
  | 'ask_question' 
  | 'view_evidence' 
  | 'escalate';

export interface AIIntervention {
  id: string;
  category: InterventionCategory;
  severity: InterventionSeverity;
  trigger: string;
  detectedEvidence: string;
  exactMessage: string;
  reason: string;
  source: InterventionSource;
  confidence: number;
  interventionType: InterventionType;
  availableActions: AgentActionType[];
  escalationRequired: boolean;
  generatedSystemAction: string | null;
  riskIfIncorrect: string;
  status: InterventionStatus;
  timestamp: string;
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

export type IntegrationType = 'salesforce_crm' | 'encompass_los' | 'optimal_blue_ppe' | 'credit_bureau';
export type IntegrationStatus = 'idle' | 'in_progress' | 'succeeded' | 'failed';

export interface IntegrationEvent {
  id: string;
  integration: IntegrationType;
  eventType: 'sync_1003_payload' | 'create_follow_up_task' | 'update_lead_status' | 'request_rate_scenario';
  status: IntegrationStatus;
  payloadSummary: string;
  rawPayload?: Record<string, unknown>;
  responseMessage?: string;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  eventType: 
    | 'meeting_started' 
    | 'compliance_rule_triggered' 
    | 'ai_intervention_generated' 
    | 'agent_action_taken' 
    | 'intervention_escalated' 
    | 'summary_generated' 
    | 'crm_los_synced';
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
  };
  timestamp: string;
}
