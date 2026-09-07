import { AIIntervention, TranscriptSegment, AgentActionType } from "@/types";
import { DETERMINISTIC_COMPLIANCE_RULES, ComplianceRule } from "./rules";
import { generateId } from "@/lib/utils";

/**
 * Deterministic Compliance Engine
 * Runs regex pattern matching and state-machine checks on transcript segments.
 * Guaranteed execution with absolute priority over generative AI inferences.
 */
export class ComplianceEngine {
  private rules: ComplianceRule[] = DETERMINISTIC_COMPLIANCE_RULES;

  /**
   * Evaluate a single transcript segment or full text against deterministic compliance rules.
   */
  public evaluateSegment(
    segment: Pick<TranscriptSegment, "text" | "speakerRole" | "id" | "meetingId">
  ): AIIntervention[] {
    const text = segment.text.trim();
    if (!text) return [];

    const matches: AIIntervention[] = [];

    for (const rule of this.rules) {
      // Check negative patterns first: if any matched, compliance was honored
      if (rule.negativePatterns && rule.negativePatterns.some((np) => np.test(text))) {
        continue;
      }

      // Check positive match patterns
      const matchedPattern = rule.patterns.find((p) => p.test(text));
      if (matchedPattern) {
        const matchResult = text.match(matchedPattern);
        const triggerSnippet = matchResult ? matchResult[0] : "Regulatory trigger detected";

        const availableActions: AgentActionType[] =
          rule.severity === "critical"
            ? ["accept", "ask_question", "view_evidence", "escalate"]
            : ["accept", "ask_question", "dismiss", "view_evidence"];

        const intervention: AIIntervention = {
          id: generateId("intv_rule"),
          category: rule.category,
          severity: rule.severity,
          trigger: `Detected pattern: "${triggerSnippet}"`,
          detectedEvidence: `Speaker (${segment.speakerRole || "participant"}) stated: "${text}"`,
          exactMessage: rule.exactMessage,
          reason: rule.reason,
          source: "deterministic_rule",
          confidence: 1.0,
          interventionType: rule.severity === "critical" ? "compliance_violation" : "alert",
          availableActions,
          escalationRequired: rule.escalationRequired,
          generatedSystemAction: rule.generatedSystemAction,
          riskIfIncorrect: rule.riskIfIncorrect,
          status: "pending",
          timestamp: new Date().toISOString(),
          meetingId: segment.meetingId,
          transcriptSegmentId: segment.id,
          ruleCitation: rule.regulationCitation,
        };

        matches.push(intervention);
      }
    }

    return matches;
  }

  /**
   * Sort interventions by severity priority: critical > high > medium > low > info.
   */
  public static sortBySeverity(interventions: AIIntervention[]): AIIntervention[] {
    const severityWeight: Record<AIIntervention["severity"], number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return [...interventions].sort(
      (a, b) => severityWeight[b.severity] - severityWeight[a.severity]
    );
  }
}

export const complianceEngine = new ComplianceEngine();
