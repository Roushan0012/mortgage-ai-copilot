import { InterventionCategory, InterventionSeverity } from "@/types";

export interface ComplianceRule {
  id: string;
  name: string;
  category: InterventionCategory;
  severity: InterventionSeverity;
  regulationCitation: string;
  regulatoryAuthority: string;
  patterns: RegExp[];
  negativePatterns?: RegExp[]; // Patterns that, if matched, indicate compliance was adhered to (e.g., APR was stated)
  exactMessage: string;
  reason: string;
  correctiveGuidance: string;
  escalationRequired: boolean;
  generatedSystemAction: string | null;
  riskIfIncorrect: string;
}

export const DETERMINISTIC_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "COMP-TRID-001",
    name: "Informal Approval Prohibition",
    category: "informal_approval_statement",
    severity: "critical",
    regulationCitation: "12 CFR § 1026.19(e) / CFPB TRID Pre-Approval Standards",
    regulatoryAuthority: "CFPB / FTC",
    patterns: [
      /\b(you'?re|you are)\s+(100%|definitely|guaranteed|totally|officially)?\s*(approved|cleared to close|guaranteed|locked in)\b/i,
      /\b(we will definitely get you (that|the) loan)\b/i,
      /\b(guarantee you will get approved|promise you the loan)\b/i,
    ],
    negativePatterns: [
      /\b(conditional pre-qualification|contingent upon underwriting|subject to formal approval)\b/i,
    ],
    exactMessage: "PROHIBITED INFORMAL APPROVAL: Immediately clarify that pre-approval is conditional and subject to comprehensive underwriting review.",
    reason: "Under TRID and RESPA, verbal commitments of approval prior to formal underwriting review and verification of complete documentation are deceptive and legally non-binding, exposing the institution to regulatory sanctions.",
    correctiveGuidance: "State: 'To clarify, our discussion today provides a preliminary pre-qualification. Full approval requires verification of documentation and formal underwriter determination.'",
    escalationRequired: true,
    generatedSystemAction: "FLAG_TRID_INFORMAL_APPROVAL_AUDIT",
    riskIfIncorrect: "Severe CFPB compliance citation, borrower detrimental reliance claim, and lender reputational exposure.",
  },
  {
    id: "COMP-TILA-002",
    name: "Indicative Interest Rate without APR Disclosure",
    category: "indicative_interest_rate_statement",
    severity: "high",
    regulationCitation: "12 CFR § 1026.24 / TILA Regulation Z Advertising & Oral Disclosures",
    regulatoryAuthority: "CFPB",
    patterns: [
      /\b(my rate is|rate will be|give you a rate of|quote you|lock you at|rate of)\s+(\d+(\.\d+)?)%/i,
    ],
    negativePatterns: [
      /\b(apr|annual percentage rate)\b/i,
    ],
    exactMessage: "MANDATORY APR DISCLOSURE: Oral rate quotes must be accompanied by the Annual Percentage Rate (APR) and note that the rate is floating.",
    reason: "TILA Reg Z mandates that stating an interest rate orally without stating the corresponding APR, discount points, and rate-lock expiration terms is an unfair and deceptive practice.",
    correctiveGuidance: "State: 'That interest rate corresponds to an estimated APR of [X.XX]%, which includes closing fees and is subject to market fluctuation until locked.'",
    escalationRequired: false,
    generatedSystemAction: "REQUEST_PPE_CORRESPONDING_APR",
    riskIfIncorrect: "TILA statutory damages and mandatory disclosure remediation.",
  },
  {
    id: "COMP-FRAUD-003",
    name: "Liability Omission or Debt Exclusion",
    category: "suggesting_exclusion_of_liability",
    severity: "critical",
    regulationCitation: "Fannie Mae Selling Guide B3-6-01 / 18 U.S.C. § 1014",
    regulatoryAuthority: "Fannie Mae / Freddie Mac / DOJ",
    patterns: [
      /\b(leave (it|this|that|the car|the lease|the debt|the loan) off|not (mention|report|include)|omit (the|this|that)?\s*(debt|liability|lease|loan))\b/i,
      /\b(cleaner debt-to-income|look cleaner if we don't (say|mention|put))\b/i,
      /\b(don't have to put that (debt|lease|loan))\b/i,
    ],
    exactMessage: "MANDATORY FULL DEBT DISCLOSURE: All debts, leases, child support, and secondary obligations must be reported on Form 1003.",
    reason: "Omission of liabilities constitutes loan application fraud under federal law. Third-party payment arrangements or remaining term do not exempt legally binding liabilities unless Fannie Mae 12-month documented release rules apply.",
    correctiveGuidance: "State: 'Federal lending regulations require disclosing all existing debts on Form 1003. We will document the terms accurately for underwriting.'",
    escalationRequired: false,
    generatedSystemAction: "ENFORCE_LIABILITY_1003_CAPTURE",
    riskIfIncorrect: "Immediate loan repurchase demand, fraud reporting under SAR (Suspicious Activity Report), and loan denial.",
  },
  {
    id: "COMP-ATR-004",
    name: "Unverifiable Cash or Side Income",
    category: "unverifiable_income_discussion",
    severity: "high",
    regulationCitation: "12 CFR § 1026.43 / Dodd-Frank Ability-to-Repay & QM Rule",
    regulatoryAuthority: "CFPB",
    patterns: [
      /\b(paid\s+me\s+(\$?\d+[\d,]*\s*)?cash|under the table|cash contract|cash job|unreported cash|off the books)\b/i,
      /\b(count (cash|unreported) (money|income))\b/i,
    ],
    exactMessage: "UNVERIFIABLE INCOME RESTRICTION: Qualifying income must be verifiable via W-2s, 1099s, tax returns, and bank statements.",
    reason: "The Ability-to-Repay rule prohibits lenders from relying on unverified consumer assertions of income. Cash income not reported on federal tax returns cannot be factored into qualifying ratios.",
    correctiveGuidance: "State: 'To qualify for a conforming mortgage, income must be documented through standard tax filings and consecutive bank deposits.'",
    escalationRequired: false,
    generatedSystemAction: "FLAG_UNVERIFIED_INCOME_CONDITION",
    riskIfIncorrect: "Loss of Qualified Mortgage safe-harbor protection and loan underwriting rejection.",
  },
  {
    id: "COMP-UDAAP-005",
    name: "Unsubstantiated Competitor Beat Promise",
    category: "promise_to_beat_competitor",
    severity: "medium",
    regulationCitation: "FTC Act Section 5 / CFPB UDAAP & Secondary Marketing Policy",
    regulatoryAuthority: "FTC / CFPB",
    patterns: [
      /\b(beat (any|their|competitor'?s?)\s*rate|promise to beat|guarantee to beat (them|any rate)|we'll beat it by)\b/i,
    ],
    exactMessage: "COMPETITOR PRICING VERIFICATION: Request official competing Loan Estimate before making binding commitments.",
    reason: "Guaranteeing to beat competitor pricing without reviewing their official Loan Estimate risks committing to terms outside lender secondary pricing margins, triggering deceptive sales practice scrutiny.",
    correctiveGuidance: "State: 'We would love to examine their official Loan Estimate to compare APR, discount points, and origination credits side by side.'",
    escalationRequired: false,
    generatedSystemAction: "GENERATE_OFFICIAL_LE_REQUEST_TASK",
    riskIfIncorrect: "Unprofitable rate commitment, margin compression, or customer bait-and-switch complaint.",
  },
  {
    id: "COMP-CLOSE-006",
    name: "Consultation Wrap-Up Without Actionable Next Steps",
    category: "closing_without_next_action",
    severity: "low",
    regulationCitation: "Lender Sales Governance & Customer Engagement Standard",
    regulatoryAuthority: "Internal Lending Operations",
    patterns: [
      /\b(talk to you later|thanks for stopping by|have a good day then|bye for now)\b/i,
    ],
    negativePatterns: [
      /\b(next step|send you the link|application|upload your documents|schedule our next|follow up)\b/i,
    ],
    exactMessage: "MISSING CLOSE: Wrap up consultation with explicit next milestones (application link, document checklist, next check-in).",
    reason: "Unstructured meeting conclusions cause pipeline leakage and delay time-to-application.",
    correctiveGuidance: "Prompt: 'Before we conclude, let's schedule our next touchpoint and send you our secure portal link to upload your W-2s and bank statements.'",
    escalationRequired: false,
    generatedSystemAction: "GENERATE_FOLLOW_UP_CHECKLIST",
    riskIfIncorrect: "Pipeline conversion drop-off and extended sales cycle.",
  },
];
