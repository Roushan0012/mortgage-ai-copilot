# Darwix AI — 2-Week Pilot Prioritization & Tradeoff Decisions

## The Situation
Two weeks prior to the branch pilot launch, the project faces seven critical operational and technical constraints. The launch date cannot move. This document outlines the rigorous, defensible product management decisions made to ensure a compliant, robust, and credible pilot delivery.

---

## Decision Matrix Summary

| Challenge | Product Decision | Operational Strategy / Architecture Response | Rationale & Trade-off |
|---|---|---|---|
| **1. Key enterprise integration unavailable** (e.g. Encompass LOS API sandbox down or delayed) | **FALLBACK** | Deploy adapter-based Mock LOS with MISMO 3.4 payload export and manual JSON/XML staging. | Prevents pilot delay. LOs can still inspect the Form 1003 draft and verify data extraction without blocking on vendor IT delays. |
| **2. Speech recognition inconsistent** (Acoustic background noise, accents, cross-talk) | **SIMPLIFY** | Implement semi-automated push-to-transcribe and quick scenario injection fallbacks; focus diarization on key financial statements. | Protects agent experience. Inaccurate transcripts create bad interventions; simplifying to structured fact extraction avoids noisy hallucinated nudges. |
| **3. Excessive nudges & agent cognitive fatigue** | **BUILD FIRST** | Enforce strict nudge fatigue controls: deduplication, 3-sec non-critical cooldown, priority ranking, and max 4 cards visible. | Critical for adoption. An annoying, hyperactive copilot will be dismissed or muted by loan officers within their first three calls. |
| **4. Compliance rejects generative high-risk warnings** | **LAUNCH** | Enforce deterministic regex rules with absolute precedence over LLM output. Generative AI clamped to max 'high' for consultative guidance only. | Non-negotiable regulatory safety. Regulators and compliance officers cannot accept probabilistic hallucinations for TRID or UDAAP enforcement. |
| **5. Raw meeting audio cannot be retained** (GLBA & wiretap privacy constraints) | **LAUNCH** | Process audio in-memory ephemerally; persist only normalized transcript text segments and extracted Form 1003 facts. | Compliance requirement. Storing raw voice audio introduces severe GLBA, state two-party consent wiretap, and biometric privacy liabilities. |
| **6. Managers request extra dashboard** (Custom multi-tier executive rollups) | **DEFER** | Provide standard Manager View with core compliance and conversion metrics; defer custom multi-branch rollups to Phase 7. | Protects the launch date. Core consultation and compliance workflows take precedence over secondary analytics. |
| **7. Autonomous AI loan approval requests** | **REJECT** | Maintain strict human-in-the-loop approval gate. AI only prepares recommendations; loan officer must approve all dispatches. | Fundamental safety rule. Autonomous underwriting approval violates federal TRID guidelines and unauthorized lender commitment laws. |

---

## Detailed Rationale by Scenario

### 1. Enterprise Integration Unavailable: Deploy Adapter Fallback
- **Problem**: ICE Encompass sandbox credentials or network firewall openings are delayed by corporate security.
- **Product Decision**: **FALLBACK**.
- **Action**: Activate the adapter's `MOCKED` mode. The copilot continues to format valid MISMO 3.4 XML/JSON payloads, enforce field validation, and display payload inspectors. Loan officers can download the MISMO file or approve staging.
- **Why**: Proves business value without blocking on external enterprise IT timelines.

### 2. Speech Recognition Inconsistency: Simplify and Constrain Scope
- **Problem**: Live Whisper / ASR struggles with speaker overlap and numbers ("five hundred" vs "fifteen hundred").
- **Product Decision**: **SIMPLIFY**.
- **Action**: Do not attempt free-form semantic parsing on noisy audio. Instead, run targeted heuristic matchers on numerical disclosures (income, down payment, monthly debt) and allow the loan officer to edit or clarify facts directly in the 1003 Ledger before post-meeting sync.
- **Why**: A wrong number in an automated Form 1003 ruins trust. Giving the LO a quick click-to-verify ledger maintains 100% data integrity.

### 3. Nudge Fatigue: Build First
- **Problem**: During a 20-minute call, loan officers receive dozens of AI suggestions, causing them to mute the copilot.
- **Product Decision**: **BUILD FIRST**.
- **Action**:
  - Max visible deck size clamped to 4 cards.
  - 3-second cooldown on low/medium consultative suggestions.
  - Suppress identical categories once dismissed by the officer.
  - High-risk compliance warnings bypass suppression and pin to top.
- **Why**: Agent adoption is the primary failure mode of sales copilots. High signal-to-noise ratio is mandatory.

### 4. Generative Compliance Warnings: Launch with Deterministic Authority
- **Problem**: Chief Compliance Officer refuses to let an LLM generate warnings regarding TRID or UDAAP.
- **Product Decision**: **LAUNCH (Deterministic Authority)**.
- **Action**: High-risk compliance warnings are generated solely by hard-coded, legal-approved regex rules citing exact CFR sections. The LLM is restricted to consultative sales coaching (product differences, turnaround objection handling).
- **Why**: Legal and regulatory compliance requires 100% explainability and zero probabilistic hallucination risk.

### 5. Raw Audio Retention Prohibition: Ephemeral In-Memory Pipeline
- **Problem**: Legal counsel flags that recording and storing customer phone audio creates wiretap consent and GLBA exposure.
- **Product Decision**: **LAUNCH (Ephemeral Pipeline)**.
- **Action**: Audio streams are converted to text in transient memory and immediately discarded. Only the structured transcript segments, extracted facts, and audit records are persisted in the database.
- **Why**: Eliminates high-risk data retention liabilities while preserving all operational auditing requirements.

### 6. Manager Extra Dashboard Requests: Defer
- **Problem**: Sales directors request customized team productivity analytics, cross-branch leaderboards, and conversion trend exports.
- **Product Decision**: **DEFER**.
- **Action**: Deliver the existing Manager Dashboard containing essential health indicators: compliance escalation queue, workflow health, and customer conversion funnel. Defer custom reporting to post-pilot sprints.
- **Why**: The primary value of Phase 6 is in-call assistance and post-call automation. Diverting engineering to reporting charts risks core call stability.

### 7. Autonomous System Execution: Explicitly Reject
- **Problem**: Stakeholders suggest letting the AI automatically approve pre-qualifications or push loan updates directly to the credit bureau.
- **Product Decision**: **REJECT**.
- **Action**: Enforce the mandatory Human Loan Officer Approval Gate (`AI Draft` → `Officer Review Modal` → `Explicit Sign-Off` → `System Execution`).
- **Why**: The copilot is an assistant, not an automated underwriter. Regulatory accountability always rests with the licensed loan officer.
