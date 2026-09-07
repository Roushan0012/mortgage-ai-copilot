"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Check,
  ArrowRight,
} from "lucide-react";

import { repository } from "@/lib/data/repository";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";


export default function ManagerDashboardPage() {
  const loanOfficers = repository.getLoanOfficers();

  const [activeTab, setActiveTab] = useState<
    "performance" | "activity" | "escalations" | "approvals" | "funnel"
  >("performance");
  const [escalationApproved, setEscalationApproved] = useState(false);
  const pendingActions = repository.getPostMeetingActions().filter((a) => a.status === "ready_for_approval");


  // Extended mock activity feed items
  const activityFeed = [
    {
      id: "act_1",
      officer: "Alex Vance",
      action: "Concluded consultation with John & Sarah Miller",
      time: "10:45 AM",
      type: "meeting",
      detail: "Form 1003 verified: 3 facts captured, BMW lease reported, 4 follow-up tasks queued.",
    },
    {
      id: "act_2",
      officer: "Alex Vance",
      action: "TRID Guard Retraction Executed",
      time: "10:05 AM",
      type: "compliance",
      detail: "Informal approval statement retracted verbally; conditional pre-qualification letter issued.",
    },
    {
      id: "act_3",
      officer: "Marcus Chen",
      action: "Encompass LOS Sync Completed",
      time: "09:50 AM",
      type: "sync",
      detail: "MISMO 3.4 payload transmitted for Robert Garcia jumbo application.",
    },
    {
      id: "act_4",
      officer: "Rachel Torres",
      action: "New Lead Consultation Started",
      time: "09:30 AM",
      type: "meeting",
      detail: "First-time buyer consultation in Houston Galleria branch.",
    },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Branch Operations
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Austin Central & Regional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manager Compliance & Performance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time origination oversight, officer adoption analytics, and regulatory escalation queue.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button size="sm" variant="outline" className="text-xs cursor-pointer">
            Export Branch Audit Log (CSV)
          </Button>
          <Button size="sm" className="bg-slate-900 text-white text-xs cursor-pointer">
            Compliance Guard Settings
          </Button>
        </div>
      </div>

      {/* 2. Workflow Health Section (Requirement 16) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Branch Origination Workflow Health
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time pipeline synchronization
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Meetings Today</span>
            <span className="text-lg font-black text-slate-900 font-mono">8</span>
            <span className="text-[9px] text-slate-400 block">3 Branches</span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Summaries Done</span>
            <span className="text-lg font-black text-emerald-700 font-mono">8</span>
            <span className="text-[9px] text-emerald-600 block">100% Generated</span>
          </div>

          <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] text-amber-900 block font-semibold uppercase">Pending Approvals</span>
            <span className="text-lg font-black text-amber-900 font-mono">3</span>
            <span className="text-[9px] text-amber-700 block">Gated Actions</span>
          </div>

          <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] text-blue-900 block font-semibold uppercase">CRM Sync Pending</span>
            <span className="text-lg font-black text-blue-900 font-mono">2</span>
            <span className="text-[9px] text-blue-700 block">Salesforce FSC</span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">LOS Updates Due</span>
            <span className="text-lg font-black text-slate-900 font-mono">2</span>
            <span className="text-[9px] text-slate-500 block">MISMO 3.4 Draft</span>
          </div>

          <div className="p-2.5 rounded bg-rose-50/60 border border-rose-200">
            <span className="text-[10px] text-rose-900 block font-semibold uppercase">High-Risk Alerts</span>
            <span className="text-lg font-black text-rose-900 font-mono">{escalationApproved ? 0 : 1}</span>
            <span className="text-[9px] text-rose-700 block">TRID Review</span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Overdue Follow-ups</span>
            <span className="text-lg font-black text-slate-700 font-mono">2</span>
            <span className="text-[9px] text-slate-400 block">Under 24 Hours</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">

        <button
          type="button"
          onClick={() => setActiveTab("performance")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === "performance"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Agent Performance Table
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("escalations")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activeTab === "escalations"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Supervisor Escalations</span>
          <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full">
            {escalationApproved ? 0 : 1}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activeTab === "approvals"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Pending Approvals</span>
          <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] font-bold rounded-full">
            {pendingActions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("funnel")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === "funnel"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Conversion Funnel
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === "activity"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Meeting Activity Feed ({activityFeed.length})
        </button>
      </div>


      {/* TAB 1: AGENT PERFORMANCE TABLE */}
      {activeTab === "performance" && (
        <Card>
          <CardHeader className="py-3.5 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Branch Loan Officer Supervision</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Key compliance adherence and 1003 completeness metrics
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
              3 Licensed Officers
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Meetings Today</th>
                  <th className="px-4 py-3">Info Completeness</th>
                  <th className="px-4 py-3">Follow-Up Completion</th>
                  <th className="px-4 py-3">Open Alerts</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loanOfficers.map((lo) => (
                  <tr key={lo.officerId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{lo.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {lo.officerId}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{lo.branch}</td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-slate-900">{lo.activeMeetingsToday}</span> scheduled
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-slate-900">{lo.averageInterventionAcceptanceRate}%</span>
                      <span className="text-[10px] text-slate-400 ml-1">avg</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-emerald-700">92.4%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {lo.complianceInfractionCount > 0 && !escalationApproved ? (
                        <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{lo.complianceInfractionCount} flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          <Check className="h-3 w-3" />
                          <span>0 clean</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href="/meeting/meet_001">
                        <Button size="sm" variant="outline" className="text-xs">
                          Inspect Pipeline
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: SUPERVISOR ESCALATIONS */}
      {activeTab === "escalations" && (
        <div className="space-y-4">
          {escalationApproved ? (
            <div className="p-6 rounded-lg border border-emerald-200 bg-emerald-50/50 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">
                All Supervisor Escalations Resolved
              </h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                The informal approval exception for Alex Vance has been signed off and recorded in the audit trail.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-lg border border-red-300 bg-red-50/30 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    CRITICAL TRID ESCALATION
                  </span>
                  <span className="text-xs font-mono text-slate-500">Meeting: meet_001</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  Unauthorized Informal Approval Statement (12 CFR § 1026.19)
                </h4>

                <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                  Alex Vance verbally stated: <span className="italic font-bold">&ldquo;you&apos;re 100% approved in my book. We will definitely get you that loan.&rdquo;</span> during the John & Sarah Miller consultation prior to Underwriting sign-off.
                </p>

                <div className="p-2.5 rounded bg-white border border-red-200 text-[11px] text-slate-600 space-y-0.5 max-w-xl">
                  <strong>Mitigation Taken:</strong> Retraction script read verbally to borrower, Conditional Pre-Qualification disclaimer letter queued in Encompass.
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Link href="/meeting/meet_001/live">
                  <Button size="sm" variant="outline">
                    Review Cockpit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => setEscalationApproved(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Approve Mitigation Sign-Off
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDING APPROVALS QUEUE */}
      {activeTab === "approvals" && (
        <Card>
          <CardHeader className="py-3.5 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Branch Agent Pending Approval Queue</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise approval gates requiring loan officer or supervisor sign-off before downstream execution
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
              {pendingActions.length} Actions Gated
            </span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {pendingActions.map((act) => (
              <div key={act.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                      Approval Required
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      {act.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.reason}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>Officer: <strong className="text-slate-700">{act.owner}</strong></span>
                    <span>•</span>
                    <span>Due: <strong className="text-slate-700">{act.dueDate}</strong></span>
                    <span>•</span>
                    <span>Source: <strong className="text-slate-700">{act.source.replace(/_/g, " ")}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 self-end md:self-center">
                  <Link href="/meeting/meet_001/summary">
                    <Button size="sm" className="bg-slate-900 text-white font-semibold text-xs cursor-pointer">
                      <span>Review in Meeting Summary</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CONVERSION FUNNEL */}
      {activeTab === "funnel" && (
        <Card>
          <CardHeader className="py-3.5 bg-slate-50/50">
            <CardTitle className="text-sm font-bold">Branch Customer Origination Funnel</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversion drop-off across discovery, information collection, documentation, and underwriting milestones
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            {[
              { stage: "1. Lead / Initial Inquiry", count: 42, pct: 100, color: "bg-slate-800" },
              { stage: "2. Consultation Scheduled", count: 33, pct: 78.5, color: "bg-blue-700" },
              { stage: "3. Consultation Completed", count: 26, pct: 61.9, color: "bg-blue-600" },
              { stage: "4. Information Collection", count: 19, pct: 45.2, color: "bg-indigo-600" },
              { stage: "5. Documentation Pending", count: 13, pct: 30.9, color: "bg-amber-600" },
              { stage: "6. Underwriting Review", count: 8, pct: 19.0, color: "bg-rose-600" },
              { stage: "7. Approved / Clear to Close", count: 5, pct: 11.9, color: "bg-emerald-600" },
            ].map((f) => (
              <div key={f.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-900">{f.stage}</span>
                  <span className="font-mono text-slate-600">
                    {f.count} applications ({f.pct}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full transition-all duration-300`}
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: MEETING & ACTIVITY FEED */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader className="py-3.5 bg-slate-50/50">
            <CardTitle className="text-sm font-bold">Branch Consultation & Activity Stream</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {activityFeed.map((item) => (
              <div key={item.id} className="p-4 flex items-start space-x-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="mt-0.5">
                  {item.type === "compliance" && <ShieldAlert className="h-4 w-4 text-amber-600" />}
                  {item.type === "meeting" && <Calendar className="h-4 w-4 text-blue-600" />}
                  {item.type === "sync" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {item.officer}: {item.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
