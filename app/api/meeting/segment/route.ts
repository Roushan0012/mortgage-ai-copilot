import { NextRequest, NextResponse } from "next/server";
import { meetingManager } from "@/lib/meeting/manager";
import { SpeakerRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, text, speakerRole, speakerName } = body;

    if (!meetingId || !text || !speakerRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: meetingId, text, speakerRole" },
        { status: 400 }
      );
    }

    const result = await meetingManager.addTranscriptSegment({
      meetingId,
      text,
      speakerRole: speakerRole as SpeakerRole,
      speakerName,
    });

    return NextResponse.json({
      success: true,
      segment: result.segment,
      meeting: result.meeting,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process transcript segment", details: String(error) },
      { status: 500 }
    );
  }
}
