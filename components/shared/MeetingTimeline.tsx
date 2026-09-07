import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgendaStep {
  stepNumber: number;
  title: string;
  description?: string;
  status: "completed" | "active" | "upcoming";
}

interface MeetingTimelineProps {
  steps?: AgendaStep[];
  className?: string;
}

export const defaultConversationPlan: AgendaStep[] = [
  {
    stepNumber: 1,
    title: "Confirm purchase timeline",
    description: "Validate target closing within 2–4 weeks and contract readiness.",
    status: "completed",
  },
  {
    stepNumber: 2,
    title: "Understand employment / income",
    description: "Explore W-2 base salary and verify self-employed Schedule C requirements.",
    status: "completed",
  },
  {
    stepNumber: 3,
    title: "Review monthly obligations",
    description: "Examine auto loan, student loans, and ensure mandatory lease disclosure.",
    status: "active",
  },
  {
    stepNumber: 4,
    title: "Discuss affordability & target budget",
    description: "Confirm target $585,000 purchase price and $85,000 down payment source.",
    status: "upcoming",
  },
  {
    stepNumber: 5,
    title: "Explain mortgage options & APR",
    description: "Present 30Y conventional fixed scenario with oral APR and fee breakdown.",
    status: "upcoming",
  },
  {
    stepNumber: 6,
    title: "Confirm documentation requirements",
    description: "Detail 2-year 1040s for self-employment and 60-day asset statements.",
    status: "upcoming",
  },
  {
    stepNumber: 7,
    title: "Agree on next step & issuance",
    description: "Queue conditional pre-qualification letter and schedule follow-up check-in.",
    status: "upcoming",
  },
];

export function MeetingTimeline({
  steps = defaultConversationPlan,
  className,
}: MeetingTimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const isDone = step.status === "completed";
          const isActive = step.status === "active";

          return (
            <div key={step.stepNumber} className="relative group text-left">
              {/* Dot / Check Icon */}
              <div
                className={cn(
                  "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold transition-colors",
                  isDone && "text-emerald-600 ring-2 ring-emerald-500",
                  isActive && "text-blue-700 ring-2 ring-blue-600 animate-pulse",
                  !isDone && !isActive && "text-slate-400 ring-1 ring-slate-300"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px]">{step.stepNumber}</span>
                )}
              </div>

              {/* Text */}
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h4
                    className={cn(
                      "text-xs font-semibold leading-snug",
                      isActive
                        ? "text-blue-900 font-bold"
                        : isDone
                        ? "text-slate-700"
                        : "text-slate-500"
                    )}
                  >
                    {step.stepNumber}. {step.title}
                  </h4>
                  {isActive && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                      Current Topic
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
