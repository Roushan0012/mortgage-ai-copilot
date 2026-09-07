"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Mic,
  FileCheck2,
  Users,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Pipeline", href: "/dashboard", icon: LayoutDashboard },
    { label: "Pre-Meeting", href: "/meeting/meet_001", icon: Building2 },
    { label: "Live Cockpit", href: "/meeting/meet_001/live", icon: Mic, badge: "LIVE" },
    { label: "Post-Summary", href: "/meeting/meet_001/summary", icon: FileCheck2 },
    { label: "Manager Portal", href: "/manager", icon: ShieldAlert },
    { label: "Customer 360", href: "/customer/cust_miller_001", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold text-sm tracking-wider">
              D
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">DARWIX</span>
              <span className="ml-1.5 text-xs text-slate-500 font-normal">Mortgage AI Copilot</span>
            </div>
          </Link>
          <span className="hidden md:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden md:inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Deterministic TRID Guard Active
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Loan Officer Profile */}
        <div className="flex items-center space-x-3 text-right">
          <div className="hidden lg:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight">Alex Vance</div>
            <div className="text-[10px] text-slate-500">NMLS #1489201 • Senior MLO</div>
          </div>
          <div className="h-7 w-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
            AV
          </div>
        </div>
      </div>
    </header>
  );
}
