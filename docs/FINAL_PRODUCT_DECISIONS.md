# Final Product Decisions & Architectural Tradeoffs

This document outlines the **12 core product and architectural decisions** governing the Darwix AI Mortgage Copilot. Each decision documents the rationale, engineering tradeoffs, and future evolution path to demonstrate defensible product judgment under enterprise mortgage constraints.

---

## 1. Hybrid AI + Deterministic Compliance Rules

* **Decision**: Couple an ultra-fast deterministic rule engine (sub-20ms regex and keyword boundary evaluation) with an asynchronous Large Language Model (Groq LLaMA 3.3 70B) for contextual reasoning, where deterministic compliance rules **strictly override** LLM suggestions.
* **Why**: Regulatory requirements (TRID 12 CFR § 1026.19, CFPB ATR/QM 12 CFR § 1026.43, 18 U.S.C. § 1014) carry severe statutory penalties and cannot tolerate probabilistic hallucination or non-deterministic latency spikes during live borrower calls.
* **Tradeoff**: Hardcoded rules require upfront compliance taxonomy design and periodic rule updates as lending guidelines shift; less flexible than pure natural language generation.
* **Future Evolution**: Expand rule authoring to a visual Compliance Studio allowing legal and compliance officers to update regex triggers, disclaimers, and state-specific disclosure mandates without code redeployment.

---

## 2. Mandatory Human Approval for Sensitive Actions

* **Decision**: All external-facing writes (Salesforce CRM stage updates, Encompass LOS 1003 commits, borrower emails, needs list requests) require an explicit, accredited Loan Officer review and one-click confirmation.
* **Why**: Under NMLS licensing regulations and Fair Lending principles, an accredited mortgage professional must remain legally accountable for borrower communications and loan file integrity. Fully automated pushes risk filing incorrect liability disclosures or premature commitments.
* **Tradeoff**: Adds a friction gate (LO must review and click 'Approve & Push' rather than 100% autonomous background execution).
* **Future Evolution**: Introduce risk-weighted progressive autonomy—e.g., auto-approving routine meeting transcription note logs to CRM while keeping LOS financial edits and credit commitments locked behind 2-person or manager approval gates.

---

## 3. Strict Stated vs. Verified Financial Data Segregation

* **Decision**: Maintain dual data models throughout the entire application lifecycle for `stated` income/liabilities (what the borrower verbalized) versus `verified` financial records (backed by W-2s, 1040s, or AUS pull), with explicit badges and ATR exclusion rules.
* **Why**: Blending verbal claims with verified data causes fatal underwriting errors. Unverifiable cash (e.g., Sarah Miller's $8,000 cash consulting) cannot be included in Fannie Mae DTI calculations without triggering a loan buyback from the secondary market.
* **Tradeoff**: Increased schema complexity and UI screen real estate required to display both values side-by-side with discrepancy callouts.
* **Future Evolution**: Direct API hooks into automated Day-1 Certainty services (e.g., Equifax The Work Number, Plaid Assets, Finicity) to automatically convert stated data to verified status the moment digital consent is provided.

---

## 4. No Automatic Underwriting Decisions

* **Decision**: The copilot provides underwriting readiness analysis, guidelines matching, and risk flags, but explicitly **never renders an automatic approval, pre-approval, or loan denial decision**.
* **Why**: Credit decisions trigger strict adverse action notice obligations (FCRA / Regulation B) and require licensed underwriter delegation or certified Automated Underwriting Systems (Fannie Mae Desktop Underwriter / Freddie Mac Loan Product Advisor).
* **Tradeoff**: The copilot does not provide an instant "Approved!" dopamine hit for the borrower in the meeting workspace.
* **Future Evolution**: Integration directly into Fannie Mae DU / Freddie Mac LPA APIs to retrieve official AUS findings (Approve/Eligible or Refer) inside the copilot under strict underwriter supervision.

---

## 5. No Unsupported Rate Guarantees

* **Decision**: The system forbids any verbal or suggested rate locking, rate guarantees, or definite APR claims during unstructured call dialogues. Rate discussions trigger mandatory TRID disclosure banners.
* **Why**: Quoting exact terms without a formal Loan Estimate (LE) or an official pricing engine lock (e.g., Optimal Blue) exposes the lender to severe Truth in Lending Act (TILA) regulatory audit penalties.
* **Tradeoff**: Loan Officers cannot use the copilot to quickly promise a rate discount to close a hesitant borrower on the phone.
* **Future Evolution**: Real-time integration with Optimal Blue or Polly Product and Pricing Engines (PPE) to show dynamic, compliant live rate ranges with required APR disclosures automatically appended.

---

## 6. Mocked Enterprise Integration Adapters with Real Contract Interfaces

* **Decision**: Build robust, realistic, typed integration adapters for Salesforce CRM, ICE Encompass LOS, and Document Generation with simulated network latency, error handling, and payload inspection, rather than binding to costly live sandbox credentials during assessment.
* **Why**: Demonstrates end-to-end operational workflows, idempotent payload structures, and resilience without exposing fragile external sandbox dependencies or recurring subscription costs to evaluators.
* **Tradeoff**: Does not test live OAuth2 token exchange with proprietary ICE Encompass or Salesforce production servers in this phase.
* **Future Evolution**: Swap mocked transport classes for live REST/OAuth SDKs (`@salesforce/core` and ICE Mortgage Technology Developer Connect APIs) with zero disruption to the presentation or domain layers.

---

## 7. Ephemeral In-Memory Voice Processing (Zero Persistent Raw Audio)

* **Decision**: Stream live borrower audio for real-time transcription and intervention analysis, then discard raw audio bytes immediately from server memory. Retain only redacted, encrypted text transcripts and cryptographic event audit hashes.
* **Why**: Comply with Gramm-Leach-Bliley Act (GLBA), state two-party wiretapping consent statutes (e.g., California, Florida), and eliminate massive cloud storage liabilities associated with storing multi-gigabyte sensitive voice recordings.
* **Tradeoff**: Post-meeting playback of exact vocal tone or raw audio forensics is not supported; team must rely on timestamped text transcripts.
* **Future Evolution**: Optional opt-in secure enterprise S3 archive with client-managed KMS encryption keys for enterprise customers whose compliance programs explicitly mandate full voice recording retention.

---

## 8. Low-Confidence AI Suppression & Silent Pass-Through

* **Decision**: Suppress contextual AI nudges when LLM confidence falls below 75% or when transcript sentiment/ambiguity is high, silently passing through without disturbing the active call screen.
* **Why**: In live mortgage conversations, an inaccurate, distracting, or hallucinated AI pop-up can derail an LO during high-stakes negotiation or misinform a borrower.
* **Tradeoff**: Some edge-case opportunities for coaching or upselling may be missed if the threshold is conservative.
* **Future Evolution**: Fine-tune domain-specific LoRA adapters on 10,000+ real mortgage sales interactions to boost inference confidence and reduce the need for aggressive suppression thresholds.

---

## 9. Nudge Fatigue Throttling & Visual Cooldowns

* **Decision**: Implement a 15-second visual cooldown debounce timer between non-critical suggestions and limit active onscreen cards to a maximum of 3 cards, prioritizing CRITICAL compliance alerts over advisory guidance.
* **Why**: Loan Officers operate under high cognitive load while speaking, listening, and navigating software. Constant visual pop-ups cause cognitive fatigue, causing users to dismiss or ignore all alerts.
* **Tradeoff**: Secondary advisory suggestions (e.g., cross-sell home insurance) might be delayed while the LO discusses loan terms.
* **Future Evolution**: Eye-tracking / focus-detection or voice activity detection (VAD) to inject visual prompts exclusively during natural conversational pauses.

---

## 10. Multi-Layered Graceful API Degradation

* **Decision**: If external LLM (Groq) or TTS (ElevenLabs) APIs experience latency spikes (>1,500ms), 429 rate limits, or network failures, the copilot automatically falls back to deterministic rule matching and pre-compiled response templates without breaking the live call UI.
* **Why**: A live customer consultation cannot crash or hang because a 3rd-party cloud AI provider has a momentary outage.
* **Tradeoff**: Fallback suggestions are templated rather than dynamically tailored to conversational subtleties during outage windows.
* **Future Evolution**: Deploy lightweight local on-device SLMs (e.g., ONNX-quantized LLaMA 3.2 1B or Phi-3) running client-side via WebAssembly for zero-network edge resilience.

---

## 11. Immutable Audit Logging with Cryptographic Hashes

* **Decision**: Every intervention generated, dismissed, accepted, or overridden by the Loan Officer is recorded in an append-only, tamper-evident audit event log with an SHA-256 state hash.
* **Why**: Financial institution compliance auditors and regulatory examiners require proof of who said what, when guidance was offered, and whether the human agent complied with or overrode safety warnings.
* **Tradeoff**: Increases database write volume and requires event store management.
* **Future Evolution**: Anchor audit log Merkle root hashes onto a private enterprise ledger (e.g., Hyperledger Besu) for unalterable regulatory compliance verification.

---

## 12. Idempotent Enterprise Action Pipelines

* **Decision**: Enterprise sync actions (CRM sync, LOS sync, document generation) utilize deterministic idempotency keys (`idempotency_key = hash(meeting_id, action_type, payload_hash)`). Multiple clicks or network retries never duplicate leads or generate duplicate loan files in the LOS.
* **Why**: Loan officers frequently double-click buttons under slow network conditions; duplicate loan entries in Encompass corrupt pipeline reporting and trigger redundant credit bureau pulls.
* **Tradeoff**: Requires server/client state caching and deduplication tracking on every push operation.
* **Future Evolution**: Distributed Redis-backed idempotency lock manager for clustered enterprise multi-region deployments.
