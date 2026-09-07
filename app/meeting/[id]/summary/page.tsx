"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  Send,
  Layers,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { integrationsHub, SyncResult } from "@/lib/integrations";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

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

  if (!meeting || !summary || !customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Summary Not Available</h2>
        <p className="text-xs text-slate-500 mt-1">ID: {meetingId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

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
    <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Post-Meeting Summary & Audit Record
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Completed at 10:45 AM</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{meeting.title}</h1>
          <p className="text-xs text-slate-500">
            Loan Officer: {meeting.assignedLoanOfficerName} • Borrowers: John & Sarah Miller
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            isLoading={isSyncingCRM}
            onClick={handleSyncCRM}
            className="flex items-center space-x-1.5"
          >
            <Send className="h-3.5 w-3.5 text-blue-600" />
            <span>Sync Salesforce CRM</span>
          </Button>

          <Button
            size="sm"
            isLoading={isSyncingLOS}
            onClick={handleSyncLOS}
            className="bg-slate-900 text-white flex items-center space-x-1.5"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sync Encompass LOS (MISMO 3.4)</span>
          </Button>
        </div>
      </div>

      {/* Integration Sync Success Banners */}
      {(losSyncResult || crmSyncResult) && (
        <div className="space-y-2">
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
                Inspect Salesforce Payload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid: Summary & Compliance Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recap & 1003 Captured Facts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Executive Consultation Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
              <p>{summary.executiveSummary}</p>
              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Borrower Goals & Parameters:</span>
                <p className="text-slate-600">{summary.borrowerGoalsRecap}</p>
              </div>
            </CardContent>
          </Card>

          {/* Form 1003 Verified Fact Capture */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Captured Form 1003 Loan Facts</CardTitle>
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
                    <div className="text-[10px] text-emerald-600 font-medium">
                      {fact.verifiedByOfficer ? "Verified by Alex Vance" : "Pending Verification"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Follow-Up Action Tasks */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Actionable Follow-Up Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 text-xs">
              {summary.followUpTasks.map((task) => (
                <div key={task.id} className="p-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="font-semibold text-slate-900">{task.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{task.description}</p>
                    <div className="text-[10px] text-slate-400">
                      Assigned to: <span className="font-medium text-slate-600 capitalize">{task.assignedTo.replace(/_/g, " ")}</span> • Due {formatDate(task.dueDate)}
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono shrink-0 uppercase">
                    Dest: {task.syncDestination}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Compliance Verdict & Risk Audit */}
        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="py-3 border-b border-amber-200">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <CardTitle className="text-amber-900 text-sm">Compliance Audit Verdict</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-amber-900 block text-xs">SUPERVISOR REVIEW REQUIRED</span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  The consultation triggered 1 critical TRID informal approval statement requiring branch manager sign-off prior to pre-approval issuance.
                </p>
              </div>

              <div className="border-t border-amber-200/60 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Alerts Raised:</span>
                  <span className="font-bold text-slate-900">{summary.complianceStatus.totalAlertsRaised}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Resolved Alerts:</span>
                  <span className="font-bold text-emerald-700">{summary.complianceStatus.resolvedAlertsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Escalated to Branch Mgr:</span>
                  <span className="font-bold text-red-700">{summary.complianceStatus.escalatedAlertsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Officer Sign-Off & Attestation</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-slate-500 leading-relaxed text-[11px]">
                I attest under 18 U.S.C. § 1014 that the financial information recorded herein has been collected in good faith adhering to Fannie Mae and ECOA Fair Lending guidelines.
              </p>
              <div className="pt-2">
                <Button className="w-full bg-slate-900 text-white">
                  Sign & Submit Audit Trail
                </Button>
              </div>
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
                {showPayloadModal === "los" ? "Encompass MISMO 3.4 Payload Inspection" : "Salesforce FSC CRM Payload"}
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
                showPayloadModal === "los" ? losSyncResult?.event.rawPayload : crmSyncResult?.event.rawPayload,
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
