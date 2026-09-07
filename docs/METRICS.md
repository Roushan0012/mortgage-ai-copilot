# Darwix AI — Product Metrics & Operational Evaluation Framework

This document defines the North Star metric, supporting operational metrics, and defensive guardrail metrics for evaluating the Darwix AI Mortgage Copilot during branch pilot deployment and general availability.

> [!IMPORTANT]
> **No Invented Baselines**: In accordance with enterprise product management principles, baseline industry benchmarks are marked as *To Be Established (TBE)* during the initial 30-day pilot cohort.

---

## 1. North Star Metric

### **Meeting-to-Next-Action Completion Rate**
- **Definition**: The percentage of completed borrower consultation calls that successfully result in at least one officer-approved post-meeting deliverable (CRM stage advance, LOS Form 1003 draft, or borrower document request package) within 60 minutes of call termination.
- **Formula**:
  $$\text{Completion Rate} = \frac{\text{Meetings with Approved Post-Meeting Deliverables within 60 min}}{\text{Total Completed Consultations}} \times 100$$
- **Business Rationale**: Directly captures whether the AI copilot successfully bridged the critical conversion gap between verbal borrower conversations and formal application pipeline progression.

---

## 2. Supporting Operational Metrics

| Metric Name | Category | Definition / Formula | Tracking Location | Target Objective |
|---|---|---|---|---|
| **Meeting Preparation Completion** | Preparation | Percentage of scheduled consultations where the loan officer opened and reviewed the Pre-Meeting Brief prior to call start. | Pre-meeting page (`/meeting/[id]`) | Increase pre-call borrower familiarity and agenda adherence. |
| **Form 1003 Information Completeness** | Quality | Ratio of required Form 1003 fields (income, down payment, liabilities, property goals) captured during the consultation. | Live Fact Ledger & Summary Hub | Minimize post-call borrower re-contacts for basic profile data. |
| **Intervention Acceptance Rate** | Adoption | Percentage of generated consultative suggestions accepted or utilized by the loan officer during live calls. | Live Copilot Deck & Manager View | Validate that sales guidance and objection scripts provide genuine conversational value. |
| **Intervention Dismissal Rate** | Noise | Percentage of generated interventions explicitly dismissed by the loan officer with or without rationale. | Live Copilot Deck & Audit Stream | Identify categories causing agent distraction or low perceived utility. |
| **High-Risk Escalation Rate** | Compliance | Percentage of consultations with CRITICAL or HIGH compliance alerts that required supervisor escalation. | Manager Escalations Queue | Ensure zero compliance violations go unaddressed before application submission. |
| **Follow-Up Task Completion** | Velocity | Percentage of post-meeting follow-up deliverables completed by their scheduled due date. | Back-Office Tasks (`/tasks`) | Accelerate borrower documentation collection and rate lock timing. |
| **CRM Sync Completion Rate** | Automation | Percentage of meetings where the loan officer approved and successfully synchronized activity notes and lead stages. | Summary Action Center & Manager Health | Eliminate manual double-entry of call notes into Salesforce FSC. |
| **LOS Update Completion Rate** | Automation | Percentage of consultations resulting in an approved MISMO 3.4 Form 1003 draft staged in Encompass. | Summary Action Center & LOS Adapter | Streamline transition from sales consultation to loan processing. |
| **Document Request Completion Rate** | Conversion | Percentage of calls resulting in an approved borrower document request package dispatched to the customer portal. | Operations & Customer Portal | Shorten time to initial document upload from borrower. |
| **Time from Meeting End to Follow-Up** | Velocity | Median elapsed minutes between meeting termination and external customer follow-up message dispatch. | Summary Hub & Audit Log | Target: Sub-15 minutes (vs. industry standard 4–24 hours). |
| **Manager Exception Resolution Time** | Governance | Median hours taken by Branch Compliance Managers to acknowledge and resolve escalated compliance exceptions. | Manager Escalations Queue | Prevent regulatory bottlenecks on active loan applications. |

---

## 3. Defensive Guardrail Metrics

Guardrail metrics monitor system health, agent fatigue, data integrity, and compliance safety. Breaching any guardrail threshold triggers immediate review by product engineering.

| Guardrail Metric | Definition / Alert Threshold | Mitigation / System Response |
|---|---|---|
| **False Positive Intervention Rate** | Percentage of compliance warnings dismissed by loan officers with rationale "False Positive" (&gt; 15% triggers alert). | Review and tune deterministic regex patterns and negative pattern filters. |
| **Compliance Override Rate** | Frequency with which loan officers attempt to proceed without resolving critical TRID/fraud alerts (&gt; 0% triggers alert). | System blocks application progression; requires mandatory supervisory sign-off. |
| **Incorrect Fact Extraction Rate** | Percentage of extracted Form 1003 facts modified or rejected by the loan officer during live call verification (&gt; 10% triggers alert). | Improve numerical extraction heuristics; enforce explicit click-to-verify step. |
| **Agent Nudge Fatigue Score** | Frequency of interventions exceeding 1 per 90 seconds, or agent muting of the Copilot panel. | Nudge fatigue coordinator automatically increases non-critical cooldown and caps visible deck to 3 cards. |
| **Failed Integrations Rate** | Percentage of approved sync requests resulting in network timeouts, 5xx errors, or schema validation failures (&gt; 2% triggers alert). | Integration Center alerts back-office operations; provides 1-click retry with preserved idempotency keys. |
| **Duplicate Record Creation** | Any instance of duplicate CRM Leads, duplicate Encompass loans, or duplicate document packages created from a single meeting. | Idempotency engine enforces deterministic `${meetingId}:${destination}` key locking to guarantee zero duplicates. |
