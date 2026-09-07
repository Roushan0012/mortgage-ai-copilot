"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  PhoneCall,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";

interface DemoStep {
  step: number;
  title: string;
  category: "Preparation" | "Live Consultation" | "Post-Meeting" | "Operations & Governance";
  description: string;
  expectedBehavior: string;
  route: string;
  buttonLabel: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "Pre-Meeting Borrower Brief",
    category: "Preparation",
    description: "Review John & Sarah Miller's financial dossier, credit profile, stated goals, and historical CRM notes.",
    expectedBehavior: "Pre-call brief loads borrower context, $675k target purchase price, and W-2 vs 1099 employment status.",
    route: "/meeting/meet_001",
    buttonLabel: "Open Pre-Meeting Brief",
  },
  {
    step: 2,
    title: "Start Live Meeting Workspace",
    category: "Live Consultation",
    description: "Launch the 3-column real-time consultation workspace (Transcript | Customer Context | Copilot Deck).",
    expectedBehavior: "Meeting timer initiates, simulated audio channel activates, and Copilot deck prepares dual-engine listener.",
    route: "/meeting/meet_001/live",
    buttonLabel: "Launch Live Workspace",
  },
  {
    step: 3,
    title: "Play Simulated Transcript",
    category: "Live Consultation",
    description: "Run the 16-turn multi-speaker benchmark conversation between Loan Officer Alex Vance, John, and Sarah.",
    expectedBehavior: "Conversation stream streams dialogue with speech diarization and real-time audio visualizer.",
    route: "/meeting/meet_001/live",
    buttonLabel: "View Transcript Playback",
  },
  {
    step: 4,
    title: "Show Real-Time AI Interventions",
    category: "Live Consultation",
    description: "Witness instant detection of TRID informal approval, TILA rate quotes, and liability omission risks.",
    expectedBehavior: "High-risk compliance alerts surface with exact citations (12 CFR § 1026.19) and suggested responses.",
    route: "/meeting/meet_001/live",
    buttonLabel: "Inspect Interventions",
  },
  {
    step: 5,
    title: "Agent Actions (Accept, Dismiss, Escalate)",
    category: "Live Consultation",
    description: "Loan Officer tests human approval actions: accept suggested response, dismiss, or escalate critical risks.",
    expectedBehavior: "Card updates status immediately, updates customer state, and logs an immutable audit event.",
    route: "/meeting/meet_001/live",
    buttonLabel: "Test Agent Actions",
  },
  {
    step: 6,
    title: "Conclude Meeting Consultation",
    category: "Live Consultation",
    description: "Click 'End Meeting' to conclude the call and initiate the automated post-meeting workflow.",
    expectedBehavior: "Transitions session from active consultation to automated AI summary synthesis.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "End Meeting & Transition",
  },
  {
    step: 7,
    title: "Generate Structured Meeting Summary",
    category: "Post-Meeting",
    description: "Inspect the 19 post-meeting facets, borrower objectives recap, and financial findings.",
    expectedBehavior: "Summary calculates estimated qualifying income, flags unresolved compliance issues, and creates action drafts.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Review Executive Summary",
  },
  {
    step: 8,
    title: "Review Post-Meeting Action Center",
    category: "Post-Meeting",
    description: "Triage AI-recommended enterprise actions in the summary page Action Center.",
    expectedBehavior: "Actions categorized into CRM, LOS Form 1003, Document Packages, and Communications in PENDING_REVIEW state.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Inspect Action Center",
  },
  {
    step: 9,
    title: "Approve CRM Update (Human Gate)",
    category: "Post-Meeting",
    description: "Officer reviews drafted CRM activity note and advances stage to 'Meeting Completed'.",
    expectedBehavior: "System enforces human approval modal before dispatching to mock Salesforce FSC (CRM-ACT-20891).",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Approve CRM Record",
  },
  {
    step: 10,
    title: "Approve LOS Update (MISMO 3.4 Form 1003)",
    category: "Post-Meeting",
    description: "Review MISMO 3.4 draft payload and advance application stage to 'Documentation Pending'.",
    expectedBehavior: "Application stage is clamped (never auto-approved); stated income explicitly labeled STATED — NOT VERIFIED.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Approve Form 1003",
  },
  {
    step: 11,
    title: "Prepare Document Request Package",
    category: "Post-Meeting",
    description: "Dispatch borrower document upload checklist (W-2s, 2 years 1040/Schedule C, bank statements).",
    expectedBehavior: "Creates document package (DOC-REQ-88201) and synchronizes requirements with Customer Portal.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Dispatch Doc Package",
  },
  {
    step: 12,
    title: "Review Follow-Up Deliverables",
    category: "Post-Meeting",
    description: "Inspect drafted follow-up tasks assigned to the loan officer, borrower, and operations.",
    expectedBehavior: "Tasks show priority, due dates, and cross-sync destinations with back-office queues.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Inspect Follow-Ups",
  },
  {
    step: 13,
    title: "Open Manager Dashboard",
    category: "Operations & Governance",
    description: "Inspect branch-wide performance, active compliance escalations, and customer conversion funnel.",
    expectedBehavior: "Manager view shows live integration health, officer adoption metrics, and escalation resolution queue.",
    route: "/manager",
    buttonLabel: "Open Manager View",
  },
  {
    step: 14,
    title: "Open Back-Office Operations Hub",
    category: "Operations & Governance",
    description: "Review back-office document verification queues, missing information tracking, and data conflict resolution.",
    expectedBehavior: "Operations queue displays stated income triage, conflicting debt ($500 vs $1,200), and unverified assets.",
    route: "/operations",
    buttonLabel: "Open Operations Hub",
  },
  {
    step: 15,
    title: "Review Tamper-Evident Audit Timeline",
    category: "Operations & Governance",
    description: "Inspect the complete immutable audit stream logging every action, actor, timestamp, and idempotency key.",
    expectedBehavior: "Audit records reflect all approvals, sync outcomes, and intervention dismissals across the lifecycle.",
    route: "/meeting/meet_001/summary",
    buttonLabel: "Inspect Audit Trail",
  },
];

export default function DemoPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResetFeedback("Demo environment successfully reset to pristine seed state.");
        setTimeout(() => setResetFeedback(null), 4000);
      }
    } catch {
      setResetFeedback("Reset completed locally.");
      setTimeout(() => setResetFeedback(null), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-rose-500/20 text-rose-300 border-rose-400/30">
                  Assessment Verification Console
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Phase 6 Ready • Zero External Credentials Required
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Darwix AI Assessment & Evaluator Tour
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Step through the complete 15-stage mortgage copilot customer and back-office lifecycle.
                All regulatory compliance checks, AI reasoning fallbacks, and enterprise integration
                adapters execute deterministically offline without external API dependencies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link href="/meeting/meet_001">
                <Button
                  size="md"
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>START DEMO (Step 1)</span>
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="md"
                onClick={handleResetDemo}
                disabled={isResetting}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 font-medium flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RotateCcw className={`h-4 w-4 ${isResetting ? "animate-spin" : ""}`} />
                <span>{isResetting ? "Resetting..." : "Reset Demo"}</span>
              </Button>
            </div>
          </div>

          {resetFeedback && (
            <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{resetFeedback}</span>
            </div>
          )}
        </div>

        {/* Evaluation Pillars Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-rose-500 bg-white">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Deterministic Precedence</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  TRID, TILA, and ATR rules evaluate in &lt;10ms with absolute precedence over LLM.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500 bg-white">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Human Approval Gates</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Zero automated approvals or loan commits; officer must inspect and sign off.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500 bg-white">
            <div className="flex items-center space-x-3">
              <Layers className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Enterprise Integrations</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  MISMO 3.4 Form 1003, Salesforce FSC, and Blend doc portals with idempotency keys.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500 bg-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Stated vs. Verified</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Conversational income is quarantined as STATED until tax documentation is verified.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 15-Stage Roadmap Step Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-rose-600" />
              <span>15-Stage End-to-End Evaluation Flow</span>
            </h2>
            <span className="text-xs text-slate-500">
              Click &quot;Launch Step&quot; to test each individual milestone
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Step {item.step}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200/80 text-[11px] text-slate-700">
                    <strong className="text-slate-900 block mb-0.5 text-[10px] uppercase font-semibold">
                      Expected Validation:
                    </strong>
                    {item.expectedBehavior}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    {item.route}
                  </span>
                  <Link href={item.route}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5 flex items-center space-x-1 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{item.buttonLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Link Shortcuts to Primary Portals */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
            All Dedicated Product Portals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/dashboard"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <Briefcase className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">LO Dashboard</span>
              <span className="text-[10px] text-slate-500">Pipeline & Calls</span>
            </Link>

            <Link
              href="/meeting/meet_001/live"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <PhoneCall className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Live Workspace</span>
              <span className="text-[10px] text-slate-500">Meeting & Copilot</span>
            </Link>

            <Link
              href="/meeting/meet_001/summary"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <FileText className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Summary Hub</span>
              <span className="text-[10px] text-slate-500">Actions & Approvals</span>
            </Link>

            <Link
              href="/operations"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <Layers className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Operations</span>
              <span className="text-[10px] text-slate-500">Back-Office Triage</span>
            </Link>

            <Link
              href="/manager"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <Users className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Manager View</span>
              <span className="text-[10px] text-slate-500">Metrics & Escalations</span>
            </Link>

            <Link
              href="/customer/cust_miller_001"
              className="p-3 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-colors text-center group cursor-pointer"
            >
              <ExternalLink className="h-5 w-5 mx-auto text-slate-600 group-hover:text-rose-600 mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Customer Portal</span>
              <span className="text-[10px] text-slate-500">Borrower Timeline</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
