import { AIIntervention, TranscriptSegment, AgentActionType, ExtractedFact } from "@/types";
import { complianceEngine, ComplianceEngine } from "@/lib/compliance/engine";
import { runAIInference } from "@/lib/ai/inference";
import { repository } from "@/lib/data/repository";

export interface ProcessSegmentResult {
  interventions: AIIntervention[];
  extractedFacts: ExtractedFact[];
  ruleTriggeredCount: number;
  aiGeneratedCount: number;
}

/**
 * Intervention Coordinator
 * Orchestrates the dual-engine decisioning pipeline:
 * 1. Runs deterministic compliance rules (highest priority).
 * 2. Runs contextual AI inference (Groq LLM).
 * 3. Arbitrates conflicts: deterministic rules override conflicting AI outputs.
 * 4. Deduplicates and orders by severity.
 * 5. Persists to repository and audit ledger.
 */
export class InterventionCoordinator {
  /**
   * Process an incoming live transcript segment.
   */
  public async processSegment(params: {
    segment: TranscriptSegment;
    priorTranscriptTexts: string[];
    customerSummary: string;
  }): Promise<ProcessSegmentResult> {
    const { segment, priorTranscriptTexts, customerSummary } = params;

    // Step 1: Run Deterministic Compliance Engine (Priority 1)
    const ruleInterventions = complianceEngine.evaluateSegment(segment);

    // Step 2: Run AI Inference (Priority 2)
    const aiResult = await runAIInference({
      currentSegment: segment.text,
      priorContext: priorTranscriptTexts,
      customerSummary,
      meetingId: segment.meetingId,
      segmentId: segment.id,
    });

    // Step 3: Arbitration & Conflict Resolution
    // If a deterministic rule is present for a critical category, filter out conflicting lower-priority AI interventions
    const ruleCategories = new Set(ruleInterventions.map((r) => r.category));
    const compatibleAiInterventions = aiResult.interventions.filter(
      (aiIntv) => !ruleCategories.has(aiIntv.category)
    );

    // Combine: Deterministic rules ALWAYS precede AI inferences
    const combined = [...ruleInterventions, ...compatibleAiInterventions];
    const sorted = ComplianceEngine.sortBySeverity(combined);

    // Step 4: Persist interventions to repository
    sorted.forEach((intv) => {
      repository.addIntervention(intv);
    });

    return {
      interventions: sorted,
      extractedFacts: aiResult.extractedFacts,
      ruleTriggeredCount: ruleInterventions.length,
      aiGeneratedCount: compatibleAiInterventions.length,
    };
  }

  /**
   * Execute an explicit Loan Officer action on an intervention.
   * Enforces human-in-the-loop safety gating.
   */
  public handleAgentAction(params: {
    interventionId: string;
    actionType: AgentActionType;
    rationale?: string;
  }): { success: boolean; intervention: AIIntervention | null } {
    const { interventionId, actionType, rationale } = params;

    const statusMap: Record<AgentActionType, AIIntervention["status"]> = {
      accept: "accepted",
      dismiss: "dismissed",
      ask_question: "executed",
      view_evidence: "pending",
      escalate: "escalated",
    };

    const newStatus = statusMap[actionType];
    const updated = repository.updateInterventionStatus(
      interventionId,
      newStatus,
      actionType,
      rationale
    );

    return {
      success: !!updated,
      intervention: updated,
    };
  }
}

export const interventionCoordinator = new InterventionCoordinator();
