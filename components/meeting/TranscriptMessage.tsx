"use client";

import React from "react";
import { User, Copy, Check } from "lucide-react";
import { TranscriptSegment, SpeakerRole } from "@/types";
import { cn } from "@/lib/utils";

interface TranscriptMessageProps {
  segment: TranscriptSegment;
  isHighlighted?: boolean;
}

export function TranscriptMessage({
  segment,
  isHighlighted = false,
}: TranscriptMessageProps) {
  const [copied, setCopied] = React.useState(false);

  const getSpeakerBadge = (role: SpeakerRole) => {
    switch (role) {
      case "loan_officer":
        return (
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
            Loan Officer
          </span>
        );
      case "primary_borrower":
        return (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
            Borrower
          </span>
        );
      case "co_borrower":
        return (
          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
            Co-Borrower
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
            System
          </span>
        );
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(segment.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id={`segment-${segment.id}`}
      className={cn(
        "p-3 rounded-lg border transition-all text-left relative group",
        isHighlighted
          ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-300 shadow-xs"
          : segment.isComplianceFlagged
          ? "border-amber-300 bg-amber-50/25"
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-900">
            {segment.speakerName}
          </span>
          {getSpeakerBadge(segment.speakerRole)}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 p-0.5"
            title="Copy statement"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            {segment.timestamp}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-800 leading-relaxed font-sans">
        {segment.text}
      </p>

      {segment.isComplianceFlagged && segment.highlightCategory && (
        <div className="mt-2 inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-300/80 px-2 py-0.5 rounded">
          <span>Detected: {segment.highlightCategory.replace(/_/g, " ")}</span>
        </div>
      )}
    </div>
  );
}
