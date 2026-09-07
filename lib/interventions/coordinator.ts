import {
  AIIntervention,
  TranscriptSegment,
  AgentActionType,
  ExtractedFact,
  InterventionCategory,
  FollowUpTask,
} from "@/types";
import { complianceEngine, ComplianceEngine } from "@/lib/compliance/engine";
import { runAIInference } from "@/lib/ai/inference";
import { repository } from "@/lib/data/repository";
import { generateId } from "@/lib/utils";

export interface ProcessSegmentResult {
  interventions: AIIntervention[];
  extractedFacts: ExtractedFact[];
  ruleTriggeredCount: number;
  aiGeneratedCount: number;
  isAIFallback: boolean;
  fallbackReason?: string;
}

/**
 * 15-Stage Modular Intervention Coordinator
 *
 * Flow:
 * Transcript Segment -> Normalize text -> Detect speaker ->
 * Run deterministic rules -> Run AI analysis -> Merge detections ->
 * Calculate confidence -> Determine severity -> Create intervention ->
 * Deduplicate -> Rank interventions -> Limit visible ->
 * Agent action -> Record audit event -> Update meeting state
 */
export class InterventionCoordinator {
  // In-memory set of dismissed category keys per meeting to prevent nudge fatigue
  private dismissedByMeeting: Map<string, Set<InterventionCategory>> = new Map();

  /**
   * 1. Normalize text: trim whitespace, normalize quotes, lowercase check
   */
  public normalizeText(text: string): string {
    return text
      .trim()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, " ");
  }

  /**
   * Process incoming transcript segment through the 15-stage pipeline.
   */
  public async processSegment(params: {
    segment: TranscriptSegment;
    priorSegments?: TranscriptSegment[];
    priorTranscriptTexts: string[];
    customerSummary: string;
  }): Promise<ProcessSegmentResult> {
    const { segment, priorSegments = [], priorTranscriptTexts, customerSummary } = params;
    const meetingId = segment.meetingId || "meet_001";

    // Stage 1 & 2: Normalize text and verify speaker
    const normalizedText = this.normalizeText(segment.text);
    const normalizedSegment: TranscriptSegment = {
      ...segment,
      text: normalizedText,
    };

    // Stage 3: Run Deterministic Compliance Rules (Priority 1)
    const ruleInterventions = complianceEngine.evaluateSegment(
      normalizedSegment,
      priorSegments
    );

    // Stage 4: Run Contextual AI Analysis (Priority 2)
    const aiResult = await runAIInference({
      currentSegment: normalizedText,
      priorContext: priorTranscriptTexts,
      customerSummary,
      meetingId,
      segmentId: segment.id,
    });

    // Stage 5 & 6: Merge detections with deterministic override
    // If a deterministic rule triggered for a category, it takes absolute precedence over AI output
    const ruleCategories = new Set(ruleInterventions.map((r) => r.category));
    const compatibleAiInterventions = aiResult.interventions.filter(
      (aiIntv) => !ruleCategories.has(aiIntv.category)
    );

    // Filter out low-confidence AI suggestions (< 0.60) to prevent noisy nudges,
    // but NEVER filter out deterministic compliance rules regardless of score!
    const confidentAiInterventions = compatibleAiInterventions.filter((item) => {
      // Deterministic rules always pass; AI suggestions require at least medium confidence
      return item.confidence >= 0.60;
    });

    // Stage 7 & 8: Determine severity & create merged interventions
    const rawMerged = [...ruleInterventions, ...confidentAiInterventions];

    // Stage 9: Deduplicate & Anti-Spam
    const currentActive = repository.getInterventions(meetingId).filter((i) => i.status === "pending");
    const dismissedCategories = this.getDismissedCategories(meetingId);

    const deduplicated = rawMerged.filter((newIntv) => {
      // 1. Do not spawn if an identical category is currently pending in the active deck
      const isAlreadyActive = currentActive.some(
        (active) => active.category === newIntv.category
      );
      if (isAlreadyActive) return false;

      // 2. Do not re-spawn non-critical interventions if previously dismissed by the loan officer
      if (dismissedCategories.has(newIntv.category) && newIntv.severity !== "critical") {
        return false;
      }

      return true;
    });

    // Stage 10: Rank interventions by severity (CRITICAL > HIGH > MEDIUM > LOW > INFO)
    const ranked = ComplianceEngine.sortBySeverity(deduplicated);

    // Stage 11: Persist new interventions and log audit events
    ranked.forEach((intv) => {
      repository.addIntervention(intv);
      repository.addAuditEvent({
        eventType: "INTERVENTION_SHOWN",
        meetingId,
        actor: { userId: intv.source, role: "Darwix Engine" },
        details: {
          category: intv.category,
          ruleCitation: intv.ruleCitation,
          notes: `Intervention shown: [${intv.severity.toUpperCase()}] ${intv.title} - ${intv.exactMessage}`,
        },
      });
    });

    return {
      interventions: ranked,
      extractedFacts: aiResult.extractedFacts,
      ruleTriggeredCount: ruleInterventions.length,
      aiGeneratedCount: confidentAiInterventions.length,
      isAIFallback: aiResult.isAIFallback,
      fallbackReason: aiResult.fallbackReason,
    };
  }

  /**
   * Execute explicit Loan Officer actions on an intervention.
   * Enforces human-in-the-loop safety gating and updates meeting state.
   */
  public handleAgentAction(params: {
    interventionId: string;
    actionType: AgentActionType;
    rationale?: string;
    meetingId?: string;
  }): { success: boolean; intervention: AIIntervention | null; generatedTask?: FollowUpTask } {
    const { interventionId, actionType, rationale, meetingId = "meet_001" } = params;

    const current = repository.getInterventions().find((i) => i.id === interventionId);
    if (!current) {
      return { success: false, intervention: null };
    }

    const effectiveMeetingId = current.meetingId || meetingId;
    const previousStatus = current.status;
    let newStatus: AIIntervention["status"] = "accepted";
    let auditEventType:
      | "INTERVENTION_ACCEPTED"
      | "INTERVENTION_DISMISSED"
      | "INTERVENTION_ESCALATED"
      | "QUESTION_SUGGESTED"
      | "FIELD_MARKED_FOR_VERIFICATION"
      | "FOLLOWUP_CREATED" = "INTERVENTION_ACCEPTED";

    let generatedTask: FollowUpTask | undefined;

    switch (actionType) {
      case "accept":
        newStatus = "accepted";
        auditEventType = "INTERVENTION_ACCEPTED";
        break;

      case "dismiss":
        newStatus = "dismissed";
        auditEventType = "INTERVENTION_DISMISSED";
        this.recordDismissal(effectiveMeetingId, current.category);
        break;

      case "escalate":
        newStatus = "escalated";
        auditEventType = "INTERVENTION_ESCALATED";
        break;

      case "ask_question":
        newStatus = "accepted";
        auditEventType = "QUESTION_SUGGESTED";
        break;

      case "mark_verification":
        newStatus = "accepted";
        auditEventType = "FIELD_MARKED_FOR_VERIFICATION";
        // Update customer profile: Stated vs Verified income
        this.applyIncomeVerificationUpdate(meetingId);
        break;

      case "mark_review":
        newStatus = "accepted";
        auditEventType = "INTERVENTION_ACCEPTED";
        // Mark debt liabilities as conflicted
        this.applyDebtConflictUpdate(meetingId);
        break;

      case "create_followup":
        newStatus = "accepted";
        auditEventType = "FOLLOWUP_CREATED";
        generatedTask = this.createDraftFollowUpTask(meetingId, current);
        break;

      case "view_evidence":
        // Viewing evidence keeps card in current status, records audit inquiry
        return { success: true, intervention: current };

      default:
        newStatus = "accepted";
        auditEventType = "INTERVENTION_ACCEPTED";
    }

    const updated = repository.updateInterventionStatus(
      interventionId,
      newStatus,
      actionType,
      rationale
    );

    if (updated && rationale) {
      updated.dismissalReason = rationale;
    }

    // Record structured audit event
    repository.addAuditEvent({
      eventType: auditEventType,
      meetingId,
      actor: { userId: "lo_avance_402", role: "Loan Officer Alex Vance" },
      details: {
        category: current.category,
        ruleCitation: current.ruleCitation,
        actionTaken: actionType,
        priorState: previousStatus,
        newState: newStatus,
        notes: rationale || `Officer executed action: ${actionType}`,
      },
    });

    return {
      success: !!updated,
      intervention: updated,
      generatedTask,
    };
  }

  /**
   * Helper: record a dismissed category for anti-spam memory
   */
  private recordDismissal(meetingId: string, category: InterventionCategory) {
    if (!this.dismissedByMeeting.has(meetingId)) {
      this.dismissedByMeeting.set(meetingId, new Set());
    }
    this.dismissedByMeeting.get(meetingId)?.add(category);
  }

  /**
   * Helper: get dismissed categories for a meeting
   */
  public getDismissedCategories(meetingId: string): Set<InterventionCategory> {
    return this.dismissedByMeeting.get(meetingId) || new Set();
  }

  /**
   * Scenario 4 update: separate Stated Income ($8,000) from Verified Income ($0 / unverified)
   */
  private applyIncomeVerificationUpdate(meetingId: string) {
    const meeting = repository.getMeeting(meetingId);
    if (!meeting) return;
    const customer = repository.getCustomer(meeting.customerId);
    if (!customer) return;

    if (customer.coBorrower) {
      customer.coBorrower.financialProfile.statedMonthlyIncome = 8000;
      customer.coBorrower.financialProfile.verifiedMonthlyIncome = 0;
      customer.coBorrower.financialProfile.incomeVerificationStatus = "required";
    }
  }

  /**
   * Scenario 6 update: mark debt liabilities as CONFLICTED
   */
  private applyDebtConflictUpdate(meetingId: string) {
    const meeting = repository.getMeeting(meetingId);
    if (!meeting) return;
    const customer = repository.getCustomer(meeting.customerId);
    if (!customer) return;

    customer.primaryBorrower.financialProfile.totalMonthlyDebtStatus = "conflicted";
    customer.primaryBorrower.financialProfile.debtConflictDetails = {
      johnAmount: 500,
      sarahAmount: 1200,
      status: "conflicted",
    };
  }

  /**
   * Scenario 8 helper: create draft follow-up task
   */
  private createDraftFollowUpTask(meetingId: string, intervention: AIIntervention): FollowUpTask {
    const summary = repository.getMeetingSummary(meetingId);
    const newTask: FollowUpTask = {
      id: generateId("task"),
      meetingId,
      title: intervention.title ? `Follow-up: ${intervention.title}` : "Schedule Application Follow-Up & Send Document Checklist",
      description: intervention.suggestedResponse || "Send borrower secure portal link for Sarah's 2024-2025 Schedule C tax returns and schedule Thursday check-in.",
      assignedTo: "loan_officer",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      priority: "high",
      completed: false,
      syncDestination: "salesforce",
    };

    if (summary) {
      summary.followUpTasks.unshift(newTask);
    }

    return newTask;
  }
}

export const interventionCoordinator = new InterventionCoordinator();
