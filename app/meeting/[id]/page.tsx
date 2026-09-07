"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mic,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

export default function PreMeetingBriefingPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || "meet_001";
  const meeting = repository.getMeeting(meetingId);
  const customer = meeting ? repository.getCustomer(meeting.customerId) : null;

  if (!meeting || !customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Meeting Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Could not locate meeting record for ID: {meetingId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Return to Dashboard</Button>
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
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Pre-Meeting Briefing Dossier
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">ID: {meeting.id}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{meeting.title}</h1>
          <p className="text-xs text-slate-500">
            Consultation scheduled with {primary.firstName} & {coBorrower?.firstName} {primary.lastName}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/meeting/${meetingId}/live`}>
            <Button size="md" className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5">
              <Mic className="h-4 w-4" />
              <span>Launch Live Meeting Cockpit</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Borrower Summary & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Borrowers & Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Borrower Profiles & Key Financials</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Primary */}
              <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {primary.firstName} {primary.lastName} (Primary Borrower)
                  </span>
                  <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                    FICO: {primary.financialProfile.creditScoreFICO}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Employer: {primary.employmentHistory[0]?.employerName}</div>
                  <div>Base Salary: {formatCurrency(primary.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo</div>
                  <div>Job Title: {primary.employmentHistory[0]?.jobTitle}</div>
                  <div>Monthly Debts: {formatCurrency(primary.financialProfile.totalMonthlyLiabilities)}/mo</div>
                </div>
              </div>

              {/* Co-Borrower */}
              {coBorrower && (
                <div className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">
                      {coBorrower.firstName} {coBorrower.lastName} (Co-Borrower)
                    </span>
                    <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                      FICO: {coBorrower.financialProfile.creditScoreFICO}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>Business: {coBorrower.employmentHistory[0]?.employerName}</div>
                    <div>Net Qualifying Income: {formatCurrency(coBorrower.employmentHistory[0]?.monthlyBaseIncome || 0)}/mo</div>
                    <div>Status: Self-Employed (2-Yr Tax Returns Needed)</div>
                    <div>Monthly Debts: {formatCurrency(coBorrower.financialProfile.totalMonthlyLiabilities)}/mo</div>
                  </div>
                </div>
              )}

              {/* Target Property */}
              <div className="p-3 rounded border border-blue-200 bg-blue-50/30 space-y-1.5">
                <span className="font-bold text-slate-900 block">Target Property & Loan Objective</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Purchase Price: {formatCurrency(goal.targetPurchasePrice)}</div>
                  <div>Down Payment: {formatCurrency(goal.targetDownPaymentAmount)} ({goal.targetDownPaymentPercent}%)</div>
                  <div>Loan Amount: {formatCurrency(goal.targetLoanAmount)}</div>
                  <div>Product: Conventional 30-Year Fixed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anticipated Friction Points */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Anticipated Meeting Friction & Copilot Strategy</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Competitor Quote Alert (Rocket Mortgage):</span>
                  <p className="text-slate-600 mt-0.5">
                    Borrowers obtained a verbal quote of 6.125% with zero fees. Be prepared to explain APR, points, and request the written Loan Estimate.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Regulatory Guardrail (TRID Informal Approval):</span>
                  <p className="text-slate-600 mt-0.5">
                    Do not state the borrower is approved until formal underwriting review is completed. Darwix TRID Guard will flag unauthorized commitments.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <FileCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Self-Employment Documentation (Sarah Miller):</span>
                  <p className="text-slate-600 mt-0.5">
                    Verify whether 2024 and 2025 Schedule C tax returns have been filed. Unverifiable cash income cannot be counted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Checklist & Launch */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Pre-Call Readiness Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Soft tri-merge credit pulled</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Salesforce Lead synced</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Optimal Blue daily rate sheet loaded</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Darwix TRID Guard activated</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="p-5 space-y-3 text-xs">
              <h4 className="font-bold text-sm">Ready to Connect?</h4>
              <p className="text-slate-300 leading-relaxed">
                Join the live consultation room. Darwix AI will actively listen, diarize speakers, extract Form 1003 facts, and surface real-time compliance nudges.
              </p>
              <Link href={`/meeting/${meetingId}/live`} className="block pt-1">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Launch Live Consultation</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
