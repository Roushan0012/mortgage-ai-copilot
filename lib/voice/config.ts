/**
 * Centralized Voice Configuration & Safe Text Layer for Darwix AI Copilot
 *
 * Security Principles:
 * 1. ZERO client exposure: ELEVENLABS_API_KEY is accessed exclusively on the server.
 * 2. Strict input boundary: Maximum 1,000 characters per TTS request.
 * 3. Content sanitization: Markdown, UI tags, confidence scores, and internal metadata are stripped.
 * 4. Opt-in assistance: Voice is an enhancement; text is never blocked.
 */

export interface VoiceSettingsConfig {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoiceConfig {
  defaultVoiceId: string;
  defaultModelId: string;
  outputFormat: string;
  maxTextLength: number;
  allowedContexts: readonly string[];
  voiceSettings: VoiceSettingsConfig;
}

export const VOICE_CONFIG: VoiceConfig = {
  // Rachel voice — clear, neutral, professional mortgage advisory tone
  defaultVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  // Eleven Turbo v2.5 — optimized for low-latency copilot suggestions
  defaultModelId: process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5",
  outputFormat: "mp3_44100_128",
  maxTextLength: 1000,
  allowedContexts: ["copilot", "suggestion", "response", "question", "test"] as const,
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  },
};

/**
 * Check if the server has an ElevenLabs API key configured.
 * Never returns the key itself.
 */
export function isVoiceConfigured(): boolean {
  const key = process.env.ELEVENLABS_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Safe public voice metadata for client status checks.
 * Does NOT expose API credentials.
 */
export function getSafeVoiceStatus() {
  return {
    configured: isVoiceConfigured(),
    voiceId: VOICE_CONFIG.defaultVoiceId,
    modelId: VOICE_CONFIG.defaultModelId,
    outputFormat: VOICE_CONFIG.outputFormat,
    maxCharacters: VOICE_CONFIG.maxTextLength,
  };
}

/**
 * Normalizes text prior to sending to ElevenLabs TTS.
 * Strips markdown, UI labels, brackets, internal scores, and extraneous tags
 * so speech sounds natural, conversational, and professional.
 */
export function normalizeVoiceText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  let text = rawText.trim();

  // 1. Strip internal audit & metadata blocks (e.g. "Authority: ...", "Confidence: ...", "Risk: ...")
  text = text.replace(/authority:\s*[^.\n]+/gi, "");
  text = text.replace(/confidence(\s*level)?:\s*[^.\n]+/gi, "");
  text = text.replace(/risk\s*(if\s*incorrect)?:\s*[^.\n]+/gi, "");
  text = text.replace(/trigger:\s*[^.\n]+/gi, "");
  text = text.replace(/rule\s*citation:\s*[^.\n]+/gi, "");
  text = text.replace(/source:\s*(rule|ai|hybrid)[^.\n]*/gi, "");

  // 2. Strip UI headers and categorical action banners
  text = text.replace(/suggested\s*verbal\s*response:\s*/gi, "");
  text = text.replace(/suggested\s*spoken\s*question:\s*/gi, "");
  text = text.replace(/suggested\s*response:\s*/gi, "");
  text = text.replace(/suggested\s*question:\s*/gi, "");
  text = text.replace(/next\s*best\s*question:?\s*/gi, "");
  text = text.replace(/compliance\s*(suggested\s*)?response:?\s*/gi, "");
  text = text.replace(/objection\s*response:?\s*/gi, "");
  text = text.replace(/why\s*this\s*appeared:?\s*/gi, "");

  // 3. Strip bracketed UI badges like [HIGH], [CRITICAL], [MEDIUM], [LOW], [AUDIT]
  text = text.replace(/\[\s*(critical|high|medium|low|info|audit|verified|conflicted)\s*\]/gi, "");

  // 4. Strip Markdown formatting (bold, italics, headers, code, blockquotes, bullets)
  text = text.replace(/\*\*(.*?)\*\*/g, "$1"); // bold **text**
  text = text.replace(/\*(.*?)\*/g, "$1"); // italic *text*
  text = text.replace(/__(.*?)__/g, "$1"); // bold __text__
  text = text.replace(/_(.*?)_/g, "$1"); // italic _text_
  text = text.replace(/`{1,3}[^`]*`{1,3}/g, ""); // inline or block code
  text = text.replace(/^#+\s+/gm, ""); // headings
  text = text.replace(/^>\s+/gm, ""); // blockquotes
  text = text.replace(/^[-*+]\s+/gm, ""); // unordered lists
  text = text.replace(/^\d+\.\s+/gm, ""); // ordered lists

  // 5. Strip speaker attribution labels like "Alex Vance (Loan Officer):", "Sarah Miller:"
  text = text.replace(/^[\w\s\(\)]+:\s*/gm, "");

  // 6. Strip enclosing quotes if the whole message was in quotes
  text = text.replace(/^["'“](.*)["'”]$/, "$1");

  // 7. Normalize whitespace, newlines, and hyphens
  text = text.replace(/\s+/g, " ").trim();

  // 8. Ensure concise output: bound to max text length
  if (text.length > VOICE_CONFIG.maxTextLength) {
    text = text.slice(0, VOICE_CONFIG.maxTextLength).trim();
    // End on last complete sentence or word
    const lastSentence = text.lastIndexOf(".");
    if (lastSentence > 100) {
      text = text.slice(0, lastSentence + 1);
    }
  }

  // 9. Guarantee final natural punctuation
  if (text.length > 0 && !/[.!?]$/.test(text)) {
    text += ".";
  }

  return text;
}

export interface VoiceValidationSuccess {
  valid: true;
  text: string;
  context: string;
  speed?: number;
}

export interface VoiceValidationFailure {
  valid: false;
  error: string;
  statusCode: number;
}

export type VoiceValidationResult = VoiceValidationSuccess | VoiceValidationFailure;

/**
 * Validates incoming client requests to POST /api/voice/speak.
 * Enforces boundaries: max 1000 characters, allowed context, and blocks client-supplied secrets.
 */
export function validateVoiceRequest(body: unknown): VoiceValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      valid: false,
      error: "Invalid request payload. Expected a JSON object.",
      statusCode: 400,
    };
  }

  const payload = body as Record<string, unknown>;

  // Security guard: prevent client from sending keys, internal URLs, or provider configurations
  const forbiddenKeys = [
    "apiKey",
    "api_key",
    "token",
    "secret",
    "providerUrl",
    "provider_url",
    "modelConfig",
    "systemPrompt",
    "system_prompt",
  ];

  for (const key of forbiddenKeys) {
    if (key in payload) {
      return {
        valid: false,
        error: `Unauthorized request parameter: '${key}'. Client-supplied credentials and URLs are prohibited.`,
        statusCode: 400,
      };
    }
  }

  // Text validation
  if (!("text" in payload) || typeof payload.text !== "string") {
    return {
      valid: false,
      error: "Missing required 'text' string parameter.",
      statusCode: 400,
    };
  }

  const trimmedText = payload.text.trim();
  if (trimmedText.length === 0) {
    return {
      valid: false,
      error: "Text content cannot be empty.",
      statusCode: 400,
    };
  }

  if (trimmedText.length > VOICE_CONFIG.maxTextLength) {
    return {
      valid: false,
      error: `Text exceeds maximum allowed length of ${VOICE_CONFIG.maxTextLength} characters (received ${trimmedText.length}).`,
      statusCode: 413,
    };
  }

  // Context validation
  let context = "copilot";
  if ("context" in payload && payload.context !== undefined) {
    if (typeof payload.context !== "string") {
      return {
        valid: false,
        error: "Context parameter must be a string.",
        statusCode: 400,
      };
    }
    const safeContext = payload.context.toLowerCase().trim();
    if (!VOICE_CONFIG.allowedContexts.includes(safeContext)) {
      return {
        valid: false,
        error: `Context '${payload.context}' is not allowed. Supported contexts: ${VOICE_CONFIG.allowedContexts.join(", ")}.`,
        statusCode: 400,
      };
    }
    context = safeContext;
  }

  // Optional playback speed validation (0.5x to 2.0x)
  let speed: number | undefined = undefined;
  if ("speed" in payload && payload.speed !== undefined) {
    if (typeof payload.speed !== "number" || isNaN(payload.speed)) {
      return {
        valid: false,
        error: "Speed must be a valid number.",
        statusCode: 400,
      };
    }
    if (payload.speed < 0.5 || payload.speed > 2.0) {
      return {
        valid: false,
        error: "Speed must be between 0.5 and 2.0.",
        statusCode: 400,
      };
    }
    speed = payload.speed;
  }

  return {
    valid: true,
    text: trimmedText,
    context,
    speed,
  };
}

/**
 * Determines whether an intervention category is appropriate for voice playback.
 * High-value consultative and objection-handling categories are voice-enabled.
 */
export function isVoiceEligibleIntervention(
  category: string,
  hasSuggestedContent: boolean
): boolean {
  if (!hasSuggestedContent) return false;

  const normalizedCategory = category.toUpperCase().trim();
  const eligibleCategories = [
    "NEXT_BEST_QUESTION",
    "COMPLIANCE_SUGGESTED_RESPONSE",
    "OBJECTION_RESPONSE",
    "NEXT_BEST_ACTION",
    "INCOME_VERIFICATION",
    "CROSS_BORROWER_CONFLICT",
    "DISCLOSURE_CLARIFICATION",
  ];

  return eligibleCategories.some(
    (c) => normalizedCategory === c || normalizedCategory.includes(c)
  );
}
