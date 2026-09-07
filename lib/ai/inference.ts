import { AIIntervention, ExtractedFact } from "@/types";
import { getGroqClient, GROQ_MODELS } from "./groq";
import { MORTGAGE_COPILOT_SYSTEM_PROMPT, buildInferencePrompt } from "./prompts";
import { LLMInferenceResponseSchema } from "@/lib/validation";
import { generateId } from "@/lib/utils";

export interface InferenceResult {
  interventions: AIIntervention[];
  extractedFacts: ExtractedFact[];
  source: "groq_llm" | "heuristic_fallback";
}

/**
 * Execute contextual AI inference for live mortgage consultation.
 */
export async function runAIInference(params: {
  currentSegment: string;
  priorContext: string[];
  customerSummary: string;
  meetingId: string;
  segmentId: string;
}): Promise<InferenceResult> {
  const { currentSegment, priorContext, customerSummary, meetingId, segmentId } = params;
  const groq = getGroqClient();

  if (groq) {
    try {
      const userPrompt = buildInferencePrompt(currentSegment, priorContext, customerSummary);

      const completion = await groq.chat.completions.create({
        model: GROQ_MODELS.VERSATILE,
        messages: [
          { role: "system", content: MORTGAGE_COPILOT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_completion_tokens: 1500,
      });

      const rawJson = completion.choices[0]?.message?.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        const validated = LLMInferenceResponseSchema.safeParse(parsed);

        if (validated.success) {
          const interventions: AIIntervention[] = validated.data.interventions.map((item) => ({
            id: generateId("intv_ai"),
            category: item.category,
            severity: item.severity,
            trigger: item.trigger,
            detectedEvidence: item.detectedEvidence,
            exactMessage: item.exactMessage,
            reason: item.reason,
            source: "ai_inference",
            confidence: item.confidence,
            interventionType: item.interventionType,
            availableActions: item.suggestedActions,
            escalationRequired: item.severity === "critical",
            generatedSystemAction: null,
            riskIfIncorrect: item.riskIfIncorrect,
            status: "pending",
            timestamp: new Date().toISOString(),
            meetingId,
            transcriptSegmentId: segmentId,
            ruleCitation: item.ruleCitation,
          }));

          const extractedFacts: ExtractedFact[] = validated.data.extractedFacts.map((fact) => ({
            id: generateId("fact"),
            meetingId,
            transcriptSegmentId: segmentId,
            category: fact.category,
            fieldPath: fact.fieldPath,
            fieldName: fact.fieldName,
            rawValue: fact.rawValue,
            normalizedValue: fact.normalizedValue,
            confidence: fact.confidence,
            verifiedByOfficer: false,
            form1003Section: fact.form1003Section as ExtractedFact["form1003Section"],
            timestamp: new Date().toISOString(),
          }));

          return {
            interventions,
            extractedFacts,
            source: "groq_llm",
          };
        }
      }
    } catch (error) {
      console.warn("Groq LLM call encountered an issue, gracefully degrading to heuristic engine:", error);
    }
  }

  // Graceful heuristic contextual interpretation fallback for demo/offline resilience
  return runContextualHeuristicInference(currentSegment, meetingId, segmentId);
}

/**
 * High-precision contextual heuristic inference fallback.
 * Guarantees zero downtime during client presentations if network or API keys are unavailable.
 */
function runContextualHeuristicInference(
  text: string,
  meetingId: string,
  segmentId: string
): InferenceResult {
  const interventions: AIIntervention[] = [];
  const extractedFacts: ExtractedFact[] = [];
  const lower = text.toLowerCase();

  // 1. Competitive statement / comparison
  if (lower.includes("rocket") || lower.includes("quicken") || lower.includes("competitor") || lower.includes("beat that rate")) {
    interventions.push({
      id: generateId("intv_ai"),
      category: "competitive_statement",
      severity: "medium",
      trigger: "Competitor lender referenced by borrower",
      detectedEvidence: text,
      exactMessage: "COMPETITIVE POSITIONING: Request the official competing Loan Estimate to compare APR, fees, and points. Highlight our direct local underwriting advantage.",
      reason: "Unverified rate promises risk margin erosion. Emphasize loan certainty, zero processing delays, and local appraisal relationships.",
      source: "ai_inference",
      confidence: 0.92,
      interventionType: "action_recommendation",
      availableActions: ["accept", "ask_question", "dismiss"],
      escalationRequired: false,
      generatedSystemAction: "REQUEST_COMPETITOR_LOAN_ESTIMATE",
      riskIfIncorrect: "Risk of borrower taking unverified quote to competing broker.",
      status: "pending",
      timestamp: new Date().toISOString(),
      meetingId,
      transcriptSegmentId: segmentId,
    });
  }

  // 2. Down payment / Purchase price fact extraction
  const priceMatch = text.match(/\$(\d{1,3}(?:,\d{3})+|\d+)/);
  if (priceMatch && (lower.includes("listed") || lower.includes("house") || lower.includes("place") || lower.includes("offer") || lower.includes("price"))) {
    const rawVal = priceMatch[0];
    const numVal = parseInt(rawVal.replace(/[$,]/g, ""), 10);
    if (numVal > 100000) {
      extractedFacts.push({
        id: generateId("fact"),
        meetingId,
        transcriptSegmentId: segmentId,
        category: "property_goal",
        fieldPath: "mortgageGoal.targetPurchasePrice",
        fieldName: "Target Purchase Price",
        rawValue: rawVal,
        normalizedValue: numVal,
        confidence: 0.95,
        verifiedByOfficer: false,
        form1003Section: "Section 4: Loan and Property Information",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Next-best discovery question
  if (lower.includes("first time") || lower.includes("offer this weekend") || lower.includes("approval")) {
    interventions.push({
      id: generateId("intv_ai"),
      category: "next_best_question",
      severity: "info",
      trigger: "Fast purchase timeline detected",
      detectedEvidence: text,
      exactMessage: "DISCOVERY NUDGE: Inquire whether their real estate purchase contract requires a verified Pre-Approval with AUS findings or standard Pre-Qual letter.",
      reason: "Austin market contracts often require stronger verification letters to win competitive bidding situations.",
      source: "ai_inference",
      confidence: 0.89,
      interventionType: "question",
      availableActions: ["accept", "ask_question", "dismiss"],
      escalationRequired: false,
      generatedSystemAction: null,
      riskIfIncorrect: "Low impact; proactive question reinforces loan officer advisory positioning.",
      status: "pending",
      timestamp: new Date().toISOString(),
      meetingId,
      transcriptSegmentId: segmentId,
    });
  }

  return {
    interventions,
    extractedFacts,
    source: "heuristic_fallback",
  };
}
