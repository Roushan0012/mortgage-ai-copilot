import {
  Customer,
  Meeting,
  IntegrationEvent,
} from "@/types";
import {
  ICommunicationAdapter,
  CustomerMessageDraft,
  CommunicationDispatchResult,
  IntegrationSystemInfo,
} from "./communication-adapter";

/**
 * Mock Enterprise Communication Gateway Adapter
 * Drafts compliant customer notifications, enforces strict approval gates,
 * and tracks omnichannel communication delivery.
 */
export class MockCommunicationAdapter implements ICommunicationAdapter {
  public systemInfo: IntegrationSystemInfo = {
    id: "communication_gateway",
    name: "Enterprise Communications Hub (Twilio / SendGrid)",
    vendor: "Twilio SendGrid & SMS Gateway",
    category: "communications",
    status: "MOCKED",
    description: "Omnichannel borrower communications gateway with TCPA consent checks and mandatory loan officer approval gates.",
    lastSyncTime: new Date().toISOString(),
    apiVersion: "v3.1 (Transactional Email/SMS API)",
    endpoint: "https://api.sendgrid.com/v3/mail/send",
    isSimulated: true,
    requiresApproval: true,
  };

  private draftsStore = new Map<string, CustomerMessageDraft>();
  private failureSimulated = false;

  public setFailureSimulation(fail: boolean) {
    this.failureSimulated = fail;
  }

  public draftFollowUpEmail(customer: Customer, meeting: Meeting): CustomerMessageDraft {
    const primary = customer.primaryBorrower;
    const coBorrower = customer.coBorrower;
    const messageId = `COMM-MSG-${Math.floor(90000 + Math.random() * 9999)}`;

    const draft: CustomerMessageDraft = {
      messageId,
      recipientName: `${primary.firstName} ${coBorrower ? `& ${coBorrower.firstName} ` : ""}${primary.lastName}`,
      recipientEmail: primary.email,
      recipientPhone: primary.phone,
      channel: "email",
      subject: `Summary of our Mortgage Consultation — Next Steps for Your Home Purchase`,
      body: `Dear ${primary.firstName} and ${coBorrower ? coBorrower.firstName : "family"},

Thank you for meeting with me today regarding your home financing goals in South Austin.

Here is a summary of what we discussed:
• Target Purchase Price: $585,000 with ~14.5% down payment ($85,000)
• Financing Goal: 30-Year Conventional Fixed loan
• Estimated Closing Timeline: 2 to 4 weeks

Next Steps to Finalize Your Pre-Approval:
1. Please upload Sarah's 2024 & 2025 Schedule C federal tax returns to our secure portal.
2. Provide a copy of the official written Loan Estimate from Rocket Mortgage so we can evaluate their pricing and structure the best comparison.
3. Review and sign the conditional pre-qualification disclosures in your borrower portal.

Please let me know if you have any questions!

Warm regards,
${meeting.assignedLoanOfficerName}
Darwix Mortgage Copilot`,
      templateId: "tpl_consultation_followup_v2",
      approvalRequired: true, // Hard security constraint
      status: "READY_FOR_APPROVAL",
      disclaimer: "This communication does not constitute a formal loan commitment or guarantee of interest rate under 12 CFR § 1026.19.",
    };

    this.draftsStore.set(messageId, draft);
    return draft;
  }

  public draftDocumentRequestNotification(
    customer: Customer,
    documentCount: number,
    portalUrl: string
  ): CustomerMessageDraft {
    const primary = customer.primaryBorrower;
    const messageId = `COMM-MSG-${Math.floor(90000 + Math.random() * 9999)}`;

    const draft: CustomerMessageDraft = {
      messageId,
      recipientName: `${primary.firstName} ${primary.lastName}`,
      recipientEmail: primary.email,
      recipientPhone: primary.phone,
      channel: "email",
      subject: `Action Requested: Documents to verify for your mortgage application`,
      body: `Hi ${primary.firstName},

To proceed with your mortgage pre-qualification review, we have prepared a checklist of ${documentCount} potential verification documents.

You can securely review and upload these items directly using your private portal link below:
${portalUrl}

If you need any assistance gathering these records, don't hesitate to reach out.

Best,
Alex Vance, NMLS #1489201`,
      templateId: "tpl_doc_request_v1",
      approvalRequired: true,
      status: "READY_FOR_APPROVAL",
      disclaimer: "Uploaded documents are stored in an encrypted Gramm-Leach-Bliley Act (GLBA) compliant vault.",
    };

    this.draftsStore.set(messageId, draft);
    return draft;
  }

  public async dispatchApprovedCommunication(
    draft: CustomerMessageDraft,
    approvedBy: string
  ): Promise<CommunicationDispatchResult> {
    if (draft.approvalRequired && draft.status !== "APPROVED" && !approvedBy) {
      throw new Error("Cannot dispatch communication without explicit loan officer approval.");
    }

    if (this.failureSimulated) {
      return {
        state: "FAILED",
        messageId: draft.messageId,
        errorMessage: "SendGrid SMTP Gateway 421: Rate limit exceeded on transactional relay. Retryable.",
        event: {
          id: `evt_comm_${Date.now()}`,
          integration: "communication_gateway",
          eventType: "dispatch_communication",
          status: "failed",
          payloadSummary: `Failed to deliver email "${draft.subject}" to ${draft.recipientEmail}.`,
          responseMessage: "421 Too Many Requests — Marked as RETRYABLE.",
          timestamp: new Date().toISOString(),
        },
      };
    }

    draft.status = "SENT";
    this.systemInfo.lastSyncTime = new Date().toISOString();

    const event: IntegrationEvent = {
      id: `evt_comm_${Date.now()}`,
      integration: "communication_gateway",
      eventType: "dispatch_communication",
      status: "succeeded",
      payloadSummary: `Dispatched approved email notification (${draft.messageId}) to ${draft.recipientEmail} following loan officer sign-off (${approvedBy}).`,
      rawPayload: {
        messageId: draft.messageId,
        recipientEmail: draft.recipientEmail,
        subject: draft.subject,
        approvedBy,
        channel: draft.channel,
      },
      responseMessage: "202 Accepted — SendGrid relay accepted message for immediate delivery.",
      timestamp: new Date().toISOString(),
    };

    return {
      state: "SUCCESS",
      messageId: draft.messageId,
      sentAt: this.systemInfo.lastSyncTime,
      event,
    };
  }

  public getDraft(messageId: string): CustomerMessageDraft | undefined {
    return this.draftsStore.get(messageId);
  }
}

export const mockCommunicationAdapter = new MockCommunicationAdapter();
