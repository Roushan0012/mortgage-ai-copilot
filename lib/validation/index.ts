import { z } from "zod";

export const InterventionSeveritySchema = z.enum([
  "info",
  "low",
  "medium",
  "high",
  "critical",
  "INFO",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const ConfidenceLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const InterventionCategorySchema = z.enum([
  "profiling",
  "missing_information",
  "product_explanation",
  "product_guidance",
  "objection",
  "customer_objection",
  "compliance",
  "compliance_warning",
  "conflict",
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
  "WARNING",
  "SUGGESTION",
  "QUESTION",
  "CAPTURE",
  "CONFLICT",
  "COMPLIANCE",
  "NEXT_ACTION",
  "question",
  "alert",
  "action_recommendation",
  "compliance_violation",
  "knowledge_lookup",
]);

export const InterventionSourceSchema = z.enum([
  "RULE",
  "AI",
  "HYBRID",
  "deterministic_rule",
  "ai_inference",
  "hybrid",
]);

export const AgentActionTypeSchema = z.enum([
  "accept",
  "dismiss",
  "ask_question",
  "view_evidence",
  "escalate",
  "mark_verification",
  "create_followup",
  "mark_review",
]);

export const AIInterventionSchema = z.object({
  id: z.string(),
  title: z.string().default("Darwix Copilot Alert"),
  category: InterventionCategorySchema,
  severity: InterventionSeveritySchema,
  trigger: z.string(),
  detectedEvidence: z.string().optional(),
  evidence: z.string(),
  exactMessage: z.string(),
  suggestedResponse: z.string().optional(),
  reason: z.string(),
  source: InterventionSourceSchema,
  confidence: z.number().min(0).max(1),
  confidenceLevel: ConfidenceLevelSchema.optional(),
  interventionType: InterventionTypeSchema,
  availableActions: z.array(AgentActionTypeSchema),
  escalationRequired: z.boolean().optional(),
  requiresEscalation: z.boolean().default(false),
  generatedSystemAction: z.string().nullable().optional(),
  systemAction: z.string().nullable().optional(),
  generatedInformation: z.string().optional(),
  riskIfIncorrect: z.string(),
  status: z.enum(["pending", "accepted", "dismissed", "escalated", "executed"]),
  timestamp: z.string(),
  dismissalReason: z.string().optional(),
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
      title: z.string().optional(),
      category: InterventionCategorySchema,
      severity: InterventionSeveritySchema,
      trigger: z.string(),
      detectedEvidence: z.string().optional(),
      evidence: z.string().optional(),
      exactMessage: z.string(),
      suggestedResponse: z.string().optional(),
      reason: z.string(),
      confidence: z.number().min(0).max(1),
      interventionType: InterventionTypeSchema.optional(),
      suggestedActions: z.array(AgentActionTypeSchema).optional(),
      riskIfIncorrect: z.string().optional(),
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
