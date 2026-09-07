"use client";

import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { CustomerCard } from "@/components/shared/CustomerCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";

export default function CustomersPage() {
  const customers = repository.getAllCustomers();
  const [search, setSearch] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((c) => {
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const primaryName = `${c.primaryBorrower.firstName} ${c.primaryBorrower.lastName}`.toLowerCase();
      const coName = c.coBorrower ? `${c.coBorrower.firstName} ${c.coBorrower.lastName}`.toLowerCase() : "";
      const email = c.primaryBorrower.email.toLowerCase();
      return primaryName.includes(q) || coName.includes(q) || email.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Borrower Client Directory"
        subtitle="Manage mortgage applicant dossiers, credit qualifications, and application stages."
        badge={
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
            Client Portfolio
          </span>
        }
      />

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Borrowers"
          value={customers.length}
          subtitle="4 in current pipeline"
          trendDirection="up"
          trendText="+1 new this week"
        />
        <MetricCard
          title="Average FICO"
          value="738"
          subtitle="Tier-1 prime concentration"
          trendDirection="neutral"
          trendText="Stable credit profile"
        />
        <MetricCard
          title="Pipeline Volume"
          value="$2.45M"
          subtitle="Avg purchase $612.5k"
          trendDirection="up"
          trendText="+14% vs last month"
        />
        <MetricCard
          title="Pre-Qualification Rate"
          value="85%"
          subtitle="Ready for 1003 submission"
          trendDirection="up"
          trendText="Compliant pre-quals"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
          {[
            { id: "all", label: "All Clients" },
            { id: "consultation", label: "Consultation" },
            { id: "pre_qualification", label: "Pre-Qualification" },
            { id: "application", label: "Application" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStageFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                stageFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by borrower name or email..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Customer Dossier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
            No borrowers found matching the selected filter.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        )}
      </div>
    </div>
  );
}
