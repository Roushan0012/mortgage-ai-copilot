# Final Product Demo Walkthrough Guide & Timing Script

> **Evaluator & Presenter Guide**: This document details the exact 5–7 minute live product demonstration script for the Darwix AI Mortgage Copilot. It includes timestamped pacing, UI navigation cues, natural conversational talking points, and explicit product decisions to highlight at each transition.
>
> **Customer Identity**: John Miller (W-2 Software Architect) & Sarah Miller (1099 Freelance UI Designer), $675,000 Purchase, $85,000 Down Payment.
> **Demo URL**: [http://localhost:3002/demo](http://localhost:3002/demo) (or `/dashboard`)

---

## 1. Demo Timing & Sequence Overview

| Timestamp | Step | Route | Core Theme |
| :--- | :--- | :--- | :--- |
| **0:00–0:40** | **1. Problem & Context** | `/dashboard` | Cognitive load, regulatory fines (TRID/ATR), and post-call admin drag |
| **0:40–1:20** | **2. Pre-Meeting Brief** | `/meeting/meet_001` | CRM/LOS synthesis, credit profile, and stated vs. verified pre-check |
| **1:20–3:20** | **3. Live Meeting & Copilot** | `/meeting/meet_001/live` | Real-time transcript, Fact Ledger, and the 4 Hero AI Moments |
| **3:20–4:15** | **4. Summary & Information Gaps** | `/meeting/meet_001/summary` | Instant post-call wrap-up, underwriting risk matrix, and action triage |
| **4:15–5:00** | **5. Enterprise Sync & Human Gates** | `/meeting/meet_001/summary` | Gated pushes to Salesforce FSC, ICE Encompass LOS, and Blend docs |
| **5:00–5:40** | **6. Manager & Operations Portals** | `/manager` & `/operations` | Branch compliance index, team coaching, doc readiness, and conflict resolution |
| **5:40–6:30** | **7. Product Judgement & Tradeoffs** | Architecture / `/demo` | Why hybrid rules beat pure LLMs; why human approval is non-negotiable |
| **6:30–7:00** | **8. MVP Scope & Closing Metrics** | `/demo` | 90-day pilot KPIs: 85% wrap time reduction, zero TRID violations |

---

## 2. Step-by-Step Walkthrough with Speaking Points

### Step 1: Problem & Executive Setup (0:00 – 0:40)
* **Screen**: Navigate to [`/dashboard`](http://localhost:3002/dashboard).
* **What to Click**: Point out the active pipeline volume ($4.2M) and the upcoming consultation with John & Sarah Miller.
* **What to Explain**:
  - *"In modern residential mortgage sales, Loan Officers are trapped in a cognitive pressure cooker. During a single 30-minute call, an MLO must build rapport, probe for hidden debts, calculate DTI ratios in their head, and comply with rigid federal lending laws (CFPB, TRID, TILA, ATR/QM)."*
  - *"A single careless phrase—like saying 'You're basically pre-approved'—triggers severe regulatory disclosure liabilities. Afterwards, the MLO spends 45 minutes manually typing notes into Salesforce and re-keying Form 1003 into Encompass."*
  - *"Darwix AI is NOT a chatbot that talks to borrowers. It is an **AI-assisted workflow layer** that helps agents prepare, navigate high-risk conversations safely, structure data, and move approved files downstream."*
* **Product Decision to Highlight**: **AI Assistance + Human Governance**. Software augments the human relationship; it never replaces the licensed professional.
* **Transition**: *"Let's begin where the loan officer starts their day: preparing for the Miller consultation."* Click on **"Open Pre-Meeting Brief"** (`/meeting/meet_001`).

---

### Step 2: Pre-Meeting Intelligence Briefing (0:40 – 1:20)
* **Screen**: [`/meeting/meet_001`](http://localhost:3002/meeting/meet_001).
* **What to Click**: Highlight the **Stated vs. Verified** financial split and the AI Suggested Agenda.
* **What to Explain**:
  - *"Before dialing, the copilot pulls together the customer's profile from Salesforce FSC and preliminary credit records in seconds."*
  - *"Notice our first core architectural pillar: **Strict Stated vs. Verified Isolation**. John's W-2 income is verified ($145,000), but Sarah's $68,000 1099 design income is currently STATED and unverified."*
  - *"The copilot immediately flags the underwriting hurdle: Sarah only has 18 months of self-employment history—missing Fannie Mae's standard 24-month requirement."*
  - *"Instead of having to dig through guidelines, the MLO receives a clear strategy: explore 1-year Freddie Mac alternative guidelines and verify missing tax returns before quoting rates."*
* **Product Decision to Highlight**: **Data Purity**: Pre-qualifications must never blend unverified verbal estimates with audited underwriting data.
* **Transition**: *"Now let's step into the live consultation cockpit."* Click **"Start Live Consultation"** (`/meeting/meet_001/live`).

---

### Step 3: Live Meeting Cockpit & Four Hero AI Moments (1:20 – 3:20)
* **Screen**: [`/meeting/meet_001/live`](http://localhost:3002/meeting/meet_001/live).
* **What to Click**: Start the live call simulation. Watch the live transcript stream on the left, audio wave in the center, and copilot HUD on the right.

```
+-----------------------------------------------------------------------------------+
| THE FOUR HERO AI DEMO MOMENTS                                                     |
+-----------------------------------------------------------------------------------+
| 1. UNVERIFIABLE CASH INCOME (ATR Rule / 12 CFR § 1026.43)                          |
|    • Trigger: Sarah mentions $8,000 cash consulting income.                       |
|    • AI Action: Quarantines cash; flags 2-year 1040 requirement.                   |
|    • Agent Action: Clicks "Mark for Verification".                                |
|    • System Action: Isolates as STATED; automatically adds to doc checklist.      |
|                                                                                   |
| 2. CONFLICTING BORROWER DEBT                                                      |
|    • Trigger: Sarah states auto loan is $1,200/mo; John previously said $500/mo.  |
|    • AI Action: Detects $700 discrepancy; avoids guessing or averaging.          |
|    • Agent Action: Reviews conflicting transcript citations.                      |
|    • System Action: Marks field CONFLICTED; stages bank statement request.       |
|                                                                                   |
| 3. INFORMAL APPROVAL PREVENTION (TRID / 12 CFR § 1026.19)                         |
|    • Trigger: Agent Vance says: "Based on these numbers, you should be approved." |
|    • AI Action: Flashes immediate RED compliance banner (verbal approval barred). |
|    • Agent Action: Clicks "Use Suggested Response" to read required disclaimer.   |
|    • System Action: Emits compliance alert audit event; updates manager queue.    |
|                                                                                   |
| 4. LIABILITY OMISSION DETECTION (18 U.S.C. § 1014 / Mortgage Fraud)               |
|    • Trigger: Agent Vance suggests leaving the car loan off the 1003 application. |
|    • AI Action: Escalates as CRITICAL statutory violation in <20ms.               |
|    • Agent Action: Acknowledges error and restores full liability capture.         |
|    • System Action: Locks automated LOS push; routes file for compliance review.  |
+-----------------------------------------------------------------------------------+
```

* **What to Explain**:
  - *"Watch the live Fact Ledger on the right: as John mentions the $675,000 purchase price and $85,000 down payment, the copilot captures them into Form 1003 parameters automatically."*
  - *"Demonstrate the voice engine: click **'Play AI Voice Response'** on a consultative suggestion to show how ElevenLabs provides natural audio phrasing for the MLO."*
  - *"Notice the **Anti-Fatigue Guardrail**: non-critical suggestions have a 15-second debounce and max 3 onscreen cards, so the officer never feels spammed."*
* **Product Decision to Highlight**: **Deterministic Precedence**: Compliance rules execute in sub-20ms with 100% predictability and strictly override generative LLMs.
* **Transition**: *"The call concludes. Let's look at the post-meeting wrap-up."* Click **"End Consultation & Review Summary"** (`/meeting/meet_001/summary`).

---

### Step 4: Post-Meeting Summary & Information Gaps (3:20 – 4:15)
* **Screen**: [`/meeting/meet_001/summary`](http://localhost:3002/meeting/meet_001/summary).
* **What to Click**: Scroll through the Executive Summary, Structured Financial Facts, and Identified Underwriting Risks.
* **What to Explain**:
  - *"In under 3 seconds, the copilot generates a comprehensive executive briefing that previously took the MLO 45 minutes of manual transcription."*
  - *"Look at the data isolation: Sarah's $8,000 cash consulting is clearly labeled as **STATED (Excluded from Qualifying Income)**, and the auto loan is tagged as **CONFLICTED ($500 vs. $1,200)**."*
  - *"Every extracted metric links back to its exact transcript timestamp and confidence score. The MLO can edit or adjust values directly in the ledger before proceeding."*
* **Product Decision to Highlight**: **No Automatic Underwriting**: The copilot prepares underwriting readiness; it never issues binding credit decisions or pre-approvals.
* **Transition**: *"Now let's move this approved work downstream into enterprise core systems."*

---

### Step 5: Enterprise Sync & Human Approval Gates (4:15 – 5:00)
* **Screen**: Bottom Action Center on [`/meeting/meet_001/summary`](http://localhost:3002/meeting/meet_001/summary).
* **What to Click**:
  1. Click **"Review & Sync Salesforce CRM"** → Review modal payload (`CRM-ACT-20891`) → Click **"Approve & Sync"**.
  2. Click **"Review & Commit Encompass LOS"** → Review MISMO 3.4 Form 1003 draft (`ENC-1003-99412`) → Click **"Approve & Commit"**.
  3. Click **"Dispatch Document Request"** → Review borrower upload checklist (`DOC-REQ-88201`).
* **What to Explain**:
  - *"Here is our core enterprise boundary: **Mandatory Human-in-the-Loop Gates**. The system will never write to the CRM, commit an LOS file, or email a customer without explicit MLO inspection and sign-off."*
  - *"Notice the LOS payload: the stage is defensively clamped to 'Documentation Pending', and automated approvals are blocked."*
  - *"Each action is fully idempotent—backed by deterministic payload hashes so multiple clicks never create duplicate loan files in Encompass."*
* **Product Decision to Highlight**: **Idempotent Enterprise Execution & Auditability**: Every approval emits an immutable SHA-256 event log.
* **Transition**: *"How does leadership oversee this? Let's check the Manager and Operations portals."* Click to navigate to `/manager`.

---

### Step 6: Manager Governance & Operations Triage (5:00 – 5:40)
* **Screen**: [`/manager`](http://localhost:3002/manager) then [`/operations`](http://localhost:3002/operations).
* **What to Click**:
  - On `/manager`: Point out Branch Compliance Score (`94.2%`), Alex Vance's verbal approval flag, and the 1-click coaching recommendation.
  - On `/operations`: Point out Loan Document Readiness Score (`82%`), Stated vs. Verified review card, and integration retry buttons.
* **What to Explain**:
  - *"In the **Manager Portal**, sales leaders get real-time compliance oversight instead of waiting for post-close audit failures. The system pinpoints exact coaching needs for specific officers."*
  - *"In the **Operations Hub**, processors don't receive sloppy handwritten notes. They receive a clean, pre-triaged loan package with missing documents prioritized by underwriting impact."*
* **Product Decision to Highlight**: **Role-Separated Visibility**: Managers oversee risk and coaching; Ops oversees document triage; Borrowers see only transparent progress milestones without confusing risk jargon.
* **Transition**: *"Let's summarize the key architectural tradeoffs that make this defensible for an enterprise bank."*

---

### Step 7: Product Judgement & Tradeoffs (5:40 – 6:30)
* **Screen**: Navigate back to [`/demo`](http://localhost:3002/demo).
* **What to Explain**:
  - *"Three deliberate product tradeoffs separate Darwix AI from generic wrappers:"*
  1. **Hybrid Rules over Pure LLMs**: Deterministic rules handle statutory compliance in <20ms; LLMs handle conversational context. We never entrust uncapped regulatory liability to probabilistic models.
  2. **Approval Gates over Full Automation**: Lending licenses require human accountability. We optimize for MLO speed, not MLO elimination.
  3. **Ephemeral Audio over Permanent Voice Storage**: In accordance with GLBA and wiretap laws, raw audio streams are processed in memory and discarded. Only encrypted text transcripts and audit hashes persist.
* **Product Decision to Highlight**: **Responsible AI in Regulated Banking**.

---

### Step 8: MVP Scope, Pilot Metrics & Closing (6:30 – 7:00)
* **Screen**: Final summary card on [`/demo`](http://localhost:3002/demo).
* **What to Explain**:
  - *"Our 90-day pilot framework for a 100-MLO lender is built around a single North Star metric: **Meeting-to-Next-Action Completion Rate** (targeting >90% within 1 hour)."*
  - *"Expected business impact: **85% reduction in post-meeting wrap time** (saving 2.5 hours per officer per day), **zero TRID oral commitment penalties**, and a **4.5-day reduction in loan time-to-close**."*
  - *"The product is fully functional today with 44 automated tests, sub-200ms response budgets, and clean enterprise adapters."*
  - *"Thank you, and I welcome your questions."*

---

## 3. What NOT to Demonstrate During Live Presentation
- ❌ Do NOT open VS Code, terminal windows, or inspect source code files.
- ❌ Do NOT open browser developer tools or examine JSON network responses.
- ❌ Do NOT discuss environment variable names or API key configuration.
- ❌ Do NOT read button labels or UI text word-for-word.
- ❌ Do NOT pause to explain mocked integration IDs (`CRM-ACT-20891`).
- ❌ Focus 100% of demo time on user workflow, compliance risk prevention, and business value.
