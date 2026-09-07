import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  FileCheck,
  RotateCcw,
  ShieldAlert,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MeetingStatus, MeetingAttentionFlag } from "@/types";

type StatusType =
  | MeetingStatus
  | MeetingAttentionFlag
  | "complete"
  | "incomplete"
  | "partial"
  | "documented"
  | "pending"
  | "verified"
  | string;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  size?: "sm" | "md";
  showIcon?: boolean;
  pulse?: boolean;
}

export function StatusBadge({
  status,
  size = "sm",
  showIcon = true,
  pulse = false,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");

  // Determine label, styling, and icon
  let label = status.replace(/_/g, " ");
  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let icon: React.ReactNode = null;
  let shouldPulse = pulse;

  switch (normalized) {
    // Meeting Statuses
    case "in_progress":
    case "live":
      label = "In Progress";
      style = "bg-rose-50 text-rose-700 border-rose-200";
      icon = <PlayCircle className="h-3 w-3 text-rose-600" />;
      shouldPulse = true;
      break;

    case "in_preparation":
      label = "In Preparation";
      style = "bg-amber-50 text-amber-800 border-amber-200";
      icon = <Clock className="h-3 w-3 text-amber-600" />;
      break;

    case "upcoming":
    case "scheduled":
      label = "Upcoming";
      style = "bg-blue-50 text-blue-700 border-blue-200";
      icon = <Clock className="h-3 w-3 text-blue-600" />;
      break;

    case "completed":
      label = "Completed";
      style = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
      break;

    case "follow_up_required":
    case "follow_up_due":
      label = "Follow-up Due";
      style = "bg-orange-50 text-orange-700 border-orange-200";
      icon = <RotateCcw className="h-3 w-3 text-orange-600" />;
      break;

    // Attention / Priority Indicators
    case "missing_information":
      label = "Missing Information";
      style = "bg-amber-50 text-amber-800 border-amber-300";
      icon = <FileQuestion className="h-3 w-3 text-amber-600" />;
      break;

    case "compliance_review":
      label = "Compliance Review";
      style = "bg-red-50 text-red-700 border-red-200";
      icon = <ShieldAlert className="h-3 w-3 text-red-600" />;
      break;

    case "documentation_pending":
      label = "Documentation Pending";
      style = "bg-sky-50 text-sky-700 border-sky-200";
      icon = <FileCheck className="h-3 w-3 text-sky-600" />;
      break;

    // Completeness Indicators
    case "complete":
    case "verified":
    case "documented":
      label = "Complete";
      style = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
      break;

    case "partial":
      label = "Partial";
      style = "bg-amber-50 text-amber-700 border-amber-200";
      icon = <AlertCircle className="h-3 w-3 text-amber-600" />;
      break;

    case "incomplete":
    case "unverified":
      label = "Incomplete";
      style = "bg-rose-50 text-rose-700 border-rose-200";
      icon = <AlertCircle className="h-3 w-3 text-rose-600" />;
      break;

    default:
      label = status.replace(/_/g, " ");
      style = "bg-slate-100 text-slate-700 border-slate-200";
      icon = <Clock className="h-3 w-3 text-slate-500" />;
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1.5 rounded-md border font-medium tracking-tight whitespace-nowrap capitalize",
        sizeClasses,
        style,
        className
      )}
      {...props}
    >
      {shouldPulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}
