"use client";

import React, { useState } from "react";
import { ShieldCheck, Sparkles, Filter } from "lucide-react";
import { AIIntervention, AgentActionType } from "@/types";
import { InterventionCard } from "./InterventionCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface CopilotPanelProps {
  interventions: AIIntervention[];
  onAction: (interventionId: string, actionType: AgentActionType, rationale?: string) => void;
  onHighlightEvidence?: (segmentId?: string) => void;
}

export function CopilotPanel({
  interventions,
  onAction,
  onHighlightEvidence,
}: CopilotPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filtered = interventions.filter((intv) => {
    if (filterSeverity === "all") return true;
    if (filterSeverity === "critical_high") return intv.severity === "critical" || intv.severity === "high";
    return intv.severity === filterSeverity;
  });

  const pendingCount = interventions.filter((i) => i.status === "pending").length;
  const criticalCount = interventions.filter((i) => i.severity === "critical" && i.status === "pending").length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">DARWIX AI COPILOT</h2>
              <p className="text-[10px] text-slate-500">Real-time Advisory & Compliance</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                {criticalCount} Critical
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
              {pendingCount} Active
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 pt-1">
          <Filter className="h-3 w-3 text-slate-400 mr-1" />
          {[
            { id: "all", label: "All" },
            { id: "critical_high", label: "High & Critical" },
            { id: "medium", label: "Medium" },
            { id: "info", label: "Discovery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer ${
                filterSeverity === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interventions Stack */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="All Clear & Compliant"
            description="No active regulatory warnings or pending discovery nudges for the current filter."
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          />
        ) : (
          filtered.map((intervention) => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              onAction={onAction}
              onHighlightEvidence={onHighlightEvidence}
            />
          ))
        )}
      </div>
    </div>
  );
}
