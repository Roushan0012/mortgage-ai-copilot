"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface TopHeaderProps {
  onToggleSidebar?: () => void;
}

export function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine contextual page title based on path
  const getContextualHeader = () => {
    if (pathname === "/dashboard" || pathname === "/") {
      return {
        title: "Loan Officer Command Center",
        subtitle: "Austin Central Branch • Tuesday, Sep 8, 2026",
      };
    }
    if (pathname.includes("/live")) {
      return {
        title: "Live Consultation Cockpit",
        subtitle: "Dual-Engine Regulatory Guardrails & Form 1003 Fact Extraction",
      };
    }
    if (pathname.includes("/summary")) {
      return {
        title: "Post-Meeting Summary & Audit Record",
        subtitle: "Verified Form 1003 Facts, Compliance Audit Trail & LOS/CRM Sync",
      };
    }
    if (pathname.startsWith("/meeting/")) {
      return {
        title: "Pre-Meeting Consultation Dossier",
        subtitle: "AI-Ready Discovery Plan, Borrower Profile & Regulatory Strategy",
      };
    }
    if (pathname === "/meetings") {
      return {
        title: "Scheduled & Active Consultations",
        subtitle: "Loan Officer Daily Meeting Pipeline & Readiness Queue",
      };
    }
    if (pathname.startsWith("/customer")) {
      return {
        title: "Customer 360 & Mortgage Journey",
        subtitle: "Borrower Application Progress, Document Checklist & Status",
      };
    }
    if (pathname === "/manager") {
      return {
        title: "Branch Manager Operations Portal",
        subtitle: "Real-time Compliance Supervision, LO Adoption & Escalations",
      };
    }
    if (pathname === "/tasks") {
      return {
        title: "Origination Action Tasks",
        subtitle: "Document Conditions, Follow-Up Milestones & Verification Items",
      };
    }
    return {
      title: "Darwix AI Mortgage Copilot",
      subtitle: "Enterprise Loan Origination Intelligence",
    };
  };

  const headerInfo = getContextualHeader();

  const mockNotifications = [
    {
      id: "notif_1",
      title: "TRID Compliance Escalation",
      desc: "Informal approval statement flagged in Miller consultation",
      time: "10 mins ago",
      type: "alert",
    },
    {
      id: "notif_2",
      title: "Meeting Starting Soon",
      desc: "Michael Carter refinance consultation scheduled for 11:00 AM",
      time: "45 mins ago",
      type: "reminder",
    },
    {
      id: "notif_3",
      title: "Encompass Sync Completed",
      desc: "Robert Garcia Form 1003 verified facts transmitted to LOS",
      time: "1 hr ago",
      type: "success",
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-800 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {headerInfo.title}
            </h1>
            <span className="hidden xl:inline-block text-xs text-slate-300">•</span>
            <span className="hidden xl:inline-block text-xs text-slate-500 truncate">
              {headerInfo.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Search, System Guard Status, Notifications, Profile */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Quick Search */}
        <div className="hidden md:flex items-center relative w-52 lg:w-64">
          <Search className="h-3.5 w-3.5 absolute left-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search borrower or loan #..."
            className="w-full pl-8 pr-8 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Deterministic Guardrail Status Pill */}
        <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden md:inline">TRID Guard Active</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Notifications & Alerts</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        {n.type === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
                        {n.type === "reminder" && <Clock className="h-3.5 w-3.5 text-blue-600" />}
                        {n.type === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-center border-t border-slate-100">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
          <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            AV
          </div>
        </div>
      </div>
    </header>
  );
}
