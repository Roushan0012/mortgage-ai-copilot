# Mortgage AI Copilot — 5–7 Minute Walkthrough Script & Demo Plan

> **Presenter Guide**: This document provides timed segments, screen navigation cues, conversational talking points, and transitions for an executive demo or PM evaluation. Do not read this verbatim—use the key talking points naturally while driving the UI.
>
> **Customer Persona**: John & Sarah Miller (`cust_miller_001`), W-2 Senior Engineer + 1099 Freelance Designer, $675,000 purchase price, $85,000 down payment.
> **Demo URL**: `/demo` (Hub for running the end-to-end flow).

---

## Timing Overview

| Timestamp | Phase | Route / View | Core Theme |
| :--- | :--- | :--- | :--- |
| **0:00–0:40** | Problem & Context | `/demo` | Cognitive overload, regulatory risk & manual admin in U.S. mortgage sales |
| **0:40–1:20** | Pre-Meeting Intelligence | `/meetings/meet_001/pre-brief` | CRM/LOS synthesis, stated vs. verified isolation, missing document checklist |
| **1:20–3:20** | Live Meeting & AI Interventions | `/meetings/meet_001/live` | Real-time transcript, deterministic compliance gates, and Groq contextual guidance |
| **3:20–4:20** | Post-Meeting Summary & Review | `/meetings/meet_001/summary` | Human-in-the-loop verification, audit trail, stated vs. verified isolation |
| **4:20–5:10** | Enterprise Execution | `/meetings/meet_001/summary` | One-click gated sync to Salesforce CRM, Encompass LOS, and doc generation |
| **5:10–5:50** | Manager & Operations Views | `/manager`, `/operations` | Team coaching metrics, compliance risk flags, SLA pipelines & document triage |
| **5:50–6:30** | Product Judgment & Tradeoffs | Architecture Docs | Why hybrid AI > pure LLM, safety-first boundaries, stated vs. verified purity |
| **6:30–7:00** | Pilot Metrics & Closing | `/demo` | Measurable enterprise ROI, time-to-close reduction, and evaluation recap |

---

## Segment-by-Segment Walkthrough

### 1. Problem & Context (0:00 – 0:40)
* **Screen State**: On `/demo`, showing the 6-phase journey ribbon (`1. Prepare` → `2. Meet` → `3. Copilot` → `4. Summary` → `5. Execute` → `6. Monitor`).
* **Navigation Action**: Highlight the mortgage lifecycle ribbon and the four critical test scenarios.
* **Talking Points**:
  - *"In modern U.S. mortgage origination, Loan Officers are caught in an impossible triad: managing high-stress borrower conversations, navigating rigid federal regulations (CFPB, TRID, ATR/QM), and executing 45 minutes of tedious post-call data entry across CRM and LOS systems."*
  - *"A single inadvertent verbal commitment—such as saying 'You're basically pre-approved'—triggers severe TRID disclosure liabilities. Meanwhile, missing undisclosed self-employment liabilities delays closings by weeks."*
  - *"Darwix AI Copilot solves this not by replacing the Loan Officer, but by acting as an invisible compliance copilot and automation engine during and after the call."*
* **Transition Cue**: *"Let's jump into the first phase of the loan officer's day: the Pre-Meeting Briefing."* Click **"Launch Complete Interactive Demo"** or navigate to `/meetings/meet_001/pre-brief`.

---

### 2. Pre-Meeting Intelligence (0:40 – 1:20)
* **Screen State**: `/meetings/meet_001/pre-brief` displaying John & Sarah Miller's profile.
* **Navigation Action**: Point out the **Stated vs. Verified** split, Credit Score (740), DTI (34%), and the AI Recommendation card.
* **Talking Points**:
  - *"Before the call starts, the copilot synthesizes data from Salesforce CRM and Encompass LOS in under 5 seconds."*
  - *"Notice our first core architectural pillar: **Strict Stated vs. Verified Isolation**. John's W-2 income is verified ($145,000/yr), but Sarah's $68,000 freelance design income is currently STATED and unverified."*
  - *"The copilot immediately flags the high-risk underwriting factor: Sarah has only 18 months of 1099 freelance history, which falls short of Fannie Mae's standard 24-month guideline."*
  - *"The system gives Alex Vance an actionable conversation game plan: verify the missing 2 years of tax returns and discuss 1-year alternative Freddie Mac guidelines before quoting rates."*
* **Transition Cue**: *"Now, let's join the call and see how the copilot assists Alex in real time without being distracting."* Click **"Start Live Call"** (`/meetings/meet_001/live`).

---

### 3. Live Meeting & Real-Time Interventions (1:20 – 3:20)
* **Screen State**: `/meetings/meet_001/live`. Live audio wave simulation, real-time scrolling transcript on the left, Copilot HUD on the right.
* **Navigation Action**: Run the simulated call or trigger the 4 core scenarios sequentially using the Scenario Selector or Demo Quick Triggers.

#### Core Scenario 1: Unverifiable Income (ATR Rule / 12 CFR § 1026.43)
* **Action**: Sarah Miller says: *"I also made an extra $8,000 cash doing freelance consulting last month, can we count that toward qualifying?"*
* **Talking Point**: *"Watch the copilot fire immediately. It doesn't allow the LO to casually say yes. Under CFPB Ability-to-Repay rules, non-documented cash cannot be used for qualifying income. The copilot provides a compliant suggested response explaining Fannie Mae documentation requirements."*
* **Interactive Element**: Click **"Play AI Voice Response"** to demonstrate ElevenLabs voice assistance delivering the professional phrasing.

#### Core Scenario 2: Conflicting Borrower Debt
* **Action**: Sarah says car loan is $1,200/mo, while John previously stated $500/mo.
* **Talking Point**: *"The engine detects the discrepancy between co-borrowers in real time. Instead of hallucinating a number or averaging it, the system marks the field as CONFLICTED and prompts the LO to request the official auto loan statement."*

#### Core Scenario 3: Informal Approval Prevention (TRID 12 CFR § 1026.19)
* **Action**: Agent Alex Vance says: *"Based on these numbers, you should be completely approved for the $675k loan."*
* **Talking Point**: *"Notice the RED compliance alert banner. The LO inadvertently gave a verbal approval without a completed LE (Loan Estimate) and underwriter sign-off. The copilot flags a high-risk TRID violation and instructs the LO to state the mandatory legal disclaimer immediately."*

#### Core Scenario 4: Liability Omission Detection (18 U.S.C. § 1014)
* **Action**: Agent Alex Vance says: *"If the debt is high, you can just leave the car loan off the 1003 application."*
* **Talking Point**: *"Here is our deterministic safety net. Omitting known liabilities on a federal mortgage application violates 18 U.S.C. § 1014 (Mortgage Fraud). The copilot escalates this as a CRITICAL compliance violation, blocks automated CRM/LOS push, and flags it for mandatory compliance review."*

* **Architecture Highlight**: Point out the **Deterministic Rule Precedence** badge. Compliance rules run synchronously in under 20ms and override any LLM outputs. Point out the anti-fatigue debounce (max 1 popup per 15s) so the LO isn't overwhelmed.
* **Transition Cue**: *"The call concludes. Let's look at the Post-Meeting Wrap-up where the LO saves 30 minutes of administrative busywork."* Click **"End Meeting & Review Summary"** (`/meetings/meet_001/summary`).

---

### 4. Post-Meeting Summary & Verification (3:20 – 4:20)
* **Screen State**: `/meetings/meet_001/summary`.
* **Navigation Action**: Review the synthesized Executive Summary, Structured Financial Facts, Identified Underwriting Risks, and the Human-in-the-Loop approval cards.
* **Talking Points**:
  - *"Within seconds of call termination, the copilot extracts all structured loan parameters: $675,000 Purchase Price, $85,000 Down Payment (12.6%), 30-Year Conventional Fixed."*
  - *"Critically, observe the data segregation: Sarah's $8,000 cash is classified as 'STATED (Unverified / Excluded from ATR Qualifying Income)', and the auto loan is tagged as 'CONFLICTED ($500 vs $1,200 - Statement Required)'."*
  - *"Every extracted field includes an exact transcript citation and confidence score. Alex can edit or adjust values directly before submitting."*
* **Transition Cue**: *"Now, let's look at how this data syncs into enterprise core systems with zero duplicate data entry."*

---

### 5. Enterprise Execution: CRM, LOS & Document Generation (4:20 – 5:10)
* **Screen State**: Post-meeting action buttons at the bottom of `/meetings/meet_001/summary`.
* **Navigation Action**: Click **"Sync to Salesforce CRM"**, **"Push to Encompass LOS"**, and **"Generate Needs List & Pre-Brief"**.
* **Talking Points**:
  - *"Instead of re-typing notes into 3 legacy systems, Alex executes an idempotent push."*
  - *"Salesforce CRM is updated with call notes, stage progression (Pre-Qualified), and next tasks."*
  - *"ICE Encompass receives the Fannie Mae Form 1003 payload with verified income and marked liabilities."*
  - *"The system instantly generates a tailored Needs List for the Millers: 2 years of 1040s, Schedule C, 2 months of bank statements, and the auto loan statement."*
  - *"Notice the **Human Approval Gate**: the LO must explicitly review and sign off before any external write occurs. No black-box automated commits."*
* **Transition Cue**: *"Next, how do team leads and operations personnel oversee this without listening to hours of calls?"* Click to navigate to `/manager`.

---

### 6. Manager Coaching & Operations Workflow (5:10 – 5:50)
* **Screen State**:
  1. `/manager` (Team performance, compliance risk flags, coaching insights).
  2. `/operations` (Loan pipeline, SLA tracking, automated document triage).
* **Navigation Action**: Switch between Manager and Operations tabs.
* **Talking Points**:
  - *"In the **Manager Dashboard**, leadership sees aggregated team health: 94.2% compliance adherence, average post-call wrap time reduced from 28 minutes to 4.2 minutes."*
  - *"Alex Vance's verbal approval slip is highlighted with a 1-click coaching recommendation: 'TRID Disclosures Refresher'."*
  - *"In the **Operations Dashboard**, loan processors see clean, structured files. Instead of vague notes, ops gets a deterministic document readiness score (82%) with missing items clearly prioritized by underwriting impact."*
* **Transition Cue**: *"Let's briefly examine the key architectural decisions that make this enterprise-grade."*

---

### 7. Product Judgment & Core Tradeoffs (5:50 – 6:30)
* **Screen State**: Navigate to `/demo` or display architecture diagram.
* **Talking Points**:
  - *"Three deliberate architectural tradeoffs separate this from generic AI wrappers:"*
  1. **Hybrid Deterministic + LLM Engine**: Regulatory rules (TRID, ATR/QM, Fraud) are hardcoded deterministic regex/rules with `<20ms` latency and 100% predictability. Groq LLM handles conversational context, but deterministic rules ALWAYS take precedence.
  2. **Zero Persistent Audio**: In accordance with GLBA and state two-party consent laws, raw audio streams are processed in memory and discarded. Only anonymized, encrypted text transcripts and audit event hashes are retained.
  3. **Strict Human Gate**: The AI suggests, humanizes, and populates, but an accredited NMLS-licensed Loan Officer MUST click to authorize every customer communication and LOS push.
* **Transition Cue**: *"To wrap up, let's look at the pilot ROI and rollout metrics."*

---

### 8. Pilot Metrics, MVP Scope & Closing (6:30 – 7:00)
* **Screen State**: Final screen on `/demo` showing the Pilot Success Metrics.
* **Talking Points**:
  - *"For a 100-LO mortgage lender, this copilot delivers:"*
    - **85% reduction in post-call administrative wrap-up time** (saving 2.5 hours per LO per day).
    - **Zero TRID verbal disclosure non-compliance penalties**.
    - **4.5-day reduction in average time-to-close** through cleaner Day-1 documentation triage.
  - *"The application is production-hardened with 44 automated tests, sub-200ms latency budgets, full dark mode, and complete keyboard accessibility."*
  - *"Thank you for your time, and I'd welcome any questions on our architecture or product roadmap."*

---

## Evaluator FAQ & Quick Handling

| Evaluator Question | Recommended Response |
| :--- | :--- |
| **Why not let the AI approve loans automatically?** | Under CFPB rules and Fair Lending laws, adverse action and credit approval require certified underwriting and documented auditability. The copilot provides underwriting readiness, not automated decisions. |
| **What happens if the Groq LLM API goes down?** | The copilot employs automatic graceful degradation: deterministic rules continue running client-side/in-process, and fallback cached templates take over without crashing the call. |
| **How do you handle audio privacy?** | Ephemeral processing only. No raw audio is written to disk or third-party storage. All customer PII is masked before logging. |
| **Can the borrower see the copilot?** | No. The HUD is strictly loan officer-facing. The borrower only receives human-approved emails, needs lists, and pre-qualification letters. |
