import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  VOICE_CONFIG,
  isVoiceConfigured,
  normalizeVoiceText,
  validateVoiceRequest,
} from "@/lib/voice/config";

/**
 * POST /api/voice/speak
 *
 * Secure server-side proxy for ElevenLabs Text-to-Speech audio streaming.
 * Strict boundaries:
 * - API Key is kept strictly on the server runtime.
 * - Text is sanitized and bounded to 1,000 characters.
 * - Audio is streamed back as audio/mpeg directly to the client.
 * - Returns graceful user-friendly error messages if provider is unreachable.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON format in request body." },
      { status: 400 }
    );
  }

  // 1. Strict Input Validation
  const validation = validateVoiceRequest(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.statusCode }
    );
  }

  // 2. Configuration Check (Server Secret Isolation)
  if (!isVoiceConfigured()) {
    return NextResponse.json(
      {
        error:
          "Voice assistance is temporarily unavailable. You can still use the text suggestion.",
        code: "VOICE_UNCONFIGURED",
      },
      { status: 503 }
    );
  }

  // 3. Text Normalization & Sanitization
  const normalizedText = normalizeVoiceText(validation.text);
  if (!normalizedText || normalizedText.length === 0) {
    return NextResponse.json(
      { error: "No speakable content found after text normalization." },
      { status: 400 }
    );
  }

  // 4. ElevenLabs TTS Call & Streaming
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY!;
    const client = new ElevenLabsClient({ apiKey });

    const audioStream = await client.textToSpeech.stream(
      VOICE_CONFIG.defaultVoiceId,
      {
        text: normalizedText,
        modelId: VOICE_CONFIG.defaultModelId,
        voiceSettings: VOICE_CONFIG.voiceSettings,
      }
    );

    return new Response(audioStream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Copilot-Voice-Status": "active",
      },
    });
  } catch (err: unknown) {
    const rawError = err instanceof Error ? err.message : String(err);
    // Redact any potential credential-looking strings in server logs
    const sanitizedLog = rawError.replace(/[a-zA-Z0-9_-]{20,}/g, "[REDACTED]");
    console.error(`[Voice API] Speech synthesis failed: ${sanitizedLog}`);

    let statusCode = 502;
    if (rawError.includes("401") || rawError.toLowerCase().includes("unauthorized")) {
      statusCode = 401;
    } else if (
      rawError.includes("429") ||
      rawError.toLowerCase().includes("rate limit") ||
      rawError.toLowerCase().includes("quota")
    ) {
      statusCode = 429;
    } else if (rawError.includes("422") || rawError.toLowerCase().includes("unprocessable")) {
      statusCode = 422;
    }

    return NextResponse.json(
      {
        error:
          "Voice assistance is temporarily unavailable. You can still use the text suggestion.",
        code: "VOICE_PROVIDER_ERROR",
      },
      { status: statusCode }
    );
  }
}
