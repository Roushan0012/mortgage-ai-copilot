import {
  Customer,
  Meeting,
  DocumentItem,
  DocumentStatus,
  IntegrationEvent,
} from "@/types";
import {
  IDocumentAdapter,
  DocumentRequestResult,
  IntegrationSystemInfo,
} from "./document-adapter";

/**
 * Mock Enterprise Document Management Adapter
 * Dynamically identifies potential verification documents based on borrower profile,
 * tracks document review lifecycle, and provisions secure borrower portal links.
 */
export class MockDocumentSystemAdapter implements IDocumentAdapter {
  public systemInfo: IntegrationSystemInfo = {
    id: "document_system",
    name: "Enterprise Document Vault & Verification Hub",
    vendor: "Blend / Roostify Document Gateway",
    category: "documents",
    status: "MOCKED",
    description: "Secure mortgage document ingestion, automated OCR condition mapping, and borrower portal checklist.",
    lastSyncTime: new Date().toISOString(),
    apiVersion: "v2.4 (Secure Enclave)",
    endpoint: "https://docs.darwix-mortgage-demo.com/api/v2",
    isSimulated: true,
    requiresApproval: true,
  };

  private documentStore = new Map<string, DocumentItem>();
  private failureSimulated = false;

  constructor() {
    this.seedDefaultDocuments();
  }

  private seedDefaultDocuments() {
    const initialDocs: DocumentItem[] = [
      {
        id: "DOC-ITEM-301",
        name: "30-Day Most Recent Pay Stubs (Apex Cloud Technologies LLC)",
        borrowerName: "John Miller",
        category: "income",
        status: "UPLOADED",
        reason: "Verifies stated W-2 base salary of $11,250/month and YTD earnings.",
        potentialOnly: true,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedAt: new Date(Date.now() - 3600000).toISOString(),
        fileSize: "1.8 MB PDF",
      },
      {
        id: "DOC-ITEM-302",
        name: "2024 & 2025 Form W-2 Wage and Tax Statements",
        borrowerName: "John Miller",
        category: "income",
        status: "VERIFIED",
        reason: "Two-year continuous W-2 history required for conventional conforming loan.",
        potentialOnly: true,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedAt: new Date(Date.now() - 14400000).toISOString(),
        fileSize: "2.4 MB PDF",
        reviewNotes: "Verified by Alex Vance. Matched 1003 employer details.",
      },
      {
        id: "DOC-ITEM-303",
        name: "Sarah Miller: 2024 & 2025 Form 1040 Federal Tax Returns (Schedule C)",
        borrowerName: "Sarah Miller",
        category: "income",
        status: "REQUESTED",
        reason: "Self-employment stated income ($38k/yr) requires 24-month tax return average under QM rules.",
        potentialOnly: true,
        requestedAt: new Date().toISOString(),
      },
      {
        id: "DOC-ITEM-304",
        name: "Sarah Miller: Year-to-Date Profit & Loss (P&L) Statement & 3-Mo Business Statements",
        borrowerName: "Sarah Miller",
        category: "income",
        status: "NOT_REQUESTED",
        reason: "Validates ongoing business cashflow stability for graphic design practice.",
        potentialOnly: true,
      },
      {
        id: "DOC-ITEM-305",
        name: "60-Day Consecutive Asset Statements (Chase Checking & Fidelity Investment)",
        borrowerName: "John Miller",
        category: "asset",
        status: "VERIFIED",
        reason: "Seasoning and sourcing verification for $85,000 down payment and 6-month reserves.",
        potentialOnly: true,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedAt: new Date(Date.now() - 28800000).toISOString(),
        fileSize: "4.2 MB PDF",
        reviewNotes: "Liquid balances confirmed: $22k checking + $72k investment.",
      },
      {
        id: "DOC-ITEM-306",
        name: "Government-Issued Photo Identification (Texas Driver's Licenses)",
        borrowerName: "John & Sarah Miller",
        category: "identity",
        status: "VERIFIED",
        reason: "USA PATRIOT Act Customer Identification Program (CIP) compliance.",
        potentialOnly: true,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedAt: new Date(Date.now() - 32000000).toISOString(),
        fileSize: "1.1 MB JPG",
        reviewNotes: "Identity confirmed against credit bureau record.",
      },
      {
        id: "DOC-ITEM-307",
        name: "Official Written Competitor Loan Estimate (Rocket Mortgage)",
        borrowerName: "John Miller",
        category: "competitive",
        status: "REQUESTED",
        reason: "Written TRID Loan Estimate required to substantiate price match request on 6.125% quote.",
        potentialOnly: true,
        requestedAt: new Date().toISOString(),
      },
      {
        id: "DOC-ITEM-308",
        name: "BMW Auto Lease Agreement & 12-Month Payment Ledger",
        borrowerName: "Sarah Miller",
        category: "liability",
        status: "REQUESTED",
        reason: "Identified in consultation meeting; lease obligation must be entered into liabilities ledger.",
        potentialOnly: true,
        requestedAt: new Date().toISOString(),
      },
    ];

    initialDocs.forEach((doc) => this.documentStore.set(doc.id, doc));
  }

  public setFailureSimulation(fail: boolean) {
    this.failureSimulated = fail;
  }

  public identifyPotentialDocuments(customer: Customer, meeting: Meeting): DocumentItem[] {
    const list: DocumentItem[] = [];
    const primary = customer.primaryBorrower;
    const coBorrower = customer.coBorrower;

    // 1. Primary employment
    if (primary.employmentHistory.some((e) => e.employmentType.startsWith("W2"))) {
      list.push({
        id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
        name: `30-Day Most Recent Pay Stubs (${primary.employmentHistory[0]?.employerName || "Employer"})`,
        borrowerName: `${primary.firstName} ${primary.lastName}`,
        category: "income",
        status: "REQUESTED",
        reason: "Potential document to verify stated base pay and year-to-date earnings.",
        potentialOnly: true,
      });
      list.push({
        id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
        name: "2024 & 2025 Form W-2 Wage Statements",
        borrowerName: `${primary.firstName} ${primary.lastName}`,
        category: "income",
        status: "REQUESTED",
        reason: "Potential document to verify two-year employment history stability.",
        potentialOnly: true,
      });
    }

    // 2. Co-borrower self-employment
    if (coBorrower && coBorrower.employmentHistory.some((e) => e.employmentType === "SelfEmployed")) {
      list.push({
        id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
        name: `${coBorrower.firstName} ${coBorrower.lastName}: 2024 & 2025 Form 1040 Tax Returns (Schedule C)`,
        borrowerName: `${coBorrower.firstName} ${coBorrower.lastName}`,
        category: "income",
        status: "REQUESTED",
        reason: "Potential document to verify 24-month self-employment average under Dodd-Frank QM.",
        potentialOnly: true,
      });
      list.push({
        id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
        name: `${coBorrower.firstName} ${coBorrower.lastName}: YTD Profit & Loss Statement and Business Bank Statements`,
        borrowerName: `${coBorrower.firstName} ${coBorrower.lastName}`,
        category: "income",
        status: "NOT_REQUESTED",
        reason: "Potential document to verify business viability and current year cashflow.",
        potentialOnly: true,
      });
    }

    // 3. Assets
    list.push({
      id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
      name: "60-Day Consecutive Bank & Investment Statements",
      borrowerName: `${primary.firstName} ${primary.lastName}`,
      category: "asset",
      status: "REQUESTED",
      reason: "Potential document to verify down payment funds and reserve requirements.",
      potentialOnly: true,
    });

    // 4. Identification
    list.push({
      id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
      name: "Government-Issued Photo ID (Driver's License / Passport)",
      borrowerName: `${primary.firstName} & ${coBorrower ? coBorrower.firstName : ""} ${primary.lastName}`,
      category: "identity",
      status: "REQUESTED",
      reason: "Potential document for USA PATRIOT Act identity verification.",
      potentialOnly: true,
    });

    // 5. Meeting-specific flags (e.g. competitor quote or undisclosed lease)
    const hasCompetitorIntervention = meeting.activeInterventions.some((i) =>
      i.category.includes("competitive") || i.category.includes("promise_to_beat")
    );
    if (hasCompetitorIntervention) {
      list.push({
        id: `DOC-ITEM-${Math.floor(300 + Math.random() * 699)}`,
        name: "Official Written Competitor Loan Estimate",
        borrowerName: `${primary.firstName} ${primary.lastName}`,
        category: "competitive",
        status: "REQUESTED",
        reason: "Potential document to substantiate verbal rate match request.",
        potentialOnly: true,
      });
    }

    return list;
  }

  public async createDocumentRequest(
    customer: Customer,
    applicationId: string,
    documents: DocumentItem[],
    officerId: string
  ): Promise<DocumentRequestResult> {
    if (this.failureSimulated) {
      return {
        state: "FAILED",
        requestId: "DOC-REQ-FAILED",
        requestedDocumentsCount: 0,
        documents: [],
        portalLink: "",
        errorMessage: "Document Portal Gateway 500: Vault key exchange failed. Retryable.",
        event: {
          id: `evt_doc_${Date.now()}`,
          integration: "document_system",
          eventType: "request_documents",
          status: "failed",
          payloadSummary: "Failed to dispatch document request to borrower portal.",
          responseMessage: "500 Internal Server Error — Key exchange error. Marked as RETRYABLE.",
          timestamp: new Date().toISOString(),
        },
      };
    }

    const requestId = `DOC-REQ-${Math.floor(80000 + Math.random() * 19999)}`;
    const updatedDocs = documents.map((doc) => {
      const updated: DocumentItem = {
        ...doc,
        status: doc.status === "NOT_REQUESTED" ? "REQUESTED" : doc.status,
        requestedAt: new Date().toISOString(),
      };
      this.documentStore.set(updated.id, updated);
      return updated;
    });

    this.systemInfo.lastSyncTime = new Date().toISOString();

    const portalLink = `https://portal.darwix-mortgage-demo.com/upload/${customer.id}?req=${requestId}`;

    const event: IntegrationEvent = {
      id: `evt_doc_${Date.now()}`,
      integration: "document_system",
      eventType: "request_documents",
      status: "succeeded",
      payloadSummary: `Created Document Request ${requestId} for ${documents.length} potential verification items for ${customer.primaryBorrower.firstName} ${customer.primaryBorrower.lastName}.`,
      rawPayload: {
        requestId,
        customerId: customer.id,
        applicationId,
        approvedByOfficer: officerId,
        documents: updatedDocs.map((d) => ({ id: d.id, name: d.name, category: d.category })),
        portalLink,
      },
      responseMessage: "201 Created — Document verification checklist queued and borrower secure upload link generated.",
      timestamp: new Date().toISOString(),
    };

    return {
      state: "SUCCESS",
      requestId,
      requestedDocumentsCount: updatedDocs.length,
      documents: updatedDocs,
      portalLink,
      event,
    };
  }

  public async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    notes?: string
  ): Promise<DocumentItem> {
    const existing = this.documentStore.get(documentId);
    if (!existing) {
      throw new Error(`Document not found: ${documentId}`);
    }
    const updated: DocumentItem = {
      ...existing,
      status,
      reviewNotes: notes || existing.reviewNotes,
      uploadedAt: status === "UPLOADED" ? new Date().toISOString() : existing.uploadedAt,
    };
    this.documentStore.set(documentId, updated);
    return updated;
  }

  public getAllDocuments(): DocumentItem[] {
    return Array.from(this.documentStore.values());
  }
}

export const mockDocumentSystemAdapter = new MockDocumentSystemAdapter();
