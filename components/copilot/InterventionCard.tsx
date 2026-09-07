"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
} from "lucide-react";
import { AIIntervention, AgentActionType } from "@/types";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

interface InterventionCardProps {
  intervention: AIIntervention;
  onAction: (interventionId: string, actionType: AgentActionType, rationale?: string) => void;
  onHighlightEvidence?: (segmentId?: string) => void;
}

export function InterventionCard({
  intervention,
  onAction,
  onHighlightEvidence,
}: InterventionCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissRationale, setDismissRationale] = useState("");

  const isResolved = intervention.status !== "pending";

  const getCardIcon = () => {
    switch (intervention.interventionType) {
      case "compliance_violation":
        return <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />;
      default:
        return <Lightbulb className="h-4 w-4 text-slate-700 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    if (isResolved) return "border-slate-200 bg-slate-50/70 opacity-75";
    switch (intervention.severity) {
      case "critical":
        return "border-red-300 bg-red-50/30 ring-1 ring-red-200";
      case "high":
        return "border-amber-300 bg-amber-50/20";
      case "medium":
        return "border-blue-200 bg-blue-50/20";
      case "low":
        return "border-slate-200 bg-white";
      case "info":
        return "border-emerald-200 bg-emerald-50/20";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3.5 transition-all text-left shadow-xs",
        getBorderColor()
      )}
    >
      {/* Top row: Category, Severity, Source */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5">
          {getCardIcon()}
          <span className="text-[11px] font-semibold text-slate-900 capitalize">
            {intervention.category.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Badge severity={intervention.severity} size="sm">
            {intervention.severity}
          </Badge>
          <span className="text-[10px] text-slate-400 font-mono">
            {intervention.source === "deterministic_rule" ? "RULE" : "AI"}
          </span>
        </div>
      </div>

      {/* Main Message */}
      <p className="text-xs font-medium text-slate-900 leading-snug mb-2">
        {intervention.exactMessage}
      </p>

      {/* Reason / Regulatory Context */}
      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
        {intervention.reason}
      </p>

      {/* Trigger & Rule Citation Preview */}
      {intervention.ruleCitation && (
        <div className="text-[10px] text-slate-500 bg-slate-100/80 px-2 py-1 rounded mb-3 font-mono">
          Citation: {intervention.ruleCitation}
        </div>
      )}

      {/* Expandable Evidence Drawer */}
      {showEvidence && (
        <div className="rounded border border-slate-200 bg-white p-2.5 mb-3 text-[11px] space-y-1.5">
          <div>
            <span className="font-semibold text-slate-700">Detected Trigger: </span>
            <span className="text-slate-600">{intervention.trigger}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Transcript Evidence: </span>
            <span className="italic text-slate-600">&ldquo;{intervention.detectedEvidence}&rdquo;</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Risk if unaddressed: </span>
            <span className="text-red-700">{intervention.riskIfIncorrect}</span>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setShowEvidence(!showEvidence);
            if (!showEvidence && intervention.transcriptSegmentId && onHighlightEvidence) {
              onHighlightEvidence(intervention.transcriptSegmentId);
            }
          }}
          className="inline-flex items-center text-[10px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
        >
          <FileText className="h-3 w-3 mr-1" />
          {showEvidence ? "Hide Evidence" : "View Evidence"}
          {showEvidence ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
        </button>

        {isResolved ? (
          <span className="text-[11px] font-medium text-slate-500 capitalize flex items-center">
            {intervention.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1" />}
            {intervention.status === "dismissed" && <XCircle className="h-3.5 w-3.5 text-slate-400 mr-1" />}
            {intervention.status === "escalated" && <ArrowUpRight className="h-3.5 w-3.5 text-amber-600 mr-1" />}
            Status: {intervention.status}
          </span>
        ) : (
          <div className="flex items-center space-x-1.5">
            {/* Ask Question / Insert */}
            {intervention.availableActions.includes("ask_question") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(intervention.id, "ask_question")}
              >
                Ask Nudge
              </Button>
            )}

            {/* Escalate (if required or high) */}
            {intervention.availableActions.includes("escalate") && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onAction(intervention.id, "escalate")}
              >
                Escalate
              </Button>
            )}

            {/* Accept */}
            {intervention.availableActions.includes("accept") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAction(intervention.id, "accept")}
              >
                Accept
              </Button>
            )}

            {/* Dismiss */}
            {intervention.availableActions.includes("dismiss") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDismissModal(true)}
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dismissal Rationale Prompt */}
      {showDismissModal && (
        <div className="mt-2.5 p-2 rounded bg-slate-100 border border-slate-200">
          <label className="block text-[10px] font-semibold text-slate-700 mb-1">
            Reason for Dismissal (Required for Compliance Audit):
          </label>
          <input
            type="text"
            value={dismissRationale}
            onChange={(e) => setDismissRationale(e.target.value)}
            placeholder="e.g. Already clarified in previous statement..."
            className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white mb-2"
          />
          <div className="flex justify-end space-x-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDismissModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!dismissRationale.trim()}
              onClick={() => {
                onAction(intervention.id, "dismiss", dismissRationale);
                setShowDismissModal(false);
              }}
            >
              Confirm Dismissal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
