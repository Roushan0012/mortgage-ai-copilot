"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Upload,
  Home,
  Phone,
  Mail,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { DocumentItem } from "@/types";

export default function CustomerFacingPortalPage() {
  const params = useParams();
  const customerId = (params?.id as string) || "cust_miller_001";
  const customer = repository.getCustomer(customerId);

  const [documents, setDocuments] = useState<DocumentItem[]>(() => repository.getDocumentItems());
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const loadDocuments = () => {
    setDocuments(repository.getDocumentItems());
  };



  if (!customer) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12">
        <h2 className="text-base font-bold text-slate-900">Borrower Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ID: {customerId}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const primary = customer.primaryBorrower;
  const coBorrower = customer.coBorrower;
  const goal = customer.mortgageGoal;

  // Requirement 15: Clean Customer Status Timeline
  const journeySteps = [
    { title: "Meeting Completed", status: "completed", date: "Sep 8, 10:45 AM" },
    { title: "Profile Captured", status: "completed", date: "Form 1003 Stated" },
    { title: "Information Gaps Identified", status: "completed", date: "Needs Verification" },
    { title: "Documents to Verify", status: "active", date: "Action Needed" },
    { title: "Next Steps", status: "upcoming", date: "Pre-Approval Letter" },
    { title: "Follow-Up", status: "upcoming", date: "Target 2–4 Weeks" },
  ];

  const handleSimulateUpload = (docId: string, docName: string) => {
    repository.updateDocumentItem(docId, "UPLOADED");
    repository.addAuditEvent({
      eventType: "FIELD_MARKED_FOR_VERIFICATION",
      meetingId: "meet_001",
      actor: { userId: "customer_portal", role: "Borrower" },
      details: {
        actionTaken: "BORROWER_UPLOADED_DOCUMENT",
        documentId: docId,
        notes: `Borrower uploaded ${docName} via secure portal link.`,
      },
    });
    loadDocuments();
    setUploadFeedback(`Uploaded "${docName}" successfully! Underwriting will review shortly.`);
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length;
  const uploadedCount = documents.filter((d) => d.status === "UPLOADED").length;
  const totalCount = documents.length;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Borrower Welcome Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Borrower Financing Portal
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Application ID: {customer.losApplicationId || "ENC-1003-99412"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {primary.firstName} & {coBorrower?.firstName} {primary.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Target Purchase: {formatCurrency(goal.targetPurchasePrice)} • {goal.desiredLoanType.toUpperCase()} 30Y Fixed • {goal.targetDownPaymentPercent}% Down Payment
          </p>
        </div>

        {/* Completion Indicator */}
        <div className="text-right p-3 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Documents Verified
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {verifiedCount} of {totalCount}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            {uploadedCount} currently under review
          </div>
        </div>
      </div>

      {/* Upload Feedback Notice */}
      {uploadFeedback && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* 2. Customer Journey Timeline (Requirement 15: Clean 6-step flow) */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
            <Home className="h-4 w-4 text-slate-700" />
            <span>Financing Timeline & Next Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {journeySteps.map((step, index) => {
              const isDone = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-left space-y-1 ${
                    isActive
                      ? "border-blue-400 bg-blue-50/50 ring-1 ring-blue-300"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-slate-200 bg-slate-50/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">
                      {step.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{step.date}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Action Required Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
            Next Action Required
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Upload Sarah&apos;s 2024 & 2025 Schedule C Federal Tax Returns
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            To substantiate self-employment earnings for Sarah Miller Graphic Design LLC, please upload your two most recent filed federal returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            handleSimulateUpload(
              "DOC-ITEM-303",
              "Sarah Miller: 2024 & 2025 Form 1040 Federal Tax Returns (Schedule C)"
            )
          }
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Tax Returns</span>
        </button>
      </div>

      {/* 4. Potential Verification Documents Checklist */}
      <Card>
        <CardHeader className="py-3.5 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Potential Documents to Verify</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely upload records requested during your consultation
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
            {verifiedCount + uploadedCount} of {totalCount} Uploaded
          </span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 text-xs">
          {documents.map((doc) => {
            const isVerified = doc.status === "VERIFIED";
            const isUploaded = doc.status === "UPLOADED" || doc.status === "UNDER_REVIEW";

            return (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isVerified ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isUploaded ? (
                      <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    ) : (
                      <Upload className="h-4 w-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900 text-xs">{doc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">{doc.reason}</p>
                  {doc.fileSize && (
                    <div className="text-[10px] text-slate-400 pl-6">
                      File: {doc.fileSize} • Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pl-6 sm:pl-0 shrink-0">
                  {isVerified ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  ) : isUploaded ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      Under Review
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload(doc.id, doc.name)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                    >
                      Upload File
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 5. Assigned Loan Officer Contact Card */}
      <Card className="bg-slate-50/70 border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Assigned Mortgage Specialist
            </span>
            <div className="font-bold text-slate-900 text-sm">
              {customer.assignedLoanOfficerName}
            </div>
            <div className="text-slate-500 text-[11px]">
              Austin Central Branch • Licensed Loan Originator
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`mailto:${primary.email}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Officer</span>
            </a>
            <a
              href="tel:5552348901"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Branch</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
