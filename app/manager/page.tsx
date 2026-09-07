"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PieChart,
  Check,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { MetricCard } from "@/components/shared/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

export default function ManagerDashboardPage() {
  const loanOfficers = repository.getLoanOfficers();

  const [activeTab, setActiveTab] = useState<"performance" | "activity" | "escalations">("performance");
  const [escalationApproved, setEscalationApproved] = useState(false);

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

      {/* 2. Top Quick Metrics (5 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Today's Meetings"
          value="12"
          subtitle="Across 3 branches"
          icon={<Calendar className="h-4 w-4" />}
        />

        <MetricCard
          title="Completed Meetings"
          value="7"
          subtitle="5 remaining today"
          icon={<CheckCircle2 className="h-4 w-4" />}
          trendText="+15% vs target"
          trendDirection="up"
          isPositiveTrend={true}
        />

        <MetricCard
          title="Follow-Ups Due"
          value="5"
          subtitle="2 urgent milestones"
          icon={<RotateCcw className="h-4 w-4" />}
        />

        <MetricCard
          title="Compliance Alerts"
          value="1"
          subtitle="Supervisor review required"
          icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
          badge={
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full animate-pulse">
              1 PENDING
            </span>
          }
        />

        <MetricCard
          title="Info Completeness"
          value="84.7%"
          subtitle="Target benchmark: 80%"
          trendText="+6.4% this week"
          trendDirection="up"
          isPositiveTrend={true}
          icon={<PieChart className="h-4 w-4" />}
        />
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

      {/* TAB 3: MEETING & ACTIVITY FEED */}
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
