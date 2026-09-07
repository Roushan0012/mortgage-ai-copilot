"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { MeetingTimeline } from "@/components/shared/MeetingTimeline";

export default function PreMeetingBriefingPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || "meet_001";
  const meeting = repository.getMeeting(meetingId);
  const customer = meeting ? repository.getCustomer(meeting.customerId) : null;

  if (!meeting || !customer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12">
        <h2 className="text-base font-bold text-slate-900">Meeting Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Could not locate meeting record for ID: {meetingId}
        </p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  const suggestedQuestions = [
    {
      q: "Could you confirm your current monthly car payment and how many months remain on that lease?",
      category: "Liabilities Verification",
    },
    {
      q: "Will the $85,000 down payment be sourced entirely from personal savings or will any gift funds be utilized?",
      category: "Asset Seasoning",
    },
    {
      q: "Have you filed your 2024 and 2025 Schedule C federal tax returns for your design business?",
      category: "Dodd-Frank QM Income",
    },
    {
      q: "Did Rocket Mortgage provide an official written Loan Estimate with the APR and fee breakdown?",
      category: "Competitive Rate Match",
    },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              Pre-Meeting Briefing
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">ID: {meeting.id}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{meeting.timeSlot || "09:30 AM"}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {primary.firstName.toUpperCase()} & {coBorrower?.firstName.toUpperCase()} {primary.lastName.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            First-time home purchase • Target purchase: 2–4 weeks • {goal.targetPropertyType.replace(/_/g, " ")}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href={`/customer/${customer.id}`}>
            <Button size="md" variant="outline" className="font-semibold cursor-pointer">
              <span>Review Customer Profile</span>
            </Button>
          </Link>
          <Link href={`/meeting/${meetingId}/live`}>
            <Button
              size="md"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Meeting</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Financial Profile, Liabilities, Attention Required */}
        <div className="lg:col-span-7 space-y-6">
          {/* Financial Profiles Card */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Borrower Financial Profiles</CardTitle>
              <span className="text-xs text-slate-500">Combined: {formatCurrency(19450)}/mo</span>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* John */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {primary.firstName} {primary.lastName}
                  </span>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                    FICO {primary.financialProfile.creditScoreFICO}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Employment: W-2 Full-Time Employee</div>
                  <div className="font-semibold text-slate-900">
                    Base Income: $7,500/month (Apex Cloud Tech)
                  </div>
                  <div>Tenure: 4.2 years</div>
                  <div>Verified Status: Verbal Verified</div>
                </div>
              </div>

              {/* Sarah */}
              {coBorrower && (
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">
                      {coBorrower.firstName} {coBorrower.lastName}
                    </span>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                      FICO {coBorrower.financialProfile.creditScoreFICO}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>Employment: Self-Employed (Design Partner)</div>
                    <div className="font-semibold text-slate-900">
                      Stated Income: $8,200/month
                    </div>
                    <div>Tenure: 2.1 years in business</div>
                    <div className="text-amber-700 font-semibold">
                      Condition: 2-Year Tax Returns (Schedule C) Needed
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Known Obligations & Down Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs font-bold">Known Obligations</CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Auto Loan (John):</span>
                  <span className="font-mono font-semibold">$480/mo (Toyota)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Auto Lease (Sarah):</span>
                  <span className="font-mono font-semibold">$420/mo (BMW)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Student Loans (Sarah):</span>
                  <span className="font-mono font-semibold">$200/mo (Mohela)</span>
                </div>
                <div className="flex justify-between font-bold pt-1 text-slate-900">
                  <span>Total Monthly Debt:</span>
                  <span className="font-mono">$1,440/mo</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs font-bold">Down Payment & Target</CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Target Purchase:</span>
                  <span className="font-mono font-semibold">$585,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Down Payment:</span>
                  <span className="font-mono font-semibold">$85,000 (14.5%)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Target Loan:</span>
                  <span className="font-mono font-semibold">$500,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Product Goal:</span>
                  <span className="font-semibold">30Y Conventional Fixed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attention Required / Known Missing Information */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="py-3 border-b border-amber-200/70">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <CardTitle className="text-sm font-bold text-amber-950">
                  Attention Required — Known Missing Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-slate-900">Income documentation incomplete:</strong> Sarah is self-employed; 2024 and 2025 Form 1040 Schedule C tax returns must be verified before factoring income into DTI.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-slate-900">Monthly debt amount not confirmed:</strong> Need exact monthly statement amounts and remaining term for Sarah&apos;s auto lease and student loans.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-slate-900">Down payment source not confirmed:</strong> Verify whether the $85,000 is 100% seasoned borrower funds or if any gift funds or 401(k) loans are involved.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Concerns & Previous Lender Interaction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>Customer Concerns:</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                First-time buyers with high sensitivity to lender fees, closing costs, and monthly PITI ceiling ($3,650 target).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Previous Lender Interaction:</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                Spoke with Rocket Mortgage yesterday; given a verbal quote of 6.125% with zero lender fees. Request written Loan Estimate.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Suggested Conversation Plan & Suggested Questions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Suggested Conversation Plan (7 steps) */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-slate-700" />
                <span>Suggested Conversation Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <MeetingTimeline />
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span>Suggested Discovery Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-slate-100 text-xs">
              {suggestedQuestions.map((sq, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {sq.category}
                  </span>
                  <p className="text-slate-800 font-medium italic">
                    &ldquo;{sq.q}&rdquo;
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Start Meeting CTA Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 text-xs shadow-md">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-white text-sm">Ready to Connect?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When you launch the live cockpit, Darwix AI will display real-time transcript diarization, extract Form 1003 facts, and surface deterministic regulatory compliance nudges.
            </p>
            <Link href={`/meeting/${meetingId}/live`} className="block pt-1">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center space-x-2 py-2.5 cursor-pointer">
                <Play className="h-4 w-4 fill-white" />
                <span>Start Live Meeting</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
