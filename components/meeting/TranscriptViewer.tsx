"use client";

import React, { useRef, useEffect } from "react";
import { User, Volume2 } from "lucide-react";
import { TranscriptSegment, SpeakerRole } from "@/types";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  highlightedSegmentId?: string;
  onInjectTestScenario?: (text: string, speakerRole: SpeakerRole) => void;
}

export function TranscriptViewer({
  segments,
  highlightedSegmentId,
  onInjectTestScenario,
}: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments.length]);

  const getSpeakerBadge = (role: SpeakerRole) => {
    switch (role) {
      case "loan_officer":
        return <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Loan Officer</span>;
      case "primary_borrower":
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Primary Borrower</span>;
      case "co_borrower":
        return <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Co-Borrower</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">System</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Transcript Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-700">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Conversation</h2>
            <p className="text-[10px] text-slate-500">Dual-Channel Audio Stream Active</p>
          </div>
        </div>

        {/* Audio Visualizer Simulator */}
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center space-x-0.5">
            {[40, 75, 55, 90, 30, 80, 60, 45].map((height, i) => (
              <span
                key={i}
                className="w-0.5 bg-emerald-600 rounded-full animate-pulse"
                style={{ height: `${height * 0.18}px`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Transcript Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {segments.map((segment) => {
          const isHighlighted = highlightedSegmentId === segment.id;
          const isFlagged = segment.isComplianceFlagged;

          return (
            <div
              key={segment.id}
              id={`segment-${segment.id}`}
              className={cn(
                "p-3 rounded-lg border transition-all text-left",
                isHighlighted
                  ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-200"
                  : isFlagged
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-slate-100 bg-white hover:bg-slate-50/50"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-900">{segment.speakerName}</span>
                  {getSpeakerBadge(segment.speakerRole)}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{segment.timestamp}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">{segment.text}</p>
              {isFlagged && segment.highlightCategory && (
                <div className="mt-1.5 text-[10px] text-amber-700 font-medium">
                  Trigger: {segment.highlightCategory.replace(/_/g, " ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulation / Testing Action Drawer */}
      {onInjectTestScenario && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700">Simulate Live Regulatory Scenarios:</span>
            <span className="text-[10px] text-slate-400 font-mono">Test Ingestion</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() =>
                onInjectTestScenario(
                  "Alex Vance: 'Don't worry, you are 100% approved in my book.'",
                  "loan_officer"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded bg-white hover:bg-red-50 hover:border-red-200 text-[10px] text-slate-700 cursor-pointer"
            >
              1. Informal Approval (TRID)
            </button>
            <button
              onClick={() =>
                onInjectTestScenario(
                  "Alex Vance: 'I can give you a rate of 5.875% right now.'",
                  "loan_officer"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded bg-white hover:bg-amber-50 hover:border-amber-200 text-[10px] text-slate-700 cursor-pointer"
            >
              2. Rate Quote without APR
            </button>
            <button
              onClick={() =>
                onInjectTestScenario(
                  "John Miller: 'Can we leave off my second car loan to look cleaner?'",
                  "primary_borrower"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded bg-white hover:bg-red-50 hover:border-red-200 text-[10px] text-slate-700 cursor-pointer"
            >
              3. Omit Debt (Fraud Risk)
            </button>
            <button
              onClick={() =>
                onInjectTestScenario(
                  "Sarah Miller: 'I have $20,000 in cash from a cash job last week.'",
                  "co_borrower"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded bg-white hover:bg-amber-50 hover:border-amber-200 text-[10px] text-slate-700 cursor-pointer"
            >
              4. Unverifiable Cash Income
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
