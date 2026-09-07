import { NextResponse } from "next/server";
import { getSafeVoiceStatus } from "@/lib/voice/config";

/**
 * GET /api/voice/status
 * Returns safe voice availability metadata without exposing API secrets.
 */
export async function GET() {
  const status = getSafeVoiceStatus();
  return NextResponse.json(status, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
