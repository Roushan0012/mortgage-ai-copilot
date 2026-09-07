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

### ADR-012: Deferral of External AI Inference (Groq/ElevenLabs) in Phase 2 for Isolated UX Polish
- **Context**: Introducing live LLM API calls during product shell design causes unpredictable latency, flakiness during UI testing, and potential credential leakage.
- **Decision**: Phase 2 focuses strictly on product shell, design system primitives, and interactive navigation using deterministic mock states. Live inference calls to Groq (Llama 3.3) and ElevenLabs TTS are isolated to optional background testing and deferred to Phase 3.
- **Consequences**:
  - *Pros*: 100% predictable UX testing, instant local evaluation, zero risk of third-party API rate limiting, and zero credential exposure.
  - *Cons*: Live generative responses are simulated via rich deterministic scenarios until Phase 3 activation.

