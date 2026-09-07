import { Meeting, TranscriptSegment, SpeakerRole, ExtractedFact, MeetingSummary } from "@/types";
import { repository } from "@/lib/data/repository";
import { interventionCoordinator, ProcessSegmentResult } from "@/lib/interventions/coordinator";
import { generateId } from "@/lib/utils";

export interface AddSegmentResponse {
  segment: TranscriptSegment;
  meeting: Meeting | null;
  processResult: ProcessSegmentResult;
}

export class MeetingManager {
  /**
   * Retrieve active meeting details with current interventions and transcript segments.
   */
  public getMeeting(meetingId: string): Meeting | null {
    return repository.getMeeting(meetingId);
  }

  /**
   * Add a new transcript segment and trigger the 15-stage hybrid intervention pipeline.
   */
  public async addTranscriptSegment(params: {
    meetingId: string;
    text: string;
    speakerRole: SpeakerRole;
    speakerName?: string;
  }): Promise<AddSegmentResponse> {
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
      confidenceScore: 0.98,
    };

    const priorSegments = [...meeting.transcriptSegments];
    meeting.transcriptSegments.push(newSegment);

    // Context for AI analysis
    const priorTexts = priorSegments.map((s) => `${s.speakerName}: ${s.text}`);
    const customer = repository.getCustomer(meeting.customerId);
    const customerSummary = customer
      ? `Borrower: ${customer.primaryBorrower.firstName} ${customer.primaryBorrower.lastName}, Target Price: $${customer.mortgageGoal.targetPurchasePrice}, Stated Income: $${customer.primaryBorrower.financialProfile.grossMonthlyIncome}/mo`
      : "Standard Conforming Loan Consultation";

    const processResult = await interventionCoordinator.processSegment({
      segment: newSegment,
      priorSegments,
      priorTranscriptTexts: priorTexts,
      customerSummary,
    });

    // Append newly extracted facts to meeting state (deduplicated by fieldPath)
    if (processResult.extractedFacts.length > 0) {
      processResult.extractedFacts.forEach((newFact) => {
        const existingIdx = meeting.extractedFacts.findIndex((f) => f.fieldPath === newFact.fieldPath);
        if (existingIdx >= 0) {
          meeting.extractedFacts[existingIdx] = newFact;
        } else {
          meeting.extractedFacts.push(newFact);
        }
      });
    }

    return {
      segment: newSegment,
      meeting: repository.getMeeting(meetingId),
      processResult,
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
      actor: { userId: "lo_avance_402", role: "Loan Officer Alex Vance" },
      details: {
        actionTaken: verified ? "VERIFY_1003_FACT" : "REJECT_1003_FACT",
        category: fact.category,
        notes: `Fact: ${fact.fieldName} = ${fact.rawValue}`,
      },
    });

    return fact;
  }

  /**
   * Get post-meeting summary.
   */
  public getMeetingSummary(meetingId: string): MeetingSummary | null {
    return repository.getMeetingSummary(meetingId);
  }
}

export const meetingManager = new MeetingManager();
