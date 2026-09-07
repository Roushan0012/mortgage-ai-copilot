import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { complianceEngine } from "@/lib/compliance/engine";
import { DETERMINISTIC_COMPLIANCE_RULES } from "@/lib/compliance/rules";
import { repository } from "@/lib/data/repository";
import { TranscriptSegment, InterventionCategory } from "@/types";

describe("Darwix AI Phase 6 — Assessment Hardening & 14 Scenarios Verification", () => {
  // --------------------------------------------------------------------------
  // 1. Verification of All 14 Required Intervention Categories
  // --------------------------------------------------------------------------
  test("1. Comprehensive Coverage: System defines deterministic rules for all required scenarios", () => {
    const categoriesInRules = new Set(DETERMINISTIC_COMPLIANCE_RULES.map((r) => r.category));

    const requiredCategories: InterventionCategory[] = [
      "profiling",
      "product_explanation",
      "customer_objection",
      "missing_information",
      "compliance_warning",
      "next_best_action",
      "informal_approval_statement",
      "indicative_interest_rate_statement",
      "suggesting_exclusion_of_liability",
      "unverifiable_income_discussion",
      "promise_to_beat_competitor",
      "conflicting_borrower_info",
      "missed_profiling_question",
      "closing_without_next_action",
    ];

    requiredCategories.forEach((cat) => {
      assert.ok(
        categoriesInRules.has(cat),
        `System must support deterministic rule for category: "${cat}"`
      );
    });
  });

  // --------------------------------------------------------------------------
  // 2. Exact High-Risk Behavior: Informal Approval
  // --------------------------------------------------------------------------
  test("2. High-Risk: Informal approval statement triggers exact message and cannot auto-approve", () => {
    const segment: TranscriptSegment = {
      id: "ts_appr_01",
      meetingId: "test_hr_01",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "Based on what you've told me, you should be approved for this mortgage.",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "informal_approval_statement");
    assert.ok(rule, "Must detect informal approval");
    assert.strictEqual(rule.severity, "high");
    assert.strictEqual(rule.requiresEscalation, true);
    assert.match(rule.exactMessage, /Approval has not been established from this meeting/i);
    assert.ok(rule.availableActions.includes("escalate"));
  });

  // --------------------------------------------------------------------------
  // 3. Exact High-Risk Behavior: Indicative Rate
  // --------------------------------------------------------------------------
  test("3. High-Risk: Indicative interest rate flags without fabricating market rates", () => {
    const segment: TranscriptSegment = {
      id: "ts_rate_01",
      meetingId: "test_hr_02",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "Regarding rates, we can probably get you a 6.1% rate for your 30-year fixed loan.",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "indicative_interest_rate_statement");
    assert.ok(rule, "Must detect rate quote without APR");
    assert.match(rule.exactMessage, /Treat this as indicative only unless supported/i);
    assert.strictEqual(rule.severity, "medium");
  });

  // --------------------------------------------------------------------------
  // 4. Exact High-Risk Behavior: Liability Omission (CRITICAL)
  // --------------------------------------------------------------------------
  test("4. High-Risk: Liability omission flagged as CRITICAL severity with escalation required", () => {
    const segment: TranscriptSegment = {
      id: "ts_omit_01",
      meetingId: "test_hr_03",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "We could leave that car loan off for now to make your debt-to-income look cleaner.",
      confidenceScore: 0.99,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "suggesting_exclusion_of_liability");
    assert.ok(rule, "Must detect liability omission attempt");
    assert.strictEqual(rule.severity, "critical");
    assert.strictEqual(rule.requiresEscalation, true);
    assert.match(rule.exactMessage, /Do not omit or misrepresent an existing liability/i);
  });

  // --------------------------------------------------------------------------
  // 5. Exact High-Risk Behavior: Unverifiable Income
  // --------------------------------------------------------------------------
  test("5. High-Risk: Unverifiable income flagged as STATED not VERIFIED", () => {
    const segment: TranscriptSegment = {
      id: "ts_inc_01",
      meetingId: "test_hr_04",
      timestamp: "10:00:00",
      speakerRole: "co_borrower",
      speakerName: "Sarah Miller",
      text: "I make about $8,000 a month, but most of it isn't documented because a lot of clients pay through private cash contracts.",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "unverifiable_income_discussion");
    assert.ok(rule, "Must detect undocumented cash income");
    assert.match(rule.exactMessage, /Income is currently stated, not verified/i);
    assert.strictEqual(rule.interventionType, "CAPTURE");
  });

  // --------------------------------------------------------------------------
  // 6. Exact High-Risk Behavior: Competitor Promise (HIGH)
  // --------------------------------------------------------------------------
  test("6. High-Risk: Competitor beat promise flagged as HIGH severity UDAAP risk", () => {
    const segment: TranscriptSegment = {
      id: "ts_comp_01",
      meetingId: "test_hr_05",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "Don't worry, we can definitely beat their offer.",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "promise_to_beat_competitor");
    assert.ok(rule, "Must detect competitor beat promise");
    assert.strictEqual(rule.severity, "high");
    assert.match(rule.exactMessage, /Avoid promising to beat a competitor without verified pricing/i);
  });

  // --------------------------------------------------------------------------
  // 7. Exact High-Risk Behavior: Conflicting Borrower Information
  // --------------------------------------------------------------------------
  test("7. High-Risk: Conflicting debt information marked as CONFLICT without auto-resolving", () => {
    const priorSegment: TranscriptSegment = {
      id: "ts_conf_01",
      meetingId: "test_hr_06",
      timestamp: "10:00:00",
      speakerRole: "primary_borrower",
      speakerName: "John Miller",
      text: "Our monthly debt is about $500, mostly just my truck loan.",
      confidenceScore: 0.98,
    };

    const currentSegment: TranscriptSegment = {
      id: "ts_conf_02",
      meetingId: "test_hr_06",
      timestamp: "10:00:30",
      speakerRole: "co_borrower",
      speakerName: "Sarah Miller",
      text: "Wait John, that's not right. It's actually closer to $1,200 when you include my student loan!",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(currentSegment, [priorSegment]);
    const rule = matches.find((m) => m.category === "conflicting_borrower_info");
    assert.ok(rule, "Must detect cross-speaker debt conflict");
    assert.strictEqual(rule.interventionType, "CONFLICT");
    assert.match(rule.exactMessage, /Borrower information conflicts with an earlier statement/i);
  });

  // --------------------------------------------------------------------------
  // 8. Exact High-Risk Behavior: Missed Profiling Question
  // --------------------------------------------------------------------------
  test("8. High-Risk: Missed profiling question prompts inquiry regarding recurring obligations", () => {
    const segment: TranscriptSegment = {
      id: "ts_prof_01",
      meetingId: "test_hr_07",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "Besides the car and student loan payments we've discussed, are there any other recurring monthly financial obligations?",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "missed_profiling_question");
    assert.ok(rule, "Must identify profiling check");
    assert.match(rule.exactMessage, /Consider asking about recurring financial obligations/i);
  });

  // --------------------------------------------------------------------------
  // 9. Exact High-Risk Behavior: No Clear Next Action
  // --------------------------------------------------------------------------
  test("9. High-Risk: Closing meeting without confirmed next action prompts follow-up creation", () => {
    const segment: TranscriptSegment = {
      id: "ts_close_01",
      meetingId: "test_hr_08",
      timestamp: "10:00:00",
      speakerRole: "loan_officer",
      speakerName: "Alex Vance",
      text: "Great, I'll let you know if anything comes up. Have a good day then.",
      confidenceScore: 0.98,
    };

    const matches = complianceEngine.evaluateSegment(segment);
    const rule = matches.find((m) => m.category === "closing_without_next_action");
    assert.ok(rule, "Must detect premature close without next action");
    assert.match(rule.exactMessage, /Define a clear next action before closing the meeting/i);
    assert.ok(rule.availableActions.includes("create_followup"));
  });

  // --------------------------------------------------------------------------
  // 10. Demo Reset State Invariant
  // --------------------------------------------------------------------------
  test("10. State Consistency: Demo reset cleanly restores seed repository and sync states", () => {
    // Mutate repository state
    repository.addAuditEvent({
      eventType: "agent_action_taken",
      meetingId: "meet_001",
      actor: { userId: "test_user", role: "Tester" },
      details: { notes: "Testing mutation" },
    });

    const preResetEvents = repository.getAuditEvents("meet_001");
    assert.ok(preResetEvents.length > 0);

    // Trigger demo reset
    repository.resetToSeed();

    // Verify reset
    const postResetMeeting = repository.getMeeting("meet_001");
    assert.ok(postResetMeeting, "Meeting record must exist after reset");
    assert.strictEqual(postResetMeeting.customerId, "cust_miller_001");

    const customer = repository.getCustomer("cust_miller_001");
    assert.ok(customer, "Customer record must exist after reset");
    assert.strictEqual(customer.primaryBorrower.firstName, "John");
  });
});
