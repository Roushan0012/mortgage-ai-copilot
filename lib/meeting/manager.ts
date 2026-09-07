import { Meeting, TranscriptSegment, SpeakerRole, ExtractedFact, MeetingSummary } from "@/types";
import { repository } from "@/lib/data/repository";
import { interventionCoordinator } from "@/lib/interventions/coordinator";
import { generateId } from "@/lib/utils";

export class MeetingManager {
  /**
   * Retrieve active meeting details with current interventions and transcript segments.
   */
  public getMeeting(meetingId: string): Meeting | null {
    return repository.getMeeting(meetingId);
  }

  /**
   * Add a new transcript segment and trigger the dual-engine intervention pipeline.
   */
  public async addTranscriptSegment(params: {
    meetingId: string;
    text: string;
    speakerRole: SpeakerRole;
    speakerName?: string;
  }): Promise<{ segment: TranscriptSegment; meeting: Meeting | null }> {
    const { meetingId, text, speakerRole, speakerName } = params;
    const meeting = repository.getMeeting(meetingId);
    if (!meeting) {
      throw new Error(`Meeting ${meetingId} not found`);
    }

    const defaultNames: Record<SpeakerRole, string> = {
      loan_officer: "Alex Vance (Loan Officer)",
      primary_borrower: "John Miller (Borrower)",
      co_borrower: "Sarah Miller (Co-Borrower)",
      system: "Darwix System",
    };

    const newSegment: TranscriptSegment = {
      id: generateId("ts"),
      meetingId,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      speakerRole,
      speakerName: speakerName || defaultNames[speakerRole],
      text,
      confidenceScore: 0.97,
    };

    meeting.transcriptSegments.push(newSegment);

    // Run intervention coordinator
    const priorTexts = meeting.transcriptSegments.map((s) => `${s.speakerName}: ${s.text}`);
    const customer = repository.getCustomer(meeting.customerId);
    const customerSummary = customer
      ? `Borrower: ${customer.primaryBorrower.firstName} ${customer.primaryBorrower.lastName}, Target Price: $${customer.mortgageGoal.targetPurchasePrice}, Income: $${customer.primaryBorrower.financialProfile.grossMonthlyIncome}/mo`
      : "Standard Conforming Loan Consultation";

    const processResult = await interventionCoordinator.processSegment({
      segment: newSegment,
      priorTranscriptTexts: priorTexts,
      customerSummary,
    });

    // Append extracted facts to meeting state
    if (processResult.extractedFacts.length > 0) {
      meeting.extractedFacts.push(...processResult.extractedFacts);
    }

    return {
      segment: newSegment,
      meeting: repository.getMeeting(meetingId),
    };
  }

  /**
   * Verify an extracted 1003 fact into formal verified state.
   */
  public verifyFact(meetingId: string, factId: string, verified: boolean): ExtractedFact | null {
    const meeting = repository.getMeeting(meetingId);
    if (!meeting) return null;

    const fact = meeting.extractedFacts.find((f) => f.id === factId);
    if (!fact) return null;

    fact.verifiedByOfficer = verified;
    if (verified) {
      fact.officerAcceptedAt = new Date().toISOString();
    }

    repository.addAuditEvent({
      eventType: "agent_action_taken",
      meetingId,
      actor: { userId: "lo_avance_402", role: "Loan Officer" },
      details: {
        actionTaken: verified ? "VERIFY_1003_FACT" : "REJECT_1003_FACT",
        category: fact.category,
        notes: `Fact: ${fact.fieldName} = ${fact.rawValue}`,
      },
    });

    return fact;
  }

  /**
   * Get or generate post-meeting summary.
   */
  public getMeetingSummary(meetingId: string): MeetingSummary | null {
    return repository.getMeetingSummary(meetingId);
  }
}

export const meetingManager = new MeetingManager();
