"use client";

import React, { useState } from "react";
import {
  User,
  CheckSquare,
  Square,
  Briefcase,
} from "lucide-react";
import { Customer, ExtractedFact } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

interface CustomerContextPanelProps {
  customer: Customer;
  extractedFacts: ExtractedFact[];
  onVerifyFact: (factId: string, verified: boolean) => void;
}

export function CustomerContextPanel({
  customer,
  extractedFacts,
  onVerifyFact,
}: CustomerContextPanelProps) {
  const [activeTab, setActiveTab] = useState<"dossier" | "facts1003" | "calculator">("dossier");

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
    <div className="flex flex-col h-full bg-slate-50/60 overflow-y-auto">
      {/* Center Header Tabs */}
      <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">
            {primary.firstName} & {coBorrower?.firstName} {primary.lastName}
          </h2>
          <p className="text-[10px] text-slate-500">
            {goal.targetPropertyType.replace(/_/g, " ")} • {goal.purpose.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center space-x-1 border border-slate-200 rounded p-0.5 bg-slate-50">
          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-2 py-1 text-[11px] font-medium rounded cursor-pointer ${
              activeTab === "dossier" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Borrower Profile
          </button>
          <button
            onClick={() => setActiveTab("facts1003")}
            className={`px-2 py-1 text-[11px] font-medium rounded cursor-pointer ${
              activeTab === "facts1003" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1003 Facts ({extractedFacts.filter((f) => f.verifiedByOfficer).length}/{extractedFacts.length})
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-2 py-1 text-[11px] font-medium rounded cursor-pointer ${
              activeTab === "calculator" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Scenario Matrix
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TAB 1: DOSSIER */}
        {activeTab === "dossier" && (
          <div className="space-y-4">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-medium">Combined Income</div>
                <div className="text-xs font-bold text-slate-900">{formatCurrency(totalMonthlyIncome)}/mo</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-medium">Monthly Debts</div>
                <div className="text-xs font-bold text-slate-900">{formatCurrency(totalMonthlyDebts)}/mo</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-medium">Est. Back-End DTI</div>
                <div className="text-xs font-bold text-emerald-700">34.2% (Qualifying)</div>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-medium">Liquid Reserves</div>
                <div className="text-xs font-bold text-slate-900">
                  {formatCurrency(primary.financialProfile.totalLiquidAssets + (coBorrower?.financialProfile.totalLiquidAssets || 0))}
                </div>
              </div>
            </div>

            {/* Primary Borrower Card */}
            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <CardTitle>Primary: {primary.firstName} {primary.lastName}</CardTitle>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  FICO {primary.financialProfile.creditScoreFICO} ({primary.financialProfile.creditTier.toUpperCase()})
                </span>
              </CardHeader>
              <CardContent className="py-3 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1 text-slate-400" /> Employer
                  </span>
                  <span className="font-medium text-slate-900">
                    {primary.employmentHistory[0]?.employerName} ({primary.employmentHistory[0]?.jobTitle})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Employment Type</span>
                  <span className="font-medium text-slate-900">W-2 Full Time ({primary.employmentHistory[0]?.yearsOnJob} yrs)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Base Salary</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(primary.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Debts</span>
                  <span className="font-medium text-slate-900">
                    Auto Loan ({formatCurrency(480)}), Credit Card ({formatCurrency(340)})
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Co-Borrower Card */}
            {coBorrower && (
              <Card>
                <CardHeader className="py-2.5 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <CardTitle>Co-Borrower: {coBorrower.firstName} {coBorrower.lastName}</CardTitle>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    FICO {coBorrower.financialProfile.creditScoreFICO} ({coBorrower.financialProfile.creditTier.toUpperCase()})
                  </span>
                </CardHeader>
                <CardContent className="py-3 text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 flex items-center">
                      <Briefcase className="h-3.5 w-3.5 mr-1 text-slate-400" /> Business
                    </span>
                    <span className="font-medium text-slate-900">
                      {coBorrower.employmentHistory[0]?.employerName} ({coBorrower.employmentHistory[0]?.jobTitle})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Employment Type</span>
                    <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                      Self-Employed (2-Yr Tax Returns Required)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Schedule C Qualifying Avg</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(coBorrower.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Debts</span>
                    <span className="font-medium text-slate-900">
                      BMW Lease ({formatCurrency(420)}), Student Loan ({formatCurrency(200)})
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: 1003 FACT EXTRACTION LEDGER */}
        {activeTab === "facts1003" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Verified facts are synchronized directly to Encompass LOS Form 1003.</span>
            </div>
            {extractedFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between space-x-3 shadow-xs"
              >
                <div className="flex items-start space-x-2.5">
                  <button
                    type="button"
                    onClick={() => onVerifyFact(fact.id, !fact.verifiedByOfficer)}
                    className="mt-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {fact.verifiedByOfficer ? (
                      <CheckSquare className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{fact.fieldName}</div>
                    <div className="text-[11px] text-slate-600">
                      Captured: <span className="font-mono font-medium text-slate-900">{fact.rawValue}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {fact.form1003Section} • Confidence {(fact.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    fact.verifiedByOfficer
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {fact.verifiedByOfficer ? "Verified" : "Pending Verification"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SCENARIO CALCULATOR */}
        {activeTab === "calculator" && (
          <Card>
            <CardHeader className="py-2.5">
              <CardTitle>Scenario & Payment Qualification Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Target Purchase Price</label>
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(goal.targetPurchasePrice)}</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Down Payment (14.5%)</label>
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(goal.targetDownPaymentAmount)}</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Target Loan Amount</label>
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(goal.targetLoanAmount)}</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Loan-to-Value (LTV)</label>
                  <div className="text-sm font-bold text-slate-900">85.47% (Requires PMI)</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Monthly Principal & Interest:</span>
                  <span className="font-semibold text-slate-900">$3,119.54</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Property Taxes (1.8% Austin):</span>
                  <span className="font-semibold text-slate-900">$877.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Homeowners Insurance:</span>
                  <span className="font-semibold text-slate-900">$145.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Private Mortgage Insurance (PMI):</span>
                  <span className="font-semibold text-slate-900">$125.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-sm">
                  <span>Total Monthly Housing (PITI):</span>
                  <span className="text-emerald-700">$4,267.04</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
