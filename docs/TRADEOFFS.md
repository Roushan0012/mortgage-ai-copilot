# Core Product & Engineering Tradeoffs

In designing an enterprise AI copilot for highly regulated U.S. mortgage origination, product success requires making defensible architectural compromises. This document formalizes the **six core tradeoffs** evaluated during development, detailing the competing options, our explicit decision, the resulting benefits, and the operational costs accepted.

---

## Tradeoff 1: AI Flexibility vs. Compliance Control

```
Option A: Pure Generative LLM                  Option B: Hybrid Deterministic Rules + LLM
(Maximum flexibility, high hallucination risk) (Predictable safety, rigid compliance precedence)
                      [SELECTED: OPTION B]
```

* **The Conflict**: Pure Large Language Models (e.g., GPT-4o, LLaMA 3.3) excel at conversational fluency and contextual understanding, but are inherently probabilistic. In mortgage sales, an informal pre-approval promise or omitting a liability carries civil fines under CFPB TRID and criminal liability under 18 U.S.C. § 1014. Lenders cannot accept even a 1% hallucination rate on statutory rules.
* **Our Decision**: **Hybrid Architecture with Deterministic Precedence**. Hardcoded regex and keyword rule sets execute synchronously in `<20ms` for federal regulations (TRID 12 CFR § 1026.19, TILA 12 CFR § 1026.24, ATR 12 CFR § 1026.43, 18 U.S.C. § 1014). Generative LLM reasoning is used exclusively for consultative nuance, objection handling, and fact summarization—and is strictly overridden whenever a deterministic compliance rule triggers.
* **Benefits**: 100% predictable compliance safety, sub-20ms in-call alert latency, zero hallucinated legal disclaimers.
* **Costs Accepted**: Maintenance overhead of updating deterministic regex rule sets when federal guidelines change; less stylistic variation in compliance disclaimers.

---

## Tradeoff 2: Autonomous Automation vs. Mandatory Human Approval Gates

```
Option A: Autonomous "Zero-Click" Sync         Option B: Gated Human-in-the-Loop Review
(Full AI automation into CRM/LOS)             (MLO must review, edit, and click to approve)
                      [SELECTED: OPTION B]
```

* **The Conflict**: Fully autonomous end-to-end processing provides the highest theoretical efficiency (e.g., the AI immediately commits Form 1003 to Encompass and emails the borrower without human intervention). However, under NMLS licensing laws and Fair Lending regulations, an accredited human officer must remain legally accountable for all credit representations and application filings.
* **Our Decision**: **Mandatory Human-in-the-Loop Approval Gates**. The AI pre-populates, formats, and stages all downstream mutations (CRM updates, LOS Form 1003 commits, borrower needs lists), but blocks external dispatch until an accredited Loan Officer reviews the payload modal and signs off.
* **Benefits**: Absolute regulatory defensibility, zero unauthorized credit commitments, and institutional trust from bank legal and compliance departments.
* **Costs Accepted**: Adds 30–60 seconds of review time per file; requires an interactive modal UI for reviewing payloads.

---

## Tradeoff 3: Full Real-Time Bidirectional Speech vs. Low-Risk TTS Assistance

```
Option A: Full Duplex Real-Time Voice          Option B: Audio Coaching via ElevenLabs TTS
(AI speaks directly to borrower on call)       (AI coaches officer via selective voice clips)
                      [SELECTED: OPTION B]
```

* **The Conflict**: Having an AI voice agent speak directly to the borrower in full-duplex audio during the live consultation introduces catastrophic failure modes (latency lag, accidental interruptions, uncanny valley awkwardness, and severe wiretap consent liabilities).
* **Our Decision**: **Targeted Loan Officer Voice Coaching via ElevenLabs TTS**. The AI listens passively to the conversation stream. When a complex objection or program comparison arises, the officer can click *"Play AI Voice Response"* to hear a professional, compliant explanation in their ear/headset, which they can then deliver in their own voice.
* **Benefits**: Eliminates borrower alienation, removes conversational collision risks, and keeps the licensed human as the sole speaking voice to the customer.
* **Costs Accepted**: Officer must trigger audio assistance; does not provide hands-free autonomous customer-facing dialogue.

---

## Tradeoff 4: Fragile Live Sandbox Endpoints vs. Resilient Adapter Architecture

```
Option A: Direct Live Sandbox Binding          Option B: Typed Enterprise Adapter Pattern
(Fragile external sandbox dependencies)        (Robust, typed, local mock with realistic payloads)
                      [SELECTED: OPTION B]
```

* **The Conflict**: Connecting directly to live external sandboxes (e.g., Salesforce FSC REST API, ICE Encompass Developer Connect) during prototype demos introduces third-party network flakiness, rate limit throttling, expired OAuth tokens, and costly enterprise licensing requirements for evaluators.
* **Our Decision**: **Hexagonal Adapter Architecture with High-Fidelity Mock Implementations**. All integrations implement strict TypeScript interfaces (`lib/integrations/types.ts`) and simulate real-world conditions (400ms network latency, error handling, idempotent payload hashing, and MISMO 3.4 XML/JSON generation) while running locally with 100% demo reliability.
* **Benefits**: Flawless, repeatable evaluator demonstrations; complete offline capability; clean separation of presentation logic from transport infrastructure.
* **Costs Accepted**: Does not test live OAuth2 handshake or network token refreshing with production Salesforce/Encompass servers in this phase.

---

## Tradeoff 5: Maximum In-Call Guidance vs. Loan Officer Nudge Fatigue

```
Option A: Aggressive Notification Stream       Option B: Anti-Fatigue Throttling & Clamping
(Pop up every detected sales opportunity)     (Strict cooldowns, max 3 cards, suppression)
                      [SELECTED: OPTION B]
```

* **The Conflict**: The AI could theoretically generate 15+ suggestions during a 30-minute consultation (upselling HELOCs, insurance cross-sells, competitor rebuttal scripts, term comparisons). However, an officer speaking to a live customer suffers severe cognitive overload from constant visual movement.
* **Our Decision**: **Strict Visual Throttling & Priority Clamping**.
  1. 15-second debounce timer between non-critical suggestions.
  2. Maximum 3 visible cards onscreen at any time.
  3. Low-confidence suppression for inferences <75%.
  4. Dismissed category memory: if an MLO dismisses a suggestion, that category is muted for the rest of the call.
* **Benefits**: The officer stays calm, focused, and present with the borrower; compliance alerts retain high visual urgency because the screen isn't cluttered.
* **Costs Accepted**: Some minor advisory coaching tips may be dropped or delayed during rapid-fire conversation segments.

---

## Tradeoff 6: Permanent Audio Retention vs. Ephemeral Privacy & Operational Simplicity

```
Option A: Permanent Raw Audio S3 Archive       Option B: Ephemeral In-Memory Voice Processing
(Store multi-gigabyte call recordings)        (Process audio in memory; persist only text)
                      [SELECTED: OPTION B]
```

* **The Conflict**: Storing raw audio recordings of borrower consultations enables post-call audio playback and vocal tone analysis, but introduces massive data security liabilities under Gramm-Leach-Bliley Act (GLBA), multi-state two-party wiretapping consent laws, and exponential cloud storage costs.
* **Our Decision**: **Ephemeral In-Memory Voice Streaming with Redacted Text Persistence**. Voice audio is streamed into server memory for real-time diarization and intervention analysis, then immediately purged. Only redacted, timestamped text transcripts and cryptographic SHA-256 audit logs are persisted to disk.
* **Benefits**: Eliminates cloud audio data breach exposure, avoids wiretap compliance friction, and slashes cloud storage requirements by >98%.
* **Costs Accepted**: Post-meeting reviews cannot play back the exact audio recording or evaluate borrower vocal pitch/inflection.
