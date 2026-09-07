"use client";

import React, { useState } from "react";
import Link from "next/link";

import { repository } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";

export default function ManagerPortalPage() {
  const metrics = repository.getManagerMetrics();
  const loanOfficers = repository.getLoanOfficers();
  const auditEvents = repository.getAuditEvents();

  const [selectedTab, setSelectedTab] = useState<"officers" | "audit" | "escalations">("officers");
  const [filterQuery, setFilterQuery] = useState("");

  const filteredAuditEvents = auditEvents.filter((e) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.eventType.toLowerCase().includes(q) ||
      e.actor.userId.toLowerCase().includes(q) ||
      (e.details.category && e.details.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Compliance & Operations Oversight
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Austin & Regional Lending Branches</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Lending Operations Executive Portal</h1>
          <p className="text-xs text-slate-500">
            Real-time compliance monitoring, loan officer adoption metrics, and regulatory audit trail.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" className="text-xs">
            Export Audit Ledger (CSV)
          </Button>
          <Button size="sm" className="bg-slate-900 text-white text-xs">
            Compliance Policy Settings
          </Button>
        </div>
      </div>

      {/* High-Level Compliance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.metricId}>
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-medium text-slate-500">{m.name}</span>
              <div className="text-xl font-bold text-slate-900">
                {m.unit === "percentage" ? `${m.value}%` : `${m.value} hrs`}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Benchmark: {m.targetBenchmark}%</span>
                <span className="text-emerald-600 font-semibold">+{m.trendPercent}% vs qtr</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedTab("officers")}
          className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
            selectedTab === "officers"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Loan Officer Risk & Performance
        </button>
        <button
          onClick={() => setSelectedTab("escalations")}
          className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center space-x-1.5 cursor-pointer ${
            selectedTab === "escalations"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Supervisor Escalations</span>
          <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full">1</span>
        </button>
        <button
          onClick={() => setSelectedTab("audit")}
          className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${
            selectedTab === "audit"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Immutable Compliance Audit Ledger ({auditEvents.length})
        </button>
      </div>

      {/* TAB 1: LOAN OFFICERS */}
      {selectedTab === "officers" && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Branch Loan Officer Supervision</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5">Loan Officer</th>
                  <th className="px-4 py-2.5">Branch</th>
                  <th className="px-4 py-2.5">Active Today</th>
                  <th className="px-4 py-2.5">Completed This Wk</th>
                  <th className="px-4 py-2.5">Nudge Acceptance</th>
                  <th className="px-4 py-2.5">Infractions</th>
                  <th className="px-4 py-2.5">Risk Rating</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loanOfficers.map((lo) => (
                  <tr key={lo.officerId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{lo.name}</td>
                    <td className="px-4 py-3 text-slate-600">{lo.branch}</td>
                    <td className="px-4 py-3 font-mono">{lo.activeMeetingsToday}</td>
                    <td className="px-4 py-3 font-mono">{lo.completedThisWeek}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {lo.averageInterventionAcceptanceRate}%
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {lo.complianceInfractionCount > 0 ? (
                        <span className="text-red-700 font-bold">{lo.complianceInfractionCount} flagged</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">0 clean</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        severity={
                          lo.riskRating === "elevated"
                            ? "critical"
                            : lo.riskRating === "moderate"
                            ? "high"
                            : "info"
                        }
                        size="sm"
                      >
                        {lo.riskRating}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href="/meeting/meet_001">
                        <Button size="sm" variant="ghost">
                          Inspect
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
      {selectedTab === "escalations" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-red-200 bg-red-50/40 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                  CRITICAL TRID ESCALATION
                </span>
                <span className="text-xs font-mono text-slate-500">Meeting ID: meet_001</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Unauthorized Informal Approval Statement (12 CFR § 1026.19)
              </h4>
              <p className="text-xs text-slate-700 max-w-2xl">
                Alex Vance verbally stated to John and Sarah Miller: <span className="italic font-medium">&ldquo;you&apos;re 100% approved in my book. We will definitely get you that loan.&rdquo;</span> prior to Underwriting review.
              </p>
              <div className="text-[11px] text-slate-500">
                Mitigating Action Taken by Officer: Retraction script read and Conditional Pre-Qualification letter queued.
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Link href="/meeting/meet_001/live">
                <Button size="sm" variant="outline">
                  Listen Audio
                </Button>
              </Link>
              <Button size="sm" className="bg-slate-900 text-white">
                Approve Mitigation Sign-Off
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LEDGER */}
      {selectedTab === "audit" && (
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Immutable Regulatory Audit Trail</CardTitle>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search audit log..."
                className="text-xs px-2.5 py-1 border border-slate-300 rounded"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {filteredAuditEvents.map((evt) => (
              <div key={evt.id} className="p-3.5 flex items-start justify-between gap-4 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 uppercase">{evt.eventType}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Actor: {evt.actor.userId} ({evt.actor.role})</span>
                  </div>
                  <div className="text-slate-700 font-sans text-xs">
                    {evt.details.notes || "Event captured."}
                  </div>
                  {evt.details.ruleCitation && (
                    <div className="text-[10px] text-slate-500">
                      Citation: {evt.details.ruleCitation}
                    </div>
                  )}
                </div>

                <span className="text-slate-400 shrink-0">{formatDate(evt.timestamp)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
