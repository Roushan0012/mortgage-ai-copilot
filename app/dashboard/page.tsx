"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Mic,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

export default function DashboardPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Loan Officer Command Center</h1>
          <p className="text-xs text-slate-500">Alex Vance, NMLS #1489201 • Austin Central Branch</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/meeting/meet_001/live">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1.5">
              <Mic className="h-3.5 w-3.5" />
              <span>Enter Live Consultation (In Progress)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-500">Active Monthly Pipeline</span>
            <div className="text-xl font-bold text-slate-900">$8,450,000</div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +14.2% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-500">TRID / TILA Compliance Score</span>
            <div className="text-xl font-bold text-emerald-700">98.5%</div>
            <div className="text-[10px] text-slate-500">Zero unmitigated infractions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-500">Copilot Nudge Acceptance</span>
            <div className="text-xl font-bold text-slate-900">88.5%</div>
            <div className="text-[10px] text-slate-500">Target benchmark: 85.0%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-500">Time-to-1003 Application</span>
            <div className="text-xl font-bold text-slate-900">4.2 hrs</div>
            <div className="text-[10px] text-emerald-600 font-medium">-32% reduction via copilot</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Active & Scheduled Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Meeting Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Today&apos;s Scheduled Consultations</CardTitle>
              <span className="text-xs text-slate-500">Tuesday, Sep 8, 2026</span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {/* Meeting Item 1: Active (Miller Family) */}
              <div className="p-4 bg-red-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                      LIVE NOW
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      John Miller & Sarah Miller — First-Time Homebuyer
                    </h4>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" /> 10:00 AM – 10:45 AM
                    </span>
                    <span>•</span>
                    <span>Target: $585,000 Single Family (South Austin)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Flagged: 1 Prohibited Approval Statement retracted • 1 BMW lease captured
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link href="/meeting/meet_001/live">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Join Live Cockpit
                    </Button>
                  </Link>
                  <Link href="/meeting/meet_001">
                    <Button size="sm" variant="outline">
                      Briefing
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Meeting Item 2: Scheduled */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      SCHEDULED
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      David & Emily Chen — Rate/Term Refinance
                    </h4>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" /> 1:30 PM – 2:00 PM
                    </span>
                    <span>•</span>
                    <span>Current Loan: $420,000 at 7.25% • Target: 6.25% Fixed</span>
                  </div>
                </div>

                <Button size="sm" variant="outline" disabled>
                  Ready at 1:25 PM
                </Button>
              </div>

              {/* Meeting Item 3: Completed */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Robert Garcia — Jumbo Loan Pre-Approval
                    </h4>
                  </div>
                  <div className="text-xs text-slate-500">
                    9:00 AM • Verified 8 Form 1003 facts • Synced to Encompass
                  </div>
                </div>

                <Link href="/meeting/meet_001/summary">
                  <Button size="sm" variant="ghost">
                    View Summary
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Links & Recent Alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Compliance Guardrail Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mr-2" />
                  TRID Informal Approval Rule
                </span>
                <span className="font-semibold text-emerald-700">Enforced</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mr-2" />
                  TILA Reg Z APR Oral Disclosure
                </span>
                <span className="font-semibold text-emerald-700">Enforced</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mr-2" />
                  Dodd-Frank QM Income Verification
                </span>
                <span className="font-semibold text-emerald-700">Enforced</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mr-2" />
                  Fannie Mae Liabilities Omission
                </span>
                <span className="font-semibold text-emerald-700">Enforced</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Enterprise System Connections</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Encompass LOS (MISMO 3.4)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">
                  CONNECTED
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Salesforce Financial Services Cloud</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">
                  CONNECTED
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Optimal Blue PPE</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">
                  CONNECTED
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
