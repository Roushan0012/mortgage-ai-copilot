import {
  InterventionCategory,
  InterventionSeverity,
  InterventionSource,
  InterventionType,
  AgentActionType,
  ConfidenceLevel,
} from "@/types";

export interface ComplianceRule {
  id: string;
  name: string;
  title: string;
  category: InterventionCategory;
  severity: InterventionSeverity;
  source: InterventionSource;
  interventionType: InterventionType;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  regulationCitation: string;
  regulatoryAuthority: string;
  patterns: RegExp[];
  negativePatterns?: RegExp[]; // Patterns that, if matched, indicate compliance was adhered to
  speakerRestriction?: "loan_officer" | "borrower" | "any";
  exactMessage: string;
  reason: string;
  suggestedResponse: string;
  correctiveGuidance: string;
  availableActions: AgentActionType[];
  escalationRequired: boolean;
  generatedSystemAction: string | null;
  riskIfIncorrect: string;
}

export const DETERMINISTIC_COMPLIANCE_RULES: ComplianceRule[] = [
  // ==========================================================================
  // SCENARIO 1: Informal Approval Statement
  // ==========================================================================
  {
    id: "COMP-TRID-001",
    name: "Informal Approval Language",
    title: "Approval language detected",
    category: "informal_approval_statement",
    severity: "high",
    source: "HYBRID",
    interventionType: "COMPLIANCE",
    confidence: 0.96,
    confidenceLevel: "HIGH",
    regulationCitation: "12 CFR § 1026.19(e) / CFPB TRID Pre-Approval Standards",
    regulatoryAuthority: "CFPB / FTC",
    speakerRestriction: "loan_officer",
    patterns: [
      /\b(you'?ll|you will|you'?re|you are)\s+(definitely|100%|guaranteed|totally|officially)?\s*(be approved|approved|cleared to close|get that loan|get the loan)\b/i,
      /\b(think you'?ll definitely be approved|guarantee you will get approved|promise you the loan)\b/i,
      /\b(in my book you'?re (100% )?approved)\b/i,
    ],
    negativePatterns: [
      /\b(conditional pre-qualification|contingent upon underwriting|subject to formal underwriting approval|not a final approval)\b/i,
    ],
    exactMessage:
      "Your statement may imply that the borrower is already approved. Avoid communicating an approval outcome before formal underwriting and lender review.",
    reason:
      "Under TRID standards, communicating that a borrower is definitely approved prior to underwriter review creates unauthorized lender liability and risks borrower detrimental reliance.",
    suggestedResponse:
      "We can discuss what may fit your situation, but final approval depends on the formal application and underwriting process.",
    correctiveGuidance:
      "State: 'We can discuss what may fit your situation, but final approval depends on the formal application and underwriting process.'",
    availableActions: ["accept", "view_evidence", "dismiss", "escalate"],
    escalationRequired: true,
    generatedSystemAction: "FLAG_TRID_INFORMAL_APPROVAL_AUDIT",
    riskIfIncorrect: "Unnecessary interruption or false positive.",
  },

  // ==========================================================================
  // SCENARIO 2: Indicative Interest Rate Statement
  // ==========================================================================
  {
    id: "COMP-TILA-002",
    name: "Indicative Interest Rate Statement",
    title: "Rate statement detected",
    category: "indicative_interest_rate_statement",
    severity: "medium",
    source: "RULE",
    interventionType: "WARNING",
    confidence: 0.94,
    confidenceLevel: "HIGH",
    regulationCitation: "12 CFR § 1026.24 / TILA Regulation Z Oral Disclosures",
    regulatoryAuthority: "CFPB",
    speakerRestriction: "loan_officer",
    patterns: [
      /\b(we can probably get you a\s+(\d+(\.\d+)?)%?\s*rate)\b/i,
      /\b(my rate is|rate will be|give you a rate of|quote you|lock you at|rate of)\s+(\d+(\.\d+)?)%/i,
      /\b(\d+(\.\d+)?)%\s*(interest )?rate\b/i,
    ],
    negativePatterns: [
      /\b(apr|annual percentage rate)\b/i,
    ],
    exactMessage:
      "This rate appears to be discussed as an indicative figure. Confirm the applicable assumptions, eligibility conditions, and that the figure is not being presented as a guaranteed offer.",
    reason:
      "TILA Regulation Z mandates that oral rate discussions state the corresponding APR and clarify that rates float until a formal lock agreement is executed.",
    suggestedResponse:
      "Rates can vary based on the borrower's profile, loan details, market conditions, and applicable terms.",
    correctiveGuidance:
      "State: 'Rates can vary based on the borrower's profile, loan details, market conditions, and applicable terms.'",
    availableActions: ["accept", "view_evidence", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "REQUEST_PPE_CORRESPONDING_APR",
    riskIfIncorrect: "The AI could incorrectly flag a legitimate educational discussion.",
  },

  // ==========================================================================
  // SCENARIO 3: Liability Exclusion / Potential Omission
  // ==========================================================================
  {
    id: "COMP-FRAUD-003",
    name: "Potential Liability Omission",
    title: "Potential liability omission",
    category: "suggesting_exclusion_of_liability",
    severity: "critical",
    source: "HYBRID",
    interventionType: "COMPLIANCE",
    confidence: 0.98,
    confidenceLevel: "HIGH",
    regulationCitation: "Fannie Mae Selling Guide B3-6-01 / 18 U.S.C. § 1014",
    regulatoryAuthority: "Fannie Mae / Freddie Mac / DOJ",
    speakerRestriction: "any",
    patterns: [
      /\b(could leave that (car|auto|student|debt|loan|lease)?\s*(loan|lease|debt)?\s*off (for now|the application)?)\b/i,
      /\b(leave (it|this|that|the car|the lease|the debt|the loan) off|not (mention|report|include)|omit (the|this|that)?\s*(debt|liability|lease|loan))\b/i,
      /\b(cleaner debt-to-income|look cleaner if we don't (say|mention|put))\b/i,
      /\b(don't have to put that (debt|lease|loan))\b/i,
    ],
    exactMessage:
      "Do not suggest omitting or misrepresenting an existing borrower liability. Financial information should be accurately disclosed and handled according to lender requirements.",
    reason:
      "Omitting liabilities on mortgage applications constitutes mortgage fraud under federal statute (18 U.S.C. § 1014). All recurring obligations must be listed on Form 1003.",
    suggestedResponse:
      "Let's make sure all existing financial obligations are accurately captured for the formal application and review process.",
    correctiveGuidance:
      "State: 'Let's make sure all existing financial obligations are accurately captured for the formal application and review process.'",
    availableActions: ["accept", "escalate", "view_evidence"],
    escalationRequired: true,
    generatedSystemAction: "ENFORCE_LIABILITY_1003_CAPTURE",
    riskIfIncorrect: "Failure to flag could create serious compliance and data-integrity risk.",
  },

  // ==========================================================================
  // SCENARIO 4: Unverifiable Income Discussion
  // ==========================================================================
  {
    id: "COMP-ATR-004",
    name: "Unverifiable Income Discussion",
    title: "Income verification required",
    category: "unverifiable_income_discussion",
    severity: "high",
    source: "HYBRID",
    interventionType: "CAPTURE",
    confidence: 0.95,
    confidenceLevel: "HIGH",
    regulationCitation: "12 CFR § 1026.43 / Dodd-Frank Ability-to-Repay & QM Rule",
    regulatoryAuthority: "CFPB",
    speakerRestriction: "any",
    patterns: [
      /\b(make about\s+(\$?\d+[\d,]*\s*)?(a month|per month|monthly)[^.]*(most of it isn't documented|not documented|cash|unreported))\b/i,
      /\b(isn't documented|not documented|under the table|cash contract|cash job|unreported cash|off the books)\b/i,
      /\b(count (cash|unreported) (money|income))\b/i,
    ],
    exactMessage:
      "Income was discussed but may not be fully verifiable. Capture the stated amount separately from verified income and identify the documentation needed.",
    reason:
      "Ability-to-Repay standards mandate third-party documentation for qualifying income. Stated income cannot be counted toward DTI until verified via 2 years of tax returns (Schedule C/1040) or W-2s.",
    suggestedResponse:
      "Let's separate the income you've reported from the income we can verify with documentation. We will note your stated monthly income of $8,000, and will request your tax returns to confirm the qualifying income for underwriting.",
    correctiveGuidance:
      "Record stated income separately from verified income. Request 2 years of tax returns and bank statements.",
    availableActions: ["accept", "mark_verification", "ask_question", "view_evidence"],
    escalationRequired: false,
    generatedSystemAction: "FLAG_UNVERIFIED_INCOME_CONDITION",
    riskIfIncorrect: "Incorrectly treating unverified income as verified could distort affordability assessment.",
  },

  // ==========================================================================
  // SCENARIO 5: Competitor Beat Promise
  // ==========================================================================
  {
    id: "COMP-UDAAP-005",
    name: "Unsubstantiated Competitor Beat Promise",
    title: "Competitive promise detected",
    category: "promise_to_beat_competitor",
    severity: "high",
    source: "HYBRID",
    interventionType: "WARNING",
    confidence: 0.93,
    confidenceLevel: "HIGH",
    regulationCitation: "FTC Act Section 5 / CFPB UDAAP & Secondary Marketing Policy",
    regulatoryAuthority: "FTC / CFPB",
    speakerRestriction: "loan_officer",
    patterns: [
      /\b(we'?ll beat whatever rate (the other lender|they|rocket|competitor) gives you)\b/i,
      /\b(beat (any|their|competitor'?s?|whatever)\s*rate|promise to beat|guarantee to beat (them|any rate)|we'll beat it by)\b/i,
    ],
    exactMessage:
      "This statement may create an unsupported commitment to beat a competitor's offer. Use factual, supportable language instead.",
    reason:
      "Promising to beat an unverified competitor quote creates regulatory exposure under FTC Act Section 5 (deceptive practices) and risks committing the lender to negative margin loans.",
    suggestedResponse:
      "We'd be happy to compare the available terms with the other offer and explain the differences.",
    correctiveGuidance:
      "State: 'We'd be happy to compare the available terms with the other offer and explain the differences.'",
    availableActions: ["accept", "view_evidence", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "GENERATE_OFFICIAL_LE_REQUEST_TASK",
    riskIfIncorrect: "The AI may incorrectly classify a legitimate comparison statement.",
  },

  // ==========================================================================
  // SCENARIO 6: Conflicting Borrower Information
  // ==========================================================================
  {
    id: "COMP-CONF-006",
    name: "Conflicting Financial Information",
    title: "Conflicting financial information",
    category: "conflicting_borrower_info",
    severity: "high",
    source: "HYBRID",
    interventionType: "CONFLICT",
    confidence: 0.95,
    confidenceLevel: "HIGH",
    regulationCitation: "Fannie Mae Form 1003 Data Accuracy / ATR Verification",
    regulatoryAuthority: "CFPB / Fannie Mae",
    speakerRestriction: "any",
    patterns: [
      /\b(actually closer to \$?1,200|different (debt|monthly|amount)|not \$?500)\b/i,
      /\b(debt is about \$?500.*closer to \$?1,200|closer to \$?1,200.*debt is about \$?500)\b/i,
    ],
    exactMessage:
      "John and Sarah provided different monthly debt amounts. Confirm the correct figure before relying on it.",
    reason:
      "Conflicting borrower statements regarding liabilities prevent accurate DTI calculation. The system cannot assume which figure is correct until clarified.",
    suggestedResponse:
      "Can we confirm the total monthly debt obligations so I can record the correct figure?",
    correctiveGuidance:
      "Ask: 'Can we confirm the total monthly debt obligations so I can record the correct figure?' Mark field as CONFLICTED in 1003 ledger.",
    availableActions: ["ask_question", "mark_review", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "MARK_DEBT_AS_CONFLICTED",
    riskIfIncorrect: "Distorted DTI ratio leading to incorrect loan approval or underwriter suspension.",
  },

  // ==========================================================================
  // SCENARIO 7: Missed Profiling Question
  // ==========================================================================
  {
    id: "COMP-PROF-007",
    name: "Missed Important Profiling Information",
    title: "Profiling information missing",
    category: "missed_profiling_question",
    severity: "medium",
    source: "RULE",
    interventionType: "QUESTION",
    confidence: 0.90,
    confidenceLevel: "HIGH",
    regulationCitation: "Lender Standard Profiling Protocol / Form 1003 Section 3",
    regulatoryAuthority: "Internal Underwriting Protocol",
    speakerRestriction: "any",
    patterns: [
      /\b(other recurring monthly|any other debts|besides the car and student loan)\b/i,
      /\b(profiling check: missing recurring obligations)\b/i,
    ],
    exactMessage:
      "Before moving on, consider confirming the borrower's complete monthly financial obligations.",
    reason:
      "Omitting inquiries about recurring obligations (such as student loans, credit card minimums, or child support) leads to unexpected liabilities appearing during credit report pull.",
    suggestedResponse:
      "Besides the car and student loan payments we've discussed, are there any other recurring monthly financial obligations?",
    correctiveGuidance:
      "Ask: 'Besides the car and student loan payments we've discussed, are there any other recurring monthly financial obligations?'",
    availableActions: ["ask_question", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "PROMPT_PROFILING_QUESTION",
    riskIfIncorrect: "Mild interruption if the officer planned to ask this later in the agenda.",
  },

  // ==========================================================================
  // SCENARIO 8: Closing Without Clear Next Action
  // ==========================================================================
  {
    id: "COMP-CLOSE-008",
    name: "Consultation Close Without Next Action",
    title: "Next step not confirmed",
    category: "closing_without_next_action",
    severity: "medium",
    source: "RULE",
    interventionType: "NEXT_ACTION",
    confidence: 0.92,
    confidenceLevel: "HIGH",
    regulationCitation: "Lender Sales Governance & Application Follow-Up Standard",
    regulatoryAuthority: "Internal Operations",
    speakerRestriction: "loan_officer",
    patterns: [
      /\b(great,? I'?ll let you know if anything comes up)\b/i,
      /\b(I'?ll let you know if anything comes up|talk to you later|have a good day then|bye for now)\b/i,
    ],
    negativePatterns: [
      /\b(scheduled our next|send you the portal link|upload checklist|application follow-up|call on (monday|tuesday|wednesday|thursday|friday))\b/i,
    ],
    exactMessage:
      "The meeting is ending without a clearly assigned next action.",
    reason:
      "Consultations concluding without assigned deliverables create pipeline abandonment and customer disengagement.",
    suggestedResponse:
      "Confirm the documentation checklist and schedule the next application-related follow-up.",
    correctiveGuidance:
      "State: 'Before we wrap up, I'll send over our secure portal link to upload Sarah's Schedule C returns and bank statements, and let's schedule our follow-up for Thursday at 2 PM.'",
    availableActions: ["create_followup", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "CREATE_DRAFT_FOLLOWUP_TASK",
    riskIfIncorrect: "Drafting an unnecessary task if follow-up was already arranged offline.",
  },
];
