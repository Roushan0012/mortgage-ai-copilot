import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";
import { integrationsHub } from "@/lib/integrations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, destination } = body;

    const meeting = repository.getMeeting(meetingId);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    const customer = repository.getCustomer(meeting.customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    if (destination === "encompass_los") {
      const result = await integrationsHub.syncToEncompassLOS(meeting, customer);
      repository.addAuditEvent({
        eventType: "crm_los_synced",
        meetingId,
        actor: { userId: "lo_avance_402", role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_ENCOMPASS_LOS",
          notes: result.event.payloadSummary,
        },
      });
      return NextResponse.json({ success: true, result });
    }

    if (destination === "salesforce_crm") {
      const result = await integrationsHub.syncToSalesforceCRM(meeting, customer);
      repository.addAuditEvent({
        eventType: "crm_los_synced",
        meetingId,
        actor: { userId: "lo_avance_402", role: "Loan Officer" },
        details: {
          actionTaken: "SYNC_SALESFORCE_CRM",
          notes: result.event.payloadSummary,
        },
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json(
      { success: false, error: "Invalid destination. Supported: encompass_los, salesforce_crm" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Integration sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
