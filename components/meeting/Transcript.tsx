"use client";

import React, { useRef, useEffect, useState } from "react";
import { Volume2, Send, Sparkles } from "lucide-react";
import { TranscriptSegment, SpeakerRole } from "@/types";
import { TranscriptMessage } from "./TranscriptMessage";
import { Button } from "@/components/shared/Button";

interface TranscriptProps {
  segments: TranscriptSegment[];
  highlightedSegmentId?: string;
  onInjectTestScenario?: (text: string, speakerRole: SpeakerRole) => void;
  pendingQuestion?: string;
  onClearPendingQuestion?: () => void;
}

export function Transcript({
  segments,
  highlightedSegmentId,
  onInjectTestScenario,
  pendingQuestion,
  onClearPendingQuestion,
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customText, setCustomText] = useState("");
  const [selectedRole, setSelectedRole] = useState<SpeakerRole>("loan_officer");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments.length]);

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || !onInjectTestScenario) return;
    onInjectTestScenario(customText.trim(), selectedRole);
    setCustomText("");
  };

  const handleUsePendingQuestion = () => {
    if (pendingQuestion && onInjectTestScenario) {
      onInjectTestScenario(pendingQuestion, "loan_officer");
      if (onClearPendingQuestion) onClearPendingQuestion();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white shadow-xs">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Conversation Stream
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                Simulated
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Offline heuristic multi-party diarization
            </p>
          </div>
        </div>

        {/* Audio Visualizer Indicator */}
        <div className="flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center space-x-0.5" title="Simulated audio channel">
            {[45, 80, 50, 95, 30, 85, 60, 40].map((height, i) => (
              <span
                key={i}
                className="w-0.5 bg-emerald-600 rounded-full animate-pulse"
                style={{
                  height: `${height * 0.18}px`,
                  animationDelay: `${i * 110}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pending Question Prompt Banner from Copilot */}
      {pendingQuestion && (
        <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-150">
          <div className="text-xs text-blue-900 min-w-0">
            <span className="font-bold block text-[10px] uppercase text-blue-700">
              Copilot Question Queued:
            </span>
            <span className="italic truncate block">&ldquo;{pendingQuestion}&rdquo;</span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <Button
              size="sm"
              onClick={handleUsePendingQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-2.5"
            >
              Ask Now
            </Button>
            {onClearPendingQuestion && (
              <button
                type="button"
                onClick={onClearPendingQuestion}
                className="text-blue-500 hover:text-blue-800 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transcript Stream Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3"
      >
        {segments.map((segment) => (
          <TranscriptMessage
            key={segment.id}
            segment={segment}
            isHighlighted={highlightedSegmentId === segment.id}
          />
        ))}
      </div>

      {/* Testing Scenarios & Simulated Input Drawer */}
      {onInjectTestScenario && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-rose-600" />
              <span>Simulate Regulatory Scenarios:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Offline Test
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() =>
                onInjectTestScenario(
                  "Alex Vance: 'Don't worry, with your savings you are 100% approved in my book.'",
                  "loan_officer"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded-md bg-white hover:bg-red-50 hover:border-red-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
            >
              1. Informal Approval (TRID)
            </button>
            <button
              type="button"
              onClick={() =>
                onInjectTestScenario(
                  "Alex Vance: 'I can give you a rate of 5.875% right now.'",
                  "loan_officer"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded-md bg-white hover:bg-amber-50 hover:border-amber-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
            >
              2. Rate Quote without APR
            </button>
            <button
              type="button"
              onClick={() =>
                onInjectTestScenario(
                  "John Miller: 'Can we leave off my second car loan so our debt looks cleaner?'",
                  "primary_borrower"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded-md bg-white hover:bg-red-50 hover:border-red-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
            >
              3. Omit Debt (Fraud Risk)
            </button>
            <button
              type="button"
              onClick={() =>
                onInjectTestScenario(
                  "Sarah Miller: 'I have $20,000 in cash from a private contract last week.'",
                  "co_borrower"
                )
              }
              className="p-1.5 text-left border border-slate-200 rounded-md bg-white hover:bg-amber-50 hover:border-amber-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer"
            >
              4. Unverifiable Cash Income
            </button>
          </div>

          {/* Quick Custom Input */}
          <form onSubmit={handleSendCustom} className="flex items-center space-x-1.5 pt-1">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as SpeakerRole)}
              className="text-[10px] p-1 border border-slate-300 rounded bg-white font-medium text-slate-700"
            >
              <option value="loan_officer">Agent</option>
              <option value="primary_borrower">John</option>
              <option value="co_borrower">Sarah</option>
            </select>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Inject custom statement..."
              className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!customText.trim()}
              className="h-7 px-2 bg-slate-900 text-white"
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
