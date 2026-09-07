"use client";

import React, { useState } from "react";
import { CheckSquare, Filter, RefreshCw } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { TaskList } from "@/components/shared/TaskList";
import { Button } from "@/components/shared/Button";
import { FollowUpTask } from "@/types";

export default function TasksPage() {
  const allTasks = repository.getAllTasks();
  const [tasks, setTasks] = useState<FollowUpTask[]>(allTasks);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && t.assignedTo !== assigneeFilter) return false;
    return true;
  });

  const urgentCount = tasks.filter((t) => t.priority === "urgent" && !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const encompassCount = tasks.filter((t) => t.syncDestination === "encompass").length;

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("Successfully synchronized all tasks with Encompass LOS & Salesforce Financial Services Cloud.");
      setTimeout(() => setSyncStatus(null), 5000);
    }, 1200);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Origination & Compliance Tasks"
        subtitle="Manage borrower documentation requests, LOS sync deliverables, and compliance follow-ups."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
            Task Queue
          </span>
        }
        actions={
          <Button
            size="sm"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 bg-slate-900 text-white hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync to Encompass / CRM"}</span>
          </Button>
        }
      />

      {syncStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>{syncStatus}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open Tasks"
          value={tasks.length - completedCount}
          subtitle="Pending borrower or LO action"
          trendDirection="neutral"
          trendText="Current workload"
        />
        <MetricCard
          title="Urgent Deliverables"
          value={urgentCount}
          subtitle="Requires action within 24h"
          trendDirection="down"
          trendText="2 resolved today"
        />
        <MetricCard
          title="Encompass Items"
          value={encompassCount}
          subtitle="Mapped to LOS Form 1003"
          trendDirection="neutral"
          trendText="LOS ready"
        />
        <MetricCard
          title="Completion Rate"
          value={`${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%`}
          subtitle={`${completedCount} of ${tasks.length} resolved`}
          trendDirection="up"
          trendText="+25% completion"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 text-xs text-slate-500 mr-2 font-medium">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Priority:</span>
          </div>
          {[
            { id: "all", label: "All Priorities" },
            { id: "urgent", label: "Urgent" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                priorityFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-slate-500 mr-2 font-medium">Assignee:</div>
          {[
            { id: "all", label: "All" },
            { id: "loan_officer", label: "Loan Officer" },
            { id: "borrower", label: "Borrower" },
            { id: "underwriter", label: "Underwriting / Supervisor" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAssigneeFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                assigneeFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Panel */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Action Items ({filteredTasks.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Click checkbox to mark resolution
          </span>
        </div>

        <TaskList
          initialTasks={filteredTasks}
          onToggleTask={(taskId, completed) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
            );
          }}
        />
      </div>
    </div>
  );
}
