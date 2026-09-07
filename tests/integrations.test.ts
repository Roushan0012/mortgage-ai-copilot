import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  mockCRMAdapter,
  mockLOSAdapter,
  mockDocumentSystemAdapter,
  mockCommunicationAdapter,
  integrationManager,
} from "@/lib/integrations";
import { repository } from "@/lib/data/repository";
import { mockMillerCustomer, mockMeetings } from "@/lib/data/mock-data";

describe("Darwix AI Enterprise Integrations & Post-Meeting Workflow — 10 Verification Areas", () => {
  const meeting = mockMeetings[0];
  const customer = mockMillerCustomer;

  beforeEach(() => {
    integrationManager.resetIdempotency();
    integrationManager.setFailureSimulation("salesforce_crm", false);
    integrationManager.setFailureSimulation("encompass_los", false);
    integrationManager.setFailureSimulation("document_system", false);
    integrationManager.setFailureSimulation("communication_gateway", false);
    repository.resetToSeed();
  });

  // --------------------------------------------------------------------------
  // 1. CRM Adapter Verification
  // --------------------------------------------------------------------------
  test("1. CRM Adapter: creates structured CRM records with realistic IDs and tasks", async () => {
    const custRecord = await mockCRMAdapter.findOrCreateCustomer(customer);
    assert.match(custRecord.leadId, /^CRM-LEAD-\d+$/);

    const activity = await mockCRMAdapter.updateMeetingActivity(
      meeting,
      customer,
      "Discussed primary home purchase and BMW lease",
      "Collect Schedule C returns",
      "Qualified / Needs Documentation"
    );
    assert.match(activity.activityId, /^CRM-ACT-\d+$/);
    assert.strictEqual(activity.outcome, "Qualified / Needs Documentation");

    const task = await mockCRMAdapter.createFollowUpTask(
      custRecord.leadId,
      "Request Schedule C Returns",
      "High",
      "Tomorrow",
      "Verify stated self-employment income"
    );
    assert.match(task.taskId, /^CRM-TASK-\d+$/);
    assert.strictEqual(task.priority, "High");
  });

  // --------------------------------------------------------------------------
  // 2. LOS Adapter Verification
  // --------------------------------------------------------------------------
  test("2. LOS Adapter: creates MISMO 3.4 draft with realistic IDs and defends stage progression", async () => {
    const result = await mockLOSAdapter.createOrUpdateDraftApplication(meeting, customer, {
      meetingId: meeting.id,
      customerId: customer.id,
      targetStage: "Documentation Pending",
      officerAttestation: true,
      officerNMLS: "1489201",
    });

    assert.strictEqual(result.state, "SUCCESS");
    assert.strictEqual(result.stage, "Documentation Pending");
    assert.match(result.loanIdentifier, /^ENC-1003-\d+$/);
    assert.strictEqual(result.mismoPayload.mismoVersion, "3.4");

    // Guardrail: Attempting to move application to "Approved" must be clamped back to Documentation Pending
    const clamped = await mockLOSAdapter.createOrUpdateDraftApplication(meeting, customer, {
      meetingId: meeting.id,
      customerId: customer.id,
      targetStage: "Approved" as unknown as import("@/types").LOSStage,
      officerAttestation: true,
      officerNMLS: "1489201",
    });
    assert.strictEqual(clamped.stage, "Documentation Pending", "Meeting must not directly approve loan");

  });

  // --------------------------------------------------------------------------
  // 3. Document Adapter Verification
  // --------------------------------------------------------------------------
  test("3. Document Adapter: identifies potential verification documents and manages states", async () => {
    const docs = mockDocumentSystemAdapter.identifyPotentialDocuments(customer, meeting);
    assert.ok(docs.length >= 4, "Should recommend at least 4 potential documents");

    // John is W-2 -> Should have W-2 and pay stubs
    const hasW2 = docs.some((d) => d.name.includes("W-2"));
    const hasPaystub = docs.some((d) => d.name.includes("Pay Stubs"));
    assert.ok(hasW2, "W-2 borrower must have potential W-2 item");
    assert.ok(hasPaystub, "W-2 borrower must have potential pay stub item");

    // Sarah is Self-Employed -> Should have Schedule C
    const hasScheduleC = docs.some((d) => d.name.includes("Schedule C"));
    assert.ok(hasScheduleC, "Self-employed co-borrower must have potential Schedule C item");

    // Language check: Must be marked as potential
    docs.forEach((doc) => {
      assert.strictEqual(doc.potentialOnly, true);
    });

    // Lifecycle transition
    const updated = await mockDocumentSystemAdapter.updateDocumentStatus(
      "DOC-ITEM-301",
      "VERIFIED",
      "Verified by Alex Vance"
    );
    assert.strictEqual(updated.status, "VERIFIED");
  });

  // --------------------------------------------------------------------------
  // 4. Communication Adapter Verification
  // --------------------------------------------------------------------------
  test("4. Communication Adapter: drafts compliant notifications and blocks unapproved dispatch", async () => {
    const draft = mockCommunicationAdapter.draftFollowUpEmail(customer, meeting);
    assert.match(draft.messageId, /^COMM-MSG-\d+$/);
    assert.strictEqual(draft.approvalRequired, true);
    assert.strictEqual(draft.status, "READY_FOR_APPROVAL");
    assert.match(draft.disclaimer, /12 CFR § 1026\.19/);

    // Attempt dispatch without approval -> must throw
    await assert.rejects(
      async () => {
        await mockCommunicationAdapter.dispatchApprovedCommunication(draft, "");
      },
      /explicit loan officer approval/
    );

    // Dispatch with approval
    draft.status = "APPROVED";
    const result = await mockCommunicationAdapter.dispatchApprovedCommunication(draft, "lo_avance_402");
    assert.strictEqual(result.state, "SUCCESS");
    assert.strictEqual(draft.status, "SENT");
  });

  // --------------------------------------------------------------------------
  // 5. Approval Gate Enforcement
  // --------------------------------------------------------------------------
  test("5. Approval Gate: blocks unauthorized execution of CRM, LOS, and Document workflows", async () => {
    // 1. CRM sync blocked if unapproved
    await assert.rejects(
      async () => {
        await integrationManager.syncCRM({
          meeting,
          customer,
          payload: {
            meetingId: meeting.id,
            customerId: customer.id,
            leadStage: "Qualified",
            outcome: "Qualified",
            nextAction: "None",
            notes: "Test",
            tasks: [],
          },
          isApproved: false, // Unapproved
        });
      },
      /Approval Gate Blocked/
    );

    // 2. LOS update blocked if unapproved
    await assert.rejects(
      async () => {
        await integrationManager.syncLOS({
          meeting,
          customer,
          payload: {
            meetingId: meeting.id,
            customerId: customer.id,
            targetStage: "Documentation Pending",
            officerAttestation: false,
            officerNMLS: "1489201",
          },
          isApproved: false, // Unapproved
        });
      },
      /Approval Gate Blocked/
    );

    // 3. Document request blocked if unapproved
    await assert.rejects(
      async () => {
        await integrationManager.requestDocuments({
          customer,
          applicationId: "ENC-1003-99412",
          meetingId: meeting.id,
          documents: [],
          isApproved: false, // Unapproved
        });
      },
      /Approval Gate Blocked/
    );
  });

  // --------------------------------------------------------------------------
  // 6. Duplicate Protection / Idempotency
  // --------------------------------------------------------------------------
  test("6. Duplicate Protection: executes first call and returns cached replay on duplicate invocation", async () => {
    const payload = {
      meetingId: meeting.id,
      customerId: customer.id,
      leadStage: "Qualified / Needs Documentation",
      outcome: "Qualified / Needs Documentation",
      nextAction: "Collect documents",
      notes: "First consultation sync",
      tasks: [
        {
          title: "Collect Sarah Tax Returns",
          priority: "High" as const,
          dueDate: "Tomorrow",
          reason: "Verify stated income",
        },
      ],
    };

    // First call: executes fresh
    const firstResult = await integrationManager.syncCRM({
      meeting,
      customer,
      payload,
      isApproved: true,
    });
    assert.strictEqual(firstResult.state, "SUCCESS");
    assert.strictEqual(firstResult.isIdempotentReplay, undefined);

    // Second call: duplicate protection triggers
    const secondResult = await integrationManager.syncCRM({
      meeting,
      customer,
      payload,
      isApproved: true,
    });
    assert.strictEqual(secondResult.state, "SUCCESS");
    assert.strictEqual(secondResult.isIdempotentReplay, true, "Should return idempotent replay");
    assert.strictEqual(secondResult.activityId, firstResult.activityId);
  });

  // --------------------------------------------------------------------------
  // 7. Integration Failure Handling & Retry
  // --------------------------------------------------------------------------
  test("7. Failure Handling: captures provider failures gracefully and allows clean retry", async () => {
    // 1. Simulate failure mode
    integrationManager.setFailureSimulation("salesforce_crm", true);

    const failResult = await integrationManager.syncCRM({
      meeting,
      customer,
      payload: {
        meetingId: meeting.id,
        customerId: customer.id,
        leadStage: "Qualified",
        outcome: "Qualified",
        nextAction: "Collect",
        notes: "Test",
        tasks: [],
      },
      isApproved: true,
    });

    assert.strictEqual(failResult.state, "FAILED");
    assert.ok(failResult.errorMessage && failResult.errorMessage.includes("503"));
    assert.strictEqual(failResult.event.status, "failed");

    // 2. Clear failure and retry
    integrationManager.setFailureSimulation("salesforce_crm", false);

    const retryResult = await integrationManager.syncCRM({
      meeting,
      customer,
      payload: {
        meetingId: meeting.id,
        customerId: customer.id,
        leadStage: "Qualified",
        outcome: "Qualified",
        nextAction: "Collect",
        notes: "Test retry",
        tasks: [],
      },
      isApproved: true,
    });

    assert.strictEqual(retryResult.state, "SUCCESS");
    assert.strictEqual(retryResult.event.status, "succeeded");
  });

  // --------------------------------------------------------------------------
  // 8. Audit Event Creation
  // --------------------------------------------------------------------------
  test("8. Audit Trail: creates structured, compliant audit events on system actions", async () => {
    const priorCount = repository.getAuditEvents().length;

    await integrationManager.syncLOS({
      meeting,
      customer,
      payload: {
        meetingId: meeting.id,
        customerId: customer.id,
        targetStage: "Documentation Pending",
        officerAttestation: true,
        officerNMLS: "1489201",
      },
      isApproved: true,
      officerId: "lo_avance_402",
    });

    const events = repository.getAuditEvents();
    assert.ok(events.length > priorCount, "Should append new audit event");

    const latest = events[0];
    assert.strictEqual(latest.action, "LOS_DRAFT_UPDATED");
    assert.strictEqual(latest.entityType, "loan_application");
    assert.strictEqual(latest.actorType, "loan_officer");
    assert.strictEqual(latest.status, "SUCCESS");
    assert.ok(latest.metadata?.statedIncomeStatus === "STATED — NOT VERIFIED");
  });

  // --------------------------------------------------------------------------
  // 9. Stated vs. Verified Financial Information
  // --------------------------------------------------------------------------
  test("9. Financial Data Integrity: marks consultation income as STATED — NOT VERIFIED", async () => {
    const losResult = await mockLOSAdapter.createOrUpdateDraftApplication(meeting, customer, {
      meetingId: meeting.id,
      customerId: customer.id,
      targetStage: "Documentation Pending",
      officerAttestation: true,
      officerNMLS: "1489201",
    });

    const john = losResult.mismoPayload.borrowers.find((b) => b.isPrimary);
    assert.ok(john);
    assert.strictEqual(john.statedMonthlyIncome.verificationState, "STATED");
    assert.strictEqual(john.statedMonthlyIncome.value, 12450);

    const sarah = losResult.mismoPayload.borrowers.find((b) => !b.isPrimary);
    assert.ok(sarah);
    assert.strictEqual(sarah.statedMonthlyIncome.verificationState, "STATED");

    // DTI estimate must be explicitly labelled estimate only
    assert.strictEqual(losResult.mismoPayload.statedDTI.status, "STATED_ESTIMATE_ONLY");
  });

  // --------------------------------------------------------------------------
  // 10. Post-Meeting Action Generation & Status Transitions
  // --------------------------------------------------------------------------
  test("10. Post-Meeting Actions: manages action lifecycle (ready -> approved -> completed)", () => {
    const actions = repository.getPostMeetingActions();
    assert.ok(actions.length >= 5, "Should have seeded post-meeting actions");

    const action = actions.find((a) => a.id === "act_01");
    assert.ok(action);
    assert.strictEqual(action.status, "ready_for_approval");
    assert.strictEqual(action.approvalRequired, true);

    // Transition to approved
    const approved = repository.updatePostMeetingActionStatus("act_01", "approved");
    assert.ok(approved);
    assert.strictEqual(approved.status, "approved");

    // Transition to completed
    const completed = repository.updatePostMeetingActionStatus("act_01", "completed", "DOC-REQ-88201");
    assert.ok(completed);
    assert.strictEqual(completed.status, "completed");
    assert.strictEqual(completed.executionResult, "DOC-REQ-88201");
    assert.ok(completed.executedAt);
  });
});
