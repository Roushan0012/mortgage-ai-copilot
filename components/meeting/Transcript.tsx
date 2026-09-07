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
  isSimulating?: boolean;
  onToggleSimulate?: () => void;
  onRestartSimulation?: () => void;
  simulationSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
  simulationStep?: number;
  totalSteps?: number;
  currentStepTag?: string;
}

export function Transcript({
  segments,
  highlightedSegmentId,
  onInjectTestScenario,
  pendingQuestion,
  onClearPendingQuestion,
  isSimulating = false,
  onToggleSimulate,
  onRestartSimulation,
  simulationSpeed = 1,
  onChangeSpeed,
  simulationStep = 0,
  totalSteps = 16,
  currentStepTag,
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customText, setCustomText] = useState("");
  const [selectedRole, setSelectedRole] = useState<SpeakerRole>("loan_officer");
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(true);

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
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white shadow-xs">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Conversation Stream
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                Simulated live transcript
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Offline multi-party diarization • 16-turn benchmark
            </p>
          </div>
        </div>

        {/* Audio Visualizer Indicator */}
        <div className="flex items-center space-x-1">
          <span className={`h-1.5 w-1.5 rounded-full ${isSimulating ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <div className="flex items-center space-x-0.5" title="Simulated audio channel">
            {[45, 80, 50, 95, 30, 85, 60, 40].map((height, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full ${isSimulating ? "bg-emerald-600 animate-pulse" : "bg-slate-300"}`}
                style={{
                  height: `${height * 0.18}px`,
                  animationDelay: `${i * 110}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="px-3 py-2 bg-slate-100/90 border-b border-slate-200 flex flex-col space-y-1.5 shrink-0 text-xs">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center space-x-1.5">
            {onToggleSimulate && (
              <button
                type="button"
                onClick={onToggleSimulate}
                className={`flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer shadow-xs ${
                  isSimulating
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : simulationStep >= totalSteps
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <span>
                  {isSimulating
                    ? "Pause Simulation"
                    : simulationStep >= totalSteps
                    ? "Replay Simulation"
                    : simulationStep === 0
                    ? "Start Simulation"
                    : "Resume Simulation"}
                </span>
              </button>
            )}

            {onRestartSimulation && (
              <button
                type="button"
                onClick={onRestartSimulation}
                title="Restart simulation from turn 1"
                className="px-2 py-1 text-[11px] font-medium rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              >
                Restart
              </button>
            )}

            {/* Speed Selector */}
            {onChangeSpeed && (
              <div className="flex items-center bg-white rounded border border-slate-300 text-[10px] font-medium overflow-hidden">
                {[0.5, 1, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => onChangeSpeed(speed)}
                    className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                      simulationSpeed === speed
                        ? "bg-slate-900 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step Count */}
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            Turn {simulationStep}/{totalSteps}
          </span>
        </div>

        {/* Current Step Description */}
        {currentStepTag && (
          <div className="text-[11px] text-slate-600 truncate flex items-center space-x-1">
            <span className="text-slate-400 font-semibold">Current:</span>
            <span className="font-medium text-slate-800">{currentStepTag}</span>
          </div>
        )}

        {/* Demo Scenario Dropdown Control */}
        {onInjectTestScenario && (
          <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1 shrink-0">
              <Sparkles className="h-3 w-3 text-rose-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Scenario:
              </span>
            </div>
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const scenarios: Record<string, { text: string; role: SpeakerRole }> = {
                    normal_discovery: {
                      text: "Alex Vance: 'Good morning John and Sarah! Let's review your target purchase timeline and goals.'",
                      role: "loan_officer",
                    },
                    informal_approval: {
                      text: "Alex Vance: 'Based on what you've told me, you should be approved for this mortgage.'",
                      role: "loan_officer",
                    },
                    indicative_rate: {
                      text: "Alex Vance: 'Regarding rates, we can probably get you a 6.1% rate for your 30-year fixed loan.'",
                      role: "loan_officer",
                    },
                    liability_omission: {
                      text: "Alex Vance: 'We could leave that car loan off for now to make your debt-to-income look cleaner.'",
                      role: "loan_officer",
                    },
                    unverifiable_income: {
                      text: "Sarah Miller: 'I make about $8,000 a month, but most of it isn't documented because a lot of clients pay through private cash contracts.'",
                      role: "co_borrower",
                    },
                    competitor_promise: {
                      text: "Alex Vance: 'Don't worry, we can definitely beat their offer and give you a better rate.'",
                      role: "loan_officer",
                    },
                    conflicting_information: {
                      text: "Sarah Miller: 'Wait John, that's not right. It's actually closer to $1,200 when you include my student loan and our credit cards!'",
                      role: "co_borrower",
                    },
                    missed_profiling_question: {
                      text: "Alex Vance: 'Besides the car and student loan payments we've discussed, are there any other recurring monthly financial obligations?'",
                      role: "loan_officer",
                    },
                    no_clear_next_action: {
                      text: "Alex Vance: 'Great, I'll let you know if anything comes up. Bye for now.'",
                      role: "loan_officer",
                    },
                  };
                  const match = scenarios[val];
                  if (match) {
                    onInjectTestScenario(match.text, match.role);
                  }
                  e.target.value = "";
                }
              }}
              title="DEMO CONTROL ONLY: Evaluator simulation trigger"
              className="flex-1 text-[11px] py-1 px-2 border border-slate-300 rounded bg-white text-slate-800 font-medium cursor-pointer shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="">Select Scenario (Demo Control)...</option>
              <option value="normal_discovery">Normal Discovery</option>
              <option value="informal_approval">Informal Approval</option>
              <option value="indicative_rate">Indicative Rate</option>
              <option value="liability_omission">Liability Omission</option>
              <option value="unverifiable_income">Unverifiable Income</option>
              <option value="competitor_promise">Competitor Promise</option>
              <option value="conflicting_information">Conflicting Information</option>
              <option value="missed_profiling_question">Missed Profiling Question</option>
              <option value="no_clear_next_action">No Clear Next Action</option>
            </select>
          </div>
        )}
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
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowScenarioDrawer(!showScenarioDrawer)}
              className="text-[11px] font-bold text-slate-800 flex items-center space-x-1 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-rose-600" />
              <span>10 Assessment Scenarios (1-Click Test):</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {showScenarioDrawer ? "▲ Hide" : "▼ Show"}
              </span>
            </button>
            <span className="text-[9px] text-slate-500 font-mono">
              Dual-Engine
            </span>
          </div>

          {showScenarioDrawer && (
            <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-0.5">
              {/* Scenario 1 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'Based on what you've told me, I think you'll definitely be approved.'",
                    "loan_officer"
                  )
                }
                title="Scenario 1: Informal approval statement without underwriting (TRID / 12 CFR § 1026.19)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-amber-50 hover:border-amber-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                1. Informal Approval (TRID)
              </button>

              {/* Scenario 2 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'Regarding rates, we can probably get you a 6.1% rate for your 30-year fixed loan.'",
                    "loan_officer"
                  )
                }
                title="Scenario 2: Indicative rate quote without APR / terms (TILA / 12 CFR § 1026.24)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-blue-50 hover:border-blue-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                2. Rate Without APR (TILA)
              </button>

              {/* Scenario 3 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'We could leave that car loan off for now to make your debt-to-income look cleaner.'",
                    "loan_officer"
                  )
                }
                title="Scenario 3: Potential liability omission (CRITICAL / Fannie Mae B3-6-01 / 18 U.S.C. § 1014)"
                className="p-1 text-left border border-red-200 rounded bg-red-50/50 hover:bg-red-100 text-[10px] text-red-900 font-semibold transition-colors cursor-pointer truncate"
              >
                3. Omit Debt (CRITICAL)
              </button>

              {/* Scenario 4 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Sarah Miller: 'I make about $8,000 a month, but most of it isn't documented because a lot of clients pay through private cash contracts.'",
                    "co_borrower"
                  )
                }
                title="Scenario 4: Undocumented cash income (CFPB ATR / 12 CFR § 1026.43)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-amber-50 hover:border-amber-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                4. Unverifiable Cash Income
              </button>

              {/* Scenario 5 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'Don't worry, we'll beat whatever rate the other lender gives you.'",
                    "loan_officer"
                  )
                }
                title="Scenario 5: Competitor beat promise (FTC Act Section 5 / UDAAP)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-amber-50 hover:border-amber-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                5. Competitor Promise (UDAAP)
              </button>

              {/* Scenario 6 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Sarah Miller: 'Wait John, that's not right. It's actually closer to $1,200 when you include my student loan and our credit cards!'",
                    "co_borrower"
                  )
                }
                title="Scenario 6: Conflicting borrower information ($500 vs $1,200 monthly debt)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-purple-50 hover:border-purple-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                6. Conflicted Debt ($500 vs $1.2k)
              </button>

              {/* Scenario 7 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'Besides the car and student loan payments we've discussed, are there any other recurring monthly financial obligations?'",
                    "loan_officer"
                  )
                }
                title="Scenario 7: Missed profiling question (recurring obligations inquiry)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-blue-50 hover:border-blue-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                7. Missing Profiling Check
              </button>

              {/* Scenario 8 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Alex Vance: 'Great, I'll let you know if anything comes up.'",
                    "loan_officer"
                  )
                }
                title="Scenario 8: Closing without confirmed next action"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-blue-50 hover:border-blue-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                8. Close Without Next Step
              </button>

              {/* Scenario 9 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "Sarah Miller: 'What's the difference between these mortgage options like a 30-year versus 15-year fixed for our $675,000 purchase with $85,000 down?'",
                    "co_borrower"
                  )
                }
                title="Scenario 9: Complex product explanation guidance (AI reasoning)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-emerald-50 hover:border-emerald-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                9. Product Guidance (30Y vs 15Y)
              </button>

              {/* Scenario 10 */}
              <button
                type="button"
                onClick={() =>
                  onInjectTestScenario(
                    "John Miller: 'Another lender said their process will be faster and that they can close in 14 days.'",
                    "primary_borrower"
                  )
                }
                title="Scenario 10: Customer objection turnaround speed (AI guidance)"
                className="p-1 text-left border border-slate-200 rounded bg-white hover:bg-emerald-50 hover:border-emerald-300 text-[10px] text-slate-700 font-medium transition-colors cursor-pointer truncate"
              >
                10. Objection (14-Day Close)
              </button>
            </div>
          )}

          {/* Quick Custom Input */}
          <form onSubmit={handleSendCustom} className="flex items-center space-x-1.5 pt-0.5">
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
            >
            </input>
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
