import Link from "next/link";
import {
  Mic,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header Badge */}
      <div className="inline-flex items-center space-x-2 bg-slate-900 text-white text-xs px-3 py-1 rounded-full w-fit mb-6">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wide">DARWIX AI ENTERPRISE</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-300">U.S. Mortgage Sales Copilot</span>
      </div>

      {/* Hero Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
        Real-Time AI Copilot & Deterministic Compliance for Mortgage Sales
      </h1>
      <p className="text-base sm:text-lg text-slate-600 max-w-3xl mb-8 leading-relaxed">
        Empowering Loan Officers during high-stakes consultations with real-time Fannie Mae Form 1003 fact
        extraction, proactive objection handling, and non-negotiable TRID / TILA / RESPA deterministic guardrails.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Link href="/meeting/meet_001/live">
          <Button size="lg" className="flex items-center space-x-2 bg-slate-900 text-white">
            <Mic className="h-4 w-4 text-emerald-400" />
            <span>Launch Live Meeting Cockpit</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="flex items-center space-x-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Loan Officer Pipeline</span>
          </Button>
        </Link>
        <Link href="/manager">
          <Button size="lg" variant="outline" className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Manager Compliance Portal</span>
          </Button>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Link href="/meeting/meet_001" className="group block">
          <div className="p-5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all hover:shadow-xs">
            <div className="h-8 w-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600">
              1. Pre-Meeting Briefing
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review Miller family profile, preliminary credit tier, property goal ($585,000), and discovery plan.
            </p>
          </div>
        </Link>

        <Link href="/meeting/meet_001/live" className="group block">
          <div className="p-5 rounded-lg border border-slate-300 bg-white hover:border-slate-400 transition-all shadow-xs">
            <div className="h-8 w-8 rounded bg-red-50 text-red-700 flex items-center justify-center mb-3">
              <Mic className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-red-600">
              2. Live Consultation Cockpit
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              3-Column split screen: Conversation stream, Borrower 1003 dossier, and Darwix AI actionable card deck.
            </p>
          </div>
        </Link>

        <Link href="/meeting/meet_001/summary" className="group block">
          <div className="p-5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all hover:shadow-xs">
            <div className="h-8 w-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-emerald-600">
              3. Post-Meeting & Integrations
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Executive consultation recap, verified 1003 facts, follow-ups, and one-click Encompass/Salesforce sync.
            </p>
          </div>
        </Link>
      </div>

      {/* Architectural Pillars */}
      <div className="border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="flex items-start space-x-2.5">
          <Lock className="h-4 w-4 text-slate-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">Deterministic Priority</span>
            Hardcoded regulatory rules for TRID, TILA, and ATR/QM always override generative LLM output.
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">Human-in-the-Loop</span>
            Loan officers explicitly validate, dismiss, or escalate all recommendations with audit logging.
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <FileSpreadsheet className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">MISMO 3.4 & CRM Ready</span>
            Decoupled integration hub connects to Encompass LOS and Salesforce Financial Services Cloud.
          </div>
        </div>
      </div>
    </div>
  );
}
