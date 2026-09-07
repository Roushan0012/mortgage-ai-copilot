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
    const qText =
      intervention.suggestedResponse || intervention.exactMessage;
    if (onSelectQuestion) {
      onSelectQuestion(qText);
    }
  };

  // Border and background based on severity
  const getContainerStyles = () => {
    if (isResolved) {
      return "border-slate-200 bg-slate-50/75 opacity-80";
    }

    switch (intervention.severity) {
      case "critical":
        return "border-red-400 bg-red-50/30 ring-1 ring-red-300/80 shadow-xs";
      case "high":
        return "border-amber-400 bg-amber-50/25 ring-1 ring-amber-200 shadow-xs";
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

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all text-left space-y-3 relative",
        getContainerStyles()
      )}
    >
      {/* 1. Header: Severity Badge, Category & Source */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <SeverityBadge severity={intervention.severity} size="sm" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {intervention.category.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono font-medium text-slate-400">
            {(intervention.confidence * 100).toFixed(0)}% CONF
          </span>
          <span className="text-[10px] text-slate-300">|</span>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            {intervention.source === "deterministic_rule" ? "RULE" : "AI"}
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug">
          {intervention.title || intervention.category.replace(/_/g, " ")}
        </h4>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          {intervention.exactMessage}
        </p>
      </div>

      {/* 3. Suggested Response Box (if present) */}
      {intervention.suggestedResponse && (
        <div className="rounded-md border border-slate-200 bg-white p-2.5 space-y-1">
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

      {/* 5. Rule Citation Pill (if present) */}
      {intervention.ruleCitation && (
        <div className="text-[10px] font-mono text-slate-600 bg-slate-100/90 px-2 py-1 rounded border border-slate-200">
          Authority: {intervention.ruleCitation}
        </div>
      )}

      {/* 6. Expandable Evidence Drawer */}
      <div>
        <button
          type="button"
          onClick={() => {
            setShowEvidence(!showEvidence);
            if (!showEvidence && intervention.transcriptSegmentId && onHighlightEvidence) {
              onHighlightEvidence(intervention.transcriptSegmentId);
            }
          }}
          className="inline-flex items-center text-[11px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" />
          <span>{showEvidence ? "Hide Evidence" : "View Evidence"}</span>
          {showEvidence ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          )}
        </button>

        {showEvidence && (
          <div className="mt-2 rounded border border-slate-200 bg-white p-3 text-xs space-y-1.5 animate-in fade-in duration-150">
            <div>
              <span className="font-semibold text-slate-700">Detected Trigger: </span>
              <span className="text-slate-600">{intervention.trigger}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Transcript Evidence: </span>
              <span className="italic text-slate-800 font-medium">
                &ldquo;{intervention.evidence || intervention.detectedEvidence}&rdquo;
              </span>
            </div>
            {intervention.riskIfIncorrect && (
              <div className="text-[11px] text-red-700 pt-1 border-t border-slate-100">
                <span className="font-semibold">Risk if unaddressed: </span>
                {intervention.riskIfIncorrect}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Action Button Deck or Resolved Status Banner */}
      <div className="pt-2 border-t border-slate-100">
        {isResolved ? (
          <div className="flex items-center space-x-2 py-1 text-xs font-semibold">
            {intervention.status === "accepted" && (
              <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                Recommendation Accepted
              </span>
            )}
            {intervention.status === "dismissed" && (
              <span className="inline-flex items-center text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                <XCircle className="h-4 w-4 mr-1.5 text-slate-400" />
                Dismissed by Officer
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
            {/* Primary Suggested Response / Accept */}
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

            {/* Ask Question */}
            {intervention.availableActions.includes("ask_question") &&
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

            {/* Accept (if no suggested response) */}
            {intervention.availableActions.includes("accept") &&
              !intervention.suggestedResponse && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAction(intervention.id, "accept")}
                >
                  Accept
                </Button>
              )}

            {/* Escalate button */}
            {intervention.availableActions.includes("escalate") && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onAction(intervention.id, "escalate")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Escalate
              </Button>
            )}

            {/* Dismiss button */}
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

        {/* Inline Dismissal Reason Input */}
        {showDismissInput && (
          <div className="mt-2.5 p-2.5 rounded bg-slate-100 border border-slate-200 text-xs space-y-2">
            <label className="block text-[11px] font-semibold text-slate-700">
              Dismissal Rationale (Required for Compliance Audit Log):
            </label>
            <input
              type="text"
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. Addressed earlier in conversation..."
              className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
            />
            <div className="flex justify-end space-x-1.5">
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
