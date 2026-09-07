import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral";
  isPositiveTrend?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trendText,
  trendDirection,
  isPositiveTrend = true,
  icon,
  badge,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
        {badge}
      </div>

      <div className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
        {value}
      </div>

      {(subtitle || trendText) && (
        <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trendText && (
            <span
              className={cn(
                "inline-flex items-center text-[11px] font-medium ml-auto",
                trendDirection === "up" && (isPositiveTrend ? "text-emerald-700 font-semibold" : "text-rose-600"),
                trendDirection === "down" && (isPositiveTrend ? "text-emerald-700 font-semibold" : "text-slate-600"),
                trendDirection === "neutral" && "text-slate-500"
              )}
            >
              {trendDirection === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
              {trendDirection === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
              {trendDirection === "neutral" && <Minus className="h-3 w-3 mr-1" />}
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
