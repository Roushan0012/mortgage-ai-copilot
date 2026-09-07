"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { AIIntervention, AgentActionType } from "@/types";
import { InterventionList } from "./InterventionList";

interface CopilotPanelProps {
  interventions: AIIntervention[];
  onAction: (
    interventionId: string,
    actionType: AgentActionType,
    rationale?: string
  ) => void;
  onHighlightEvidence?: (segmentId?: string) => void;
  onSelectQuestion?: (questionText: string) => void;
}

export function CopilotPanel({
  interventions,
  onAction,
  onHighlightEvidence,
  onSelectQuestion,
}: CopilotPanelProps) {
  const pendingCount = interventions.filter((i) => i.status === "pending").length;
  const criticalCount = interventions.filter(
    (i) => (i.severity === "critical" || i.severity === "high") && i.status === "pending"
  ).length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                DARWIX AI COPILOT
              </h2>
              <p className="text-[10px] text-slate-500">Real-Time Advisory & Compliance</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                {criticalCount} Critical / High
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
              {pendingCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* Intervention List Deck */}
      <div className="flex-1 overflow-y-auto p-3.5">
        <InterventionList
          interventions={interventions}
          onAction={onAction}
          onHighlightEvidence={onHighlightEvidence}
          onSelectQuestion={onSelectQuestion}
        />
      </div>
    </div>
  );
}
