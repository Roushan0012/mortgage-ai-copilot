"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  Send,
  Layers,
  ArrowRight,
  FileQuestion,
  Sparkles,
  DollarSign,
  Check,
  FileText,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { integrationsHub, SyncResult } from "@/lib/integrations";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TaskList } from "@/components/shared/TaskList";

export default function MeetingSummaryPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || "meet_001";

  const meeting = repository.getMeeting(meetingId);
  const summary = repository.getMeetingSummary(meetingId);
  const customer = meeting ? repository.getCustomer(meeting.customerId) : null;

  const [losSyncResult, setLosSyncResult] = useState<SyncResult | null>(null);
  const [crmSyncResult, setCrmSyncResult] = useState<SyncResult | null>(null);
  const [isSyncingLOS, setIsSyncingLOS] = useState(false);
  const [isSyncingCRM, setIsSyncingCRM] = useState(false);
  const [showPayloadModal, setShowPayloadModal] = useState<string | null>(null);
  const [signedOff, setSignedOff] = useState(false);

  if (!meeting || !summary || !customer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12">
        <h2 className="text-base font-bold text-slate-900">Summary Not Available</h2>
        <p className="text-xs text-slate-500 mt-1">Could not find record for ID: {meetingId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  const handleSyncLOS = async () => {
    setIsSyncingLOS(true);
    try {
      const result = await integrationsHub.syncToEncompassLOS(meeting, customer);
      setLosSyncResult(result);
    } finally {
      setIsSyncingLOS(false);
    }
  };

  const handleSyncCRM = async () => {
    setIsSyncingCRM(true);
    try {
      const result = await integrationsHub.syncToSalesforceCRM(meeting, customer);
      setCrmSyncResult(result);
    } finally {
      setIsSyncingCRM(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Post-Meeting Summary & Audit Record
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Completed at 10:45 AM
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {primary.firstName} & {coBorrower?.firstName} {primary.lastName} — Home Purchase Consultation
          </h1>
          <p className="text-xs text-slate-500">
            Loan Officer: {meeting.assignedLoanOfficerName} • ID: {meeting.id}
          </p>
        </div>

        {/* Sync Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            isLoading={isSyncingCRM}
            onClick={handleSyncCRM}
            className="flex items-center space-x-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-blue-600" />
            <span>Sync Salesforce FSC</span>
          </Button>

          <Button
            size="sm"
            isLoading={isSyncingLOS}
            onClick={handleSyncLOS}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sync Encompass (MISMO 3.4)</span>
          </Button>
        </div>
      </div>

      {/* Sync Success Banners */}
      {(losSyncResult || crmSyncResult) && (
        <div className="space-y-2 animate-in fade-in duration-150">
          {losSyncResult && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{losSyncResult.event.payloadSummary}</span>
              </div>
              <button
                onClick={() => setShowPayloadModal("los")}
                className="text-[11px] font-mono text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
              >
                Inspect MISMO 3.4 Payload
              </button>
            </div>
          )}

          {crmSyncResult && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{crmSyncResult.event.payloadSummary}</span>
              </div>
              <button
                onClick={() => setShowPayloadModal("crm")}
                className="text-[11px] font-mono text-blue-800 underline hover:text-blue-950 cursor-pointer"
              >
                Inspect Salesforce FSC Payload
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Recommended Next Step Banner (High Priority) */}
      <div className="p-4 rounded-xl border border-slate-900 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-rose-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Recommended Next Best Step
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Issue Conditional Pre-Qualification Letter with TRID Disclaimers
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Transmit formal written pre-qualification letter clarifying underwriting review requirements, and send borrower portal link for Sarah&apos;s 2024–2025 Schedule C tax returns.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link href={`/customer/${customer.id}`}>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer">
              <span>View Borrower Portal</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Meeting Summary */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-slate-700" />
                <span>Executive Consultation Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
              <p>{summary.executiveSummary}</p>
            </CardContent>
          </Card>

          {/* Section: Customer Goals & Mortgage Discussion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs font-bold">Customer Goals</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs space-y-2 text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Target Property:</span>
                  <span className="font-semibold text-slate-900">Single Family (South Austin)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Target Price:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(goal.targetPurchasePrice)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Down Payment:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(goal.targetDownPaymentAmount)} (14.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Closing:</span>
                  <span className="font-semibold text-slate-900">2–4 Weeks</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2.5 bg-slate-50/50">
                <CardTitle className="text-xs font-bold">Mortgage Discussion</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs space-y-2 text-slate-700 leading-relaxed">
                <p>
                  Discussed 30-year conventional fixed loan with estimated PITI under $3,650. Addressed competing Rocket Mortgage 6.125% verbal quote and explained that written Loan Estimate is needed to verify APR and points.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section: Financial Profile Findings */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Financial Profile Findings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Qualifying Income</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(summary.keyFinancialFindings.qualifyingIncomeTotal)}/mo
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Monthly Debts</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(summary.keyFinancialFindings.monthlyDebtsTotal)}/mo
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Estimated Back DTI</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    {summary.keyFinancialFindings.estimatedDTI}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Target Loan</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(summary.keyFinancialFindings.targetLoanAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Information Captured (Form 1003 Facts) */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Information Captured (Form 1003)</CardTitle>
              <span className="text-xs text-slate-500 font-medium">
                {meeting.extractedFacts.filter((f) => f.verifiedByOfficer).length} of {meeting.extractedFacts.length} Verified
              </span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 text-xs">
              {meeting.extractedFacts.map((fact) => (
                <div key={fact.id} className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">{fact.fieldName}</div>
                    <div className="text-slate-500 text-[11px]">{fact.form1003Section}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">{fact.rawValue}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {fact.verifiedByOfficer ? "Verified by Alex Vance" : "Pending Verification"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section: Missing Information */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="py-3 border-b border-amber-200/70">
              <CardTitle className="text-sm font-bold text-amber-950 flex items-center space-x-1.5">
                <FileQuestion className="h-4 w-4 text-amber-700" />
                <span>Known Missing Information & Outstanding Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong>Sarah Miller 2024 & 2025 Schedule C Tax Returns:</strong> Required for calculating 24-month self-employment average under Dodd-Frank QM.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong>BMW Auto Lease Note:</strong> Verified full lease obligation must be entered into liabilities ledger.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <div>
                  <strong>Competing Written Loan Estimate:</strong> Official document from Rocket Mortgage required to substantiate price match.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Follow-up Tasks */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Follow-Up Action Milestones</CardTitle>
              <span className="text-xs text-slate-500 font-medium">
                {summary.followUpTasks.length} Milestones
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <TaskList initialTasks={summary.followUpTasks} />
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Cols: AI Interventions & Compliance Verdict */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section: Compliance Verdict */}
          <Card className="border-amber-300 bg-amber-50/25">
            <CardHeader className="py-3 border-b border-amber-200">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <CardTitle className="text-amber-950 text-sm font-bold">
                  Compliance Audit Verdict
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-amber-950 block text-xs uppercase tracking-wider">
                  Supervisor Review Required
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  1 critical TRID informal approval statement was flagged and escalated for Branch Manager sign-off prior to formal underwriting.
                </p>
              </div>

              <div className="border-t border-amber-200 pt-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Alerts Raised:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {summary.complianceStatus.totalAlertsRaised}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Resolved by Officer:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {summary.complianceStatus.resolvedAlertsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Supervisor Escalations:</span>
                  <span className="font-bold text-red-700 font-mono">
                    {summary.complianceStatus.escalatedAlertsCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: AI Interventions Recap */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold">Meeting AI Interventions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              {meeting.activeInterventions.map((intv) => (
                <div
                  key={intv.id}
                  className="p-2.5 rounded border border-slate-200 bg-white space-y-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">
                      {intv.title || intv.category.replace(/_/g, " ")}
                    </span>
                    <StatusBadge status={intv.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {intv.exactMessage}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Officer Sign-off & Attestation */}
          <Card>
            <CardHeader className="py-3 bg-slate-50/50">
              <CardTitle className="text-sm font-bold">Officer Attestation</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-slate-500 leading-relaxed text-[11px]">
                I attest under 18 U.S.C. § 1014 that borrower financial data recorded herein has been verified in good faith according to Fannie Mae selling guidelines and ECOA Fair Lending statutes.
              </p>

              {signedOff ? (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Attestation signed by Alex Vance, NMLS #1489201</span>
                </div>
              ) : (
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  onClick={() => setSignedOff(true)}
                >
                  Sign & Submit Audit Trail
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Raw Payload Inspection Modal */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {showPayloadModal === "los"
                  ? "Encompass MISMO 3.4 Payload Inspection"
                  : "Salesforce FSC CRM Payload"}
              </h3>
              <button
                onClick={() => setShowPayloadModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto bg-slate-950 text-emerald-400 p-3 rounded font-mono text-[11px]">
              {JSON.stringify(
                showPayloadModal === "los"
                  ? losSyncResult?.event.rawPayload
                  : crmSyncResult?.event.rawPayload,
                null,
                2
              )}
            </pre>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowPayloadModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
