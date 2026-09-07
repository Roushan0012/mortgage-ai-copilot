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
} from "@/types";
import {
  mockMillerCustomer,
  mockMeeting,
  mockMeetingSummary,
  mockInterventions,
  mockAuditEvents,
  mockManagerMetrics,
  mockLoanOfficers,
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

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed customer
    this.customers.set(mockMillerCustomer.id, JSON.parse(JSON.stringify(mockMillerCustomer)));

    // Seed meeting
    this.meetings.set(mockMeeting.id, JSON.parse(JSON.stringify(mockMeeting)));

    // Seed summary
    this.meetingSummaries.set(mockMeetingSummary.meetingId, JSON.parse(JSON.stringify(mockMeetingSummary)));

    // Seed interventions
    mockInterventions.forEach((intv) => {
      this.interventions.set(intv.id, JSON.parse(JSON.stringify(intv)));
    });

    // Seed audit events
    this.auditEvents = JSON.parse(JSON.stringify(mockAuditEvents));
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

  public getManagerMetrics(): ManagerMetric[] {
    return mockManagerMetrics;
  }

  public getLoanOfficers(): LoanOfficerOverview[] {
    return mockLoanOfficers;
  }

  public resetToSeed(): void {
    this.customers.clear();
    this.meetings.clear();
    this.meetingSummaries.clear();
    this.interventions.clear();
    this.auditEvents = [];
    this.seed();
  }
}

// Export singleton repository instance
export const repository = new MortgageRepository();
