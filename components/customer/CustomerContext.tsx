"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  HelpCircle,
  Home,
  DollarSign,
  PieChart,
  Check,
} from "lucide-react";
import { Customer, ExtractedFact } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

interface CustomerContextProps {
  customer: Customer;
  extractedFacts: ExtractedFact[];
  onVerifyFact?: (factId: string, verified: boolean) => void;
  onAskQuestion?: (question: string) => void;
}

export function CustomerContext({
  customer,
  extractedFacts,
  onVerifyFact,
  onAskQuestion,
}: CustomerContextProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "facts1003" | "calculator">("overview");

  // Local state for interactive open questions resolution
  const [openQuestions, setOpenQuestions] = useState<
    Array<{ id: string; question: string; answered: boolean; detail?: string }>
  >([
    {
      id: "oq_1",
      question: "Monthly car payment amount?",
      answered: false,
      detail: "John mentioned car payment, but exact monthly obligation is missing.",
    },
    {
      id: "oq_2",
      question: "Student loan monthly payment terms?",
      answered: false,
      detail: "Sarah has Mohela loan; check whether on standard 10-year or IBR plan.",
    },
    {
      id: "oq_3",
      question: "Down payment seasoning & source?",
      answered: false,
      detail: "Confirm whether $85,000 is 100% seasoned borrower funds or includes gift.",
    },
  ]);

  const toggleQuestionAnswered = (id: string) => {
    setOpenQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answered: !q.answered } : q))
    );
  };

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  const totalMonthlyIncome =
    primary.financialProfile.grossMonthlyIncome +
    (coBorrower ? coBorrower.financialProfile.grossMonthlyIncome : 0);

  const totalMonthlyDebts =
    primary.financialProfile.totalMonthlyLiabilities +
    (coBorrower ? coBorrower.financialProfile.totalMonthlyLiabilities : 0);

  return (
    <div className="flex flex-col h-full bg-slate-50/70 overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">
            {primary.firstName} & {coBorrower?.firstName} {primary.lastName}
          </h2>
          <p className="text-[10px] text-slate-500">
            {goal.targetPropertyType.replace(/_/g, " ")} • {goal.purpose.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center space-x-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Context
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("facts1003")}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              activeTab === "facts1003"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1003 Facts ({extractedFacts.filter((f) => f.verifiedByOfficer).length}/{extractedFacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
              activeTab === "calculator"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            PITI Matrix
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* TAB 1: CONTEXT & STRUCTURED INFORMATION */}
        {activeTab === "overview" && (
          <div className="space-y-3.5">
            {/* Information Completeness Matrix */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <PieChart className="h-3.5 w-3.5 text-slate-600" />
                  <span>Information Completeness</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-normal">
                  Fannie Mae 1003
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">Income</span>
                  <StatusBadge status="complete" size="sm" />
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">Employment</span>
                  <StatusBadge status="complete" size="sm" />
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">Liabilities</span>
                  <StatusBadge status="partial" size="sm" />
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] text-slate-500 font-medium">Documents</span>
                  <StatusBadge status="incomplete" size="sm" />
                </div>
              </div>
            </div>

            {/* Financial Profile Summary */}
            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs flex items-center space-x-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Financial Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Employment</span>
                  <span className="font-medium text-slate-900 text-right">
                    John (W-2 Apex Cloud) • Sarah (Self-Employed)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Monthly Income</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(totalMonthlyIncome)}/mo
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Monthly Liabilities</span>
                  <span className="font-medium text-slate-900 font-mono">
                    {formatCurrency(totalMonthlyDebts)}/mo
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Down Payment</span>
                  <span className="font-medium text-slate-900 font-mono">
                    {formatCurrency(goal.targetDownPaymentAmount)} ({goal.targetDownPaymentPercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Score Status</span>
                  <span className="font-semibold text-emerald-700">
                    FICO 742 / 718 (Verified Soft Pull)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Mortgage Goal Summary */}
            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs flex items-center space-x-1.5">
                  <Home className="h-3.5 w-3.5 text-blue-600" />
                  <span>Mortgage Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Purchase Timeline</span>
                  <span className="font-semibold text-slate-900">
                    {goal.targetClosingTimelineWeeks} Weeks (Target Purchase: 2–4 weeks)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Property Type</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {goal.targetPropertyType.replace(/_/g, " ")} (South Austin)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Budget</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(goal.targetPurchasePrice)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Open Questions Panel */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center space-x-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
                  <span>Open Clarification Questions</span>
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  {openQuestions.filter((q) => !q.answered).length} Unresolved
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {openQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-2 rounded bg-white border border-amber-200 flex items-start justify-between space-x-2"
                  >
                    <div className="flex items-start space-x-2 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleQuestionAnswered(q.id)}
                        className="mt-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={q.answered ? "Mark unaddressed" : "Mark resolved"}
                      >
                        {q.answered ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded border border-slate-300" />
                        )}
                      </button>
                      <div>
                        <div
                          className={`font-semibold text-slate-900 ${
                            q.answered ? "line-through text-slate-400" : ""
                          }`}
                        >
                          • {q.question}
                        </div>
                        {q.detail && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {q.detail}
                          </p>
                        )}
                      </div>
                    </div>

                    {!q.answered && onAskQuestion && (
                      <button
                        type="button"
                        onClick={() => onAskQuestion(q.question)}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer"
                      >
                        Ask
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXTRACTED FORM 1003 FACTS */}
        {activeTab === "facts1003" && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-500 mb-1">
              Facts extracted automatically from verbal meeting cues. Loan officer validation updates the Fannie Mae Form 1003 ledger.
            </div>

            {extractedFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between space-x-3 shadow-xs"
              >
                <div className="flex items-start space-x-2.5">
                  {onVerifyFact && (
                    <button
                      type="button"
                      onClick={() => onVerifyFact(fact.id, !fact.verifiedByOfficer)}
                      className="mt-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {fact.verifiedByOfficer ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {fact.fieldName}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Captured: <span className="font-mono font-bold text-slate-900">{fact.rawValue}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {fact.form1003Section} • Confidence {(fact.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <StatusBadge
                  status={fact.verifiedByOfficer ? "verified" : "pending"}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PITI QUALIFICATION MATRIX */}
        {activeTab === "calculator" && (
          <Card>
            <CardHeader className="py-2.5 bg-slate-50/50">
              <CardTitle className="text-xs">Scenario & Monthly Housing Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-xs space-y-3">
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Purchase Price</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(goal.targetPurchasePrice)}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Down Payment</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(goal.targetDownPaymentAmount)} (14.5%)
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Loan Amount</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(goal.targetLoanAmount)}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">LTV / Equity</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    85.47% (Requires PMI)
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Principal & Interest (6.25% 30Y Fixed):</span>
                  <span className="font-mono font-semibold text-slate-900">$3,078.60</span>
                </div>
                <div className="flex justify-between">
                  <span>Travis County Property Taxes (1.85%):</span>
                  <span className="font-mono font-semibold text-slate-900">$901.88</span>
                </div>
                <div className="flex justify-between">
                  <span>Hazard / Homeowners Insurance:</span>
                  <span className="font-mono font-semibold text-slate-900">$135.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Private Mortgage Insurance (PMI):</span>
                  <span className="font-mono font-semibold text-slate-900">$125.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                  <span>Total Housing PITI:</span>
                  <span className="text-emerald-700 font-mono">$4,240.48/mo</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Qualifying Front-End DTI:</span>
                  <span className="font-semibold text-emerald-700">21.8% (Benchmark &le; 28%)</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Qualifying Back-End DTI:</span>
                  <span className="font-semibold text-emerald-700">29.2% (Benchmark &le; 43%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
