"use client";

import React from "react";
import {
  User,
  Briefcase,
  Home,
} from "lucide-react";
import { Customer } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface CustomerProfilePanelProps {
  customer: Customer;
  className?: string;
}

export function CustomerProfilePanel({
  customer,
  className,
}: CustomerProfilePanelProps) {
  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* 1. Identity & Application Status */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm">Borrower Identity & Application</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-semibold">
              Stage: {customer.stage.replace(/_/g, " ")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          {/* Primary Borrower */}
          <div className="p-3 rounded-md border border-slate-200 bg-white space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">
                {primary.firstName} {primary.lastName} (Primary)
              </span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                FICO {primary.financialProfile.creditScoreFICO} • {primary.financialProfile.creditTier.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div>Email: {primary.email}</div>
              <div>Phone: {primary.phone}</div>
              <div>SSN (Masked): {primary.maskedSSN}</div>
              <div>Marital Status: {primary.maritalStatus}</div>
              <div className="sm:col-span-2">
                Current Residence: {primary.currentAddress.street}, {primary.currentAddress.city}, {primary.currentAddress.state} ({primary.currentAddress.housingStatus}, {formatCurrency(primary.currentAddress.monthlyRentMortgage)}/mo)
              </div>
            </div>
          </div>

          {/* Co-Borrower */}
          {coBorrower && (
            <div className="p-3 rounded-md border border-slate-200 bg-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">
                  {coBorrower.firstName} {coBorrower.lastName} (Co-Borrower)
                </span>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                  FICO {coBorrower.financialProfile.creditScoreFICO} • {coBorrower.financialProfile.creditTier.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>Email: {coBorrower.email}</div>
                <div>Phone: {coBorrower.phone}</div>
                <div>SSN (Masked): {coBorrower.maskedSSN}</div>
                <div>Marital Status: {coBorrower.maritalStatus}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Employment & Income Profiles */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm flex items-center space-x-1.5">
            <Briefcase className="h-4 w-4 text-slate-700" />
            <span>Employment & Qualifying Income</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          {/* Primary Employment */}
          <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">
                {primary.firstName}: {primary.employmentHistory[0]?.employerName}
              </span>
              <StatusBadge status="complete" size="sm" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Job Title: {primary.employmentHistory[0]?.jobTitle}</div>
              <div>Type: {primary.employmentHistory[0]?.employmentType.replace(/_/g, " ")}</div>
              <div>Tenure: {primary.employmentHistory[0]?.yearsOnJob} years</div>
              <div className="font-semibold text-slate-900">
                Base Income: {formatCurrency(primary.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo
              </div>
            </div>
          </div>

          {/* Co-Borrower Employment */}
          {coBorrower && (
            <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">
                  {coBorrower.firstName}: {coBorrower.employmentHistory[0]?.employerName}
                </span>
                <StatusBadge status="partial" size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Job Title: {coBorrower.employmentHistory[0]?.jobTitle}</div>
                <div>Type: Self-Employed (Schedule C)</div>
                <div>Tenure: {coBorrower.employmentHistory[0]?.yearsOnJob} years in business</div>
                <div className="font-semibold text-slate-900">
                  Net Avg: {formatCurrency(coBorrower.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Known Liabilities Table */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm">Known Liabilities & Obligations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-xs">
          <table className="w-full text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2">Obligation</th>
                <th className="px-4 py-2">Creditor</th>
                <th className="px-4 py-2">Monthly Payment</th>
                <th className="px-4 py-2">Unpaid Balance</th>
                <th className="px-4 py-2">DTI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {primary.financialProfile.liabilities.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-medium text-slate-900 capitalize">
                    {l.liabilityType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{l.creditorName}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-slate-900">
                    {formatCurrency(l.monthlyPayment)}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600">
                    {formatCurrency(l.unpaidBalance)}
                  </td>
                  <td className="px-4 py-2 text-emerald-700 font-medium">Included</td>
                </tr>
              ))}
              {coBorrower?.financialProfile.liabilities.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-medium text-slate-900 capitalize">
                    {l.liabilityType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{l.creditorName}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-slate-900">
                    {formatCurrency(l.monthlyPayment)}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600">
                    {formatCurrency(l.unpaidBalance)}
                  </td>
                  <td className="px-4 py-2 text-emerald-700 font-medium">
                    Mandatory (Fannie Mae)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 4. Home Purchase Goal & Notes */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm flex items-center space-x-1.5">
            <Home className="h-4 w-4 text-slate-700" />
            <span>Home Purchase Goal & Financing Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block">Purchase Price</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatCurrency(goal.targetPurchasePrice)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Down Payment</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatCurrency(goal.targetDownPaymentAmount)} ({goal.targetDownPaymentPercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Loan Amount</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatCurrency(goal.targetLoanAmount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Closing Timeline</span>
              <span className="font-bold text-slate-900">
                Within {goal.targetClosingTimelineWeeks} Weeks
              </span>
            </div>
          </div>

          {goal.notes && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">Loan Officer Notes:</span>
              <p>{goal.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
