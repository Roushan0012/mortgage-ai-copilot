# Darwix AI — Domain Research, Operational Context & Explicit Assumptions

This document articulates the domain research, operational context, and explicit product assumptions governing the Darwix AI Mortgage Copilot architecture.

---

## 1. U.S. Mortgage Journey Assumptions

- **Standardized Application Framework**: Assumes origination workflows align with the Uniform Residential Loan Application (Fannie Mae Form 1003 / Freddie Mac Form 65) and MISMO 3.4 data standards.
- **Consultation Objective**: The initial borrower consultation is assumed to be an exploratory pre-qualification or discovery session where initial financial parameters (income, assets, debts, property goals) are stated by the borrower, rather than an underwriting submission.
- **Stated vs. Verified Information**: Assumes conversational data is strictly *stated* and unverified. Verified figures require documentation (W-2s, 1040 Schedule C, 30 days of paystubs, 60 days of bank statements, or tri-merge credit report pulls).
- **Borrower Profile Complexity**: Assumes primary and co-borrower household structures frequently introduce complex mixed income sources (e.g. W-2 salary + 1099 self-employment) and conflicting debt estimates that require manual reconciliation.

---

## 2. Loan Officer (Agent) Workflow Assumptions

- **Consultation Medium**: Consultations take place via phone call, video conference (e.g. Zoom / Teams), or in-person branch meetings.
- **Cognitive Load & In-Call Multitasking**: Assumes loan officers struggle to simultaneously listen actively, probe for liabilities, take accurate notes, calculate DTI ratios, and look up product guideline differences.
- **Nudge Sensitivity**: Assumes loan officers will mute or abandon any software that interrupts frequently, displays obvious trivial information, or lags behind real-time speech by more than 2 seconds.
- **Accountability Model**: Assumes the licensed Loan Officer (NMLS registered) is legally responsible for all statements made and all data submitted to the lender's loan origination system. The AI cannot share legal liability.

---

## 3. Enterprise System Assumptions

- **Fragmented Tech Stack**: Assumes mortgage lenders utilize distinct, siloed systems:
  - **CRM**: Salesforce Financial Services Cloud or Total Expert for leads, customer communication logs, and follow-up tasks.
  - **LOS**: ICE Mortgage Technology Encompass or Blend for loan applications, loan processing, underwriting conditions, and loan disclosures.
  - **Document Portal**: Blend, Roostify, or PointServ for secure borrower document collection and OCR indexing.
  - **PPE**: Optimal Blue or Polly for live interest rate pricing and scenario comparison.
- **Batch vs. Event-Driven Sync**: Assumes enterprise systems communicate through REST APIs or webhook events, but enterprise firewalls often enforce strict approval gateways and rate limits.

---

## 4. Compliance & Regulatory Assumptions

- **CFPB TRID (12 CFR § 1026.19)**: Assumes oral communications cannot state or imply that a borrower is approved prior to formal application submission and underwriter evaluation.
- **TILA Regulation Z (12 CFR § 1026.24)**: Assumes quoting an interest rate orally without stating the Annual Percentage Rate (APR) and applicable terms constitutes a regulatory violation.
- **Dodd-Frank Ability-to-Repay (ATR) / Qualified Mortgage (QM) Rule**: Assumes undocumented or cash income cannot be counted toward qualifying DTI without two years of documented tax filings.
- **Equal Credit Opportunity Act (ECOA / Regulation B)**: Assumes loan officers are legally prohibited from inquiring into childbearing plans, familial intentions, or protected demographic traits outside standard Form 1003 government monitoring disclosures.
- **Mortgage Fraud Statutes (18 U.S.C. § 1014)**: Assumes omitting, hiding, or advising a borrower to exclude an existing liability (e.g. auto lease, student loan) is a federal criminal violation.

---

## 5. AI Capabilities & Limitations

- **Probabilistic Nature of LLMs**: Language models are probabilistic reasoning engines subject to hallucinations, non-deterministic formatting, and subtle drift. High-risk compliance rules must therefore remain deterministic (regex / state machine) and execute with sub-10ms latency.
- **Contextual Understanding Strength**: Large language models excel at conversational synthesis, summarizing dialogue, explaining complex product differences (30-year vs 15-year amortizations), and formulating empathetic objection-handling scripts.
- **Speech Diarization Realities**: In real-world environments, raw acoustic audio suffers from cross-talk, variable microphones, and accents. High-precision extraction must allow the loan officer to review and verify extracted numbers before pushing to production LOS records.
- **No Private Chain-of-Thought in User Experience**: To ensure explainability and compliance defensibility, all evidence presented to users consists strictly of transcript quotes, factual data bindings, and regulatory citations.

---

## 6. Mocked vs. Production Integration Boundaries

- **Mock Implementation Reality**: The adapters in `lib/integrations/` (Salesforce CRM, Encompass LOS, Document Hub, Communications) are simulated in-memory implementations. They model realistic REST payloads, network latency (200–400ms), error handling, and idempotency checks.
- **Production Integration Requirements**: Moving to live enterprise connectivity requires:
  - Enterprise OAuth2 / mTLS authentication credentials.
  - Integration with lender-specific custom Encompass fields and business rules.
  - Production webhook listeners for bidirectional document status updates.
