"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { X, BookOpen, Sliders, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/shared/Button";

interface AppShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function AppShell({ children, hideHeader = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setHelpOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {!hideHeader && (
          <TopHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>

      {/* Help & Playbook Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-slate-800" />
                <h3 className="font-bold text-base text-slate-900">
                  Darwix AI Regulatory Playbook & Help
                </h3>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-slate-600 leading-relaxed pr-1">
              <div className="p-3 rounded bg-blue-50 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1">
                  1. TRID Informal Approval Guard (12 CFR § 1026.19)
                </h4>
                <p>
                  Never state a borrower is &ldquo;approved&rdquo; prior to underwriting sign-off. Always emphasize that issuance is a conditional pre-qualification letter subject to document verification.
                </p>
              </div>

              <div className="p-3 rounded bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-1">
                  2. TILA Reg Z Oral APR Disclosure (12 CFR § 1026.24)
                </h4>
                <p>
                  When quoting an interest rate verbally, you must state the Annual Percentage Rate (APR) and clarify that rates float until a formal lock agreement is executed.
                </p>
              </div>

              <div className="p-3 rounded bg-red-50 border border-red-200">
                <h4 className="font-bold text-red-900 mb-1">
                  3. Fannie Mae Liabilities Mandate (18 U.S.C. § 1014)
                </h4>
                <p>
                  All installment debts, leases, and obligations must be declared on Form 1003. Omitting debts constitutes mortgage fraud under federal statute.
                </p>
              </div>

              <div className="p-3 rounded bg-emerald-50 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-1">
                  4. Dodd-Frank ATR / QM Income Standards
                </h4>
                <p>
                  Self-employment income requires 2 consecutive years of filed tax returns and Schedule C. Unverifiable cash income cannot be counted.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button size="sm" onClick={() => setHelpOpen(false)}>
                Close Playbook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-slate-800" />
                <h3 className="font-bold text-base text-slate-900">
                  Officer & System Settings
                </h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">Deterministic TRID Guard</span>
                  <span className="text-[11px] text-slate-500">Sub-10ms pattern evaluation</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">Audio Diarization Mode</span>
                  <span className="text-[11px] text-slate-500">Offline Heuristic Simulation</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Phase 2 Mocks
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">Assigned Officer</span>
                  <span className="text-[11px] text-slate-500">Alex Vance, NMLS #1489201</span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button size="sm" onClick={() => setSettingsOpen(false)}>
                Save & Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
