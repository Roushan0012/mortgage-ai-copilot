import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";
import { DocumentStatus } from "@/types";

export async function GET() {
  const operationsData = repository.getOperationsOverview();
  const allDocuments = repository.getDocumentItems();
  const allActions = repository.getPostMeetingActions();
  const auditEvents = repository.getAuditEvents();

  return NextResponse.json({
    success: true,
    overview: operationsData,
    documents: allDocuments,
    actions: allActions,
    auditEvents: auditEvents.slice(0, 25),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionType, documentId, status, notes, actionId } = body;

    if (actionType === "update_document_status" && documentId && status) {
      const updated = repository.updateDocumentItem(documentId, status as DocumentStatus, notes);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
      }

      repository.addAuditEvent({
        eventType: "FIELD_MARKED_FOR_VERIFICATION",
        meetingId: "meet_001",
        actor: { userId: "ops_specialist_102", role: "Back Office Underwriter" },
        details: {
          actionTaken: `DOCUMENT_STATUS_${status}`,
          documentId,
          notes: notes || `Document status updated to ${status}`,
        },
      });

      return NextResponse.json({ success: true, document: updated });
    }

    if (actionType === "update_action_status" && actionId && status) {
      const updated = repository.updatePostMeetingActionStatus(actionId, status);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Action not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, action: updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation actionType" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Operations request failed", details: String(error) },
      { status: 500 }
    );
  }
}
