"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PhoneOff,
  Clock,
  RotateCcw,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { interventionCoordinator } from "@/lib/interventions/coordinator";
import { TranscriptViewer } from "@/components/meeting/TranscriptViewer";
import { CustomerContextPanel } from "@/components/customer/CustomerContextPanel";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { Button } from "@/components/shared/Button";
import { TranscriptSegment, AIIntervention, ExtractedFact, AgentActionType, SpeakerRole } from "@/types";
import { generateId } from "@/lib/utils";

export default function LiveMeetingPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || "meet_001";

  // Hydrate initial state from repository
  const initialMeeting = repository.getMeeting(meetingId);
  const initialCustomer = initialMeeting ? repository.getCustomer(initialMeeting.customerId) : null;

  const [segments, setSegments] = useState<TranscriptSegment[]>(initialMeeting?.transcriptSegments || []);
  const [interventions, setInterventions] = useState<AIIntervention[]>(initialMeeting?.activeInterventions || []);
  const [extractedFacts, setExtractedFacts] = useState<ExtractedFact[]>(initialMeeting?.extractedFacts || []);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | undefined>(undefined);

  if (!initialMeeting || !initialCustomer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Meeting Session Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ID: {meetingId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  // Handle agent card actions (Accept, Dismiss, Ask Question, Escalate)
  const handleAction = (interventionId: string, actionType: AgentActionType, rationale?: string) => {
    const result = interventionCoordinator.handleAgentAction({
      interventionId,
      actionType,
      rationale,
    });

    if (result.success && result.intervention) {
      setInterventions((prev) =>
        prev.map((item) => (item.id === interventionId ? result.intervention! : item))
      );
    }
  };

  // Handle 1003 fact verification
  const handleVerifyFact = (factId: string, verified: boolean) => {
    setExtractedFacts((prev) =>
      prev.map((f) => (f.id === factId ? { ...f, verifiedByOfficer: verified } : f))
    );
    repository.addAuditEvent({
      eventType: "agent_action_taken",
      meetingId,
      actor: { userId: "lo_avance_402", role: "Loan Officer" },
      details: {
        actionTaken: verified ? "VERIFY_1003_FACT" : "UNVERIFY_1003_FACT",
        notes: `Fact ID ${factId} updated by officer`,
      },
    });
  };

  // Highlight transcript evidence when requested from intervention card
  const handleHighlightEvidence = (segmentId?: string) => {
    setHighlightedSegmentId(segmentId);
    if (segmentId) {
      const el = document.getElementById(`segment-${segmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Inject a live simulated message and run dual-engine processing
  const handleInjectTestScenario = async (text: string, speakerRole: SpeakerRole) => {
    const speakerNames: Record<SpeakerRole, string> = {
      loan_officer: "Alex Vance (Loan Officer)",
      primary_borrower: "John Miller (Borrower)",
      co_borrower: "Sarah Miller (Co-Borrower)",
      system: "Darwix System",
    };

    const newSegment: TranscriptSegment = {
      id: generateId("ts"),
      meetingId,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      speakerRole,
      speakerName: speakerNames[speakerRole],
      text,
      confidenceScore: 0.98,
    };

    // Update transcript state
    const updatedSegments = [...segments, newSegment];
    setSegments(updatedSegments);

    // Evaluate through coordinator
    const priorTexts = updatedSegments.map((s) => `${s.speakerName}: ${s.text}`);
    const customerSummary = `Borrower: John & Sarah Miller, Target Price: $585,000, Conventional Fixed`;

    const result = await interventionCoordinator.processSegment({
      segment: newSegment,
      priorTranscriptTexts: priorTexts,
      customerSummary,
    });

    // Merge new interventions
    if (result.interventions.length > 0) {
      setInterventions((prev) => [...result.interventions, ...prev]);
    }

    // Merge extracted facts
    if (result.extractedFacts.length > 0) {
      setExtractedFacts((prev) => [...prev, ...result.extractedFacts]);
    }
  };

  const handleResetSession = () => {
    repository.resetToSeed();
    const freshMeeting = repository.getMeeting(meetingId);
    if (freshMeeting) {
      setSegments([...freshMeeting.transcriptSegments]);
      setInterventions([...freshMeeting.activeInterventions]);
      setExtractedFacts([...freshMeeting.extractedFacts]);
      setHighlightedSegmentId(undefined);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100">
      {/* Cockpit Top Bar */}
      <div className="h-11 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">LIVE CONSULTATION</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-medium text-slate-200">
            {initialMeeting.title}
          </span>
          <span className="text-slate-600">•</span>
          <div className="flex items-center text-[11px] text-slate-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>00:14:32</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetSession}
            title="Reset to initial test seed data"
            className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Scenario</span>
          </button>
          <Link href={`/meeting/${meetingId}/summary`}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5">
              <PhoneOff className="h-3 w-3" />
              <span>Conclude & Generate Summary</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-COLUMN ENTERPRISE COCKPIT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* COLUMN 1: Real-time Transcript Stream (30% -> 4 cols on 12-grid or 3.5) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 h-full overflow-hidden">
          <TranscriptViewer
            segments={segments}
            highlightedSegmentId={highlightedSegmentId}
            onInjectTestScenario={handleInjectTestScenario}
          />
        </div>

        {/* COLUMN 2: Customer Dossier & 1003 Fact Ledger (40% -> 5 cols on 12-grid) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-5 h-full overflow-hidden border-r border-slate-200">
          <CustomerContextPanel
            customer={initialCustomer}
            extractedFacts={extractedFacts}
            onVerifyFact={handleVerifyFact}
          />
        </div>

        {/* COLUMN 3: Darwix AI Copilot Action Deck (30% -> 3 cols on 12-grid) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-hidden">
          <CopilotPanel
            interventions={interventions}
            onAction={handleAction}
            onHighlightEvidence={handleHighlightEvidence}
          />
        </div>
      </div>
    </div>
  );
}
