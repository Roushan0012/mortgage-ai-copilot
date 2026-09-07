import Groq from "groq-sdk";

/**
 * Server-side Groq Client Singleton.
 * Never exposed to browser / client runtime.
 */
let groqClientInstance: Groq | null = null;

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!groqClientInstance) {
    groqClientInstance = new Groq({
      apiKey: apiKey,
    });
  }

  return groqClientInstance;
}

export const GROQ_MODELS = {
  VERSATILE: "llama-3.3-70b-versatile",
  INSTANT: "llama-3.1-8b-instant",
} as const;
