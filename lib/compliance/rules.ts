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
      /\b(you should be approved|think you'?ll (definitely )?be approved|guarantee you will get approved|promise you the loan)\b/i,
      /\b(in my book you'?re (100% )?approved)\b/i,
    ],
    negativePatterns: [
      /\b(conditional pre-qualification|contingent upon underwriting|subject to formal underwriting approval|not a final approval)\b/i,
    ],
    exactMessage:
      "Approval has not been established from this meeting. Avoid representing the customer as approved before the required underwriting and verification process.",
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
      "Treat this as indicative only unless supported by an approved rate source and applicable eligibility conditions.",
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
      "Do not omit or misrepresent an existing liability. Capture the obligation accurately and follow the required verification process.",
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
      "Income is currently stated, not verified. Capture it as stated and request appropriate documentation before treating it as verified.",
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
      /\b(we can definitely beat (their offer|them|whatever rate)|beat (any|their|competitor'?s?|whatever)\s*rate|promise to beat|guarantee to beat (them|any rate)|we'll beat it by)\b/i,
    ],
    exactMessage:
      "Avoid promising to beat a competitor without verified pricing and eligibility information.",
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
      "Borrower information conflicts with an earlier statement. Confirm the correct information before updating the record.",
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
      "Consider asking about recurring financial obligations before completing the affordability discussion.",
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
      "Define a clear next action before closing the meeting.",
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

  // ==========================================================================
  // SCENARIO 9: Customer Profiling
  // ==========================================================================
  {
    id: "RULE-PROF-009",
    name: "Customer Profiling & Timeline Discovery",
    title: "Property timeline & goal profiling",
    category: "profiling",
    severity: "low",
    source: "RULE",
    interventionType: "QUESTION",
    confidence: 0.91,
    confidenceLevel: "HIGH",
    regulationCitation: "Form 1003 Section 4 / Mortgage Origination Best Practice",
    regulatoryAuthority: "Internal Sales Enablement",
    speakerRestriction: "any",
    patterns: [
      /\b(start with your current employment background|verify your qualifying profile|looking for a house|buying our first home)\b/i,
    ],
    exactMessage:
      "Confirm the target property type, expected move-in timeline, and first-time homebuyer status to tailor program eligibility.",
    reason:
      "Establishing clear purchase timeline and first-time homebuyer eligibility unlocks specialized down-payment assistance programs and sets rate lock duration.",
    suggestedResponse:
      "Are you currently under contract or actively touring homes, and what is your ideal target closing date?",
    correctiveGuidance:
      "Ask: 'Are you currently under contract or actively touring homes, and what is your ideal target closing date?'",
    availableActions: ["ask_question", "accept", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "UPDATE_MORTGAGE_GOAL_TIMELINE",
    riskIfIncorrect: "Low risk; standard customer discovery profiling.",
  },

  // ==========================================================================
  // SCENARIO 10: Product Explanation
  // ==========================================================================
  {
    id: "RULE-PROD-010",
    name: "Product Explanation & Guidance",
    title: "Product guidance: 30Y vs 15Y Fixed",
    category: "product_explanation",
    severity: "low",
    source: "RULE",
    interventionType: "SUGGESTION",
    confidence: 0.94,
    confidenceLevel: "HIGH",
    regulationCitation: "Fannie Mae Conforming Guidelines / CFPB Loan Comparison",
    regulatoryAuthority: "CFPB",
    speakerRestriction: "any",
    patterns: [
      /\b(difference between.*(30-year|15-year)|30-year versus 15-year|which loan type.*better|difference between these mortgage options)\b/i,
    ],
    exactMessage:
      "Explain the key differences between 30-year fixed conforming vs 15-year based on the borrowers' purchase price and down payment.",
    reason:
      "Borrower needs clarity on monthly cash flow versus accelerated principal amortization without unauthorized rate guarantees.",
    suggestedResponse:
      "A 30-year fixed provides the lowest mandatory monthly payment for flexibility, whereas a 15-year builds equity much faster with lower total interest expense. With your $85,000 down payment (~12.6%), both options will carry private mortgage insurance until 20% equity is reached.",
    correctiveGuidance:
      "Highlight payment stability on 30-year vs total interest savings on 15-year. Clarify PMI requirement with <20% down.",
    availableActions: ["accept", "ask_question", "view_evidence", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: null,
    riskIfIncorrect: "Product terms must accurately reflect conforming loan guidelines.",
  },

  // ==========================================================================
  // SCENARIO 11: Customer Objection Handling
  // ==========================================================================
  {
    id: "RULE-OBJ-011",
    name: "Turnaround Speed Objection",
    title: "Turnaround speed objection",
    category: "customer_objection",
    severity: "medium",
    source: "RULE",
    interventionType: "SUGGESTION",
    confidence: 0.93,
    confidenceLevel: "HIGH",
    regulationCitation: "TRID Closing Disclosure Timing (12 CFR § 1026.19(f))",
    regulatoryAuthority: "CFPB",
    speakerRestriction: "any",
    patterns: [
      /\b(process will be faster|close in 14 days|close in 10 days|other lender is quicker|close faster)\b/i,
    ],
    exactMessage:
      "Address the turnaround speed objection by requesting their quoted closing timeline and explaining our direct local underwriting milestones.",
    reason:
      "Competitors often quote turnaround speeds that exclude mandatory appraisal turn-times and TRID 3-day CD waiting periods. Explaining milestones preserves borrower confidence.",
    suggestedResponse:
      "What timeline did they quote you, and did that include appraisal and underwriting milestones? We offer direct local underwriting with clear milestones from document upload to clear-to-close.",
    correctiveGuidance:
      "Ask what specific timeline was quoted and explain our milestone-driven local underwriting process.",
    availableActions: ["accept", "ask_question", "view_evidence", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: null,
    riskIfIncorrect: "Do not disparage competitors without documented facts.",
  },

  // ==========================================================================
  // SCENARIO 12: Missing Information
  // ==========================================================================
  {
    id: "RULE-MISS-012",
    name: "Down Payment Asset Source Verification",
    title: "Down payment asset source missing",
    category: "missing_information",
    severity: "medium",
    source: "RULE",
    interventionType: "CAPTURE",
    confidence: 0.92,
    confidenceLevel: "HIGH",
    regulationCitation: "Fannie Mae B3-4.1-01 / Minimum Reserve & Asset Seasoning",
    regulatoryAuthority: "Fannie Mae",
    speakerRestriction: "any",
    patterns: [
      /\b(\$85,000 ready for down payment|have \$85,000 for down payment|down payment of \$85,000)\b/i,
      /\b(missing asset seasoning verification)\b/i,
    ],
    exactMessage:
      "Confirm the specific accounts holding the $85,000 down payment funds to ensure 60-day asset seasoning and verify whether any gift funds are involved.",
    reason:
      "Unseasoned large deposits require detailed paper trails under anti-money laundering and Fannie Mae guidelines. Identifying account sources early prevents closing delays.",
    suggestedResponse:
      "Are your down payment funds currently held in checking or savings, and will any portion be sourced from gift funds or investment liquidation?",
    correctiveGuidance:
      "Ask: 'Are your down payment funds currently held in checking or savings, and will any portion be sourced from gift funds or investment liquidation?'",
    availableActions: ["ask_question", "mark_verification", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "FLAG_DOWN_PAYMENT_SEASONING_CHECK",
    riskIfIncorrect: "Overlooking unseasoned funds leads to underwriting condition delays.",
  },

  // ==========================================================================
  // SCENARIO 13: Compliance Warning (ECOA / Reg B Fair Lending)
  // ==========================================================================
  {
    id: "RULE-ECOA-013",
    name: "Fair Lending / ECOA Inquiries Notice",
    title: "Fair Lending / ECOA compliance notice",
    category: "compliance_warning",
    severity: "high",
    source: "RULE",
    interventionType: "COMPLIANCE",
    confidence: 0.97,
    confidenceLevel: "HIGH",
    regulationCitation: "12 CFR § 1002.5 / Equal Credit Opportunity Act (Regulation B)",
    regulatoryAuthority: "CFPB / DOJ",
    speakerRestriction: "loan_officer",
    patterns: [
      /\b(planning on having (kids|children)|expecting a baby|are you married or single|maternity leave)\b/i,
    ],
    exactMessage:
      "Do not make inquiries regarding childbearing intentions, family planning, or marital status outside standard Form 1003 joint application fields under ECOA Regulation B.",
    reason:
      "Inquiring about family planning or discriminatory demographic factors violates federal fair lending statutes (12 CFR § 1002.5).",
    suggestedResponse:
      "Let's focus strictly on qualifying income and debt parameters as defined in standard mortgage application guidelines.",
    correctiveGuidance:
      "Refrain from informal demographic or personal family questions. Follow Form 1003 demographic collection procedures.",
    availableActions: ["accept", "view_evidence", "escalate"],
    escalationRequired: true,
    generatedSystemAction: "LOG_ECOA_COMPLIANCE_EXCEPTION",
    riskIfIncorrect: "Failure to intervene creates severe regulatory liability under fair lending enforcement.",
  },

  // ==========================================================================
  // SCENARIO 14: Next-Best Action (Credit Pull Authorization)
  // ==========================================================================
  {
    id: "RULE-NBA-014",
    name: "Next Best Action: Credit Authorization",
    title: "Next best action: Soft credit pull authorization",
    category: "next_best_action",
    severity: "low",
    source: "RULE",
    interventionType: "NEXT_ACTION",
    confidence: 0.90,
    confidenceLevel: "HIGH",
    regulationCitation: "Fair Credit Reporting Act (15 U.S.C. § 1681b) / Form 1003",
    regulatoryAuthority: "FTC / CFPB",
    speakerRestriction: "any",
    patterns: [
      /\b(truck loan of \$485|car loan of \$485|credit score is around|run our credit|pre-qualify us)\b/i,
    ],
    exactMessage:
      "Request borrower authorization for a soft tri-merge credit pull to confirm liabilities and establish definitive qualifying scores without impacting their credit rating.",
    reason:
      "A soft credit pull allows the loan officer to review exact debt amounts and credit scores before issuing a formal pre-approval.",
    suggestedResponse:
      "With your permission, we can initiate a soft credit check today to verify existing obligations—it won't affect your credit score and will give us precise numbers.",
    correctiveGuidance:
      "State: 'With your permission, we can initiate a soft credit check today to verify existing obligations—it won't affect your credit score and will give us precise numbers.'",
    availableActions: ["accept", "ask_question", "dismiss"],
    escalationRequired: false,
    generatedSystemAction: "PREPARE_SOFT_CREDIT_AUTHORIZATION_DISCLOSURE",
    riskIfIncorrect: "Premature credit discussion if borrower is purely exploring rates.",
  },
];
