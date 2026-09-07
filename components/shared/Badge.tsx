import React from "react";
import { cn } from "@/lib/utils";
import { InterventionSeverity } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary";
  severity?: InterventionSeverity;
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  severity,
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  if (severity) {
    const norm = severity.toLowerCase();
    const severityStyles: Record<string, string> = {
      critical: "bg-red-50 text-red-700 border-red-200 border",
      high: "bg-amber-50 text-amber-800 border-amber-200 border",
      medium: "bg-blue-50 text-blue-700 border-blue-200 border",
      low: "bg-slate-100 text-slate-700 border-slate-200 border",
      info: "bg-emerald-50 text-emerald-700 border-emerald-200 border",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md font-medium tracking-wide uppercase text-[10px]",
          sizeClasses,
          severityStyles[norm] || severityStyles.low,
          className
        )}
        {...props}
      >
        {children || severity}
      </span>
    );
  }

  const variantStyles = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-800",
    outline: "border border-slate-300 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        sizeClasses,
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
