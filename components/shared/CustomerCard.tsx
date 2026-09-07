import React from "react";
import Link from "next/link";
import { Home, ArrowRight, ShieldCheck } from "lucide-react";
import { Customer } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "./Button";

interface CustomerCardProps {
  customer: Customer;
  className?: string;
}

export function CustomerCard({ customer, className }: CustomerCardProps) {
  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2">
            <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
              {primary.firstName[0]}
              {primary.lastName[0]}
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {primary.firstName} {primary.lastName}
              {coBorrower && ` & ${coBorrower.firstName} ${coBorrower.lastName}`}
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-semibold">
              FICO {primary.financialProfile.creditScoreFICO}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                Target: {formatCurrency(goal.targetPurchasePrice)} • {goal.desiredLoanType.toUpperCase()} 30Y
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Stage: {customer.stage.replace(/_/g, " ").toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link href={`/customer/${customer.id}`}>
            <Button size="sm" variant="outline" className="flex items-center space-x-1">
              <span>View Dossier</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
