# Next Phase Roadmap & Production Evolution

This document defines the **seven sequenced engineering and product priorities** for scaling Darwix AI from an assessment prototype into a multi-branch enterprise production deployment.

> **Integrity Mandate**: The priorities below represent future post-pilot initiatives. None of these are claimed as currently operational in the prototype.

---

## Roadmap Priority Overview

```
Phase 1 (Months 1–2)      Phase 2 (Months 3–4)      Phase 3 (Months 5–6)
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ P1: Production CRM   │  │ P3: Day-1 Doc Vault  │  │ P6: Analytics & A/B  │
│ P2: Production LOS   │  │ P5: Realtime STT Hub │  │ P7: Advanced Workflow│
│ P4: Enterprise SSO   │  │                      │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## Priority 1: Production CRM Integration (Salesforce Financial Services Cloud)
* **Why**: The current prototype demonstrates Salesforce FSC syncing using a typed local adapter. Production enterprise deployment requires live bi-directional sync to update contacts, opportunities, and consultation activity histories.
* **Dependency**: Enterprise Salesforce FSC developer instance with OAuth2 Connected App credentials and `@salesforce/core` SDK integration.
* **Risk**: High API latency or downtime on customer Salesforce instances; custom object schema variations across different lending institutions.
* **Expected Value**: Replaces 100% of manual CRM data entry for loan officers; guarantees 100% activity logging compliance across the sales organization.

---

## Priority 2: Production LOS Integration (ICE Encompass)
* **Why**: The prototype formats valid MISMO 3.4 XML/JSON Form 1003 drafts in mock mode. Live origination requires programmatic file creation directly inside the lender's Encompass environment.
* **Dependency**: ICE Mortgage Technology Developer Connect REST API sandbox access, client API credentials, and certified MISMO 3.4 envelope validation.
* **Risk**: Encompass custom field configurations and brittle field validation rules across branches; potential rate-limiting on batch loan creations.
* **Expected Value**: Drops loan application setup time from 35 minutes to under 2 minutes, accelerating borrower file handoff to operations.

---

## Priority 3: Automated Document Verification Integration (Day-1 Certainty)
* **Why**: Today, the copilot segregates stated cash from verified income and flags missing documents for manual upload. Connecting to verification providers allows instant digital conversion from stated to verified.
* **Dependency**: Integration contracts with Equifax The Work Number (VOE/VOI), Plaid Assets / Finicity (VOA), and IRS 4506-C transcript automation.
* **Risk**: Borrower drop-off during external bank account credential linking; coverage gaps for 1099 freelance self-employed borrowers.
* **Expected Value**: Converts up to 60% of W-2 borrower files to verified status during the initial consultation call, removing 7–10 days of document waiting time.

---

## Priority 4: Enterprise Identity & Access Management (SSO / RBAC)
* **Why**: The prototype utilizes mock authentication roles (Loan Officer, Manager, Operations). Enterprise banks mandate integration with central corporate directories.
* **Dependency**: SAML 2.0 / OIDC protocol integration with Microsoft Azure AD / Entra ID, Okta, or Ping Identity; role mapping to NMLS license IDs.
* **Risk**: Complex enterprise IT procurement and security approvals; multi-tenant role synchronization across regional branch hierarchies.
* **Expected Value**: Enables single sign-on across 10,000+ branch employees with instant access de-provisioning upon employee termination.

---

## Priority 5: Certified Real-Time Streaming Transcription (STT Engine)
* **Why**: The prototype features a high-fidelity simulated transcript stream with manual audio input controls. Production calls require direct VoIP softphone integration (e.g., Cisco Webex, Genesys, Zoom Phone).
* **Dependency**: Enterprise SIP trunk audio streaming or WebRTC integration with dedicated low-latency STT providers (e.g., Deepgram Nova-2 or AWS Transcribe).
* **Risk**: Background acoustic noise, speaker crosstalk, and heavy regional accents degrading transcription accuracy on specific numeric terms.
* **Expected Value**: Completely hands-free call operation without loan officers needing to press start/stop buttons during borrower conversations.

---

## Priority 6: Enterprise Analytics, Coaching & Experimentation
* **Why**: Branch managers currently view branch compliance and coaching metrics on `/manager`. Advanced lenders need cohort analysis, A/B testing on suggested phrasing, and predictive conversion modeling.
* **Dependency**: Modern data warehouse synchronization (Snowflake, BigQuery) with dbt transformation pipelines.
* **Risk**: Over-indexing on conversational metrics leading to robotic or unnatural loan officer behavior on calls.
* **Expected Value**: Identifies top-performing sales phrasing that boosts borrower lock-in rates while maintaining 100% regulatory compliance.

---

## Priority 7: Advanced Workflow Automation & Auto-Task Routing
* **Why**: When an operational blocker occurs (e.g., Sarah Miller's auto loan discrepancy), the system currently tags the file. Future evolution should automatically dispatch an SMS to the borrower requesting the auto statement.
* **Dependency**: Multi-channel communication orchestration (Twilio Messaging API, SendGrid Email API) with verified customer consent records.
* **Risk**: Excessive automated communications annoying borrowers; TCPA compliance exposure if automated SMS consent is not strictly verified.
* **Expected Value**: Closes document collection gaps autonomously within 2 hours of call completion without manual processor follow-up.
