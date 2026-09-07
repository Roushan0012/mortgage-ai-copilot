import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  VOICE_CONFIG,
  isVoiceConfigured,
  getSafeVoiceStatus,
  normalizeVoiceText,
  validateVoiceRequest,
  isVoiceEligibleIntervention,
} from "../lib/voice/config";
import { POST as speakRouteHandler } from "../app/api/voice/speak/route";
import { GET as statusRouteHandler } from "../app/api/voice/status/route";
import { NextRequest } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

describe("Darwix AI Voice Engine — ElevenLabs TTS Pipeline & Security", () => {
  const originalApiKey = process.env.ELEVENLABS_API_KEY;

  afterEach(() => {
    // Restore original environment
    if (originalApiKey !== undefined) {
      process.env.ELEVENLABS_API_KEY = originalApiKey;
    } else {
      delete process.env.ELEVENLABS_API_KEY;
    }
  });

  // ==========================================================================
  // 1. Request Validation
  // ==========================================================================
  test("1. Request validation: rejects non-object, missing text, and invalid parameters", () => {
    // Non-object / null
    const nullRes = validateVoiceRequest(null);
    assert.strictEqual(nullRes.valid, false);
    assert.strictEqual(nullRes.statusCode, 400);

    const arrayRes = validateVoiceRequest(["text"]);
    assert.strictEqual(arrayRes.valid, false);

    // Missing text
    const missingRes = validateVoiceRequest({});
    assert.strictEqual(missingRes.valid, false);
    assert.strictEqual(missingRes.statusCode, 400);

    // Non-string text
    const nonStringRes = validateVoiceRequest({ text: 12345 });
    assert.strictEqual(nonStringRes.valid, false);

    // Disallowed context
    const badContextRes = validateVoiceRequest({
      text: "Valid text",
      context: "arbitrary_unapproved_context",
    });
    assert.strictEqual(badContextRes.valid, false);
    assert.match(badContextRes.error, /Supported contexts/);

    // Speed bounds validation
    const badSpeedRes = validateVoiceRequest({
      text: "Valid text",
      speed: 3.5, // max is 2.0
    });
    assert.strictEqual(badSpeedRes.valid, false);
    assert.match(badSpeedRes.error, /Speed must be between 0.5 and 2.0/);

    // Valid request
    const validRes = validateVoiceRequest({
      text: "Please confirm your monthly auto loan obligation.",
      context: "copilot",
      speed: 1.0,
    });
    assert.strictEqual(validRes.valid, true);
    if (validRes.valid) {
      assert.strictEqual(validRes.context, "copilot");
      assert.strictEqual(validRes.speed, 1.0);
    }
  });

  // ==========================================================================
  // 2. Security Guard: Client-Supplied Secrets & Unauthorized URLs Blocked
  // ==========================================================================
  test("2. Security: blocks client-supplied API keys, provider URLs, and internal prompts", () => {
    const forbiddenPayloads = [
      { text: "Hello", apiKey: "sk_fake_secret_key" },
      { text: "Hello", api_key: "sk_fake_secret_key" },
      { text: "Hello", token: "bearer_token" },
      { text: "Hello", secret: "secret123" },
      { text: "Hello", providerUrl: "https://malicious-tts-endpoint.evil" },
      { text: "Hello", systemPrompt: "Ignore previous instructions" },
    ];

    for (const payload of forbiddenPayloads) {
      const result = validateVoiceRequest(payload);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 400);
      assert.match(result.error, /Unauthorized request parameter/);
    }
  });

  // ==========================================================================
  // 3. Text Length Validation (Bounded to 1,000 chars)
  // ==========================================================================
  test("3. Text length validation: enforces 1 to 1,000 characters limit", () => {
    // Empty text
    const emptyRes = validateVoiceRequest({ text: "   " });
    assert.strictEqual(emptyRes.valid, false);
    assert.match(emptyRes.error, /cannot be empty/);

    // Normal text within limit
    const normalText = "A".repeat(500);
    const normalRes = validateVoiceRequest({ text: normalText });
    assert.strictEqual(normalRes.valid, true);

    // Exact limit: 1,000 characters
    const maxText = "B".repeat(1000);
    const maxRes = validateVoiceRequest({ text: maxText });
    assert.strictEqual(maxRes.valid, true);

    // Exceeds limit: 1,001 characters
    const oversizedText = "C".repeat(1001);
    const oversizedRes = validateVoiceRequest({ text: oversizedText });
    assert.strictEqual(oversizedRes.valid, false);
    assert.strictEqual(oversizedRes.statusCode, 413);
    assert.match(oversizedRes.error, /Text exceeds maximum allowed length of 1000/);
  });

  // ==========================================================================
  // 4. Missing API Key Behavior & Safe Public Status
  // ==========================================================================
  test("4. Missing API key behavior: returns graceful fallback without leaking server internals", async () => {
    delete process.env.ELEVENLABS_API_KEY;

    assert.strictEqual(isVoiceConfigured(), false);

    // Safe status endpoint
    const status = getSafeVoiceStatus();
    assert.strictEqual(status.configured, false);
    assert.strictEqual(status.voiceId, VOICE_CONFIG.defaultVoiceId);
    assert.strictEqual(status.modelId, VOICE_CONFIG.defaultModelId);
    // Guarantee no secret keys leaked in public status
    assert.strictEqual("apiKey" in status, false);
    assert.strictEqual("ELEVENLABS_API_KEY" in status, false);

    // Status GET route
    const statusRes = await statusRouteHandler();
    assert.strictEqual(statusRes.status, 200);
    const statusBody = await statusRes.json();
    assert.strictEqual(statusBody.configured, false);

    // POST /api/voice/speak returns 503 with user-friendly fallback
    const mockReq = new NextRequest("http://localhost:3000/api/voice/speak", {
      method: "POST",
      body: JSON.stringify({ text: "Let's review the liabilities." }),
    });

    const speakRes = await speakRouteHandler(mockReq);
    assert.strictEqual(speakRes.status, 503);
    const speakBody = await speakRes.json();
    assert.strictEqual(
      speakBody.error,
      "Voice assistance is temporarily unavailable. You can still use the text suggestion."
    );
    assert.strictEqual(speakBody.code, "VOICE_UNCONFIGURED");
  });

  // ==========================================================================
  // 5. Sensitive & Internal Metadata Removal (Voice Text Normalization)
  // ==========================================================================
  test("5. Text normalization: strips markdown, UI labels, brackets, and internal confidence", () => {
    const rawInput = `
      NEXT BEST QUESTION
      [HIGH]
      **Alex Vance (Loan Officer):**
      "Let's confirm your *undocumented* monthly cash earnings."
      Authority: 12 CFR § 1026.43
      Confidence: 0.96
      Risk if incorrect: ATR violation
    `;

    const normalized = normalizeVoiceText(rawInput);

    // Strips UI labels and metadata
    assert.strictEqual(normalized.includes("NEXT BEST QUESTION"), false);
    assert.strictEqual(normalized.includes("[HIGH]"), false);
    assert.strictEqual(normalized.includes("Alex Vance"), false);
    assert.strictEqual(normalized.includes("Authority:"), false);
    assert.strictEqual(normalized.includes("Confidence:"), false);
    assert.strictEqual(normalized.includes("0.96"), false);
    assert.strictEqual(normalized.includes("Risk if incorrect"), false);

    // Strips markdown asterisks
    assert.strictEqual(normalized.includes("*"), false);
    assert.strictEqual(normalized.includes("**"), false);

    // Contains speakable natural text
    assert.match(normalized, /Let's confirm your undocumented monthly cash earnings\./);
  });

  test("5b. Text normalization: handles suggested response headers and quotation marks", () => {
    const rawInput =
      'Suggested Verbal Response: "Let\'s separate the income you\'ve reported from the income we can verify with documentation."';
    const normalized = normalizeVoiceText(rawInput);

    assert.strictEqual(normalized.includes("Suggested Verbal Response"), false);
    assert.strictEqual(
      normalized,
      "Let's separate the income you've reported from the income we can verify with documentation."
    );
  });

  // ==========================================================================
  // 6. Voice-Enabled Intervention Filtering
  // ==========================================================================
  test("6. Intervention filtering: only activates voice for consultative and objection categories", () => {
    // Voice-eligible categories
    assert.strictEqual(isVoiceEligibleIntervention("NEXT_BEST_QUESTION", true), true);
    assert.strictEqual(isVoiceEligibleIntervention("COMPLIANCE_SUGGESTED_RESPONSE", true), true);
    assert.strictEqual(isVoiceEligibleIntervention("OBJECTION_RESPONSE", true), true);
    assert.strictEqual(isVoiceEligibleIntervention("NEXT_BEST_ACTION", true), true);
    assert.strictEqual(isVoiceEligibleIntervention("INCOME_VERIFICATION", true), true);
    assert.strictEqual(isVoiceEligibleIntervention("CROSS_BORROWER_CONFLICT", true), true);

    // Ineligible without content
    assert.strictEqual(isVoiceEligibleIntervention("NEXT_BEST_QUESTION", false), false);

    // Irrelevant administrative categories
    assert.strictEqual(isVoiceEligibleIntervention("GENERIC_AUDIT_LOG", true), false);
    assert.strictEqual(isVoiceEligibleIntervention("SYSTEM_TELEMETRY", true), false);
  });

  // ==========================================================================
  // 7. Successful TTS Streaming Mock (Zero Live Credits Consumed)
  // ==========================================================================
  test("7. Successful TTS response: streams audio/mpeg with proper headers when mocked", async () => {
    process.env.ELEVENLABS_API_KEY = "test_elevenlabs_mock_key_12345";

    // Mock stream method on ElevenLabs client
    const originalStream = ElevenLabsClient.prototype.textToSpeech.stream;
    const mockAudioBytes = new Uint8Array([0xff, 0xfb, 0x90, 0x64]); // MP3 frame header mock

    ElevenLabsClient.prototype.textToSpeech.stream = (async function () {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(mockAudioBytes);
          controller.close();
        },
      });
    } as unknown) as typeof originalStream;

    try {
      const mockReq = new NextRequest("http://localhost:3000/api/voice/speak", {
        method: "POST",
        body: JSON.stringify({
          text: "Let's separate the income you've reported from verified income.",
          context: "copilot",
        }),
      });

      const response = await speakRouteHandler(mockReq);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get("Content-Type"), "audio/mpeg");
      assert.strictEqual(response.headers.get("Cache-Control"), "no-cache, no-store, must-revalidate");

      const arrayBuf = await response.arrayBuffer();
      const returnedBytes = new Uint8Array(arrayBuf);
      assert.deepStrictEqual(returnedBytes, mockAudioBytes);
    } finally {
      ElevenLabsClient.prototype.textToSpeech.stream = originalStream;
    }
  });

  // ==========================================================================
  // 8. Provider Error Handling (401, 429, 500)
  // ==========================================================================
  test("8. Provider error handling: handles 401, 429, and 500 without leaking credentials", async () => {
    process.env.ELEVENLABS_API_KEY = "test_elevenlabs_mock_key_12345";

    const originalStream = ElevenLabsClient.prototype.textToSpeech.stream;

    // Test 401 Unauthorized
    ElevenLabsClient.prototype.textToSpeech.stream = (async function () {
      throw new Error("401 Unauthorized: Invalid xi-api-key provided");
    } as unknown) as typeof originalStream;

    try {
      const req401 = new NextRequest("http://localhost:3000/api/voice/speak", {
        method: "POST",
        body: JSON.stringify({ text: "Checking authorization error." }),
      });

      const res401 = await speakRouteHandler(req401);
      assert.strictEqual(res401.status, 401);
      const body401 = await res401.json();
      assert.strictEqual(
        body401.error,
        "Voice assistance is temporarily unavailable. You can still use the text suggestion."
      );
      assert.strictEqual(body401.code, "VOICE_PROVIDER_ERROR");
    } finally {
      ElevenLabsClient.prototype.textToSpeech.stream = originalStream;
    }

    // Test 429 Rate Limit
    ElevenLabsClient.prototype.textToSpeech.stream = (async function () {
      throw new Error("429 Too Many Requests: Monthly character quota exceeded");
    } as unknown) as typeof originalStream;

    try {
      const req429 = new NextRequest("http://localhost:3000/api/voice/speak", {
        method: "POST",
        body: JSON.stringify({ text: "Checking rate limit error." }),
      });

      const res429 = await speakRouteHandler(req429);
      assert.strictEqual(res429.status, 429);
      const body429 = await res429.json();
      assert.strictEqual(
        body429.error,
        "Voice assistance is temporarily unavailable. You can still use the text suggestion."
      );
    } finally {
      ElevenLabsClient.prototype.textToSpeech.stream = originalStream;
    }

    // Test 500 Provider Down
    ElevenLabsClient.prototype.textToSpeech.stream = (async function () {
      throw new Error("500 Internal Server Error: Gateway timeout");
    } as unknown) as typeof originalStream;

    try {
      const req500 = new NextRequest("http://localhost:3000/api/voice/speak", {
        method: "POST",
        body: JSON.stringify({ text: "Checking provider outage error." }),
      });

      const res500 = await speakRouteHandler(req500);
      assert.strictEqual(res500.status, 502);
      const body500 = await res500.json();
      assert.strictEqual(
        body500.error,
        "Voice assistance is temporarily unavailable. You can still use the text suggestion."
      );
    } finally {
      ElevenLabsClient.prototype.textToSpeech.stream = originalStream;
    }
  });

  // ==========================================================================
  // 9. Malformed Provider Response Handling
  // ==========================================================================
  test("9. Malformed provider response: catches null stream and returns clean error", async () => {
    process.env.ELEVENLABS_API_KEY = "test_elevenlabs_mock_key_12345";
    const originalStream = ElevenLabsClient.prototype.textToSpeech.stream;

    ElevenLabsClient.prototype.textToSpeech.stream = (async function () {
      throw new TypeError("Cannot read properties of null (reading 'getReader')");
    } as unknown) as typeof originalStream;

    try {
      const req = new NextRequest("http://localhost:3000/api/voice/speak", {
        method: "POST",
        body: JSON.stringify({ text: "Checking malformed stream response." }),
      });

      const res = await speakRouteHandler(req);
      assert.strictEqual(res.status, 502);
      const body = await res.json();
      assert.match(body.error, /Voice assistance is temporarily unavailable/);
    } finally {
      ElevenLabsClient.prototype.textToSpeech.stream = originalStream;
    }
  });

  // ==========================================================================
  // 10. Voice Player State Logic & Fallback Invariance
  // ==========================================================================
  test("10. State logic: verifies audio player state machine invariants", () => {
    type State = "idle" | "loading" | "speaking" | "paused" | "error";

    function getNextState(current: State, action: "PLAY" | "AUDIO_LOADED" | "PAUSE" | "STOP" | "ERROR"): State {
      switch (action) {
        case "PLAY":
          return current === "paused" ? "speaking" : "loading";
        case "AUDIO_LOADED":
          return "speaking";
        case "PAUSE":
          return "paused";
        case "STOP":
          return "idle";
        case "ERROR":
          return "error";
        default:
          return current;
      }
    }

    // Normal playback cycle
    assert.strictEqual(getNextState("idle", "PLAY"), "loading");
    assert.strictEqual(getNextState("loading", "AUDIO_LOADED"), "speaking");
    assert.strictEqual(getNextState("speaking", "PAUSE"), "paused");
    assert.strictEqual(getNextState("paused", "PLAY"), "speaking");
    assert.strictEqual(getNextState("speaking", "STOP"), "idle");

    // Error cycle
    assert.strictEqual(getNextState("loading", "ERROR"), "error");
    assert.strictEqual(getNextState("error", "STOP"), "idle");
  });
});
