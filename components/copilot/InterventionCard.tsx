"use client";

import React, { useState } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  BookmarkCheck,
  CalendarPlus,
} from "lucide-react";
import { AIIntervention, AgentActionType } from "@/types";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

interface InterventionCardProps {
  intervention: AIIntervention;
  onAction: (
    interventionId: string,
    actionType: AgentActionType,
    rationale?: string
  ) => void;
  onHighlightEvidence?: (segmentId?: string) => void;
  onSelectQuestion?: (questionText: string) => void;
}

export function InterventionCard({
  intervention,
  onAction,
  onHighlightEvidence,
  onSelectQuestion,
}: InterventionCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showDismissInput, setShowDismissInput] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [copied, setCopied] = useState(false);

  const isResolved = intervention.status !== "pending";
  const isCritical = intervention.severity === "critical" || intervention.severity === "CRITICAL";

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseResponse = () => {
    onAction(intervention.id, "accept");
    if (intervention.suggestedResponse && onSelectQuestion) {
      onSelectQuestion(intervention.suggestedResponse);
    }
  };

  const handleAskQuestion = () => {
    onAction(intervention.id, "ask_question");
    const qText = intervention.suggestedResponse || intervention.exactMessage;
    if (onSelectQuestion) {
      onSelectQuestion(qText);
    }
  };

  const handleMarkVerification = () => {
    onAction(intervention.id, "mark_verification");
  };

  const handleMarkReview = () => {
    onAction(intervention.id, "mark_review");
  };

  const handleCreateFollowup = () => {
    onAction(intervention.id, "create_followup");
  };

  // Border and background based on severity
  const getContainerStyles = () => {
    if (isResolved) {
      return "border-slate-200 bg-slate-50/75 opacity-75";
    }

    switch (intervention.severity.toLowerCase()) {
      case "critical":
        return "border-red-500 bg-red-50/40 ring-2 ring-red-400/80 shadow-sm";
      case "high":
        return "border-amber-400 bg-amber-50/30 ring-1 ring-amber-300 shadow-xs";
      case "medium":
        return "border-blue-300 bg-blue-50/20";
      case "low":
        return "border-slate-200 bg-white";
      case "info":
        return "border-emerald-300 bg-emerald-50/20";
      default:
        return "border-slate-200 bg-white";
    }
  };

  // Confidence display helper
  const confLevel = intervention.confidenceLevel || (intervention.confidence >= 0.85 ? "HIGH" : intervention.confidence >= 0.6 ? "MEDIUM" : "LOW");

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all text-left space-y-3 relative",
        getContainerStyles()
      )}
    >
      {/* 1. Header: Severity Badge, Category, Source, and Confidence */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <SeverityBadge severity={intervention.severity} size="sm" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {intervention.category.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {confLevel === "MEDIUM" && (
            <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
              Medium Conf
            </span>
          )}
          {confLevel === "LOW" && (
            <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
              Low Conf
            </span>
          )}
          <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            {intervention.source.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2. Title & Message */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug flex items-center space-x-1.5">
          {isCritical && <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />}
          <span>{intervention.title || intervention.category.replace(/_/g, " ")}</span>
        </h4>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          {intervention.exactMessage}
        </p>
      </div>

      {/* 3. Suggested Verbal Response Box (if present) */}
      {intervention.suggestedResponse && (
        <div className="rounded-md border border-slate-200 bg-white p-2.5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Suggested Verbal Response:</span>
            <button
              type="button"
              onClick={() => handleCopy(intervention.suggestedResponse!)}
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs font-medium text-slate-800 italic leading-relaxed">
            &ldquo;{intervention.suggestedResponse}&rdquo;
          </p>
        </div>
      )}

      {/* 4. Why this appeared / Context */}
      <div className="text-[11px] text-slate-600 leading-relaxed space-y-0.5">
        <span className="font-semibold text-slate-700 block">Why this appeared:</span>
        <p>{intervention.reason}</p>
      </div>

      {/* 5. Rule Citation / Authority */}
      {intervention.ruleCitation && (
        <div className="text-[10px] font-mono text-slate-600 bg-slate-100/90 px-2 py-1 rounded border border-slate-200">
          Authority: {intervention.ruleCitation}
        </div>
      )}

      {/* 6. Evidence-First Drawer (No chain-of-thought, strictly auditable facts) */}
      <div>
        <button
          type="button"
          onClick={() => {
            setShowEvidence(!showEvidence);
            if (!showEvidence && intervention.transcriptSegmentId && onHighlightEvidence) {
              onHighlightEvidence(intervention.transcriptSegmentId);
            }
          }}
          className="inline-flex items-center text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline decoration-slate-300 underline-offset-2"
        >
          <FileText className="h-3.5 w-3.5 mr-1 text-slate-500" />
          <span>{showEvidence ? "Hide Evidence" : "View Evidence"}</span>
          {showEvidence ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          )}
        </button>

        {showEvidence && (
          <div className="mt-2 rounded-md border border-slate-200 bg-white p-3 text-xs space-y-2 animate-in fade-in duration-150 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Evidence Record
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Detected Trigger:</span>
              <span className="text-slate-600 font-medium">{intervention.trigger}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Transcript Excerpt:</span>
              <div className="italic text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 font-serif leading-relaxed">
                &ldquo;{intervention.evidence || intervention.detectedEvidence}&rdquo;
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-700">Source: </span>
                <span>{intervention.source === "HYBRID" ? "Rule + contextual analysis" : intervention.source === "RULE" ? "Deterministic rule" : "AI contextual inference"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Confidence: </span>
                <span>{confLevel === "HIGH" ? "High (≥90%)" : confLevel === "MEDIUM" ? "Medium (60-89%)" : "Low (<60%)"}</span>
              </div>
            </div>
            {intervention.riskIfIncorrect && (
              <div className="text-[11px] text-red-700 pt-1 border-t border-red-100">
                <span className="font-semibold">Risk if unaddressed: </span>
                {intervention.riskIfIncorrect}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Action Buttons or Resolved Status Banner */}
      <div className="pt-2 border-t border-slate-100">
        {isResolved ? (
          <div className="flex flex-wrap items-center gap-2 py-1 text-xs font-semibold">
            {intervention.status === "accepted" && (
              <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                Recommendation Accepted
              </span>
            )}
            {intervention.status === "dismissed" && (
              <span className="inline-flex items-center text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                <XCircle className="h-4 w-4 mr-1.5 text-slate-400" />
                Dismissed: {intervention.dismissalReason || "Officer discretionary"}
              </span>
            )}
            {intervention.status === "escalated" && (
              <span className="inline-flex items-center text-red-800 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                <ArrowUpRight className="h-4 w-4 mr-1.5 text-red-600" />
                Escalated to Supervisor
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Use Suggested Response */}
            {intervention.suggestedResponse && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUseResponse}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Use Suggested Response
              </Button>
            )}

            {/* 2. Ask Question / Ask Clarifying Question */}
            {(intervention.availableActions.includes("ask_question")) &&
              !intervention.suggestedResponse && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAskQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ask Question
                </Button>
              )}

            {/* 3. Mark For Verification (Scenario 4) */}
            {intervention.availableActions.includes("mark_verification") && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkVerification}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1"
              >
                <BookmarkCheck className="h-3.5 w-3.5 mr-1" />
                <span>Mark For Verification</span>
              </Button>
            )}

            {/* 4. Mark For Review / Conflict Review (Scenario 6) */}
            {intervention.availableActions.includes("mark_review") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkReview}
                className="text-slate-700"
              >
                Mark For Review
              </Button>
            )}

            {/* 5. Create Follow-up Task (Scenario 8) */}
            {intervention.availableActions.includes("create_followup") && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateFollowup}
                className="bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1"
              >
                <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                <span>Create Follow-up</span>
              </Button>
            )}

            {/* 6. Escalate button (Mandatory for critical items) */}
            {(intervention.availableActions.includes("escalate") || intervention.requiresEscalation) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onAction(intervention.id, "escalate")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Escalate
              </Button>
            )}

            {/* 7. Dismiss button (Controlled for high/critical risks) */}
            {intervention.availableActions.includes("dismiss") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDismissInput(!showDismissInput)}
                className="text-slate-500 hover:text-slate-800"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}

        {/* Inline Dismissal Confirmation Modal / Input */}
        {showDismissInput && (
          <div className="mt-2.5 p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>
                {isCritical
                  ? "Explicit Confirmation & Rationale Required (Critical Risk)"
                  : "Dismissal Rationale (Compliance Audit Log)"}
              </span>
            </div>
            {isCritical && (
              <p className="text-[11px] text-red-700 font-medium">
                Warning: Dismissing a potential liability omission is recorded in the permanent institutional compliance audit trail.
              </p>
            )}
            <input
              type="text"
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="Provide reason for dismissal (e.g., verbal retraction issued, verified in prior doc)..."
              className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDismissInput(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!dismissReason.trim()}
                onClick={() => {
                  onAction(intervention.id, "dismiss", dismissReason);
                  setShowDismissInput(false);
                }}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Confirm Dismissal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
