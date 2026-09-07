# Failure Modes, System Resilience & Graceful Fallbacks

This document outlines the **ten primary failure modes** that can threaten the reliability, compliance, and user adoption of an in-call mortgage copilot. For each failure mode, we define the operational impact, automated detection mechanism, engineering mitigation, and fallback strategy.

---

## Failure Modes & Mitigation Matrix

```
+------------------------------------+-----------------------------+------------------------------------+
| FAILURE MODE                       | OPERATIONAL IMPACT          | PRIMARY MITIGATION / FALLBACK      |
+------------------------------------+-----------------------------+------------------------------------+
| 1. Inaccurate Fact Extraction      | Corrupt Form 1003 in LOS    | Highlight confidence; manual edit  |
| 2. False-Positive Compliance Alert | MLO frustration / alarm     | Officer dismissal with feedback    |
| 3. Missed Regulatory Infraction    | Statutory liability / fines | Deterministic regex priority       |
| 4. Excessive In-Call Nudges        | Cognitive fatigue / noise   | 15s cooldown & 3-card clamp        |
| 5. Low-Quality Audio Transcript    | Hallucinated AI context     | Audio quality check & pass-through |
| 6. Downstream Integration Outage   | Stalled file handoff        | Local queue & idempotent retry     |
| 7. Duplicate Enterprise Action     | Redundant LOS files / tasks | SHA-256 payload idempotency keys   |
| 8. MLO Blindly Trusting AI         | Unverified data in credit   | Mandatory approval modal check     |
| 9. Borrower Information Conflict   | Skewed DTI calculations     | Explicit CONFLICTED tag; no guess  |
| 10. Unsupported Rate Guarantee     | TILA Reg Z violations       | Strict verbal quote prohibition    |
+------------------------------------+-----------------------------+------------------------------------+
```

---

## Detailed Failure Mode Analysis

### 1. Inaccurate Fact Extraction
* **Failure**: AI misinterprets conversational dialogue (e.g., extracts John's base salary as $180,000 instead of $145,000 due to complex bonus discussion).
* **Impact**: Inaccurate DTI calculation and incorrect loan drafting inside ICE Encompass.
* **Detection**: Confidence scoring below 80% on extracted numeric fields; cross-validation against pre-meeting stated profile.
* **Mitigation**: Every extracted fact renders with an interactive edit icon, transcript citation badge, and speaker attribution.
* **Fallback**: Loan officer can click directly on the Fact Ledger row to override the value manually before approving LOS sync.

---

### 2. False-Positive Compliance Alert
* **Failure**: System flags an innocent conversational phrase (e.g., *"You should be approved for a credit card through your bank"*) as a mortgage TRID informal pre-approval violation.
* **Impact**: Distracts the loan officer during live customer rapport building.
* **Detection**: MLO clicks *"Dismiss"* with reason *"Not applicable / false positive"*.
* **Mitigation**: Strict multi-token regex boundaries requiring mortgage-specific contextual anchors (e.g., loan amount, pre-approval, closing terms).
* **Fallback**: Officer dismissal instantly hides the card and mutes identical alerts for the remainder of the active call session.

---

### 3. Missed Regulatory Infraction (False Negative)
* **Failure**: Officer makes an unlawful verbal commitment using obscure slang or indirect phrasing not caught by the deterministic rule engine.
* **Impact**: Unmitigated TRID or TILA liability exposing the lender to civil regulatory action.
* **Detection**: Post-meeting transcript scan runs a secondary, deeper asynchronous LLM compliance audit.
* **Mitigation**: Hybrid dual-engine design—if deterministic regex misses nuanced phrasing, the asynchronous Groq LLM evaluates conversational context in parallel.
* **Fallback**: Surfaced in the Post-Meeting Summary as an *"Unreviewed Potential Risk"* and logged to the Branch Manager Coaching Queue for supervisory review.

---

### 4. Excessive In-Call Nudges (Cognitive Fatigue)
* **Failure**: Copilot generates 8–10 advisory cards in rapid succession during an active borrower negotiation.
* **Impact**: Officer experiences cognitive overload, mutes the screen, or ignores all guidance (including critical safety warnings).
* **Detection**: Rapid dismissals (<2 seconds per card) or screen interaction timeout.
* **Mitigation**: Visual anti-fatigue engine enforces:
  - 15-second debounce cooldown between advisory cards.
  - Hard cap of at most 3 visible cards onscreen.
  - Automatic suppression of suggestions with <75% confidence.
* **Fallback**: Advisory suggestions are silently diverted into a collapsed side drawer, leaving only CRITICAL compliance banners floating onscreen.

---

### 5. Low-Quality Audio Transcription
* **Failure**: Heavy background acoustic noise or poor cell phone reception results in garbled speech-to-text tokens.
* **Impact**: Downstream LLM hallucinates incorrect financial facts or generates nonsensical suggested responses.
* **Detection**: Diarization confidence drops below 0.65; word error rate (WER) spike detected.
* **Mitigation**: In-flight text normalization strips unrecognizable tokens and verifies phrase coherence before feeding prompts to Groq.
* **Fallback**: Copilot pauses AI suggestion generation and displays a subtle banner: *"Audio quality degraded — transcription paused"*, keeping the officer in manual control without crashing the UI.

---

### 6. Downstream Enterprise Integration Outage
* **Failure**: Salesforce CRM or ICE Encompass experiences a network timeout or HTTP 503 Service Unavailable during post-meeting push.
* **Impact**: Completed consultation notes and Form 1003 application fail to commit to the enterprise system of record.
* **Detection**: Adapter catches HTTP error status or network timeout (>3,000ms).
* **Mitigation**: Exponential backoff retry loop with structured error event logging (`CRM-FAIL-503`).
* **Fallback**: File is safely cached in the local offline transaction queue; UI displays a yellow warning with a 1-click *"Retry Sync"* button and allows the officer to proceed without data loss.

---

### 7. Duplicate Enterprise Action Execution
* **Failure**: Loan officer double-clicks the *"Commit to Encompass LOS"* button under slow network conditions.
* **Impact**: Creates duplicate loan origination records in Encompass, confusing operations and skewing pipeline reporting.
* **Detection**: Middleware checks incoming request hash against active in-flight request cache.
* **Mitigation**: Client-side button disables immediately on click with loading spinner; backend generates deterministic SHA-256 idempotency keys: `hash(meeting_id + action_type + payload)`.
* **Fallback**: Second request is recognized as duplicate and returns the original cached transaction ID (`ENC-1003-99412`) with zero side effects.

---

### 8. Loan Officer Blindly Trusting AI Output
* **Failure**: Officer assumes AI-extracted numbers are 100% infallible and clicks *"Approve & Commit"* without reading the payload.
* **Impact**: Incorrect borrower debt numbers or unverified self-employment income are submitted to underwriting.
* **Detection**: Approval modal closed in under 500ms without scrolling payload preview.
* **Mitigation**: Modal forces visual review of flagged risk items (e.g., highlighting Sarah Miller's unverified $8,000 cash in amber) before the final confirm button activates.
* **Fallback**: File is committed with a mandatory *"AI-Assisted Draft / Underwriter Audit Required"* tag inside Encompass MISMO 3.4 headers.

---

### 9. Borrower Information Conflict (Multi-Speaker Discrepancy)
* **Failure**: Co-borrowers state conflicting financial figures during the call (e.g., John says auto debt is $500/mo; Sarah says it is $1,200/mo).
* **Impact**: Flawed DTI calculation leading to premature pre-qualification and subsequent loan denial.
* **Detection**: Multi-speaker entity resolution detects two distinct values assigned to the same liability category.
* **Mitigation**: The copilot strictly refuses to guess or average the numbers. It tags the liability as **CONFLICTED**.
* **Fallback**: The field is locked from automated qualifying calculations, and an auto-generated document request for the official auto loan statement is added to the borrower's upload portal.

---

### 10. Unsupported Rate Guarantees
* **Failure**: Officer attempts to promise an exact interest rate (e.g., *"I can lock you in at 5.875% today"*) without verifying pricing engine guidelines.
* **Impact**: Severe violation of Truth in Lending Act (TILA Regulation Z) and potential lender financial loss.
* **Detection**: Regex pattern matching detects rate commitments paired with guarantee terminology.
* **Mitigation**: System flashes an immediate amber regulatory alert warning the officer that verbal quotes without formal Loan Estimates (LE) are prohibited.
* **Fallback**: Injects a compliant suggested response into the HUD: *"Current market rates for this tier are around 5.875% with an APR of 6.125%, subject to formal underwriting and daily rate lock approval."*
