import { z } from "zod";

export const InterventionSeveritySchema = z.enum(["info", "low", "medium", "high", "critical"]);

export const InterventionCategorySchema = z.enum([
  "profiling",
  "missing_information",
  "product_explanation",
  "customer_objection",
  "compliance_warning",
  "conflicting_borrower_info",
  "next_best_question",
  "next_best_action",
  "income_verification",
  "competitive_statement",
  "informal_approval_statement",
  "indicative_interest_rate_statement",
  "suggesting_exclusion_of_liability",
  "unverifiable_income_discussion",
  "promise_to_beat_competitor",
  "missed_profiling_question",
  "closing_without_next_action",
]);

export const InterventionTypeSchema = z.enum([
  "question",
  "alert",
  "action_recommendation",
  "compliance_violation",
  "knowledge_lookup",
]);

export const AgentActionTypeSchema = z.enum([
  "accept",
  "dismiss",
  "ask_question",
  "view_evidence",
  "escalate",
]);

export const AIInterventionSchema = z.object({
  id: z.string(),
  category: InterventionCategorySchema,
  severity: InterventionSeveritySchema,
  trigger: z.string(),
  detectedEvidence: z.string(),
  exactMessage: z.string(),
  reason: z.string(),
  source: z.enum(["deterministic_rule", "ai_inference", "hybrid"]),
  confidence: z.number().min(0).max(1),
  interventionType: InterventionTypeSchema,
  availableActions: z.array(AgentActionTypeSchema),
  escalationRequired: z.boolean(),
  generatedSystemAction: z.string().nullable(),
  riskIfIncorrect: z.string(),
  status: z.enum(["pending", "accepted", "dismissed", "escalated", "executed"]),
  timestamp: z.string(),
  meetingId: z.string().optional(),
  transcriptSegmentId: z.string().optional(),
  ruleCitation: z.string().optional(),
});

/**
 * Strict LLM structured output schema for Groq inference.
 */
export const LLMInferenceResponseSchema = z.object({
  interventions: z.array(
    z.object({
      category: InterventionCategorySchema,
      severity: InterventionSeveritySchema,
      trigger: z.string(),
      detectedEvidence: z.string(),
      exactMessage: z.string(),
      reason: z.string(),
      confidence: z.number().min(0).max(1),
      interventionType: InterventionTypeSchema,
      suggestedActions: z.array(AgentActionTypeSchema),
      riskIfIncorrect: z.string(),
      ruleCitation: z.string().optional(),
    })
  ),
  extractedFacts: z.array(
    z.object({
      category: z.enum([
        "income",
        "asset",
        "liability",
        "property_goal",
        "credit_history",
        "timeline",
        "co_borrower_intent",
        "competitor_quote",
      ]),
      fieldName: z.string(),
      fieldPath: z.string(),
      rawValue: z.string(),
      normalizedValue: z.union([z.string(), z.number(), z.boolean()]),
      confidence: z.number().min(0).max(1),
      form1003Section: z.string(),
    })
  ),
});

export const AgentActionPayloadSchema = z.object({
  interventionId: z.string(),
  meetingId: z.string(),
  actionType: AgentActionTypeSchema,
  loanOfficerId: z.string(),
  rationale: z.string().optional(),
  modifiedValue: z.string().optional(),
});
