"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  ChevronRight,
  Clock,
  Eye,
  X,
  Building,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { MetricCard } from "@/components/shared/MetricCard";
import { DocumentItem, DocumentStatus } from "@/types";


export default function OperationsDashboardPage() {
  const [filter, setFilter] = useState<
    "all" | "high_priority" | "compliance" | "documents" | "los" | "crm" | "escalations"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>(() => repository.getDocumentItems());
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = () => {
    setDocuments(repository.getDocumentItems());
  };



  const handleUpdateDocStatus = (docId: string, status: DocumentStatus) => {
    const updated = repository.updateDocumentItem(docId, status, reviewNotes || `Processed by Operations`);
    if (updated) {
      repository.addAuditEvent({
        eventType: "FIELD_MARKED_FOR_VERIFICATION",
        meetingId: "meet_001",
        actor: { userId: "ops_spec_410", role: "Back Office Underwriter" },
        details: {
          actionTaken: `DOCUMENT_${status}`,
          documentId: docId,
          notes: `Operations updated "${updated.name}" status to ${status}`,
        },
      });
      setActionFeedback(`Document "${updated.name}" marked as ${status}`);
      setTimeout(() => setActionFeedback(null), 3000);
      setSelectedDoc(null);
      setReviewNotes("");
      loadData();
    }
  };

  const operations = repository.getOperationsOverview();

  // Unified Queue Items
  const queueItems = [
    {
      id: "Q-DOC-01",
      category: "documents",
      priority: "high",
      title: "Sarah Miller: 2024 & 2025 Schedule C Tax Returns",
      customer: "Sarah Miller (cust_miller_001)",
      source: "Post-Meeting Condition",
      status: "REQUESTED",
      stage: "Documentation Pending",
      owner: "Operations Document Team",
      reason: "Self-employment stated income ($38,000) requires 24-month tax return average under QM rules.",
      docId: "DOC-ITEM-303",
    },
    {
      id: "Q-DOC-02",
      category: "documents",
      priority: "high",
      title: "30-Day Most Recent Pay Stubs (Apex Cloud Technologies LLC)",
      customer: "John Miller (cust_miller_001)",
      source: "Borrower Portal Upload",
      status: "UPLOADED",
      stage: "Underwriting Verification",
      owner: "Operations Underwriter",
      reason: "Verifies stated W-2 base salary of $11,250/month and continuous employment.",
      docId: "DOC-ITEM-301",
    },
    {
      id: "Q-CONF-01",
      category: "compliance",
      priority: "high",
      title: "BMW Auto Lease ($590/mo) Omission Conflict",
      customer: "Sarah Miller (cust_miller_001)",
      source: "AI Meeting Intervention",
      status: "UNRESOLVED_DISCLOSURE",
      stage: "Liabilities Review",
      owner: "Compliance Officer",
      reason: "Borrower initially asked to exclude lease; Fannie Mae B3-6-01 mandates inclusion in Form 1003 obligations.",
    },
    {
      id: "Q-ESCAL-01",
      category: "escalations",
      priority: "high",
      title: "Informal Approval Retraction Sign-Off",
      customer: "John & Sarah Miller (meet_001)",
      source: "TRID Guard Escalation",
      status: "SUPERVISOR_REVIEW",
      stage: "Branch Oversight",
      owner: "Branch Operations Manager",
      reason: "Verbal pre-approval statement was retracted and replaced with formal conditional pre-qualification letter.",
    },
    {
      id: "Q-LOS-01",
      category: "los",
      priority: "medium",
      title: "Encompass Draft MISMO 3.4 Validation (ENC-1003-99412)",
      customer: "John & Sarah Miller",
      source: "LOS Adapter",
      status: "PENDING_UNDERWRITING_IMPORT",
      stage: "Information Collection",
      owner: "Loan Setup Desk",
      reason: "Ensure all stated income fields are flagged as STATED — NOT VERIFIED prior to automated AUS run.",
    },
    {
      id: "Q-CRM-01",
      category: "crm",
      priority: "low",
      title: "Salesforce FSC Lead Task Synchronization (CRM-LEAD-10482)",
      customer: "John & Sarah Miller",
      source: "CRM Adapter",
      status: "SYNC_ACTIVE",
      stage: "Qualified / Needs Documentation",
      owner: "Alex Vance (Originator)",
      reason: "Automated task checklist created for 2-day competitor LE collection follow-up.",
    },
    {
      id: "Q-DOC-03",
      category: "documents",
      priority: "medium",
      title: "Official Written Competitor Loan Estimate (Rocket Mortgage)",
      customer: "John Miller (cust_miller_001)",
      source: "Competitive Match Request",
      status: "REQUESTED",
      stage: "Pricing Desk Review",
      owner: "Secondary Marketing / Pricing",
      reason: "Written TRID Loan Estimate required to substantiate price match request on 6.125% quote.",
      docId: "DOC-ITEM-307",
    },
  ];

  // Filtering
  const filteredItems = queueItems.filter((item) => {
    if (filter === "high_priority" && item.priority !== "high") return false;
    if (filter === "compliance" && item.category !== "compliance") return false;
    if (filter === "documents" && item.category !== "documents") return false;
    if (filter === "los" && item.category !== "los") return false;
    if (filter === "crm" && item.category !== "crm") return false;
    if (filter === "escalations" && item.category !== "escalations") return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              Back Office Originations
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Operations & Fulfillment Command Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Operations & Document Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Fulfillment processing, document condition sign-offs, stated-income validation, and LOS payload verification.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button size="sm" variant="outline" onClick={loadData} className="text-xs cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span>Refresh Queue</span>
          </Button>
          <Link href="/settings/integrations">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer">
              <span>Integration Status</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 2. Key Metrics Row (4 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Document Queue"
          value={operations.documentVerificationQueue.length.toString()}
          subtitle="Awaiting underwriter review"
          icon={<FileCheck className="h-4 w-4" />}
          trendText="3 ready for verification"
          trendDirection="neutral"
        />

        <MetricCard
          title="Information Gaps"
          value={operations.missingInformation.length.toString()}
          subtitle="Outstanding borrower conditions"
          icon={<Clock className="h-4 w-4" />}
        />

        <MetricCard
          title="Compliance Escalations"
          value={operations.complianceEscalations.length.toString()}
          subtitle="1 branch manager review"
          icon={<ShieldAlert className="h-4 w-4 text-rose-600" />}
        />

        <MetricCard
          title="Pending Approvals"
          value={operations.pendingApprovals.length.toString()}
          subtitle="Agent action center items"
          icon={<Layers className="h-4 w-4" />}
          trendText="All gated"
          trendDirection="neutral"
        />
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
            <Filter className="h-3 w-3 mr-1" /> Filter:
          </span>
          {[
            { key: "all", label: "All Items" },
            { key: "high_priority", label: "High Priority" },
            { key: "documents", label: "Documents" },
            { key: "compliance", label: "Compliance & Conflicts" },
            { key: "escalations", label: "Escalations" },
            { key: "los", label: "LOS Sync" },
            { key: "crm", label: "CRM" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search borrower, condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* 4. Operations Queue Table */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
            <Building className="h-4 w-4 text-slate-700" />
            <span>Fulfillment & Verification Queue ({filteredItems.length})</span>
          </CardTitle>
          <span className="text-xs text-slate-500 font-mono">
            Demo environment — simulated enterprise integration
          </span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-400">
                    {item.id}
                  </span>
                  <strong className="text-xs text-slate-900">{item.title}</strong>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      item.priority === "high"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {item.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.reason}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                  <span>Customer: <strong className="text-slate-700">{item.customer}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-slate-700">{item.source}</strong></span>
                  <span>•</span>
                  <span>Assigned: <strong className="text-slate-700">{item.owner}</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 self-end md:self-center flex items-center space-x-2">
                {item.docId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const doc = documents.find((d) => d.id === item.docId);
                      if (doc) setSelectedDoc(doc);
                    }}
                    className="text-xs cursor-pointer font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1 text-slate-600" />
                    <span>Review Condition</span>
                  </Button>
                ) : item.category === "compliance" ? (
                  <Link href="/meeting/meet_001/summary">
                    <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                      <span>View Form 1003 Audit</span>
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Active Pipeline
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. Document Review Drawer/Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Operations Condition Review
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {selectedDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Borrower:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.borrowerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-900 uppercase">{selectedDoc.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-slate-900">{selectedDoc.status}</span>
                </div>
                {selectedDoc.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Attachment:</span>
                    <span className="font-mono text-slate-900">{selectedDoc.fileSize}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Underwriter Review Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. W-2 verified against Fannie Mae guidelines; Schedule C YTD confirmed..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateDocStatus(selectedDoc.id, "REJECTED")}
                className="text-red-700 border-red-200 hover:bg-red-50 text-xs cursor-pointer"
              >
                Reject Condition
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateDocStatus(selectedDoc.id, "UNDER_REVIEW")}
                  className="text-xs cursor-pointer"
                >
                  Mark Under Review
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateDocStatus(selectedDoc.id, "VERIFIED")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Verify Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
