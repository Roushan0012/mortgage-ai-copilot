"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart,
  ListTodo,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { MetricCard } from "@/components/shared/MetricCard";
import { MeetingCard } from "@/components/shared/MeetingCard";
import { TaskList } from "@/components/shared/TaskList";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

export default function DashboardPage() {
  const meetings = repository.getAllMeetings();
  const summary = repository.getMeetingSummary("meet_001");
  const followUpTasks = summary?.followUpTasks || [];

  // Next meeting is John & Sarah Miller (meet_001)
  const nextMeeting = meetings.find((m) => m.id === "meet_001") || meetings[0];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Greeting & Context with Primary CTA */}
      <div className="rounded-xl border border-slate-900 bg-slate-900 text-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              Operational Pipeline Online
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Tuesday, Sep 8, 2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Good morning, Alex
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            You have <strong className="text-white font-semibold">3 customer meetings</strong> scheduled today.
          </p>
        </div>

        {/* Primary CTA: Open Next Meeting */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href={`/meeting/${nextMeeting.id}`}>
            <Button
              size="lg"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Open Next Meeting</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link href={`/meeting/${nextMeeting.id}/live`}>
            <Button
              size="lg"
              variant="outline"
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 font-semibold cursor-pointer"
            >
              <span>Jump to Live Cockpit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Meetings"
          value="3"
          subtitle="2 upcoming • 1 active session"
          icon={<Calendar className="h-4 w-4" />}
          badge={
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full animate-pulse">
              1 LIVE
            </span>
          }
        />

        <MetricCard
          title="Follow-Ups Due"
          value="2"
          subtitle="1 urgent compliance item"
          trendText="Action required today"
          trendDirection="down"
          isPositiveTrend={false}
          icon={<AlertCircle className="h-4 w-4" />}
        />

        <MetricCard
          title="Open Tasks"
          value="4"
          subtitle="Form 1003 conditions pending"
          trendText="2 borrower • 2 officer"
          trendDirection="neutral"
          icon={<ListTodo className="h-4 w-4" />}
        />

        <MetricCard
          title="Information Completeness"
          value="84.7%"
          subtitle="Benchmark &ge; 80.0%"
          trendText="+6.4% this week"
          trendDirection="up"
          isPositiveTrend={true}
          icon={<PieChart className="h-4 w-4" />}
        />
      </div>

      {/* 3. Main Dashboard Layout: Today's Meetings & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Scheduled & Active Meetings (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="py-3.5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  Today&apos;s Customer Meetings
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered chronologically by appointment schedule
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                3 Total Consultations
              </span>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {meetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  isNextMeeting={index === 0}
                />
              ))}
            </CardContent>
          </Card>

          {/* Quick Guidance Card */}
          <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 flex items-start space-x-3 text-xs">
            <Sparkles className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900 block">
                Next Best LO Recommendation:
              </span>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Prior to your 09:30 AM consultation with John & Sarah Miller, verify whether 2-year Schedule C tax returns have been uploaded. The Darwix TRID Guard is active to prevent unauthorized verbal approval commitments.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Priority Follow-Up Tasks & Compliance Guardrails (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Priority Follow-up Tasks */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Follow-Up Action Items</CardTitle>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {followUpTasks.length} Active
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <TaskList initialTasks={followUpTasks} />
            </CardContent>
          </Card>

          {/* Regulatory Guardrail Real-Time Status */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Active Compliance Guardrails</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">TRID Informal Approval Check</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ENFORCED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">TILA Reg Z Oral APR Mandate</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ENFORCED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Fannie Mae Liability Omission Guard</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ENFORCED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Dodd-Frank ATR/QM Verification</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ENFORCED
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Connectors Status */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold">Enterprise System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span>Encompass LOS (MISMO 3.4)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  SYNC READY
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Salesforce Financial Services Cloud</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  CONNECTED
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Optimal Blue PPE Rates</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  LOADED
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
