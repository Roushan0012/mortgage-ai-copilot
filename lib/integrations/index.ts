import { IntegrationEvent, Meeting, Customer } from "@/types";
import { generateId } from "@/lib/utils";

export interface SyncResult {
  success: boolean;
  event: IntegrationEvent;
  externalRecordId: string;
}

/**
 * Mock Enterprise Integration Adapters
 * Provides contract-compliant payload generation and event dispatching
 * for Salesforce Financial Services Cloud (CRM) and Encompass (LOS).
 */
export class EnterpriseIntegrationsHub {
  /**
   * Sync extracted 1003 loan facts into Encompass LOS (MISMO 3.4 standard).
   */
  public async syncToEncompassLOS(meeting: Meeting, customer: Customer): Promise<SyncResult> {
    const mismoPayload = {
      mismoVersion: "3.4",
      loanIdentifier: customer.losApplicationId || "ENC-1003-99412",
      borrowers: [
        {
          name: `${customer.primaryBorrower.firstName} ${customer.primaryBorrower.lastName}`,
          ssnMasked: customer.primaryBorrower.maskedSSN,
          baseMonthlyIncome: customer.primaryBorrower.employmentHistory[0]?.monthlyBaseIncome,
          liabilitiesCount: customer.primaryBorrower.financialProfile.liabilities.length,
        },
        ...(customer.coBorrower
          ? [
              {
                name: `${customer.coBorrower.firstName} ${customer.coBorrower.lastName}`,
                ssnMasked: customer.coBorrower.maskedSSN,
                baseMonthlyIncome: customer.coBorrower.employmentHistory[0]?.monthlyBaseIncome,
                liabilitiesCount: customer.coBorrower.financialProfile.liabilities.length,
              },
            ]
          : []),
      ],
      loanTerms: {
        loanAmount: customer.mortgageGoal.targetLoanAmount,
        propertyValue: customer.mortgageGoal.targetPurchasePrice,
        occupancy: customer.mortgageGoal.occupancyType,
        loanPurpose: customer.mortgageGoal.purpose,
      },
      verifiedFactsFromMeeting: meeting.extractedFacts.filter((f) => f.verifiedByOfficer),
    };

    const event: IntegrationEvent = {
      id: generateId("evt_los"),
      integration: "encompass_los",
      eventType: "sync_1003_payload",
      status: "succeeded",
      payloadSummary: `Transmitted ${meeting.extractedFacts.filter((f) => f.verifiedByOfficer).length} verified 1003 facts to Encompass Loan Application ${mismoPayload.loanIdentifier}.`,
      rawPayload: mismoPayload,
      responseMessage: "200 OK — MISMO 3.4 Data Schema validated successfully by Encompass Gateway.",
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      event,
      externalRecordId: mismoPayload.loanIdentifier,
    };
  }

  /**
   * Push consultation notes and follow-up tasks to Salesforce Financial Services Cloud.
   */
  public async syncToSalesforceCRM(meeting: Meeting, customer: Customer): Promise<SyncResult> {
    const crmPayload = {
      leadId: customer.crmLeadId || "SF-LEAD-89210",
      contactName: `${customer.primaryBorrower.firstName} ${customer.primaryBorrower.lastName}`,
      meetingSubject: meeting.title,
      loanOfficer: meeting.assignedLoanOfficerName,
      meetingDurationMinutes: 35,
      stageUpdate: "Mortgage Application in Progress",
      complianceStatus: "Compliance Review Required (1 flagged exception)",
    };

    const event: IntegrationEvent = {
      id: generateId("evt_crm"),
      integration: "salesforce_crm",
      eventType: "update_lead_status",
      status: "succeeded",
      payloadSummary: `Updated Salesforce Lead ${crmPayload.leadId} with meeting notes and post-call task checklist.`,
      rawPayload: crmPayload,
      responseMessage: "201 Created — Salesforce Financial Services Cloud Lead Task object created.",
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      event,
      externalRecordId: crmPayload.leadId,
    };
  }

  /**
   * Query Optimal Blue Product & Pricing Engine (PPE) for live scenario rates.
   */
  public async queryOptimalBluePPE(params: {
    loanAmount: number;
    purchasePrice: number;
    ficoScore: number;
    propertyType: string;
  }): Promise<{
    rate: number;
    apr: number;
    monthlyPI: number;
    points: number;
    investor: string;
  }> {
    // Calculates monthly P&I based on loanAmount and standard 30Y conforming rate
    const rate = 6.375;
    const monthlyRate = rate / 100 / 12;
    const n = 360;
    const monthlyPI = Number(
      (
        (params.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1)
      ).toFixed(2)
    );

    return {
      rate,
      apr: 6.495,
      monthlyPI: monthlyPI || 3119.54,
      points: 0.125,
      investor: `Fannie Mae 30Y Conf Fixed (${params.propertyType || "Single Family"})`,
    };
  }
}

export const integrationsHub = new EnterpriseIntegrationsHub();
