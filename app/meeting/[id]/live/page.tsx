"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PhoneOff,
  Clock,
  RotateCcw,
  Pause,
  Play,
  BookmarkPlus,
  HelpCircle,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { interventionCoordinator } from "@/lib/interventions/coordinator";
import { Transcript } from "@/components/meeting/Transcript";
import { CustomerContext } from "@/components/customer/CustomerContext";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { Button } from "@/components/shared/Button";
import { ActionButton } from "@/components/shared/ActionButton";
import {
  TranscriptSegment,
  AIIntervention,
  ExtractedFact,
  AgentActionType,
  SpeakerRole,
} from "@/types";
import { generateId, formatDuration } from "@/lib/utils";

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

  // Meeting timer & pause state
  const [secondsElapsed, setSecondsElapsed] = useState(872); // 14m 32s
  const [isPaused, setIsPaused] = useState(false);

  // Queued question from Copilot to insert into transcript
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>(undefined);

  // Action Bar interactive modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [escalationConfirmation, setEscalationConfirmation] = useState<string | null>(null);
  const [notesList, setNotesList] = useState<string[]>([
    "Borrowers confirmed they have $85,000 ready for down payment.",
    "Sarah mentioned BMW lease is paid with assistance from father.",
  ]);

  // Mobile active tab for smaller screens
  const [mobileTab, setMobileTab] = useState<"transcript" | "context" | "copilot">("transcript");

  // Timer interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  if (!initialMeeting || !initialCustomer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12">
        <h2 className="text-base font-bold text-slate-900">Meeting Session Not Found</h2>
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

    if (actionType === "escalate") {
      setEscalationConfirmation(
        "Critical TRID exception escalated to Branch Compliance Supervisor. Audit record created."
      );
      setTimeout(() => setEscalationConfirmation(null), 5000);
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

  // Receive question selection from Copilot
  const handleSelectQuestion = (questionText: string) => {
    setPendingQuestion(questionText);
    setMobileTab("transcript");
  };

  // Inject a live simulated message and run dual-engine processing
  const handleInjectTestScenario = async (text: string, speakerRole: SpeakerRole) => {
    const speakerNames: Record<SpeakerRole, string> = {
      loan_officer: "Alex Vance (Loan Officer)",
      primary_borrower: "John Miller (Borrower)",
      co_borrower: "Sarah Miller (Co-Borrower)",
      system: "Darwix Copilot System",
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

    if (result.interventions.length > 0) {
      setInterventions((prev) => [...result.interventions, ...prev]);
    }

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
      setPendingQuestion(undefined);
    }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    setNotesList((prev) => [...prev, noteContent.trim()]);
    setNoteContent("");
    setShowNoteModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden select-none">
      {/* 1. MEETING HEADER */}
      <div className="h-12 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0 border-b border-slate-800 z-10">
        {/* Left: Meeting Identification & Duration */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span
              className={`h-2 w-2 rounded-full ${
                isPaused ? "bg-amber-400" : "bg-rose-500 animate-pulse"
              }`}
            />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
              {isPaused ? "MEETING PAUSED" : "LIVE CONSULTATION"}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <span className="text-xs font-bold text-white truncate">
            {initialMeeting.borrowerNames || initialMeeting.title}
          </span>

          <span className="text-slate-700 hidden md:inline">•</span>

          <span className="text-xs text-slate-300 hidden md:inline truncate">
            Home Purchase Consultation
          </span>

          <span className="text-slate-700 hidden lg:inline">•</span>

          {/* Duration Counter */}
          <div className="flex items-center text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <Clock className="h-3 w-3 mr-1 text-slate-400" />
            <span>{formatDuration(secondsElapsed)}</span>
          </div>

          {/* Recording / Simulated Status Label */}
          <span className="hidden xl:inline-flex items-center text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Volume2 className="h-3 w-3 mr-1 text-emerald-400" />
            Simulated Transcription Active
          </span>
        </div>

        {/* Right: Pause & End Meeting Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleResetSession}
            title="Reset scenario to seed state"
            className="hidden sm:flex items-center space-x-1 px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              isPaused
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <Link href={`/meeting/${meetingId}/summary`}>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span>End Meeting</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Escalation Confirmation Banner */}
      {escalationConfirmation && (
        <div className="bg-red-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-150">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{escalationConfirmation}</span>
          </div>
          <button
            type="button"
            onClick={() => setEscalationConfirmation(null)}
            className="text-white hover:text-slate-200 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile View Tab Selector */}
      <div className="md:hidden flex items-center justify-around bg-slate-800 text-slate-300 text-xs py-1.5 shrink-0 border-b border-slate-700">
        <button
          type="button"
          onClick={() => setMobileTab("transcript")}
          className={`px-3 py-1 rounded font-semibold ${
            mobileTab === "transcript" ? "bg-slate-900 text-white" : ""
          }`}
        >
          Conversation ({segments.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("context")}
          className={`px-3 py-1 rounded font-semibold ${
            mobileTab === "context" ? "bg-slate-900 text-white" : ""
          }`}
        >
          Customer Context
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("copilot")}
          className={`px-3 py-1 rounded font-semibold ${
            mobileTab === "copilot" ? "bg-rose-600 text-white font-bold" : ""
          }`}
        >
          Copilot ({interventions.filter((i) => i.status === "pending").length})
        </button>
      </div>

      {/* 2. 3-COLUMN ENTERPRISE LIVE WORKSPACE */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* COLUMN 1: Real-Time Conversation Stream (30% -> 4 cols) */}
        <div
          className={`col-span-12 md:col-span-4 lg:col-span-4 h-full overflow-hidden ${
            mobileTab === "transcript" ? "block" : "hidden md:block"
          }`}
        >
          <Transcript
            segments={segments}
            highlightedSegmentId={highlightedSegmentId}
            onInjectTestScenario={handleInjectTestScenario}
            pendingQuestion={pendingQuestion}
            onClearPendingQuestion={() => setPendingQuestion(undefined)}
          />
        </div>

        {/* COLUMN 2: Customer Context Dossier & 1003 Fact Ledger (40% -> 5 cols) */}
        <div
          className={`col-span-12 md:col-span-4 lg:col-span-5 h-full overflow-hidden border-r border-slate-200 ${
            mobileTab === "context" ? "block" : "hidden md:block"
          }`}
        >
          <CustomerContext
            customer={initialCustomer}
            extractedFacts={extractedFacts}
            onVerifyFact={handleVerifyFact}
            onAskQuestion={(q) => handleSelectQuestion(q)}
          />
        </div>

        {/* COLUMN 3: Darwix AI Copilot Action Deck (30% -> 3 cols) */}
        <div
          className={`col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-hidden ${
            mobileTab === "copilot" ? "block" : "hidden md:block"
          }`}
        >
          <CopilotPanel
            interventions={interventions}
            onAction={handleAction}
            onHighlightEvidence={handleHighlightEvidence}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>
      </div>

      {/* 3. MEETING ACTION BAR */}
      <div className="h-11 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 z-10 text-xs">
        {/* Left Action Buttons */}
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={<BookmarkPlus className="h-3.5 w-3.5 text-slate-500" />}
            label="Add Note"
            onClick={() => setShowNoteModal(true)}
          />
          <ActionButton
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            label="Mark Information"
            onClick={() => {
              // Toggle latest unverified fact
              const unverified = extractedFacts.find((f) => !f.verifiedByOfficer);
              if (unverified) handleVerifyFact(unverified.id, true);
            }}
          />
          <ActionButton
            icon={<HelpCircle className="h-3.5 w-3.5 text-blue-600" />}
            label="Ask Question"
            onClick={() =>
              handleSelectQuestion(
                "Could you confirm your current monthly car payment and loan balance?"
              )
            }
          />
          <Link href={`/customer/${initialCustomer.id}`} className="hidden sm:inline-block">
            <ActionButton
              icon={<User className="h-3.5 w-3.5 text-purple-600" />}
              label="View Customer"
            />
          </Link>
        </div>

        {/* Right Info: Recorded Notes count & End Meeting button */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-500 hidden md:inline">
            Notes captured: <strong className="text-slate-800">{notesList.length}</strong>
          </span>

          <Link href={`/meeting/${meetingId}/summary`}>
            <Button size="sm" variant="danger" className="font-semibold text-xs h-7">
              <span>End Meeting</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <BookmarkPlus className="h-4 w-4 text-slate-700" />
                <span>Capture Consultation Note</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record borrower condition, pricing discussion, or document follow-up..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />

            <div className="flex justify-end space-x-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setShowNoteModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote} disabled={!noteContent.trim()}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
