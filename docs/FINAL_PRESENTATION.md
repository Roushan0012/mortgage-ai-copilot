# Darwix AI — Executive Client Presentation Deck

> **Presentation Overview**: A strictly 6-slide executive deck designed for senior mortgage lending executives, risk & compliance committees, and PM assessment evaluators.

---

## SLIDE 1: Research + Problem
### *"Mortgage Meetings Are High-Value, High-Risk Moments"*

#### The Problem Across the Mortgage Stakeholder Spectrum

```
+-------------------+--------------------+--------------------+--------------------+
|     CUSTOMER      |       AGENT        |      MANAGER       |     OPERATIONS     |
+-------------------+--------------------+--------------------+--------------------+
| Anxious, confused | High in-call       | Zero visibility    | Trapped in manual  |
| by rates & terms; | cognitive load;    | into live call     | document chasing;  |
| receives mixed    | must listen, probe | compliance risks;  | stated cash income |
| signals across    | DTI & take notes;  | reviews files only | derails files in   |
| unvetted calls    | 45m post-call work | after formal audit | late underwriting  |
+-------------------+--------------------+--------------------+--------------------+
```

- **Current Agent Workflow**: Loan officers juggle 5+ disjointed systems during live 30-minute calls while navigating complex federal lending guidelines.
- **Inconsistent Quality & Explanations**: MLOs quote interest rates without required APR terms or make verbal promises that expose lenders to severe regulatory liabilities.
- **Missed Information & Delayed Follow-Up**: Crucial debt obligations and co-borrower discrepancies are overlooked, stalling Day-1 document turnaround.
- **Limited Manager Visibility**: Branch managers manage blind—spotting TRID violations or compliance failures only weeks later during quality control audits.

#### Why Now? / Why AI?
- **Compressed Lender Margins**: Rising origination costs ($11,000+ per loan) demand dramatic operational efficiency gains without headcount expansion.
- **Sub-100ms Inference (Groq LPU)**: Low-latency AI now enables real-time conversational understanding alongside sub-20ms deterministic compliance rules during live calls.
- **Why AI**: Software can actively parse unstructured dialogue into structured MISMO 3.4 data, removing 85% of repetitive administrative drag.

---

## SLIDE 2: Proposed Product Journey
### *The End-to-End AI-Assisted Mortgage Lifecycle*

```
BEFORE            DURING             AFTER             MANAGER           OPERATIONS
Meeting           Consultation       Summary & Review  Governance        Execution
  │                 │                  │                 │                 │
  ▼                 ▼                  ▼                 ▼                 ▼
[Prepare Agent]   [Assist Agent]    [Structure &     [Surface           [Move Work
Pre-meeting brief Real-time nudges,  Execute]         Exceptions]        Forward]
from CRM & LOS;   TRID/ATR alerts,   Executive wrap,  Risk flags, team   Doc triage, debt
stated vs.        live Form 1003     stated vs.       coaching, audit    conflict review,
verified check    fact extraction    verified split   trail inspection   SLA resolution
```

#### The Role of AI Across the Lifecycle
1. **Before (Prepare Agent)**: Instantly aggregates historical CRM notes, borrower credit profile, and missing docs into a 30-second pre-call briefing.
2. **During (Assist Agent)**: Listens passively, surfaces non-intrusive compliance alerts and consultative talking points, and logs loan parameters in real time.
3. **After (Structure & Execute)**: Synthesizes call transcripts into verified Form 1003 fields and stages downstream actions with mandatory human approval gates.
4. **Manager (Surface Exceptions)**: Highlights branch compliance scores, unhandled TRID/ATR infractions, and specific coaching opportunities.
5. **Operations (Move Work Forward)**: Delivers clean, structured files with pre-triage document checklists, eliminating back-and-forth underwriter friction.

---

## SLIDE 3: AI Copilot & Intervention Engine
### *Dual-Engine Intelligence: Deterministic Precedence + LLM Reasoning*

```
                 Transcript Stream (Diarized Multi-Speaker)
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
      [DETERMINISTIC RULES]                    [CONTEXTUAL AI ENGINE]
      Priority 1: Hardcoded Regex              Priority 2: Groq LLaMA 3.3
      Sub-20ms latency | Zero hallucination    Conversational nuance & objections
      TRID, TILA, ATR/QM, 18 USC 1014          Suppressed if confidence < 75%
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
                     [INTERVENTION COORDINATOR]
             Deterministic overrides LLM | Max 3 Cards | 15s Cooldown
                                    │
                                    ▼
                     [HUMAN APPROVAL GATEWAY]
                   Agent Accepts / Dismisses / Escalates
```

#### 8+ Core Intervention Categories
- **TRID Oral Disclosures** (Rule) • **TILA Rate/APR** (Rule) • **18 U.S.C. § 1014 Fraud** (Rule) • **ATR Cash Quarantine** (Hybrid) • **Borrower Debt Conflict** (Hybrid) • **Competitor Objection Handling** (AI) • **Loan Term Comparison** (AI) • **Next Steps Prompt** (AI)

#### Four Hero Demonstration Moments

| Scenario | Trigger Dialogue | AI Guidance | Agent Action | System Action | Engine Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Unverifiable Income** | Sarah: *"I made $8k cash in consulting last month."* | Quarantines cash; flags 2-yr tax requirement under ATR. | Clicks *"Mark for Verification"*. | Isolates as **STATED**; adds 1040/Sched C to doc list. | **HYBRID** |
| **2. Conflicting Debt** | Sarah: *"$1,200/mo auto"*; John: *"$500/mo"*. | Detects $700 gap; halts calculation without guessing. | Reviews discrepancy evidence. | Tags field **CONFLICTED**; requests bank statement. | **HYBRID** |
| **3. Informal Approval** | MLO: *"You should be approved for $675k."* | Fires critical TRID banner: oral commitment prohibited. | Clicks *"Use Suggested Response"*. | Logs disclaimer audit event; alerts officer. | **RULE** |
| **4. Liability Omission** | MLO: *"Leave the car loan off the 1003."* | CRITICAL 18 U.S.C. § 1014 violation detected. | Dismisses bad suggestion; probes debt. | Blocks automated LOS push; alerts manager queue. | **RULE** |

---

## SLIDE 4: Role-Based Product Experience
### *Unified Operating System Across the Lending Organization*

```
+-------------------+--------------------+--------------------+--------------------+
|    AGENT VIEW     |   CUSTOMER VIEW    |    MANAGER VIEW    |  OPERATIONS VIEW   |
|  /meeting/live    |  /customer/[id]    |      /manager      |    /operations     |
+-------------------+--------------------+--------------------+--------------------+
| • Real-time audio | • 6-stage clear    | • Branch risk score| • Document triage  |
|   wave & transcript milestone progress |   (94.2% compliance|   readiness score  |
| • Copilot HUD &   | • Secure borrower  | • Active exception | • Stated vs.       |
|   compliance cards  upload portal      |   escalation queue |   verified audit   |
| • Live fact ledger| • Required docs    | • Team MLO coaching| • Unresolved debt  |
|   (Form 1003 sync)  checklist (Blend)  |   recommendations  |   conflict matrix  |
| • One-click voice | • Direct MLO       | • Conversion funnel| • Integration fail |
|   coaching (TTS)    contact card       |   health & trends  |   retry controls   |
+-------------------+--------------------+--------------------+--------------------+
```

- **Agent Experience**: Transforms live calls into focused consultations with real-time guardrails and a 1-click post-meeting action center.
- **Customer Experience**: Delivers transparency and trust with clean milestone tracking—strictly excluding internal underwriter notes or risk scores.
- **Manager Governance**: Surfaces systemic compliance risks, team coaching metrics, and loan officer adoption without micromanagement.
- **Operations Velocity**: Receives structured Day-1 loan files with pre-validated documentation checklists, slashing underwriting turn times.

---

## SLIDE 5: Enterprise Integration & Risk Governance
### *Human-in-the-Loop Automation with Cryptographic Audit Trails*

```
                     AI Synthesis & Extraction
                                 │
                                 ▼
                     [HUMAN APPROVAL GATE]
                     (Accredited MLO Sign-Off)
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   [SALESFORCE CRM]       [ICE ENCOMPASS LOS]      [DOCUMENT VAULT]
      (MOCKED)                 (MOCKED)                (MOCKED)
Stage: Pre-Qualified     MISMO 3.4 Form 1003      Dynamic Needs List
Activity: CRM-ACT-20891  File: ENC-1003-99412     Vault: DOC-REQ-88201
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    [IMMUTABLE AUDIT TRAIL]
               SHA-256 State Hash | Idempotent Retry Keys
```

#### Key Risk & Architectural Decisions
- **No Automatic Underwriting**: Copilot evaluates guideline readiness; it explicitly never makes credit decisions or issues commitments.
- **Stated ≠ Verified**: Unverified verbal claims are strictly segregated from verified assets and excluded from ATR qualifying income.
- **No Unsupported Rate Guarantees**: Prohibits verbal rate promises; enforces mandatory APR and loan terms disclosures.
- **Zero Liability Omission**: Deterministically intercepts and blocks intentional debt omissions under 18 U.S.C. § 1014.
- **Deterministic Priority 1 Rules**: Hardcoded compliance checks always override probabilistic LLM outputs.
- **Mandatory Approval Gates**: Automated external commits are blocked; licensed officers must review and click to dispatch.
- **Ephemeral Voice Memory (GLBA)**: Zero persistent storage of raw audio files; audio streams are processed in memory and immediately discarded.

---

## SLIDE 6: MVP Scope, Success Metrics & Pilot Decisions
### *Targeted 90-Day Pilot Framework for 100-MLO Deployment*

#### Core MVP Scope
- Pre-Meeting Intelligence Briefing • In-Call Copilot & Compliance Guardrails • Real-Time Form 1003 Fact Ledger • Post-Meeting Summary & Action Center • Human Approval Gateway • Manager Compliance Dashboard • Back-Office Operations Triage Hub • Mocked Enterprise Adapter Layer

#### Measurement Framework

```
+----------------------------------------------------------------------------------+
| NORTH-STAR METRIC: Meeting-to-Next-Action Completion Rate (Target: >90% within 1h) |
+----------------------------------------------------------------------------------+
| SUPPORTING METRICS                             | GUARDRAIL METRICS                |
| • 85% reduction in post-call wrap time         | • False-positive alert rate < 3% |
| • 100% TRID / TILA oral disclosure adherence   | • Fact extraction accuracy > 96% |
| • 4.5-day reduction in loan time-to-close      | • Nudge fatigue: max 3 onscreen  |
| • 92% first-time document checklist accuracy   | • Zero duplicate CRM/LOS syncs   |
+----------------------------------------------------------------------------------+
```

#### Pilot Governance Decisions

```
+--------------------+--------------------+--------------------+--------------------+
|       LAUNCH       |      SIMPLIFY      |       DEFER        |       REJECT       |
+--------------------+--------------------+--------------------+--------------------+
| • Core compliance  | • Replace live mic | • Live AUS (DU/LPA)| • Fully autonomous |
|   intervention HUD |   with simulated   |   credit decisions |   loan approval    |
| • Stated/verified  |   audio benchmark  | • Bi-directional   | • Client-side API  |
|   isolation engine | • Template-based   |   core banking     |   credential store |
| • Post-call gated  |   customer email   |   integrations     | • Permanent raw    |
|   enterprise sync  |   notifications    | • Multi-borrower   |   voice recording  |
| • Manager & Ops    | • Standardized     |   video analysis   |   retention (GLBA) |
|   dashboards       |   document checklist|                    |                    |
+--------------------+--------------------+--------------------+--------------------+
```
