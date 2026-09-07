import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";
import { integrationManager } from "@/lib/integrations";
import { LOSStage } from "@/types";

export async function GET() {
  const systems = integrationManager.getSystems();
  return NextResponse.json({
    success: true,
    systems,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      meetingId = "meet_001",
      destination,
      isApproved = false,
      officerId = "lo_avance_402",
      payload,
    } = body;

    const meeting = repository.getMeeting(meetingId);
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: `Meeting record not found for ID: ${meetingId}` },
        { status: 404 }
      );
    }

    const customer = repository.getCustomer(meeting.customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: `Customer record not found for ID: ${meeting.customerId}` },
        { status: 404 }
      );
    }

    // Toggle failure simulation for QA testing
    if (destination === "simulate_failure") {
      const { systemId, shouldFail } = body;
      integrationManager.setFailureSimulation(systemId, !!shouldFail);
      return NextResponse.json({
        success: true,
        message: `Failure simulation for "${systemId}" set to ${shouldFail}`,
      });
    }

    // Reset idempotency cache
    if (destination === "reset_idempotency") {
      integrationManager.resetIdempotency();
      return NextResponse.json({ success: true, message: "Idempotency cache cleared." });
    }

    // 1. Salesforce CRM Sync
    if (destination === "salesforce_crm") {
      if (!isApproved) {
        return NextResponse.json(
          {
            success: false,
            error: "Approval Gate Blocked: Salesforce CRM sync requires explicit agent approval before execution.",
            approvalRequired: true,
          },
          { status: 403 }
        );
      }

      const crmPayload = payload || {
        meetingId: meeting.id,
        customerId: customer.id,
        leadStage: "Qualified / Needs Documentation",
        outcome: "Qualified / Needs Documentation",
        nextAction: "Collect income and liability documents",
        notes: `Consultation concluded. Identified BMW lease obligation ($590/mo), W-2 and Schedule C income. Rate discussion on 30Y conventional fixed.`,
        tasks: [
          {
            title: "Request Sarah Miller 2024 & 2025 Schedule C Tax Returns",
            priority: "High" as const,
            dueDate: "Tomorrow",
            reason: "Verify stated $38k net self-employment earnings under Dodd-Frank QM.",
          },
          {
            title: "Collect Official Written Loan Estimate from Rocket Mortgage",
            priority: "Normal" as const,
            dueDate: "In 2 days",
            reason: "Substantiate price match request on 6.125% quote.",
          },
        ],
      };

      const result = await integrationManager.syncCRM({
        meeting,
        customer,
        payload: crmPayload,
        isApproved,
        officerId,
      });

      // Update action in repository
      repository.updatePostMeetingActionStatus("act_03", "completed", result.crmLeadId);

      return NextResponse.json({
        success: result.state === "SUCCESS",
        state: result.state,
        result,
        message: result.isIdempotentReplay ? "Already synced (idempotent replay)" : "CRM sync successful",
      });
    }

    // 2. ICE Encompass LOS Update
    if (destination === "encompass_los") {
      if (!isApproved) {
        return NextResponse.json(
          {
            success: false,
            error: "Approval Gate Blocked: ICE Encompass LOS update requires explicit agent review and approval.",
            approvalRequired: true,
          },
          { status: 403 }
        );
      }

      const losPayload = {
        meetingId: meeting.id,
        customerId: customer.id,
        targetStage: (payload?.targetStage || "Documentation Pending") as LOSStage,
        officerAttestation: payload?.officerAttestation ?? true,
        officerNMLS: payload?.officerNMLS || "1489201",
      };

      const result = await integrationManager.syncLOS({
        meeting,
        customer,
        payload: losPayload,
        isApproved,
        officerId,
      });

      // Update action in repository
      repository.updatePostMeetingActionStatus("act_02", "completed", result.loanIdentifier);

      return NextResponse.json({
        success: result.state === "SUCCESS",
        state: result.state,
        result,
        message: result.isIdempotentReplay ? "Already synced (idempotent replay)" : "LOS update successful",
      });
    }

    // 3. Document Request Workflow
    if (destination === "document_system") {
      if (!isApproved) {
        return NextResponse.json(
          {
            success: false,
            error: "Approval Gate Blocked: Document request dispatch requires loan officer sign-off.",
            approvalRequired: true,
          },
          { status: 403 }
        );
      }

      const docsToRequest = payload?.documents || repository.getDocumentItems().filter(
        (d) => d.status === "NOT_REQUESTED" || d.status === "REQUESTED"
      );

      const result = await integrationManager.requestDocuments({
        customer,
        applicationId: customer.losApplicationId || "ENC-1003-99412",
        meetingId: meeting.id,
        documents: docsToRequest,
        isApproved,
        officerId,
      });

      // Update action in repository
      repository.updatePostMeetingActionStatus("act_01", "completed", result.requestId);

      return NextResponse.json({
        success: result.state === "SUCCESS",
        state: result.state,
        result,
        message: result.isIdempotentReplay ? "Already dispatched (idempotent replay)" : "Document request queued",
      });
    }

    // 4. Customer Outbound Communication
    if (destination === "communication_gateway") {
      if (!isApproved) {
        return NextResponse.json(
          {
            success: false,
            error: "Approval Gate Blocked: External communication cannot be transmitted without loan officer approval.",
            approvalRequired: true,
          },
          { status: 403 }
        );
      }

      const draft = payload?.draft;
      if (!draft) {
        return NextResponse.json(
          { success: false, error: "Missing communication draft payload" },
          { status: 400 }
        );
      }

      const result = await integrationManager.sendCommunication({
        draft,
        meetingId: meeting.id,
        isApproved,
        officerId,
      });

      // Update action in repository
      repository.updatePostMeetingActionStatus("act_05", "completed", result.messageId);

      return NextResponse.json({
        success: result.state === "SUCCESS",
        state: result.state,
        result,
        message: "Customer communication delivered via SendGrid relay",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unsupported destination "${destination}". Supported: salesforce_crm, encompass_los, document_system, communication_gateway, simulate_failure, reset_idempotency.`,
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Integration operation failed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
