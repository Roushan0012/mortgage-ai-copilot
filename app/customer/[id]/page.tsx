"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Upload,
  FileCheck,
  Home,
  Phone,
  Mail,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";

export default function CustomerFacingPortalPage() {
  const params = useParams();
  const customerId = (params?.id as string) || "cust_miller_001";
  const customer = repository.getCustomer(customerId);

  const [uploadedItems, setUploadedItems] = useState<Record<string, boolean>>({});

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

  const journeySteps = [
    { title: "Initial Consultation", status: "completed", date: "Sep 8, 2026" },
    { title: "Document Review", status: "active", date: "In Progress" },
    { title: "Pre-Approval Letter", status: "upcoming", date: "Estimated Sep 10" },
    { title: "Property Underwriting", status: "upcoming", date: "Pending Contract" },
    { title: "Clear to Close", status: "upcoming", date: "Target 2–4 Weeks" },
  ];

  const documentChecklist = [
    {
      id: "doc_1",
      title: "John Miller: 2024 & 2025 W-2 Statements",
      description: "Apex Cloud Technologies W-2 forms",
      status: "received",
      requiredFor: "Income Verification",
    },
    {
      id: "doc_2",
      title: "Sarah Miller: 2024 & 2025 Form 1040 Tax Returns (Schedule C)",
      description: "Federal tax returns documenting self-employment business earnings",
      status: uploadedItems["doc_2"] ? "received" : "action_required",
      requiredFor: "Self-Employment Verification",
    },
    {
      id: "doc_3",
      title: "60-Day Consecutive Bank Statements (Checking & Savings)",
      description: "Chase Bank & Frost Bank asset documentation verifying $85,000 down payment",
      status: "received",
      requiredFor: "Asset Seasoning",
    },
    {
      id: "doc_4",
      title: "Government-Issued Photo Identification",
      description: "Valid Texas Driver's Licenses for John and Sarah Miller",
      status: "received",
      requiredFor: "Identity Verification",
    },
    {
      id: "doc_5",
      title: "Competing Official Loan Estimate (Rocket Mortgage)",
      description: "Official written Loan Estimate with APR and fee schedule for rate comparison",
      status: uploadedItems["doc_5"] ? "received" : "action_required",
      requiredFor: "Pricing & Fee Review",
    },
  ];

  const handleSimulateUpload = (docId: string) => {
    setUploadedItems((prev) => ({ ...prev, [docId]: true }));
  };

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
            Target: {formatCurrency(goal.targetPurchasePrice)} • {goal.desiredLoanType.toUpperCase()} 30Y Fixed • {goal.targetDownPaymentPercent}% Down
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="text-right p-3 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Profile Completion
          </div>
          <div className="text-xl font-extrabold text-slate-900">78%</div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            2 items remaining
          </div>
        </div>
      </div>

      {/* 2. Mortgage Journey Stepper */}
      <Card>
        <CardHeader className="py-3 bg-slate-50/50">
          <CardTitle className="text-sm font-bold flex items-center space-x-1.5">
            <Home className="h-4 w-4 text-slate-700" />
            <span>Your Mortgage Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {journeySteps.map((step, index) => {
              const isDone = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-left space-y-1 ${
                    isActive
                      ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-300"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-slate-200 bg-slate-50/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
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

      {/* 3. Current Next Step Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
            Current Next Step
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Upload Sarah&apos;s 2024 & 2025 Schedule C Federal Tax Returns
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            To verify self-employment qualifying income, please upload your two most recent filed federal tax returns. This allows our underwriting team to calculate your qualifying income.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSimulateUpload("doc_2")}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Tax Returns</span>
        </button>
      </div>

      {/* 4. Documentation Checklist */}
      <Card>
        <CardHeader className="py-3.5 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Documentation Checklist</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely upload documents for underwriting verification
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
            3 of 5 Received
          </span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 text-xs">
          {documentChecklist.map((doc) => {
            const isReceived = doc.status === "received";

            return (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isReceived ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-900">{doc.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{doc.description}</p>
                  <div className="text-[10px] text-slate-400">
                    Purpose: <span className="font-medium text-slate-700">{doc.requiredFor}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isReceived ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Received & Verified</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload(doc.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 5. Meeting Outcome & Loan Officer Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meeting Outcome */}
        <Card>
          <CardHeader className="py-3 bg-slate-50/50">
            <CardTitle className="text-sm font-bold">Meeting Outcome & Next Milestones</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs text-slate-700 leading-relaxed">
            <p>
              Thank you for meeting with Alex today! We reviewed your home purchase goal for a <strong>$585,000</strong> single family residence in South Austin with a target loan of <strong>$500,000</strong>.
            </p>
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div><strong>Target Product:</strong> 30-Year Conventional Fixed Conforming</div>
              <div><strong>Target Closing Timeline:</strong> Within 2–4 Weeks</div>
              <div><strong>Pre-Qualification Status:</strong> In Preparation (Letter pending document upload)</div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Officer Contact Card */}
        <Card>
          <CardHeader className="py-3 bg-slate-50/50">
            <CardTitle className="text-sm font-bold">Your Dedicated Mortgage Officer</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                AV
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Alex Vance</h4>
                <p className="text-slate-500 text-[11px]">
                  Senior Mortgage Loan Officer • NMLS #1489201
                </p>
                <p className="text-slate-400 text-[10px]">
                  Austin Central Branch • Darwix Lending Group
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>(555) 789-0123</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>alex.vance@darwix.example.com</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
