# Darwix AI — Voice Assistance Architecture & Guide (Phase 4)

This document provides technical documentation, operational guidance, and security architecture details for the **ElevenLabs Text-to-Speech (TTS)** voice copilot in **Darwix AI**.

---

## 1. Overview & Product Philosophy

The Darwix AI Voice Copilot enables loan officers to optionally hear concise, high-fidelity AI-generated recommendations, clarifying questions, and objection rebuttals through **ElevenLabs Text-to-Speech**.

### Core Tenets
1. **Strictly Opt-In & Agent-Initiated**: Voice assistance never speaks automatically to the customer and never interrupts the live consultation. The loan officer reviews an intervention card first, then explicitly chooses when to trigger audio playback (`[Play Suggestion]`, `[Play Response]`, `[Play Question]`).
2. **Zero Browser Secret Exposure**: The `ELEVENLABS_API_KEY` is isolated strictly to the server-side Node.js runtime. The client browser communicates only with our internal authenticated API endpoint (`/api/voice/speak`).
3. **Enhancement, Not a Dependency**: The entire text-based copilot continues to function flawlessly even if the ElevenLabs service is unconfigured, rate-limited, or completely offline.
4. **Defensive Content Sanitization**: Before text is transmitted to ElevenLabs, all markdown tags, internal risk scores, confidence values, rule citations, and private metadata are stripped to ensure clean, conversational speech.

---

## 2. Voice Architecture & Data Flow

```
+-------------------------------------------------------------+
|                     Client Web Browser                      |
|                                                             |
|  1. Loan Officer views intervention card                    |
|  2. Explicitly clicks [Play Response]                       |
|  3. CopilotVoicePlayer initiates POST /api/voice/speak      |
+------------------------------+------------------------------+
                               |
                               | HTTPS POST (text, context)
                               v
+-------------------------------------------------------------+
|                Next.js Server Runtime (App Router)          |
|                                                             |
|  4. validateVoiceRequest():                                 |
|     - Rejects unauthorized client parameters (keys/URLs)    |
|     - Bounds text <= 1,000 characters                       |
|     - Verifies allowed context                              |
|  5. isVoiceConfigured(): verifies ELEVENLABS_API_KEY        |
|  6. normalizeVoiceText(): strips markdown, tags, scores     |
|  7. ElevenLabsClient: stream TTS from voice provider        |
+------------------------------+------------------------------+
                               |
                               | HTTPS (Streaming REST)
                               v
+-------------------------------------------------------------+
|                    ElevenLabs TTS Cloud                     |
|                                                             |
|  8. Model: eleven_turbo_v2_5                                |
|  9. Voice: Rachel (21m00Tcm4TlvDq8ikWAM)                    |
| 10. Progressive audio/mpeg byte stream generated            |
+------------------------------+------------------------------+
                               |
                               | Progressive audio/mpeg stream
                               v
+-------------------------------------------------------------+
|                     Client Web Browser                      |
|                                                             |
| 11. CopilotVoicePlayer buffers stream into Blob / URL       |
| 12. Caches audio in bounded client memory (max 20 entries)  |
| 13. Plays audio via HTML5 Audio element                     |
| 14. Synchronizes [Stop], pause, resume, & waveform state    |
+-------------------------------------------------------------+
```

---

## 3. Environment Configuration

All voice configuration is centralized in `lib/voice/config.ts`. The following environment variables configure the service:

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `ELEVENLABS_API_KEY` | **Yes** (for live TTS) | *None* | Official ElevenLabs API key. **Server-side only.** Never prefix with `NEXT_PUBLIC_`. |
| `ELEVENLABS_VOICE_ID` | No | `21m00Tcm4TlvDq8ikWAM` | Voice ID for speech synthesis (Default: Rachel — clear, professional, neutral advisory tone). |
| `ELEVENLABS_MODEL_ID` | No | `eleven_turbo_v2_5` | Low-latency synthesis model optimized for conversational copilots. |

If `ELEVENLABS_API_KEY` is omitted, the application automatically enters **Offline Voice Fallback** mode without breaking any part of the text copilot.

---

## 4. Server API Specification

### Endpoint: `POST /api/voice/speak`

Streaming TTS synthesis proxy.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload
```json
{
  "text": "Let's separate the income you've reported from the income we can verify with documentation.",
  "context": "copilot",
  "speed": 1.0
}
```

#### Validation & Guardrails
- **Max Length**: 1,000 characters (returns `413 Payload Too Large` if exceeded).
- **Prohibited Parameters**: Requests containing `apiKey`, `api_key`, `token`, `secret`, `providerUrl`, or `systemPrompt` are immediately rejected with `400 Bad Request`.
- **Allowed Contexts**: `["copilot", "suggestion", "response", "question", "test"]`.
- **Allowed Speed**: Number between `0.5` and `2.0`.

#### Successful Response (`200 OK`)
- **Headers**:
  - `Content-Type: audio/mpeg`
  - `Cache-Control: no-cache, no-store, must-revalidate`
- **Body**: Progressive binary MP3 audio stream.

#### Error Responses
- `400 Bad Request`: Invalid JSON, empty text, or prohibited client parameters.
- `413 Payload Too Large`: Text exceeds 1,000 characters.
- `503 Service Unavailable`: `ELEVENLABS_API_KEY` not configured on the server.
- `502 Bad Gateway`: ElevenLabs provider timeout, network failure, or malformed upstream stream.
- `429 Too Many Requests`: ElevenLabs monthly character quota exceeded.

All error responses return clean JSON and **never expose API credentials, provider endpoints, or stack traces**:
```json
{
  "error": "Voice assistance is temporarily unavailable. You can still use the text suggestion.",
  "code": "VOICE_UNCONFIGURED"
}
```

---

### Endpoint: `GET /api/voice/status`

Public voice availability check.

#### Response (`200 OK`)
```json
{
  "configured": true,
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "modelId": "eleven_turbo_v2_5",
  "outputFormat": "mp3_44100_128",
  "maxCharacters": 1000
}
```
*Note: This endpoint reports capability without ever exposing credential strings.*

---

## 5. UI Components & Interaction States

### `CopilotVoicePlayer` (`components/voice/CopilotVoicePlayer.tsx`)
A stateful, reusable audio player with 5 distinct visual states:

1. **Idle**: `[ 🔊 Play Suggestion ]` / `[ 🔊 Play Response ]` / `[ 🔊 Play Question ]`
2. **Loading**: `[ ◐ Preparing voice… ]` with animated indicator.
3. **Speaking**: `[ ◼ Stop ] Speaking…` with dynamic audio pulse indicator.
4. **Paused**: `[ ▶ Resume ]`
5. **Error / Offline**: `[ ⚠️ Voice offline (text only) ]` (subtle and non-intrusive).

#### Features
- **Client-Side Caching**: Uses a memory-bounded cache (max 20 entries) to prevent re-generating audio when the loan officer replays the same suggestion.
- **Browser Speech Synthesis Fallback**: When `ELEVENLABS_API_KEY` is not present, gracefully speaks using native `window.speechSynthesis` (marked with *(Browser)* badge).
- **Mutual Exclusion**: When one card starts playing, any previously playing audio is automatically stopped via `VoiceContext`.
- **Full Keyboard Accessibility**: Accessible `aria-label`, visible focus outlines, and keyboard activation (`Enter` / `Space`).

### `VoiceSettingsControl` (`components/voice/VoiceSettingsControl.tsx`)
A compact header widget providing loan officer controls:
- **Global Status Badge**: `Voice ready` (green) or `Voice: Offline fallback` (amber).
- **Enable/Disable Toggle**: Disables audio playback across all cards with a single switch.
- **Playback Speed Selector**: `0.75x`, `1.0x (Normal)`, `1.25x`.
- **Safe Voice Verification Button**: `[ Test Voice ]` speaks a fixed compliance sentence (*"Your next recommended step is to confirm the required documents."*), sending zero customer data.

---

## 6. Demo Walkthroughs

### Demo 1: Undocumented Cash Income (Scenario 4)
1. Sarah Miller states: *"I make about $8,000 a month, but most of it isn't documented because a lot of clients pay through private cash contracts."*
2. Darwix AI detects `INCOME_VERIFICATION` (High Priority).
3. The loan officer reviews the card and clicks `[Use Suggested Response]`.
4. The suggested response appears: *"Let's separate the income you've reported from the income we can verify with documentation."*
5. The officer clicks `[Play Response]`.
6. ElevenLabs synthesizes and streams the audio. The intervention card remains visible and actionable.

### Demo 2: Cross-Borrower Debt Conflict (Scenario 6)
1. John states: *"Our monthly debt is about $500."*
2. Sarah states: *"It's actually closer to $1,200."*
3. Darwix AI flags `CROSS_BORROWER_CONFLICT` (High Severity).
4. The loan officer clicks `[Ask Clarifying Question]`.
5. Suggested question: *"Can we confirm the total monthly debt obligations so I can record the correct figure?"*
6. The officer clicks `[Play Question]` to listen to the suggestion before speaking to the borrowers.
7. The Customer Context dossier preserves `Monthly debt: CONFLICTED` until official documents are reconciled.

---

## 7. Security & Compliance Verification

| Security Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **API Key Isolation** | Server environment variable `ELEVENLABS_API_KEY` used only in Node.js route. No `NEXT_PUBLIC_` prefix. | Verified |
| **Input Boundary** | Request body strictly bounded to 1,000 characters; oversized inputs rejected with 413. | Verified |
| **Zero Client Key Injection** | Client request parameters scanned for `apiKey`, `token`, `secret`; rejected with 400. | Verified |
| **Customer Privacy** | Private customer IDs, Social Security numbers, and credit scores are never sent to TTS. | Verified |
| **Metadata Sanitization** | Internal confidence numbers, risk scores, and citations stripped prior to synthesis. | Verified |
| **Compliance UX** | High/Critical warnings never auto-play. Agent must explicitly initiate playback. | Verified |
| **No Key in Repository** | Scanned codebase and git history for credentials; `.env.local` gitignored. | Verified |

---

## 8. Testing Strategy

Automated tests in `tests/voice-engine.test.ts` test all 10 core pipeline requirements with **100% mocked provider calls**:
- Zero live ElevenLabs credits consumed during `npm test`.
- Request validation, parameter blocking, length enforcement.
- Missing API key behavior and 503 fallback.
- Simulated provider errors (401 Unauthorized, 429 Quota Exceeded, 500 Outage, malformed stream).
- Text normalization (markdown stripping, UI header stripping, attribution removal).
- Intervention category filtering.
- Audio player state machine invariants.
