"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mic,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

export default function Customer360Page() {
  const params = useParams();
  const customerId = (params?.id as string) || "cust_miller_001";
  const customer = repository.getCustomer(customerId);

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Customer Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ID: {customerId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Customer 360 Dossier
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Salesforce FSC ID: {customer.crmLeadId}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {primary.firstName} & {coBorrower?.firstName} {primary.lastName}
          </h1>
          <p className="text-xs text-slate-500">
            Assigned to {customer.assignedLoanOfficerName} • Stage: Consultation in Progress
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/meeting/meet_001/live">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5">
              <Mic className="h-3.5 w-3.5" />
              <span>Join Active Consultation</span>
            </Button>
          </Link>
          <Link href="/meeting/meet_001/summary">
            <Button size="sm" variant="outline">
              View Meeting Summary
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Financial & Loan Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Borrowers & Assets/Liabilities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Primary Borrower */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Primary Borrower: {primary.firstName} {primary.lastName}</CardTitle>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
                FICO {primary.financialProfile.creditScoreFICO}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>Email: {primary.email}</div>
                <div>Phone: {primary.phone}</div>
                <div>SSN (Masked): {primary.maskedSSN}</div>
                <div>Marital Status: {primary.maritalStatus}</div>
                <div>Current Address: {primary.currentAddress.street}, {primary.currentAddress.city}, {primary.currentAddress.state}</div>
                <div>Monthly Rent: {formatCurrency(primary.currentAddress.monthlyRentMortgage)}</div>
              </div>

              <div className="border-t border-slate-100 pt-2.5">
                <span className="font-semibold text-slate-900 block mb-1">Employment Details:</span>
                <div className="text-slate-600">
                  {primary.employmentHistory[0]?.jobTitle} at {primary.employmentHistory[0]?.employerName} • {primary.employmentHistory[0]?.yearsOnJob} years • Base Salary {formatCurrency(primary.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-Borrower */}
          {coBorrower && (
            <Card>
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Co-Borrower: {coBorrower.firstName} {coBorrower.lastName}</CardTitle>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
                  FICO {coBorrower.financialProfile.creditScoreFICO}
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>Email: {coBorrower.email}</div>
                  <div>Phone: {coBorrower.phone}</div>
                  <div>SSN (Masked): {coBorrower.maskedSSN}</div>
                  <div>Employment: Self-Employed (Creative Director)</div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <span className="font-semibold text-slate-900 block mb-1">Underwriting Condition (Dodd-Frank QM):</span>
                  <div className="text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                    Self-employment documentation requires 2024 & 2025 Schedule C federal tax returns. Unverifiable cash income contracts cannot be used toward qualifying DTI.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Combined Liabilities Table */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Declared Obligations & Liabilities (Form 1003)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs">
              <table className="w-full text-left divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Obligation</th>
                    <th className="px-4 py-2">Creditor</th>
                    <th className="px-4 py-2">Monthly Pmt</th>
                    <th className="px-4 py-2">Unpaid Balance</th>
                    <th className="px-4 py-2">DTI Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {primary.financialProfile.liabilities.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-2 font-medium text-slate-900 capitalize">{l.liabilityType.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2 text-slate-600">{l.creditorName}</td>
                      <td className="px-4 py-2 font-mono">{formatCurrency(l.monthlyPayment)}</td>
                      <td className="px-4 py-2 font-mono">{formatCurrency(l.unpaidBalance)}</td>
                      <td className="px-4 py-2 text-emerald-700">Included</td>
                    </tr>
                  ))}
                  {coBorrower?.financialProfile.liabilities.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-2 font-medium text-slate-900 capitalize">{l.liabilityType.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2 text-slate-600">{l.creditorName}</td>
                      <td className="px-4 py-2 font-mono">{formatCurrency(l.monthlyPayment)}</td>
                      <td className="px-4 py-2 font-mono">{formatCurrency(l.unpaidBalance)}</td>
                      <td className="px-4 py-2 text-emerald-700">Mandatory (Fannie Mae)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Mortgage Goal & System IDs */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Mortgage Target Goal</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Price:</span>
                <span className="font-bold text-slate-900">{formatCurrency(goal.targetPurchasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Down Payment:</span>
                <span className="font-bold text-slate-900">{formatCurrency(goal.targetDownPaymentAmount)} ({goal.targetDownPaymentPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(goal.targetLoanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Product:</span>
                <span className="font-bold text-slate-900">30Y Fixed Conventional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timeline:</span>
                <span className="font-bold text-slate-900">Within {goal.targetClosingTimelineWeeks} Weeks</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Enterprise System Records</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Encompass LOS ID</span>
                <span className="text-slate-900 font-bold">{customer.losApplicationId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Salesforce FSC Lead ID</span>
                <span className="text-slate-900 font-bold">{customer.crmLeadId}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
