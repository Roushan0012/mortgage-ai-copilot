import {
  Customer,
  Meeting,
  IntegrationEvent,
} from "@/types";
import {
  ILOSAdapter,
  LOSDraftApplication,
  LOSSyncPayload,
  LOSSyncResult,
  IntegrationSystemInfo,
} from "./los-adapter";

/**
 * Mock ICE Encompass Loan Origination System (LOS) Adapter
 * Formats MISMO 3.4 payload, enforces STATED vs VERIFIED financial distinction,
 * and manages loan application stages defensively.
 */
export class MockLOSAdapter implements ILOSAdapter {
  public systemInfo: IntegrationSystemInfo = {
    id: "encompass_los",
    name: "ICE Encompass LOS (MISMO 3.4)",
    vendor: "ICE Mortgage Technology",
    category: "los",
    status: "MOCKED",
    description: "Enterprise Loan Origination System managing Form 1003 underwriting pipelines and loan conditions.",
    lastSyncTime: new Date().toISOString(),
    apiVersion: "MISMO v3.4 / Encompass REST API v24.2",
    endpoint: "https://api.elliemae.com/encompass/v3/loans",
    isSimulated: true,
    requiresApproval: true,
  };

  private applicationsStore = new Map<string, LOSDraftApplication>();
  private failureSimulated = false;

  constructor() {
    // Seed default John & Sarah draft loan application in LOS
    this.applicationsStore.set("ENC-1003-99412", {
      applicationId: "LOS-APP-48201",
      loanIdentifier: "ENC-1003-99412",
      mismoVersion: "3.4",
      stage: "Information Collection",
      borrowers: [
        {
          borrowerId: "bor_john_miller",
          isPrimary: true,
          name: "John Miller",
          maskedSSN: "***-**-4819",
          statedMonthlyIncome: {
            value: 12450,
            verificationState: "STATED", // Crucial STATED vs VERIFIED
            source: "Verbal Statement — Consultation Meeting",
            notes: "Stated: $135k base salary + $14.4k bonus/RSU. Unverified pending W-2s & pay stubs.",
          },
          employment: {
            employer: "Apex Cloud Technologies LLC",
            title: "Senior Solutions Architect",
            employmentType: "W2_FullTime",
            statedTenureYears: 4.2,
            verificationStatus: "VOE_PENDING",
          },
          liabilities: [
            {
              creditor: "Toyota Financial Services",
              type: "auto_loan",
              monthlyPayment: 480,
              unpaidBalance: 14200,
              isStated: true,
              isExcluded: false,
            },
            {
              creditor: "FedLoan Servicing",
              type: "student_loan",
              monthlyPayment: 340,
              unpaidBalance: 24000,
              isStated: true,
              isExcluded: false,
            },
          ],
        },
        {
          borrowerId: "bor_sarah_miller",
          isPrimary: false,
          name: "Sarah Miller",
          maskedSSN: "***-**-8291",
          statedMonthlyIncome: {
            value: 3166,
            verificationState: "STATED", // Crucial STATED vs VERIFIED
            source: "Verbal Statement — Consultation Meeting",
            notes: "Stated: $38k net Schedule C business earnings. Requires 24-month tax return average.",
          },
          employment: {
            employer: "Sarah Miller Graphic Design LLC",
            title: "Owner / Creative Director",
            employmentType: "SelfEmployed",
            statedTenureYears: 3.0,
            verificationStatus: "TAX_RETURNS_REQUIRED",
          },
          liabilities: [
            {
              creditor: "BMW Financial Services",
              type: "auto_lease",
              monthlyPayment: 590,
              unpaidBalance: 18200,
              isStated: true,
              isExcluded: false,
              exclusionReason: undefined,
            },
          ],
        },
      ],
      loanGoal: {
        purpose: "purchase",
        occupancy: "primary_residence",
        purchasePrice: 585000,
        targetLoanAmount: 500000,
        downPaymentAmount: 85000,
        desiredLoanType: "conventional",
        desiredTermMonths: 360,
        targetClosingTimeline: "2–4 Weeks",
      },
      statedDTI: {
        frontEnd: 28.4,
        backEnd: 34.2,
        status: "STATED_ESTIMATE_ONLY",
      },
      outstandingConditionsCount: 4,
      lastUpdatedAt: new Date(Date.now() - 7200000).toISOString(),
    });
  }

  public setFailureSimulation(fail: boolean) {
    this.failureSimulated = fail;
  }

  public async getApplication(applicationId: string): Promise<LOSDraftApplication | null> {
    for (const app of this.applicationsStore.values()) {
      if (app.applicationId === applicationId || app.loanIdentifier === applicationId) {
        return app;
      }
    }
    return null;
  }

  public async createOrUpdateDraftApplication(
    meeting: Meeting,
    customer: Customer,
    payload: LOSSyncPayload
  ): Promise<LOSSyncResult> {
    if (this.failureSimulated) {
      return {
        state: "FAILED",
        applicationId: "LOS-APP-48201",
        loanIdentifier: customer.losApplicationId || "ENC-1003-99412",
        stage: "Information Collection",
        mismoPayload: {} as LOSDraftApplication,
        lastUpdatedAt: new Date().toISOString(),
        errorMessage: "Encompass Gateway Error: 504 Gateway Timeout while streaming MISMO 3.4 XML payload. Retryable.",
        event: {
          id: `evt_los_${Date.now()}`,
          integration: "encompass_los",
          eventType: "sync_los",
          status: "failed",
          payloadSummary: "Failed to transmit MISMO 3.4 draft to ICE Encompass LOS due to gateway timeout.",
          responseMessage: "504 Gateway Timeout — Connection dropped by Encompass API proxy. Marked as RETRYABLE.",
          timestamp: new Date().toISOString(),
        },
      };
    }

    const loanIdentifier = customer.losApplicationId || "ENC-1003-99412";
    const existing = this.applicationsStore.get(loanIdentifier);

    // Safeguard: Meeting MUST NOT move application to "Approved" or "Underwriting"
    let stage = payload.targetStage || "Documentation Pending";
    if (stage === "Approved" || stage === "Underwriting" || stage === "Closed") {
      stage = "Documentation Pending";
    }

    const primary = customer.primaryBorrower;
    const coBorrower = customer.coBorrower;
    const goal = customer.mortgageGoal;

    const draftApp: LOSDraftApplication = {
      applicationId: existing?.applicationId || `LOS-APP-${Math.floor(40000 + Math.random() * 59999)}`,
      loanIdentifier,
      mismoVersion: "3.4",
      stage,
      borrowers: [
        {
          borrowerId: primary.id,
          isPrimary: true,
          name: `${primary.firstName} ${primary.lastName}`,
          maskedSSN: primary.maskedSSN,
          statedMonthlyIncome: {
            value: primary.financialProfile.grossMonthlyIncome,
            verificationState: "STATED", // Explicit STATED — NOT VERIFIED
            source: `Consultation Meeting ${meeting.id}`,
            notes: "Stated income extracted from meeting transcript. Formal W-2 & 30-day paystub verification pending.",
          },
          employment: {
            employer: primary.employmentHistory[0]?.employerName || "Apex Cloud Technologies LLC",
            title: primary.employmentHistory[0]?.jobTitle || "Senior Solutions Architect",
            employmentType: primary.employmentHistory[0]?.employmentType || "W2_FullTime",
            statedTenureYears: primary.employmentHistory[0]?.yearsOnJob || 4.2,
            verificationStatus: "VOE_PENDING",
          },
          liabilities: primary.financialProfile.liabilities.map((l) => ({
            creditor: l.creditorName,
            type: l.liabilityType,
            monthlyPayment: l.monthlyPayment,
            unpaidBalance: l.unpaidBalance,
            isStated: true,
            isExcluded: l.isExcludedFromDTI,
            exclusionReason: l.exclusionReason,
          })),
        },
        ...(coBorrower
          ? [
              {
                borrowerId: coBorrower.id,
                isPrimary: false,
                name: `${coBorrower.firstName} ${coBorrower.lastName}`,
                maskedSSN: coBorrower.maskedSSN,
                statedMonthlyIncome: {
                  value: coBorrower.financialProfile.grossMonthlyIncome,
                  verificationState: "STATED" as const, // Explicit STATED — NOT VERIFIED
                  source: `Consultation Meeting ${meeting.id}`,
                  notes: "Self-employment stated income. Requires two consecutive years filed 1040 Schedule C.",
                },
                employment: {
                  employer: coBorrower.employmentHistory[0]?.employerName || "Sarah Miller Graphic Design LLC",
                  title: coBorrower.employmentHistory[0]?.jobTitle || "Owner",
                  employmentType: coBorrower.employmentHistory[0]?.employmentType || "SelfEmployed",
                  statedTenureYears: coBorrower.employmentHistory[0]?.yearsOnJob || 3.0,
                  verificationStatus: "TAX_RETURNS_REQUIRED",
                },
                liabilities: coBorrower.financialProfile.liabilities.map((l) => ({
                  creditor: l.creditorName,
                  type: l.liabilityType,
                  monthlyPayment: l.monthlyPayment,
                  unpaidBalance: l.unpaidBalance,
                  isStated: true,
                  isExcluded: l.isExcludedFromDTI,
                  exclusionReason: l.exclusionReason,
                })),
              },
            ]
          : []),
      ],
      loanGoal: {
        purpose: goal.purpose,
        occupancy: goal.occupancyType,
        purchasePrice: goal.targetPurchasePrice,
        targetLoanAmount: goal.targetLoanAmount,
        downPaymentAmount: goal.targetDownPaymentAmount,
        desiredLoanType: goal.desiredLoanType,
        desiredTermMonths: goal.desiredTermMonths,
        targetClosingTimeline: "2–4 Weeks",
      },
      statedDTI: {
        frontEnd: primary.financialProfile.frontEndDTI,
        backEnd: primary.financialProfile.backEndDTI,
        status: "STATED_ESTIMATE_ONLY",
      },
      outstandingConditionsCount: 3,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.applicationsStore.set(loanIdentifier, draftApp);
    this.systemInfo.lastSyncTime = draftApp.lastUpdatedAt;

    const verifiedFactsCount = meeting.extractedFacts.filter((f) => f.verifiedByOfficer).length;

    const event: IntegrationEvent = {
      id: `evt_los_${Date.now()}`,
      integration: "encompass_los",
      eventType: "sync_los",
      status: "succeeded",
      payloadSummary: `Updated Encompass Loan Draft ${loanIdentifier} to stage "${stage}" with ${verifiedFactsCount} officer-verified facts (all income recorded as STATED — NOT VERIFIED).`,
      rawPayload: {
        loanIdentifier: draftApp.loanIdentifier,
        applicationId: draftApp.applicationId,
        mismoVersion: "3.4",
        stage: draftApp.stage,
        officerNMLS: payload.officerNMLS,
        officerAttestation: payload.officerAttestation,
        statedMonthlyIncomeJohn: draftApp.borrowers[0]?.statedMonthlyIncome,
        statedMonthlyIncomeSarah: draftApp.borrowers[1]?.statedMonthlyIncome,
      },
      responseMessage: "200 OK — MISMO 3.4 Loan Record updated in ICE Encompass pipeline. Stated financial conditions generated.",
      timestamp: new Date().toISOString(),
    };

    return {
      state: "SUCCESS",
      applicationId: draftApp.applicationId,
      loanIdentifier: draftApp.loanIdentifier,
      stage: draftApp.stage,
      mismoPayload: draftApp,
      lastUpdatedAt: draftApp.lastUpdatedAt,
      event,
    };
  }
}

export const mockLOSAdapter = new MockLOSAdapter();
