import {
  Customer,
  Meeting,
  MeetingSummary,
  AIIntervention,
  AuditEvent,
  ManagerMetric,
  LoanOfficerOverview,
  InterventionStatus,
  AgentActionType,
  FollowUpTask,
  PostMeetingAction,
  DocumentItem,
  DocumentStatus,
} from "@/types";
import {
  mockMillerCustomer,
  mockCarterCustomer,
  mockJohnsonCustomer,
  mockGarciaCustomer,
  mockMeetings,
  mockMeetingSummary,
  mockInterventions,
  mockAuditEvents,
  mockManagerMetrics,
  mockLoanOfficers,
  mockPostMeetingActions,
  mockDocumentItems,
} from "./mock-data";

import { generateId } from "@/lib/utils";

/**
 * In-Memory Mock Persistence Repository
 * Serves as the thread-safe simulated data store for the prototype.
 * Designed with standard repository interfaces so it can be swapped
 * with PostgreSQL / Prisma / Supabase in production.
 */
class MortgageRepository {
  private customers: Map<string, Customer> = new Map();
  private meetings: Map<string, Meeting> = new Map();
  private meetingSummaries: Map<string, MeetingSummary> = new Map();
  private interventions: Map<string, AIIntervention> = new Map();
  private auditEvents: AuditEvent[] = [];
  private postMeetingActions: Map<string, PostMeetingAction> = new Map();
  private documentItems: Map<string, DocumentItem> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed customers
    const allCustomers = [
      mockMillerCustomer,
      mockCarterCustomer,
      mockJohnsonCustomer,
      mockGarciaCustomer,
    ];
    allCustomers.forEach((c) => {
      this.customers.set(c.id, JSON.parse(JSON.stringify(c)));
    });

    // Seed meetings
    mockMeetings.forEach((m) => {
      this.meetings.set(m.id, JSON.parse(JSON.stringify(m)));
    });

    // Seed summary
    this.meetingSummaries.set(mockMeetingSummary.meetingId, JSON.parse(JSON.stringify(mockMeetingSummary)));

    // Seed interventions
    mockInterventions.forEach((intv) => {
      this.interventions.set(intv.id, JSON.parse(JSON.stringify(intv)));
    });

    // Seed audit events
    this.auditEvents = JSON.parse(JSON.stringify(mockAuditEvents));

    // Seed post-meeting action items
    mockPostMeetingActions.forEach((act) => {
      this.postMeetingActions.set(act.id, JSON.parse(JSON.stringify(act)));
    });

    // Seed document items
    mockDocumentItems.forEach((doc) => {
      this.documentItems.set(doc.id, JSON.parse(JSON.stringify(doc)));
    });
  }


  public getCustomer(id: string): Customer | null {
    return this.customers.get(id) || null;
  }

  public getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  public getMeeting(id: string): Meeting | null {
    const meeting = this.meetings.get(id);
    if (!meeting) return null;
    // Hydrate active interventions from store
    const meetingInterventions = Array.from(this.interventions.values()).filter(
      (i) => i.meetingId === id
    );
    return {
      ...meeting,
      activeInterventions: meetingInterventions,
    };
  }

  public getAllMeetings(): Meeting[] {
    return Array.from(this.meetings.values());
  }

  public getMeetingSummary(meetingId: string): MeetingSummary | null {
    return this.meetingSummaries.get(meetingId) || null;
  }

  public getAllTasks(): FollowUpTask[] {
    const tasks: FollowUpTask[] = [];
    this.meetingSummaries.forEach((summary) => {
      tasks.push(...summary.followUpTasks);
    });
    return tasks;
  }

  public getInterventions(meetingId?: string): AIIntervention[] {
    const all = Array.from(this.interventions.values());
    if (meetingId) {
      return all.filter((i) => i.meetingId === meetingId);
    }
    return all;
  }

  public addIntervention(intervention: AIIntervention): AIIntervention {
    this.interventions.set(intervention.id, intervention);
    this.addAuditEvent({
      eventType: "ai_intervention_generated",
      meetingId: intervention.meetingId || "meet_001",
      actor: { userId: intervention.source, role: "System" },
      details: {
        category: intervention.category,
        ruleCitation: intervention.ruleCitation,
        notes: `Intervention generated: ${intervention.exactMessage}`,
      },
    });
    return intervention;
  }

  public updateInterventionStatus(
    id: string,
    status: InterventionStatus,
    actionType?: AgentActionType,
    rationale?: string
  ): AIIntervention | null {
    const intv = this.interventions.get(id);
    if (!intv) return null;

    intv.status = status;
    this.interventions.set(id, intv);

    this.addAuditEvent({
      eventType: "agent_action_taken",
      meetingId: intv.meetingId || "meet_001",
      actor: { userId: "lo_avance_402", role: "Loan Officer" },
      details: {
        actionTaken: actionType || status,
        category: intv.category,
        ruleCitation: intv.ruleCitation,
        notes: rationale || `Officer executed action: ${actionType || status}`,
      },
    });

    return intv;
  }

  public getAuditEvents(meetingId?: string): AuditEvent[] {
    if (meetingId) {
      return this.auditEvents.filter((e) => e.meetingId === meetingId);
    }
    return this.auditEvents;
  }

  public addAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">): AuditEvent {
    const fullEvent: AuditEvent = {
      ...event,
      id: generateId("aud"),
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(fullEvent);
    return fullEvent;
  }

  public getPostMeetingActions(): PostMeetingAction[] {
    return Array.from(this.postMeetingActions.values());
  }

  public getPostMeetingAction(id: string): PostMeetingAction | null {
    return this.postMeetingActions.get(id) || null;
  }

  public updatePostMeetingActionStatus(
    id: string,
    status: PostMeetingAction["status"],
    executionResult?: string
  ): PostMeetingAction | null {
    const act = this.postMeetingActions.get(id);
    if (!act) return null;
    act.status = status;
    if (status === "completed") {
      act.executedAt = new Date().toISOString();
      act.executionResult = executionResult;
    }
    this.postMeetingActions.set(id, act);
    return act;
  }

  public addPostMeetingAction(action: PostMeetingAction): PostMeetingAction {
    this.postMeetingActions.set(action.id, action);
    return action;
  }

  public getDocumentItems(): DocumentItem[] {
    return Array.from(this.documentItems.values());
  }

  public getDocumentItem(id: string): DocumentItem | null {
    return this.documentItems.get(id) || null;
  }

  public updateDocumentItem(
    id: string,
    status: DocumentStatus,
    notes?: string
  ): DocumentItem | null {
    const doc = this.documentItems.get(id);
    if (!doc) return null;
    doc.status = status;
    if (notes) doc.reviewNotes = notes;
    if (status === "UPLOADED" && !doc.uploadedAt) {
      doc.uploadedAt = new Date().toISOString();
    }
    this.documentItems.set(id, doc);
    return doc;
  }

  public getOperationsOverview() {
    const allDocs = Array.from(this.documentItems.values());
    const allActions = Array.from(this.postMeetingActions.values());
    const allInterventions = Array.from(this.interventions.values());

    return {
      documentVerificationQueue: allDocs.filter((d) => d.status === "UPLOADED" || d.status === "UNDER_REVIEW"),
      missingInformation: allDocs.filter((d) => d.status === "REQUESTED" || d.status === "MISSING"),
      verifiedDocuments: allDocs.filter((d) => d.status === "VERIFIED"),
      unresolvedConflicts: [
        {
          id: "conf_01",
          type: "liabilities_omission",
          title: "BMW Auto Lease ($590/mo) Omission Conflict",
          description: "Borrower initially stated desire to leave lease off Form 1003. Verified lease must be captured in liabilities ledger under Fannie Mae B3-6-01.",
          status: "pending_back_office_verification",
          priority: "High",
          borrowerName: "Sarah Miller",
        },
      ],
      complianceEscalations: allInterventions.filter(
        (i) => i.requiresEscalation || i.severity === "critical" || i.severity === "CRITICAL"
      ),
      pendingApprovals: allActions.filter((a) => a.status === "ready_for_approval"),
      completedActions: allActions.filter((a) => a.status === "completed"),
      totalActionsCount: allActions.length,
    };
  }

  public getManagerMetrics(): ManagerMetric[] {
    return mockManagerMetrics;
  }

  public getLoanOfficers(): LoanOfficerOverview[] {
    return mockLoanOfficers;
  }

  private resetCallbacks: Array<() => void> = [];

  public onReset(cb: () => void): void {
    this.resetCallbacks.push(cb);
  }

  public resetToSeed(): void {
    this.customers.clear();
    this.meetings.clear();
    this.meetingSummaries.clear();
    this.interventions.clear();
    this.auditEvents = [];
    this.postMeetingActions.clear();
    this.documentItems.clear();
    this.seed();
    this.resetCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn("Reset subscriber error:", err);
      }
    });
  }
}

// Export singleton repository instance
export const repository = new MortgageRepository();

