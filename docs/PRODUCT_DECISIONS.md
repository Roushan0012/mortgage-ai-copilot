# Darwix AI — Product & Architectural Decisions Record
## Strategic Rationale for Assessment Prototype and Production Roadmap

---

### ADR-001: Priority of Deterministic Rules over Generative LLM Inference
- **Context**: In U.S. residential mortgage lending, lenders operate under severe regulatory scrutiny from the CFPB, FTC, FDIC, and state regulators. Violations of TRID (TILA-RESPA Integrated Disclosures), ECOA (Equal Credit Opportunity Act / Regulation B), or Dodd-Frank Ability-to-Repay / Qualified Mortgage (QM) rules carry strict civil money penalties, mandatory loan rescission, and personal liability for Loan Officers.
- **Decision**: We established a dual-engine architecture where deterministic TypeScript rule sets execute with absolute priority over generative AI inferences. If a deterministic compliance rule detects a regulatory hazard (such as an informal loan approval statement or an interest rate quote lacking APR), the system immediately halts or overrides any generative suggestion.
- **Consequences**:
  - *Pros*: Zero risk of LLM hallucinations weakening compliance; guaranteed sub-10ms evaluation of high-risk regulatory triggers; complete auditability.
  - *Cons*: Requires maintaining curated regulatory pattern libraries alongside generative prompts.

---

### ADR-002: Ultra-Low Latency LLM Reasoning via Groq LPUs
- **Context**: Live customer meetings occur at conversational speed (approx. 130–160 words per minute). Traditional LLM inference with roundtrip latencies exceeding 2–3 seconds results in interventions arriving after the conversation has already pivoted, rendering recommendations irrelevant or disruptive.
- **Decision**: Selected Groq Cloud (`llama-3.3-70b-versatile` and `llama-3.1-8b-instant`) as the primary generative inference engine. Groq’s Language Processing Units (LPUs) provide token generation speeds exceeding 250–350 tokens per second with time-to-first-token (TTFT) under 300ms.
- **Consequences**:
  - *Pros*: In-flight objection handling, real-time 1003 fact extraction, and next-best question suggestions arrive within the Loan Officer's natural conversational cadence.
  - *Cons*: Requires fallback mock playbooks for offline or unauthenticated development environments.

---

### ADR-003: Mandatory Human-in-the-Loop (HITL) Action Gating
- **Context**: Autonomous AI agents that modify loan files or communicate directly with borrowers introduce unacceptable operational and legal risk in regulated finance.
- **Decision**: The Darwix AI Copilot is strictly advisory. All system actions (committing an extracted fact to Form 1003, pushing follow-up tasks to Salesforce, escalating a compliance breach to branch management) require explicit Loan Officer validation via dedicated card actions (`Accept`, `Dismiss`, `Ask Question`, `Escalate`). Dismissing a critical compliance alert requires selecting or typing a justification that is permanently recorded in the immutable audit log.
- **Consequences**:
  - *Pros*: Ensures legal culpability remains with licensed Loan Officers; builds trust with underwriters and risk officers; creates a high-fidelity dataset of accepted vs. rejected suggestions for model fine-tuning.
  - *Cons*: Requires clean, high-efficiency keyboard/click UX so Loan Officers do not experience cognitive fatigue.

---

### ADR-004: Three-Column Live Meeting Cockpit Layout
- **Context**: Mortgage consultations require Loan Officers to juggle active listening, 1003 data entry, product qualification, and objection handling simultaneously.
- **Decision**: Standardized on a persistent 3-column split view for `/meeting/[id]/live`:
  1. *Left (30%)*: Real-time conversation stream with speaker diarization, audio signal visualizer, and compliance trigger badges.
  2. *Center (40%)*: Customer 360 dossier, pre-approved loan parameters, live 1003 verification checklist, and interactive scenario calculator.
  3. *Right (30%)*: Darwix AI Copilot actionable card deck with clear severity indicators.
- **Consequences**:
  - *Pros*: Eliminates tab switching; provides continuous contextual awareness; keeps the loan officer oriented toward both borrower empathy and deal execution.
  - *Cons*: Requires minimum desktop viewport width (optimized for 1280px+ displays common in enterprise workstations).

---

### ADR-005: Decoupled Enterprise Adapter Pattern for LOS and CRM
- **Context**: Mortgage lenders use heterogeneous core systems: Encompass (ICE Mortgage Technology), Byte, or Cadence for Loan Origination; Salesforce FSC, Total Expert, or HubSpot for CRM; Optimal Blue for secondary marketing pricing.
- **Decision**: Built a decoupled integration layer (`/lib/integrations/`) with standardized interfaces (`LOSAdapter`, `CRMAdapter`, `PPEAdapter`, `CreditBureauAdapter`). In the assessment prototype, these emit realistic events and structured Fannie Mae MISMO 3.4 / Salesforce payloads, ready to be plugged into real REST/SOAP endpoints without altering core business logic.
- **Consequences**:
  - *Pros*: Ready for enterprise proof-of-concept deployments; allows independent unit testing of fact mapping without requiring live third-party test environments.
  - *Cons*: Requires maintaining schema fidelity against actual MISMO 3.4 XML and Salesforce FSC object graphs.

---

### ADR-006: Comprehensive Coverage of Assessment Scenarios
- **Context**: The evaluation requires demonstrating nuanced handling of real-world mortgage situations, ranging from basic profiling to severe regulatory infractions.
- **Decision**: Explicitly modeled and implemented test fixtures and rule matches for:
  1. *Informal approval statements* ("You are 100% approved") -> Immediate TRID block.
  2. *Indicative interest rate quotes* ("I can get you 5.99%") -> Enforced APR & Points disclosure requirement.
  3. *Liability omission suggestions* ("Let's not mention the second car loan") -> Fannie Mae Fraud prevention block.
  4. *Unverifiable cash/bonus income* ("My uncle pays me $1,000 cash weekly") -> Dodd-Frank QM income verification guidance.
  5. *Competitor rate promises* ("I'll beat their rate by 50 bps no matter what") -> Requirement for written Loan Estimate.
  6. *Conflicting borrower information* (Primary borrower states $120k salary, co-borrower states $95k) -> Clarification prompt.
  7. *Missed profiling questions* (Failure to ask about planned occupancy or down payment source) -> Guided prompt.
  8. *Closing meeting without clear next steps* -> Automated closing checklist & follow-up scheduler.

---

### ADR-007: Enterprise Security & Secrets Isolation
- **Context**: Protecting Nonpublic Personal Information (NPI) under the Gramm-Leach-Bliley Act (GLBA) and safeguarding AI credentials is mandatory.
- **Decision**:
  - API keys (`GROQ_API_KEY`, `ELEVENLABS_API_KEY`) are restricted to server-side code and API routes; they are strictly prohibited from client bundles (`NEXT_PUBLIC_` prefixes forbidden for secrets).
  - Client-side data displayed in mock transcripts uses realistic synthetic personas (John & Sarah Miller) with all mock SSNs, account numbers, and phone numbers following standard testing format conventions (`***-**-6789`).
  - `.gitignore` explicitly prevents `.env` and `.env*.local` from ever being checked into version control, while `.env.example` provides an audited template.

---

### ADR-008: Actionable Intervention Cards with Multi-Action Human Governance
- **Context**: Passive AI suggestions are frequently ignored by loan officers or cause excessive context switching when officers must manually re-type suggestions into conversation or LOS fields.
- **Decision**: All interventions in the live cockpit are packaged as actionable cards with explicit one-click actions:
  - `[Use Suggested Response]`: Copies or speaks verified CFPB-safe rebuttal/script into the officer's active prompt.
  - `[Ask Question]`: Stages clarifying discovery questions into the conversation queue.
  - `[View Evidence]`: Expands precise transcript citation, timestamps, and regulatory rule references.
  - `[Dismiss]`: Requires a recorded officer rationale for compliance audit logging.
  - `[Escalate]`: Routes supervisory review requests directly to the branch compliance manager dashboard.
- **Consequences**:
  - *Pros*: Reduces cognitive load to sub-second decisions; creates a 100% auditable record of loan officer interaction with AI suggestions.
  - *Cons*: Requires compact visual presentation to avoid overwhelming the live screen.

---

### ADR-009: Strict 5-Tier Compliance Severity Taxonomy
- **Context**: Treating all notifications equally results in "alert fatigue", where loan officers dismiss critical TRID/TILA infractions alongside minor sales coaching tips.
- **Decision**: Standardized on a 5-tier semantic severity model:
  - `Critical`: Hard stop legal violations (e.g. unauthorized verbal approvals, deliberate debt omissions). Prominently highlighted in crimson with mandatory acknowledgment.
  - `High Priority`: Significant regulatory risk requiring timely correction (e.g. rate quotes lacking APR, self-employment 2-year tax return documentation gaps).
  - `Medium`: Policy or pricing advisories (e.g. unverified competitor matching, undisclosed gifts).
  - `Low`: Minor operational suggestions and Form 1003 completeness prompts.
  - `Info / Nudge`: Non-intrusive sales discovery cues, rapport builders, and transition prompts.
- **Consequences**:
  - *Pros*: Eliminates alert fatigue; loan officers instantly recognize when legal compliance requires immediate verbal intervention.
  - *Cons*: Requires rigorous classification logic so non-critical items are never falsely escalated to Critical.

---

### ADR-010: Strict Segregation Between Borrower Experience and Internal Agent Cockpit
- **Context**: Mortgage lending involves sensitive internal risk assessments, underwriter flags, and compliance audits that must never be exposed to consumers, while consumers need clear, transparent milestone tracking.
- **Decision**: Physically and architecturally segregated internal loan officer screens (`/dashboard`, `/meeting/[id]/live`, `/meeting/[id]/summary`, `/manager`) from borrower-facing views (`/customer/[id]`):
  - Borrower portal displays only consumer-friendly progress bars, document upload checklists, loan targets, and contact details.
  - Internal AI reasoning, severity ratings, audit logs, DTI calculations, and supervisor escalations are completely omitted from customer endpoints and views.
- **Consequences**:
  - *Pros*: Eliminates consumer confusion and prevents accidental disclosure of internal compliance deliberations or proprietary pricing margins.
  - *Cons*: Requires maintaining distinct UI views tailored to each persona's mental model.

---

### ADR-011: Zero-Dependency Deterministic In-Memory Repository for Reliable Prototyping
- **Context**: Demonstrations and automated tests fail when dependent on external database servers, network connectivity, or third-party cloud outages.
- **Decision**: Engineered `MortgageRepository` as a robust, singleton in-memory data store hydrated with rich synthetic mortgage personas (Miller family, Carter, Johnson, Garcia), multi-turn conversation transcripts, and pre-computed compliance scenarios.
- **Consequences**:
  - *Pros*: Guaranteed deterministic behavior during evaluations, zero database setup friction, and instantaneous page load times across all prototype screens.
  - *Cons*: State resets upon server restart (can be easily wired to Prisma/Postgres in Phase 3 without changing repository interfaces).

---

### ADR-012: Deferral of External Audio/TTS in Phase 3
- **Context**: Real-time audio synthesis (e.g. ElevenLabs) adds unnecessary overhead and distraction in an internal loan officer sales cockpit, where visual readability and speed are paramount.
- **Decision**: Deferred ElevenLabs integration. Kept the copilot focused on visual action cards, evidence transparency, and sub-10ms text processing.
- **Consequences**:
  - *Pros*: Zero audio interference; maximum focus on conversation listening and cognitive precision.
  - *Cons*: Audio playback remains simulated via visualizers.

---

### ADR-013: Absolute Precedence of Deterministic Compliance Rules over AI
- **Context**: Modern LLMs, while contextually adept, are probabilistic and prone to hallucination, sycophancy, or non-deterministic variance. In residential mortgage originations, a single uncorrected misstatement can cause loan rescission, civil penalties, or loss of Fannie Mae seller/servicer approval.
- **Decision**: Deterministic compliance rules execute in <10ms and have absolute override authority over LLM inferences. If a deterministic rule triggers, it cannot be overridden, weakened, or hidden by generative AI reasoning. Furthermore, generative AI is hard-clamped to at most `HIGH` severity—only deterministic rules backed by federal statute can issue `CRITICAL` violations.
- **Consequences**:
  - *Pros*: Provable compliance safety; instantaneous execution; auditability during regulatory examination.
  - *Cons*: Requires maintaining comprehensive regex pattern banks alongside LLM prompts.

---

### ADR-014: High Severity Classification for Informal Approval Statements
- **Context**: Loan officers frequently tell prospective borrowers *"You're definitely approved in my book"* to reassure them. Under CFPB TRID rules (12 CFR § 1026.19), this creates severe legal exposure.
- **Decision**: Classified informal approval statements as `HIGH` severity (`COMP-TRID-001`), requiring immediate verbal clarification that formal approval requires underwriting review of completed documentation.
- **Consequences**:
  - *Pros*: Protects the lender from binding promissory estoppel claims and TRID examination findings.
  - *Cons*: Requires officers to develop the habit of qualifying optimistic statements with formal disclaimers.

---

### ADR-015: Critical Severity and Mandatory Escalation for Liability Omission
- **Context**: A loan officer suggesting that a borrower "leave off a car loan to make DTI look cleaner" constitutes intentional mortgage fraud under 18 U.S.C. § 1014 and Fannie Mae Selling Guide B3-6-01.
- **Decision**: Assigned `CRITICAL` severity to liability omission attempts (`COMP-FRAUD-003`). The engine immediately flags the application, prompts full 1003 disclosure, locks submission, and triggers an automated escalation notification to the Branch Compliance Supervisor.
- **Consequences**:
  - *Pros*: Shields institution from criminal liability, buyback demands, and NMLS license revocation.
  - *Cons*: High-friction workflow (justified by severe criminal and institutional liability).

---

### ADR-016: Strict Segregation of Stated Income vs. Verified Income
- **Context**: Under Dodd-Frank Ability-to-Repay (12 CFR § 1026.43), lenders must verify income using reliable third-party records. Borrowers frequently cite cash revenue, side gigs, or undocumented contracts (e.g., Sarah's $8,000/mo cash design contracts).
- **Decision**: The system strictly isolates `statedMonthlyIncome` from `verifiedMonthlyIncome`. Unverified funds are never merged into qualifying income or used for automated DTI calculations until official 1040/Schedule C tax transcripts are uploaded and verified.
- **Consequences**:
  - *Pros*: Guarantees Qualified Mortgage (QM) safe harbor protection; eliminates post-closing investor repurchases.
  - *Cons*: Borrower qualification numbers initially appear lower until tax documents are processed.

---

### ADR-017: Suggesting Questions Instead of Auto-Answering
- **Context**: Generative copilots that attempt to answer borrower questions directly risk providing incorrect underwriting commitments or disrupting the officer-borrower relationship.
- **Decision**: The copilot operates as a coach that suggests clarifying questions (`QUESTION` intervention type) rather than attempting to take over or auto-answer the conversation.
- **Consequences**:
  - *Pros*: Preserves the loan officer's authoritative role; leads to deeper discovery and higher-fidelity Form 1003 data collection.
  - *Cons*: Requires officer engagement to verbally deliver the question.

---

### ADR-018: Surfacing Explicit Confidence Levels to the Loan Officer
- **Context**: "Black box" AI systems that conceal their certainty level lead to two failure modes: automation complacency (blindly trusting the AI) or alert fatigue (ignoring all alerts).
- **Decision**: Every intervention card surfaces its exact source (`RULE`, `AI`, or `HYBRID`), confidence score (e.g. `96%`), confidence tier (`HIGH`, `MEDIUM`, `LOW`), and an expandable evidence drawer showing the exact quote and unaddressed risk.
- **Consequences**:
  - *Pros*: Full transparency and explainability; officers know when an alert is an ironclad legal mandate vs. a contextual suggestion.
  - *Cons*: Consumes modest UI space on the intervention card.

---

### ADR-019: Conflict State for Contradictory Co-Borrower Liabilities
- **Context**: When co-borrowers provide contradictory figures (e.g., John stating $500/mo and Sarah stating $1,200/mo), AI systems often make the mistake of averaging the numbers or picking the higher amount.
- **Decision**: The copilot sets `totalMonthlyDebtStatus: "conflicted"` and records both figures with a prompt for the officer to clarify. The system never picks a winner or guesses.
- **Consequences**:
  - *Pros*: Upholds Form 1003 data integrity; forces verbal confirmation before formal underwriting submission.
  - *Cons*: Leaves DTI in an unresolved state until the officer records the verified answer.


