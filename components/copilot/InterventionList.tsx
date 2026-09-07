"use client";

import React, { useState } from "react";
import { Filter, ShieldCheck } from "lucide-react";
import { AIIntervention, AgentActionType } from "@/types";
import { InterventionCard } from "./InterventionCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface InterventionListProps {
  interventions: AIIntervention[];
  onAction: (
    interventionId: string,
    actionType: AgentActionType,
    rationale?: string
  ) => void;
  onHighlightEvidence?: (segmentId?: string) => void;
  onSelectQuestion?: (questionText: string) => void;
}

export function InterventionList({
  interventions,
  onAction,
  onHighlightEvidence,
  onSelectQuestion,
}: InterventionListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = interventions.filter((intv) => {
    if (filter === "all") return true;
    if (filter === "critical_high") {
      return intv.severity === "critical" || intv.severity === "high";
    }
    if (filter === "medium") return intv.severity === "medium";
    if (filter === "info") {
      return intv.severity === "info" || intv.severity === "low";
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-100 pb-2">
        <Filter className="h-3 w-3 text-slate-400 mr-1" />
        {[
          { id: "all", label: "All" },
          { id: "critical_high", label: "High & Critical" },
          { id: "medium", label: "Medium" },
          { id: "info", label: "Discovery" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors cursor-pointer ${
              filter === tab.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.length === 0 ? (
          <EmptyState
            title="All Clear & Compliant"
            description="No active regulatory warnings or discovery nudges for this filter."
            icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          />
        ) : (
          filtered.map((intv) => (
            <InterventionCard
              key={intv.id}
              intervention={intv}
              onAction={onAction}
              onHighlightEvidence={onHighlightEvidence}
              onSelectQuestion={onSelectQuestion}
            />
          ))
        )}
      </div>
    </div>
  );
}
