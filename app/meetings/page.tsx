"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Filter, Search, Play } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { MeetingCard } from "@/components/shared/MeetingCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";

export default function MeetingsPage() {
  const meetings = repository.getAllMeetings();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredMeetings = meetings.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.borrowerNames && m.borrowerNames.toLowerCase().includes(q)) ||
        (m.purposeDescription && m.purposeDescription.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Consultation Meetings Pipeline"
        subtitle="Manage upcoming, in-progress, and completed borrower strategy sessions."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
            Pipeline Queue
          </span>
        }
        actions={
          <Link href="/meeting/meet_001/live">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5">
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Launch Live Session</span>
            </Button>
          </Link>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
          {[
            { id: "all", label: "All Sessions" },
            { id: "in_progress", label: "Live Now" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
            No meetings found for the selected filter.
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        )}
      </div>
    </div>
  );
}
