"use client";

import React, { useState } from "react";

import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { integrationManager, IntegrationSystemInfo } from "@/lib/integrations";
import { repository } from "@/lib/data/repository";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { AuditEvent } from "@/types";

export default function IntegrationCenterPage() {
  const [systems, setSystems] = useState<IntegrationSystemInfo[]>(() => integrationManager.getSystems());
  const [simulatedFailures, setSimulatedFailures] = useState<Record<string, boolean>>({});
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => repository.getAuditEvents());

  const loadSystems = () => {
    setSystems(integrationManager.getSystems());
    setAuditEvents(repository.getAuditEvents());
  };



  const handleToggleSimulation = (systemId: string) => {
    const nextState = !simulatedFailures[systemId];
    setSimulatedFailures((prev) => ({ ...prev, [systemId]: nextState }));
    integrationManager.setFailureSimulation(systemId, nextState);
  };

  const activeSystems = systems.filter((s) => s.status === "MOCKED" || s.status === "LIVE");
  const futureSystems = systems.filter((s) => s.status === "FUTURE");

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Enterprise Adapters
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Simulated Integration Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Enterprise Integration Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Adapter status, API endpoints, schema contracts, and failure handling across enterprise mortgage subsystems.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button size="sm" variant="outline" onClick={loadSystems} className="text-xs cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>Check Health</span>
          </Button>
          <Link href="/meeting/meet_001/summary">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer">
              <span>Return to Meeting Summary</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs text-amber-950 space-y-1">
        <div className="flex items-center space-x-2 font-bold text-amber-900">
          <Cpu className="h-4 w-4 text-amber-700" />
          <span>Demo Environment Notice</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          Current adapters run in <strong>MOCKED</strong> mode using contract-compliant MISMO 3.4 and REST schemas. AI recommendations cannot execute external API payloads without explicit loan officer approval.
        </p>
      </div>

      {/* 3. Active Integrations (MOCKED) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Active Core Integrations (Mocked Adapters)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSystems.map((sys) => (
            <Card key={sys.id} className="border-slate-200 shadow-xs">
              <CardHeader className="py-3 bg-slate-50/60 border-b border-slate-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold text-slate-900">{sys.name}</CardTitle>
                  <span className="text-[10px] text-slate-500">{sys.vendor}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {sys.status}
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs text-slate-700">
                <p className="text-[11px] text-slate-600 leading-relaxed">{sys.description}</p>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Version:</span>
                    <span className="text-slate-900">{sys.apiVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className="text-slate-900">
                      {sys.lastSyncTime ? new Date(sys.lastSyncTime).toLocaleTimeString() : "Today 10:45 AM"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approval Gate:</span>
                    <span className="text-emerald-700 font-bold">Mandatory Human Review</span>
                  </div>
                </div>

                {/* Failure Simulation QA Switch */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Simulate Network Failure (QA):</span>
                  <button
                    onClick={() => handleToggleSimulation(sys.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      simulatedFailures[sys.id]
                        ? "bg-red-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {simulatedFailures[sys.id] ? "Failure Active" : "Normal"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Future Integrations (FUTURE) */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Planned Future Integrations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {futureSystems.map((sys) => (
            <Card key={sys.id} className="border-slate-200 bg-slate-50/50">
              <CardContent className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    FUTURE
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{sys.apiVersion}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{sys.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-3 leading-snug">
                  {sys.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Recent System Integration Event Stream */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
            <span>Recent Integration Audit Trail</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 text-xs font-mono">
          {auditEvents
            .filter((e) => e.eventType.includes("crm") || e.eventType.includes("los") || e.eventType.includes("document"))
            .slice(0, 6)
            .map((e) => (
              <div key={e.id} className="p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-sans font-semibold text-slate-900">
                    {e.action || e.eventType.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div className="text-[11px] font-sans text-slate-500">
                    {e.details.notes || e.details.actionTaken}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
