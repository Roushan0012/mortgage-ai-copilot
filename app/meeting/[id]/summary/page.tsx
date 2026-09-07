"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  Send,
  Layers,
  ArrowRight,
  FileQuestion,
  Sparkles,
  DollarSign,
  Check,
  FileText,
  RefreshCw,
  X,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import {
  integrationManager,
  CRMSyncResult,
  LOSSyncResult,
  DocumentRequestResult,
} from "@/lib/integrations";

import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { TaskList } from "@/components/shared/TaskList";
import {
  PostMeetingAction,
  DocumentItem,
  AuditEvent,
} from "@/types";

export default function MeetingSummaryPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || "meet_001";

  const meeting = repository.getMeeting(meetingId);
  const summary = repository.getMeetingSummary(meetingId);
  const customer = meeting ? repository.getCustomer(meeting.customerId) : null;

  // Local state for actions, documents, and audit logs initialized directly from repository
  const [actions, setActions] = useState<PostMeetingAction[]>(() => repository.getPostMeetingActions());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => repository.getDocumentItems());
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => repository.getAuditEvents(meetingId));
  const [signedOff, setSignedOff] = useState(false);

  // Sync execution states
  const [isSyncingCRM, setIsSyncingCRM] = useState(false);
  const [crmResult, setCrmResult] = useState<CRMSyncResult | null>(null);

  const [isSyncingLOS, setIsSyncingLOS] = useState(false);
  const [losResult, setLosResult] = useState<LOSSyncResult | null>(null);

  const [isRequestingDocs, setIsRequestingDocs] = useState(false);
  const [docResult, setDocResult] = useState<DocumentRequestResult | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    "crm_review" | "los_review" | "doc_review" | "payload_view" | null
  >(null);
  const [payloadViewContent, setPayloadViewContent] = useState<{ title: string; data: unknown } | null>(null);

  // Selected documents in modal
  const [selectedDocIds, setSelectedDocIds] = useState<Record<string, boolean>>(() => {
    const docMap: Record<string, boolean> = {};
    repository.getDocumentItems().forEach((d) => {
      docMap[d.id] = d.status !== "VERIFIED";
    });
    return docMap;
  });

  // Active view tab (Summary vs Audit Stream)
  const [activeTab, setActiveTab] = useState<"summary" | "audit">("summary");

  const refreshData = () => {
    setActions(repository.getPostMeetingActions());
    setDocuments(repository.getDocumentItems());
    setAuditEvents(repository.getAuditEvents(meetingId));

    const docMap: Record<string, boolean> = {};
    repository.getDocumentItems().forEach((d) => {
      docMap[d.id] = d.status !== "VERIFIED";
    });
    setSelectedDocIds(docMap);
  };



  if (!meeting || !summary || !customer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12">
        <h2 className="text-base font-bold text-slate-900">Summary Not Available</h2>
        <p className="text-xs text-slate-500 mt-1">Could not find record for ID: {meetingId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  // ============================================================================
  // Workflow 1: CRM Sync
  // ============================================================================
  const executeCRMSync = async () => {
    setIsSyncingCRM(true);
    try {
      const res = await integrationManager.syncCRM({
        meeting,
        customer,
        payload: {
          meetingId: meeting.id,
          customerId: customer.id,
          leadStage: "Qualified / Needs Documentation",
          outcome: "Qualified / Needs Documentation",
          nextAction: "Collect income and liability documents",
          notes: `Consultation concluded. Identified BMW lease obligation ($590/mo), W-2 and Schedule C income. Rate discussion on 30Y conventional fixed.`,
          tasks: [
            {
              title: "Request Sarah Miller 2024 & 2025 Schedule C Tax Returns",
              priority: "High",
              dueDate: "Tomorrow",
              reason: "Verify stated $38k net self-employment earnings under Dodd-Frank QM.",
            },
            {
              title: "Collect Official Written Loan Estimate from Rocket Mortgage",
              priority: "Normal",
              dueDate: "In 2 days",
              reason: "Substantiate price match request on 6.125% quote.",
            },
          ],
        },
        isApproved: true,
      });
      setCrmResult(res);
      repository.updatePostMeetingActionStatus("act_03", "completed", res.crmLeadId);
      refreshData();
      setActiveModal(null);
    } finally {
      setIsSyncingCRM(false);
    }
  };

  // ============================================================================
  // Workflow 2: LOS Sync
  // ============================================================================
  const executeLOSSync = async () => {
    setIsSyncingLOS(true);
    try {
      const res = await integrationManager.syncLOS({
        meeting,
        customer,
        payload: {
          meetingId: meeting.id,
          customerId: customer.id,
          targetStage: "Documentation Pending",
          officerAttestation: true,
          officerNMLS: "1489201",
        },
        isApproved: true,
      });
      setLosResult(res);
      repository.updatePostMeetingActionStatus("act_02", "completed", res.loanIdentifier);
      refreshData();
      setActiveModal(null);
    } finally {
      setIsSyncingLOS(false);
    }
  };

  // ============================================================================
  // Workflow 3: Document Request
  // ============================================================================
  const executeDocRequest = async () => {
    setIsRequestingDocs(true);
    try {
      const docsToRequest = documents.filter((d) => selectedDocIds[d.id]);
      const res = await integrationManager.requestDocuments({
        customer,
        applicationId: customer.losApplicationId || "ENC-1003-99412",
        meetingId: meeting.id,
        documents: docsToRequest,
        isApproved: true,
      });
      setDocResult(res);
      repository.updatePostMeetingActionStatus("act_01", "completed", res.requestId);
      refreshData();
      setActiveModal(null);
    } finally {
      setIsRequestingDocs(false);
    }
  };

  // ============================================================================
  // Action Center Handler (Approve / Dismiss / Execute)
  // ============================================================================
  const handleActionClick = async (action: PostMeetingAction, targetState: "approved" | "dismissed") => {
    if (targetState === "approved") {
      // If approved, trigger the review modal for sensitive operations
      if (action.category === "crm") {
        setActiveModal("crm_review");
      } else if (action.category === "los") {
        setActiveModal("los_review");
      } else if (action.category === "documents") {
        setActiveModal("doc_review");
      } else {
        repository.updatePostMeetingActionStatus(action.id, "approved");
        refreshData();
      }
    } else {
      repository.updatePostMeetingActionStatus(action.id, "dismissed");
      repository.addAuditEvent({
        eventType: "action_dismissed",
        meetingId: meeting.id,
        actor: { userId: "lo_avance_402", role: "Loan Officer" },
        details: { actionTaken: "DISMISS_ACTION", actionId: action.id, title: action.title },
      });
      refreshData();
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Enterprise Integration Status Banner */}
      <div className="rounded-lg bg-slate-900 text-slate-300 p-3.5 px-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 mr-2">
              Demo Environment
            </span>
            <span className="text-slate-300">
              Simulated enterprise integration adapters active (CRM: Mocked • LOS: Mocked • Docs: Mocked • Comms: Mocked).
            </span>
          </div>
        </div>
        <Link
          href="/settings/integrations"
          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <span>Integration Center</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 2. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Post-Meeting Summary & Audit Record
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Completed at 10:45 AM • 45m Consultation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {primary.firstName} & {coBorrower?.firstName} {primary.lastName} — First-Time Homebuyer Discovery
          </h1>
          <p className="text-xs text-slate-500">
            Loan Officer: {meeting.assignedLoanOfficerName} • Consultation ID: {meeting.id}
          </p>
        </div>

        {/* Sync Action Buttons with Approval Gates */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveModal("crm_review")}
            className="flex items-center space-x-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-blue-600" />
            <span>Sync to CRM</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal("los_review")}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Prepare LOS Update</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveModal("doc_review")}
            className="flex items-center space-x-1.5 cursor-pointer"
          >
            <FileCheck className="h-3.5 w-3.5 text-rose-600" />
            <span>Prepare Document Request</span>
          </Button>
        </div>
      </div>

      {/* Sync Success Feedback Bars */}
      {(crmResult || losResult || docResult) && (
        <div className="space-y-2 animate-in fade-in duration-150">
          {crmResult && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  {crmResult.isIdempotentReplay ? "Already synced: " : "CRM Sync Successful: "}
                  {crmResult.event.payloadSummary} (Record: {crmResult.crmLeadId})
                </span>
              </div>
              <button
                onClick={() =>
                  setPayloadViewContent({
                    title: "Salesforce FSC CRM Payload (SObject)",
                    data: crmResult.event.rawPayload,
                  })
                }
                className="text-[11px] font-mono text-blue-800 underline hover:text-blue-950 cursor-pointer"
              >
                Inspect CRM Payload
              </button>
            </div>
          )}

          {losResult && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {losResult.isIdempotentReplay ? "Already synced: " : "LOS Draft Updated: "}
                  {losResult.event.payloadSummary} (ID: {losResult.loanIdentifier})
                </span>
              </div>
              <button
                onClick={() =>
                  setPayloadViewContent({
                    title: "Encompass MISMO 3.4 Data Schema",
                    data: losResult.event.rawPayload,
                  })
                }
                className="text-[11px] font-mono text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
              >
                Inspect MISMO 3.4
              </button>
            </div>
          )}

          {docResult && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  Document request created: Request ID {docResult.requestId} with {docResult.requestedDocumentsCount} items queued for borrower portal.
                </span>
              </div>
              <button
                onClick={() =>
                  setPayloadViewContent({
                    title: "Document Verification Request Payload",
                    data: docResult.event.rawPayload,
                  })
                }
                className="text-[11px] font-mono text-rose-800 underline hover:text-rose-950 cursor-pointer"
              >
                Inspect Request Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Section: Post-Meeting Action Center (High-Visibility Priority) */}
      <Card className="border-slate-300 shadow-sm overflow-hidden">
        <CardHeader className="py-3 bg-slate-100/70 border-b border-slate-200 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-sm font-bold text-slate-900">
              Post-Meeting Action Center
            </CardTitle>
            <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              {actions.filter((a) => a.status === "ready_for_approval").length} Pending Approval
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            AI Prepared • Human Approval Gate Required
          </span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{act.action}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      act.status === "completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : act.status === "approved"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : act.status === "dismissed"
                        ? "bg-slate-100 text-slate-500 border-slate-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {act.status.replace(/_/g, " ")}
                  </span>
                  {act.approvalRequired && act.status !== "completed" && (
                    <span className="text-[10px] text-slate-500 font-medium flex items-center">
                      <ShieldAlert className="h-3 w-3 mr-0.5 text-amber-600" />
                      Approval Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{act.reason}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                  <span>Owner: <strong className="text-slate-700">{act.owner}</strong></span>
                  <span>•</span>
                  <span>Due: <strong className="text-slate-700">{act.dueDate}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-slate-700">{act.source.replace(/_/g, " ")}</strong></span>
                  {act.executedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono">Executed: {act.executionResult}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {act.status === "ready_for_approval" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleActionClick(act, "approved")}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Review & Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionClick(act, "dismissed")}
                      className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Dismiss
                    </Button>
                  </>
                )}
                {act.status === "approved" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (act.category === "crm") executeCRMSync();
                      if (act.category === "los") executeLOSSync();
                      if (act.category === "documents") executeDocRequest();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Execute Action
                  </Button>
                )}
                {act.status === "completed" && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                    <Check className="h-4 w-4" />
                    <span>Completed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Tab Navigation: Comprehensive Summary vs Unified Audit Timeline */}
      <div className="border-b border-slate-200 flex items-center space-x-4">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "summary"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Structured Consultation Summary
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "audit"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Unified Enterprise Audit Trail</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {auditEvents.length}
          </span>
        </button>
      </div>

      {activeTab === "summary" ? (
        /* Main Structured Summary Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Executive, Profile, Form 1003, Gaps, Documents */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Executive Summary */}
            <Card>
              <CardHeader className="py-3 bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-slate-700" />
                  <span>1. Executive Consultation Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <p>{summary.executiveSummary}</p>
                <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200 text-blue-900 text-[11px]">
                  <strong>Consultation Strategy:</strong> Primary borrower John Miller qualifies with strong W-2 income ($135k base). Sarah&apos;s self-employment graphic design business provides $38k net income, requiring 24-month tax return averages under QM standards.
                </div>
              </CardContent>
            </Card>

            {/* 2. Customer Goals & Objectives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-2.5 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold">2. Customer Goals & Property Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-3 text-xs space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Target Property:</span>
                    <span className="font-semibold text-slate-900">Single Family (South Austin, TX)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Target Purchase Price:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(goal.targetPurchasePrice)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Down Payment:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(goal.targetDownPaymentAmount)} (14.5%)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span>Closing Timeline:</span>
                    <span className="font-semibold text-slate-900">2–4 Weeks (Urgent)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First-Time Homebuyer:</span>
                    <span className="font-semibold text-emerald-700">Yes (Both Borrowers)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2.5 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold">3. Mortgage Discussion & Objections</CardTitle>
                </CardHeader>
                <CardContent className="p-3 text-xs space-y-2 text-slate-700 leading-relaxed">
                  <p>
                    <strong>Product Compared:</strong> 30-Year Conventional Fixed vs. 15-Year Fixed. 30-year selected to maintain comfortable monthly obligation under $3,650.
                  </p>
                  <p>
                    <strong>Customer Objection Addressed:</strong> Borrower cited competing Rocket Mortgage 6.125% verbal offer. Loan officer properly disclaimed that rate comparisons require an official written TRID Loan Estimate detailing APR and discount points.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3. Stated Financial Ledger (CRUCIAL Stated vs Verified Callout) */}
            <Card className="border-slate-300">
              <CardHeader className="py-3 bg-slate-50/70 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold">
                    4. Financial Profile & Stated Income Ledger
                  </CardTitle>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  Status: Stated — Not Verified
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Stated Monthly Income</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(summary.keyFinancialFindings.qualifyingIncomeTotal)}
                    </span>
                    <span className="text-[9px] text-amber-700 block font-semibold">Unverified (Pending W-2)</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Monthly Obligations</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(summary.keyFinancialFindings.monthlyDebtsTotal)}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-medium">Includes BMW Lease</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Estimated Back DTI</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      {summary.keyFinancialFindings.estimatedDTI}%
                    </span>
                    <span className="text-[9px] text-slate-500 block font-medium">Under 43% QM Limit</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Target Loan Amount</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatCurrency(summary.keyFinancialFindings.targetLoanAmount)}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-medium">Conventional Conforming</span>
                  </div>
                </div>

                {/* Stated Liabilities Breakdown */}
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    Disclosed Liabilities & Debts Ledger
                  </div>
                  <div className="divide-y divide-slate-100 text-[11px]">
                    <div className="p-2.5 flex justify-between items-center">
                      <div>
                        <strong>Toyota Financial Services:</strong> Auto Loan (John Miller)
                      </div>
                      <div className="font-mono text-slate-900">$480/mo ($14,200 balance) • Stated</div>
                    </div>
                    <div className="p-2.5 flex justify-between items-center">
                      <div>
                        <strong>FedLoan Servicing:</strong> Student Loan (John Miller)
                      </div>
                      <div className="font-mono text-slate-900">$340/mo ($24,000 balance) • Stated</div>
                    </div>
                    <div className="p-2.5 flex justify-between items-center bg-amber-50/30">
                      <div>
                        <strong className="text-amber-950">BMW Financial Services:</strong> Auto Lease (Sarah Miller)
                        <span className="text-[10px] text-amber-700 block">
                          Captured via Copilot intervention. Cannot be excluded from DTI under Fannie Mae Selling Guide B3-6-01.
                        </span>
                      </div>
                      <div className="font-mono font-bold text-amber-950">$590/mo ($18,200 obligation)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Information Gaps & Potential Verification Documents */}
            <Card className="border-amber-200 bg-amber-50/20">
              <CardHeader className="py-3 border-b border-amber-200/70 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center space-x-1.5">
                  <FileQuestion className="h-4 w-4 text-amber-700" />
                  <span>5. Known Information Gaps & Potential Documents to Verify</span>
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setActiveModal("doc_review")}
                  className="bg-amber-900 hover:bg-amber-800 text-white text-[11px] cursor-pointer"
                >
                  Manage Verification Checklist
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs text-slate-700">
                <p className="text-[11px] text-slate-500 italic">
                  Note: Under Fannie Mae guidelines, items below represent potential documents to verify eligibility rather than guaranteed loan approval conditions.
                </p>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded bg-white border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-slate-500">{doc.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            doc.status === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : doc.status === "UPLOADED"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {doc.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 5. Follow-Up Action Milestones */}
            <Card>
              <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">6. Follow-Up Action Milestones</CardTitle>
                <span className="text-xs text-slate-500 font-medium">
                  {summary.followUpTasks.length} Milestones
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <TaskList initialTasks={summary.followUpTasks} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column (4 cols): Compliance Verdict, Officer Attestation, Integration Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Compliance Audit Verdict */}
            <Card className="border-amber-300 bg-amber-50/25 shadow-xs">
              <CardHeader className="py-3 border-b border-amber-200">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <CardTitle className="text-amber-950 text-sm font-bold">
                    Compliance Audit Verdict
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 block text-xs uppercase tracking-wider">
                    Supervisor Review Required
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    1 critical TRID informal approval statement was flagged and escalated for Branch Manager sign-off prior to formal underwriting.
                  </p>
                </div>

                <div className="border-t border-amber-200 pt-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Alerts Raised:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {summary.complianceStatus.totalAlertsRaised}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Resolved by Officer:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {summary.complianceStatus.resolvedAlertsCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Supervisor Escalations:</span>
                    <span className="font-bold text-red-700 font-mono">
                      {summary.complianceStatus.escalatedAlertsCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Officer Attestation Form */}
            <Card>
              <CardHeader className="py-3 bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                  <span>Officer Attestation & Sign-Off</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  I attest under 18 U.S.C. § 1014 that borrower financial data recorded herein has been captured in good faith according to Fannie Mae selling guidelines and ECOA Fair Lending statutes. Stated income has not been represented as verified.
                </p>

                {signedOff ? (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Attestation signed by Alex Vance, NMLS #1489201</span>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    onClick={() => {
                      setSignedOff(true);
                      repository.addAuditEvent({
                        eventType: "summary_generated",
                        meetingId: meeting.id,
                        actor: { userId: "lo_avance_402", role: "Loan Officer" },
                        details: { actionTaken: "OFFICER_SIGNED_OFF", nmls: "1489201" },
                      });
                      refreshData();
                    }}
                  >
                    Sign & Commit Audit Record
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Borrower Portal Quick Access */}
            <Card className="bg-slate-900 text-white">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-rose-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Customer Experience
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Borrower Financing Portal</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Borrowers see a clean, simplified status timeline with requested documents. Internal risk scores, compliance reasoning, and metadata remain hidden.
                </p>
                <Link href={`/customer/${customer.id}`} className="inline-block pt-1">
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer">
                    <span>Open Borrower Portal</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Unified Enterprise Audit Trail Stream */
        <Card>
          <CardHeader className="py-3 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">
                Unified Enterprise Audit Stream
              </CardTitle>
              <p className="text-xs text-slate-500">
                Tamper-evident record of all transcript extractions, compliance alerts, agent decisions, and system sync events.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={refreshData} className="cursor-pointer text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              <span>Refresh</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 font-mono text-xs">
            {auditEvents.map((evt) => (
              <div key={evt.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5 max-w-2xl font-sans">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {evt.action || evt.eventType.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {evt.actor.role} ({evt.actor.userId})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    {evt.details.notes || String(evt.details.actionTaken || "Action logged")}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {evt.id}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          MODAL 1: CRM Review & Approval Gate
         ========================================================================= */}
      {activeModal === "crm_review" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Approval Gate Required
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  Sync to Salesforce FSC (CRM)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Review the changes detected during consultation before pushing to Salesforce Financial Services Cloud.
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Lead Record:</span>
                  <span className="font-semibold text-slate-900">CRM-LEAD-10482 (John & Sarah Miller)</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Lead Stage Update:</span>
                  <span className="font-semibold text-emerald-700">Qualified / Needs Documentation</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Next Action:</span>
                  <span className="font-semibold text-slate-900">Collect income and liability documents</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Follow-Up Tasks to Create:</span>
                  <span className="font-semibold text-slate-900">2 Automated Tasks (Schedule C, Written LE)</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900">
                <strong>Idempotency Guarantee:</strong> Pushing this update will generate activity record CRM-ACT-20891. Duplicate clicks will not create redundant leads or task duplicates.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isSyncingCRM}
                onClick={executeCRMSync}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Approve & Sync to CRM
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: LOS Review & Approval Gate
         ========================================================================= */}
      {activeModal === "los_review" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Form 1003 Approval Gate
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  Prepare Encompass LOS Update (MISMO 3.4)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                The AI Copilot has drafted Form 1003 updates. By enterprise policy, consultation data moves the application to <strong>Documentation Pending</strong> and strictly records income as <strong>STATED — NOT VERIFIED</strong>.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Primary Borrower</span>
                    <strong className="text-slate-900">John Miller</strong> (W-2: Apex Cloud)
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Stated Base Income</span>
                    <strong className="font-mono text-slate-900">$11,250/mo</strong>
                    <span className="text-[10px] text-amber-700 font-bold block">STATED — NOT VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Co-Borrower</span>
                    <strong className="text-slate-900">Sarah Miller</strong> (Self-Employed)
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Stated Net Income</span>
                    <strong className="font-mono text-slate-900">$3,166/mo</strong>
                    <span className="text-[10px] text-amber-700 font-bold block">STATED — NOT VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Target LOS Stage</span>
                    <span className="font-bold text-slate-900">Documentation Pending</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Liabilities to Record</span>
                    <span className="font-bold text-slate-900">Toyota ($480) + Student ($340) + BMW ($590)</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Compliance Guard:</strong> This update creates draft conditions in Encompass loan file <code>ENC-1003-99412</code>. It does not issue a commitment or trigger underwriting approval.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isSyncingLOS}
                onClick={executeLOSSync}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                Approve & Transmit MISMO 3.4
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Document Request Approval Gate
         ========================================================================= */}
      {activeModal === "doc_review" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Borrower Document Checklist
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  Prepare Document Verification Request
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Select potential verification documents to request from John & Sarah Miller. Only approved items will be published to their secure borrower upload portal.
              </p>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="p-3 flex items-start space-x-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedDocIds[doc.id]}
                      onChange={(e) =>
                        setSelectedDocIds((prev) => ({ ...prev, [doc.id]: e.target.checked }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-semibold text-slate-900">{doc.name}</div>
                      <div className="text-[11px] text-slate-500">{doc.reason}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="text-[11px] text-slate-500">
                Borrower notification will be dispatched with an encrypted link to the secure portal.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isRequestingDocs}
                onClick={executeDocRequest}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Approve & Dispatch Checklist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: Raw Payload Inspection
         ========================================================================= */}
      {payloadViewContent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">{payloadViewContent.title}</h3>
              <button
                onClick={() => setPayloadViewContent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto bg-slate-950 text-emerald-400 p-3 rounded font-mono text-[11px]">
              {JSON.stringify(payloadViewContent.data, null, 2)}
            </pre>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setPayloadViewContent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
