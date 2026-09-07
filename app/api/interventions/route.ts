import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";
import { interventionCoordinator } from "@/lib/interventions/coordinator";
import { AgentActionPayloadSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meetingId") || undefined;
    const interventions = repository.getInterventions(meetingId);
    return NextResponse.json({ success: true, interventions });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch interventions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AgentActionPayloadSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { interventionId, actionType, rationale } = validated.data;
    const result = interventionCoordinator.handleAgentAction({
      interventionId,
      actionType,
      rationale,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Intervention not found or action failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, intervention: result.intervention });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
