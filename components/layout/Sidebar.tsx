"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  ShieldCheck,
  HelpCircle,
  Settings,
  Sparkles,
  X,
  Building,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onOpenHelp,
  onOpenSettings,
}: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    {
      name: "Demo Tour",
      href: "/demo",
      icon: Sparkles,
      isActive: pathname === "/demo",
      badge: "GUIDE",
    },
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      name: "Meetings",
      href: "/meetings",
      icon: Calendar,
      isActive: pathname.startsWith("/meeting") || pathname === "/meetings",
      badge: pathname.includes("/live") ? "LIVE" : undefined,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      isActive: pathname.startsWith("/customer") || pathname === "/customers",
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      isActive: pathname === "/tasks",
      badge: "4",
    },
    {
      name: "Operations",
      href: "/operations",
      icon: Building,
      isActive: pathname === "/operations",
      badge: "3",
    },
    {
      name: "Manager",
      href: "/manager",
      icon: ShieldCheck,
      isActive: pathname === "/manager",
    },
    {
      name: "Integrations",
      href: "/settings/integrations",
      icon: Layers,
      isActive: pathname.startsWith("/settings/integrations"),
      badge: "MOCK",
    },
  ];


  const lowerNav = [
    {
      name: "Help & Playbooks",
      action: onOpenHelp,
      icon: HelpCircle,
    },
    {
      name: "Settings",
      action: onOpenSettings,
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col justify-between w-64 border-r border-slate-200 bg-white h-screen shrink-0 select-none",
        "transition-transform duration-200 ease-in-out z-40",
        // Desktop: static; Mobile: fixed drawer overlay
        "fixed lg:static top-0 bottom-0 left-0",
        isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Upper Section */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center space-x-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-black text-sm tracking-wider shadow-xs">
              D
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  DARWIX AI
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200">
                  v2.0
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Mortgage Copilot
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Origination Workspace
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors group",
                  item.isActive
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      item.isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] font-bold",
                      item.badge === "LIVE"
                        ? "bg-rose-500 text-white animate-pulse"
                        : item.isActive
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Cockpit Quick Launcher Button */}
        <div className="p-3 mx-2 my-1 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            <span>Active Session</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            John & Sarah Miller consultation ready for cockpit.
          </p>
          <Link
            href="/meeting/meet_001/live"
            onClick={onClose}
            className="inline-flex items-center justify-center w-full px-2.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-xs"
          >
            Launch Live Cockpit
          </Link>
        </div>
      </div>

      {/* Lower Section */}
      <div className="border-t border-slate-200 p-3 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Support & Preferences
        </div>
        {lowerNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                if (item.action) item.action();
                if (onClose) onClose();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-md transition-colors text-left cursor-pointer"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* User / Workspace Footer */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between px-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300 shadow-xs">
              AV
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                Alex Vance
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                NMLS #1489201 • Austin Central
              </div>
            </div>
          </div>

          <span
            title="Deterministic TRID & TILA Guard Active"
            className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse shrink-0"
          />
        </div>
      </div>
    </aside>
  );
}
