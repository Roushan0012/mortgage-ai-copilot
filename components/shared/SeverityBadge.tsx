import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InterventionSeverity } from "@/types";

interface SeverityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: InterventionSeverity;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function SeverityBadge({
  severity,
  size = "sm",
  showIcon = true,
  className,
  ...props
}: SeverityBadgeProps) {
  const norm = (severity || "low").toLowerCase();
  const configMap: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    critical: {
      label: "CRITICAL",
      style: "bg-red-50 text-red-700 border-red-300 font-bold ring-1 ring-red-200",
      icon: <ShieldAlert className="h-3.5 w-3.5 text-red-600 shrink-0" />,
    },
    high: {
      label: "HIGH PRIORITY",
      style: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />,
    },
    medium: {
      label: "MEDIUM",
      style: "bg-blue-50 text-blue-800 border-blue-200 font-medium",
      icon: <AlertCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />,
    },
    low: {
      label: "LOW",
      style: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
      icon: <Info className="h-3 w-3 text-slate-500 shrink-0" />,
    },
    info: {
      label: "INFO / NUDGE",
      style: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium",
      icon: <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />,
    },
  };

  const config = configMap[norm] || {
    label: String(severity).toUpperCase(),
    style: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
    icon: <Info className="h-3 w-3 text-slate-500 shrink-0" />,
  };

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1.5 rounded-md border uppercase tracking-wider",
        sizeClasses,
        config.style,
        className
      )}
      {...props}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
