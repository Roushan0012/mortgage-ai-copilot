# Product Manager Assessment — Evaluator Q&A Guide

Concise, product-oriented answers to the 15 core questions expected during evaluator assessment and executive reviews.

---

### 1. Why AI instead of a normal CRM?
Traditional CRMs are passive databases requiring manual human data entry after the conversation. Darwix AI is an active in-call workflow copilot that listens in real time, prevents regulatory violations as words are spoken, auto-extracts Form 1003 parameters, and stages CRM/LOS updates automatically.

### 2. Why not automate everything (zero-click)?
Under NMLS licensing rules and federal lending laws, an accredited human officer must remain legally accountable for credit representations and borrower filings. Fully automated commits risk filing unauthorized disclosures. The copilot prepares and structures; the licensed human authorizes.

### 3. How do you prevent hallucinations?
Through a dual-engine architecture: all statutory compliance checks (TRID, TILA, ATR, 18 U.S.C. § 1014) are evaluated by deterministic, hardcoded regex rules running in `<20ms` with absolute precedence. The LLM is used only for conversational nuance, and inferences below 75% confidence are suppressed.

### 4. How do you handle regulatory compliance?
Compliance is embedded directly into the software architecture rather than bolted on. Deterministic rules run client-side/in-process to catch verbal pre-approval promises, missing APR disclosures, and liability omissions instantaneously, providing compliant suggested scripts.

### 5. What happens if the AI is wrong?
Every extracted fact links back to its exact transcript citation and confidence score. The loan officer can review, edit, or override any field in seconds before approving downstream syncs. Nothing is committed to Encompass or Salesforce without officer review.

### 6. Why use deterministic rules alongside an LLM?
Large Language Models are inherently probabilistic. In mortgage lending, an informal pre-approval promise carries severe statutory penalties under CFPB TRID. A 99% accurate model still violates federal regulations 1% of the time. Deterministic rules guarantee 100% predictable compliance safety.

### 7. Why are enterprise integrations mocked?
To deliver a 100% reliable, repeatable, offline-capable demonstration without exposing fragile third-party sandbox credentials or recurring subscription fees to evaluators. The adapters implement strict enterprise TypeScript interfaces, realistic latency, and genuine MISMO 3.4 payloads.

### 8. How would this scale to enterprise production?
Via a modular hexagonal adapter pattern: replace the mock transport classes with `@salesforce/core` and ICE Mortgage Technology Developer Connect REST SDKs. The frontend, copilot HUD, compliance engine, and post-meeting summary require zero architectural changes.

### 9. How do you measure product success?
Our North Star metric is **Meeting-to-Next-Action Completion Rate** (target: >90% within 1 hour). Key operational metrics include an **85% reduction in post-call wrap time** (from 45m to <5m), **zero TRID oral disclosure violations**, and a **4.5-day reduction in loan time-to-close**.

### 10. What constitutes the core MVP?
Pre-meeting intelligence synthesis, live consultation copilot with deterministic compliance guardrails, real-time Form 1003 fact ledger, post-meeting executive summary, human-in-the-loop approval modal, and branch manager exception monitoring.

### 11. What would you build next?
1. Production bi-directional Salesforce and ICE Encompass API connectors.
2. Direct integration with Day-1 Certainty verification providers (The Work Number, Plaid Assets).
3. Enterprise SAML/SSO integration with NMLS license role mapping.

### 12. How do you prevent agent nudge fatigue?
By enforcing a 15-second visual cooldown between non-critical suggestions, capping active floating cards at a maximum of 3, suppressing inferences below 75% confidence, and muting any category the officer dismisses for the remainder of the call.

### 13. What happens when transcription fails or audio degrades?
The system gracefully degrades: text normalization detects low acoustic confidence, pauses AI suggestion generation with a non-blocking banner, and keeps the officer in full manual control without crashing the live call workspace.

### 14. How do you protect customer financial information (GLBA)?
Ephemeral audio architecture: raw call audio is streamed into server memory for real-time diarization and discarded immediately. No raw voice recordings are stored. All customer PII is masked, and downstream events are recorded with SHA-256 state hashes.

### 15. Why does the branch manager need this product?
Managers currently manage blind, learning about compliance errors weeks later during audits. Darwix AI provides real-time branch compliance scores (94.2%), active exception queues, and automated coaching recommendations to remediate officer behavior before loans reach underwriting.
