# Darwix AI — Advanced Scenario Test Matrix & Behavioral Specifications

This document outlines the exact behavioral specifications, detection engines, compliance citations, and escalation protocols for all advanced mortgage consultation scenarios.

> [!IMPORTANT]
> **Zero Private Chain-of-Thought Exposure**: "Evidence" refers strictly to verifiable transcript dialogue quotes, structured Form 1003 data bindings, or factual regulatory citations. No internal hidden model prompts or chain-of-thought traces are exposed to users.

---

## Scenario 1: Informal Loan Approval Statement

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Informal Loan Approval Statement without Underwriting Review |
| **Detection Method** | Multi-pattern regex matching (`/\b(you'?ll|you will|you'?re|you are)\s+(definitely|100%|guaranteed)?\s*(be approved|approved)\b/i`, `/\b(you should be approved)\b/i`) guarded by negative patterns (`contingent upon underwriting`, `conditional pre-qualification`). |
| **Engine Classification** | **HYBRID** (Deterministic Regex Rule authoritative + Groq contextual verification) |
| **Exact Agent Message** | *"Approval has not been established from this meeting. Avoid representing the customer as approved before the required underwriting and verification process."* |
| **Severity Level** | **HIGH** |
| **Evidence** | Loan Officer statement during consultation: *"Based on what you've told me, you should be approved for this mortgage."* (12 CFR § 1026.19(e) TRID Pre-Approval Standards). |
| **Available Agent Actions** | `Review Evidence` (`view_evidence`), `Use Suggested Response` (`accept`), `Dismiss` (`dismiss`), `Escalate` (`escalate`) |
| **Recorded Information** | Stored in meeting audit stream as potential TRID infraction event `FLAG_TRID_INFORMAL_APPROVAL_AUDIT`. |
| **Escalation Protocol** | Requires mandatory supervisor review acknowledgment if escalated or uncorrected prior to closing consultation. |
| **Low-Confidence Behavior** | Deterministic rule enforces minimum 0.96 confidence; never throttled or suppressed. |
| **System Action** | Defensive ceiling blocks automated application status change to "Approved" across CRM and LOS. Application stage clamped to "Consultation Completed". |
| **Risk If Incorrect** | Unauthorized lender commitment, civil liability under promissory estoppel, and TRID disclosure violations. |

---

## Scenario 2: Indicative Interest Rate Quoting

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Indicative Interest Rate Quoted Without Corresponding APR or Discount Terms |
| **Detection Method** | Regex matching interest rate percentages (`/\b(\d+(\.\d+)?)%\s*(interest )?rate\b/i`) lacking negative pattern matches for `/\b(apr|annual percentage rate)\b/i`. |
| **Engine Classification** | **RULE** (TILA Regulation Z Oral Disclosures — 12 CFR § 1026.24) |
| **Exact Agent Message** | *"Treat this as indicative only unless supported by an approved rate source and applicable eligibility conditions."* |
| **Severity Level** | **MEDIUM** |
| **Evidence** | Loan Officer statement: *"Regarding rates, we can probably get you a 6.1% rate for your 30-year fixed loan."* |
| **Available Agent Actions** | `Use Suggested Response` (`accept`), `Review Evidence` (`view_evidence`), `Dismiss` (`dismiss`) |
| **Recorded Information** | Flags rate discussion in summary notes as floating indicative estimate; records PPE query parameters. |
| **Escalation Protocol** | Standard supervisory review in weekly audit sample; no immediate live call escalation required. |
| **Low-Confidence Behavior** | Deterministic rule operates with 0.94 confidence. Never hallucinates or fabricates a mock market rate. |
| **System Action** | Emits `REQUEST_PPE_CORRESPONDING_APR`; prevents rate locking until formal Optimal Blue PPE execution. |
| **Risk If Incorrect** | Misleading rate advertising under CFPB rules and borrower dissatisfaction when locked rate differs. |

---

## Scenario 3: Potential Liability Omission

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Attempted or Suggested Exclusion of Existing Debt / Liability |
| **Detection Method** | Pattern matching phrases suggesting omitting liabilities (`/\b(leave that (car|auto|student|debt)?\s*loan off|cleaner debt-to-income)\b/i`). |
| **Engine Classification** | **HYBRID** (Fannie Mae Selling Guide B3-6-01 / Federal Statute 18 U.S.C. § 1014) |
| **Exact Agent Message** | *"Do not omit or misrepresent an existing liability. Capture the obligation accurately and follow the required verification process."* |
| **Severity Level** | **CRITICAL** (Highest severity; bypasses all nudge fatigue suppressions) |
| **Evidence** | Loan Officer statement: *"We could leave that car loan off for now to make your debt-to-income look cleaner."* |
| **Available Agent Actions** | `Correct Information` (`accept`), `Escalate to Compliance` (`escalate`), `Review Evidence` (`view_evidence`) |
| **Recorded Information** | Obligation logged into Form 1003 liability ledger. Exception logged to Branch Compliance queue. |
| **Escalation Protocol** | Mandatory Branch Compliance Officer escalation; triggers red banner in Live Workspace. |
| **Low-Confidence Behavior** | Evaluated via deterministic pattern with 0.98 confidence; cannot be suppressed or dismissed quietly. |
| **System Action** | Enforces liability capture; prevents any automated deletion or omission from MISMO 3.4 payload. |
| **Risk If Incorrect** | Civil and criminal mortgage fraud under 18 U.S.C. § 1014; immediate loan repurchase demand by Fannie Mae. |

---

## Scenario 4: Undocumented & Unverifiable Cash Income

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Unverifiable Cash Income Discussion (Dodd-Frank Ability-to-Repay / ATR Rule) |
| **Detection Method** | Dialogue matching self-employment / cash income lacking documentation (`/\b(most of it isn't documented|private cash contracts|cash job)\b/i`). |
| **Engine Classification** | **HYBRID** (12 CFR § 1026.43 ATR / Qualified Mortgage Standard) |
| **Exact Agent Message** | *"Income is currently stated, not verified. Capture it as stated and request appropriate documentation before treating it as verified."* |
| **Severity Level** | **HIGH** |
| **Evidence** | Co-borrower Sarah Miller: *"I make about $8,000 a month, but most of it isn't documented because a lot of clients pay through private cash contracts."* |
| **Available Agent Actions** | `Record Stated Income` (`accept`), `Mark for Tax Verification` (`mark_verification`), `Ask Question` (`ask_question`), `Review Evidence` (`view_evidence`) |
| **Recorded Information** | Co-borrower financial profile updated: `statedMonthlyIncome = 8000`, `verifiedMonthlyIncome = 0`, `incomeVerificationStatus = "required"`. |
| **Escalation Protocol** | Routed to back-office Operations verification queue with 2-year 1040/Schedule C condition. |
| **Low-Confidence Behavior** | AI inferences <0.70 are flagged with cautionary text; deterministic rule remains authoritative at 0.95. |
| **System Action** | Emits `FLAG_UNVERIFIED_INCOME_CONDITION`; excludes $8,000 from automated underwriting DTI ratio. |
| **Risk If Incorrect** | Ineligible loan origination, DTI miscalculation, and loss of Qualified Mortgage safe-harbor protection. |

---

## Scenario 5: Unsubstantiated Competitor Beat Promise

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Unsubstantiated Promise to Beat Competitor's Offer |
| **Detection Method** | Pattern matching guarantees to beat competitor pricing (`/\b(we can definitely beat (their offer|them)|beat whatever rate)\b/i`). |
| **Engine Classification** | **HYBRID** (FTC Act Section 5 Deceptive Practices / CFPB UDAAP Standard) |
| **Exact Agent Message** | *"Avoid promising to beat a competitor without verified pricing and eligibility information."* |
| **Severity Level** | **HIGH** |
| **Evidence** | Loan Officer statement: *"Don't worry, we can definitely beat their offer and give you a better rate."* |
| **Available Agent Actions** | `Use Suggested Response` (`accept`), `Review Evidence` (`view_evidence`), `Dismiss` (`dismiss`) |
| **Recorded Information** | Creates task `GENERATE_OFFICIAL_LE_REQUEST_TASK` requiring official competitor Loan Estimate. |
| **Escalation Protocol** | Secondary Marketing review if loan officer submits pricing concession request. |
| **Low-Confidence Behavior** | If AI confidence is below 0.70, surfaces with cautious notice; deterministic rule operates at 0.93. |
| **System Action** | Prevents price concession application without verified competing Loan Estimate document attached. |
| **Risk If Incorrect** | Regulatory enforcement for deceptive pricing claims and origination of negative-margin loans. |

---

## Scenario 6: Conflicting Borrower Information

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Multi-Turn Conflicting Financial Statements Between Co-Borrowers |
| **Detection Method** | Multi-speaker diarization analysis detecting conflicting debt declarations ($500 by John vs $1,200 by Sarah) within transcript window. |
| **Engine Classification** | **HYBRID** (Fannie Mae Form 1003 Data Accuracy / ATR Verification) |
| **Exact Agent Message** | *"Borrower information conflicts with an earlier statement. Confirm the correct information before updating the record."* |
| **Severity Level** | **HIGH** |
| **Evidence** | John Miller stated: *"Our monthly debt is about $500..."* followed by Sarah Miller stating: *"Wait John, that's not right. It's actually closer to $1,200..."* |
| **Available Agent Actions** | `Ask Clarifying Question` (`ask_question`), `Mark as Conflicted` (`mark_review`), `Dismiss` (`dismiss`) |
| **Recorded Information** | Borrower profile marked: `totalMonthlyDebtStatus: "conflicted"`, details: `{ johnAmount: 500, sarahAmount: 1200 }`. |
| **Escalation Protocol** | Highlighted in Operations Dashboard Back-Office Conflict Resolution queue until resolved. |
| **Low-Confidence Behavior** | System NEVER automatically picks a winner or guesses between conflicting numbers. |
| **System Action** | Emits `MARK_DEBT_AS_CONFLICTED`; disables automated DTI qualification until credit report or clarification. |
| **Risk If Incorrect** | Inaccurate DTI underwriting suspension or loan denial during final funding review. |

---

## Scenario 7: Missed Important Profiling Question

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Incomplete Liabilities Discovery (Missed Recurring Debt Inquiries) |
| **Detection Method** | Contextual agenda tracker checking if recurring obligations (credit card minimums, student loans, child support) were explored. |
| **Engine Classification** | **RULE** (Lender Standard Profiling Protocol / Form 1003 Section 3) |
| **Exact Agent Message** | *"Consider asking about recurring financial obligations before completing the affordability discussion."* |
| **Severity Level** | **MEDIUM** |
| **Evidence** | Loan officer transitioned directly from auto loan to interest rates without probing for other obligations. |
| **Available Agent Actions** | `Queue Discovery Question` (`ask_question`), `Dismiss` (`dismiss`) |
| **Recorded Information** | Suggests question into live transcript queue: *"Besides the car and student loan payments, are there other recurring obligations?"* |
| **Escalation Protocol** | None required; standard conversational sales guidance. |
| **Low-Confidence Behavior** | Subject to 3-second cooldown; suppressed if active deck exceeds 4 pending cards. |
| **System Action** | Places pending question banner in conversation stream with 1-click "Ask Now" insertion. |
| **Risk If Incorrect** | Mild loan officer distraction if question was intentionally delayed. |

---

## Scenario 8: Consultation Closing Without Clear Next Action

| Specification Field | Operational Behavior |
|---|---|
| **Scenario Name** | Consultation Closing Statement Without Concrete Next Deliverables |
| **Detection Method** | Pattern matching premature wrap-up phrases (`/\b(great,? I'?ll let you know if anything comes up|bye for now)\b/i`) without follow-up scheduling. |
| **Engine Classification** | **RULE** (Lender Sales Governance & Application Follow-Up Standard) |
| **Exact Agent Message** | *"Define a clear next action before closing the meeting."* |
| **Severity Level** | **MEDIUM** |
| **Evidence** | Loan Officer statement: *"Great, I'll let you know if anything comes up. Bye for now."* |
| **Available Agent Actions** | `Create Follow-Up Task` (`create_followup`), `Dismiss` (`dismiss`) |
| **Recorded Information** | Drafts follow-up task: *"Schedule Application Follow-Up & Send Document Checklist"*. |
| **Escalation Protocol** | Unassigned meetings without follow-up appear in Manager Unresolved Actions report. |
| **Low-Confidence Behavior** | Evaluated deterministically with 0.92 confidence. |
| **System Action** | Automatically generates high-priority follow-up item in Post-Meeting Summary Action Center. |
| **Risk If Incorrect** | Pipeline slippage and prospective borrower abandonment to competing lenders. |
