# Product Screenshot Plan & Evidence Guide

This document outlines the **8 exact product screenshots** required for client decks, PM assessment review, and executive demonstrations. All screenshots are sourced from the running application without code overlays or mock frames.

---

## Summary Matrix

| # | Screen Name | Route | Slide # | Primary Visual Artifact | Why It Matters |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Officer Pipeline Dashboard** | `/dashboard` | Slide 1 | Active pipeline table, consultation calendar, and MLO quick stats | Demonstrates the officer's daily workflow starting point and cognitive load context. |
| **2** | **Pre-Meeting Intelligence Brief** | `/meeting/meet_001` | Slide 2 | Stated vs. verified financial split, credit score, and AI talking points | Shows how the copilot prepares the officer in 30 seconds with synthesized data. |
| **3** | **Live Copilot (Consultative Guidance)** | `/meeting/meet_001/live` | Slide 3 | Live audio wave, scrolling transcript, and Form 1003 fact ledger | Demonstrates passive listening, non-intrusive HUD, and real-time fact capture. |
| **4** | **Live Copilot (High-Risk Intervention)** | `/meeting/meet_001/live` | Slide 3 | Red compliance banner (TRID / 18 U.S.C. § 1014) & suggested legal disclaimer | Proves deterministic rule precedence and active risk prevention during live calls. |
| **5** | **Post-Meeting Executive Summary** | `/meeting/meet_001/summary` | Slide 2 | Executive wrap-up, underwriting risk matrix, and stated vs. verified badge | Shows instant post-call structuring with zero manual note transcription. |
| **6** | **Human Approval & Enterprise Sync** | `/meeting/meet_001/summary` | Slide 5 | Gated modal for Salesforce FSC and Encompass LOS with payload preview | Proves strict human-in-the-loop governance and zero automated LOS writes. |
| **7** | **Branch Manager Governance Portal** | `/manager` | Slide 4 | Branch compliance index (94.2%), escalation queue, and coaching insights | Illustrates management visibility, compliance tracking, and team coaching. |
| **8** | **Back-Office Operations Triage Hub** | `/operations` | Slide 4 | Document readiness score (82%), debt conflict matrix, and SLA pipelines | Demonstrates downstream velocity and clean Day-1 file handoff to underwriting. |

---

## Detailed Screenshot Specifications

### Screenshot 1: Officer Pipeline Dashboard
* **Route**: `/dashboard`
* **Target Slide**: Slide 1 (Research + Problem)
* **What Must Be Visible**:
  - Top metric cards: Active Loans, Consultations Today, Pipeline Volume ($4.2M), Average Post-Call Wrap Time.
  - Upcoming Consultation card for John & Sarah Miller with pre-meeting status.
  - Lead conversion funnel and high-priority action alerts.
* **Why It Matters**: Grounds the narrative in the loan officer's daily reality—handling dozens of leads while facing administrative overhead.

---

### Screenshot 2: Pre-Meeting Intelligence Briefing
* **Route**: `/meeting/meet_001`
* **Target Slide**: Slide 2 (Proposed Product Journey — Before)
* **What Must Be Visible**:
  - Borrower profile header: John Miller (Apex Cloud W-2) & Sarah Miller (Miller Design 1099).
  - Financial Profile card: Purchase Price ($675,000), Down Payment ($85,000), Credit Score (740), DTI (34%).
  - **Stated vs. Verified Callout**: John's W-2 is verified ($145k), Sarah's 1099 is stated ($68k).
  - Underwriting flag: Sarah's 18-month self-employment history (under 24-month guideline).
  - AI Suggested Meeting Agenda and high-priority verification checklist.
* **Why It Matters**: Proves that the copilot equips the MLO with actionable intelligence before the borrower even picks up the phone.

---

### Screenshot 3: Live Copilot — Consultative In-Call Experience
* **Route**: `/meeting/meet_001/live`
* **Target Slide**: Slide 3 (AI Copilot — Assist Agent)
* **What Must Be Visible**:
  - Multi-speaker streaming transcript on the left (Agent Alex Vance vs. Borrower Sarah Miller).
  - Middle visual audio wave simulation indicating an active call.
  - Live Form 1003 Fact Ledger dynamically capturing $675k loan amount and 30-Year Fixed program.
  - Consultative intervention card recommending Fannie Mae HomeReady vs. Standard Conventional with "Play AI Response" audio button.
* **Why It Matters**: Demonstrates that the copilot is helpful, subtle, and context-aware without distracting the officer.

---

### Screenshot 4: Live Copilot — High-Risk Compliance Intervention
* **Route**: `/meeting/meet_001/live`
* **Target Slide**: Slide 3 (AI Copilot — Deterministic Rules)
* **What Must Be Visible**:
  - Prominent high-severity compliance alert card with red border.
  - Category: `TRID_INFORMAL_APPROVAL` (12 CFR § 1026.19) or `LIABILITY_OMISSION` (18 U.S.C. § 1014).
  - Exact transcript quote that triggered the alert.
  - Mandatory Suggested Legal Disclaimer button: *"Approval has not been established from this meeting..."*
  - Deterministic Precedence badge indicating `<20ms` rule evaluation.
* **Why It Matters**: Visual proof that the system stops illegal verbal representations before they expose the lender to audit fines.

---

### Screenshot 5: Post-Meeting Summary & Financial Segregation
* **Route**: `/meeting/meet_001/summary`
* **Target Slide**: Slide 2 (Proposed Product Journey — After)
* **What Must Be Visible**:
  - AI Executive Wrap-Up with timestamped meeting duration (28 mins).
  - Structured Financial Facts grid showing Purchase Price, Down Payment %, and Program.
  - **Stated vs. Verified Segregation Box**: Sarah's $8,000 cash quarantined as `STATED / EXCLUDED FROM QUALIFYING INCOME`.
  - Identified Underwriting Risks: Conflicting auto loan debt ($500 vs. $1,200).
* **Why It Matters**: Proves that post-meeting transcription eliminates 45 minutes of manual re-typing while preserving strict regulatory data integrity.

---

### Screenshot 6: Human-in-the-Loop Enterprise Approval Gate
* **Route**: `/meeting/meet_001/summary` (Approval Modal Open)
* **Target Slide**: Slide 5 (Enterprise + Risk Governance)
* **What Must Be Visible**:
  - Modal overlay: *"Review & Approve Salesforce FSC / Encompass LOS Sync"*.
  - Payload preview displaying MISMO 3.4 XML/JSON Form 1003 structure (`ENC-1003-99412`).
  - Stage clamping notice: *"File will be committed to 'Documentation Pending' — Automatic approval blocked"*.
  - MLO sign-off signature checkbox and green *"Approve & Commit"* button.
* **Why It Matters**: Proves that no external system mutation occurs without explicit licensed officer authorization.

---

### Screenshot 7: Branch Manager Governance Portal
* **Route**: `/manager`
* **Target Slide**: Slide 4 (Role-Based Product Experience — Manager)
* **What Must Be Visible**:
  - Branch Compliance Score: `94.2%` with trend line.
  - Active Exception Queue highlighting Alex Vance's verbal approval warning.
  - Team Performance Table: MLO Name, Meeting Volume, Wrap Time Reduction (28m -> 4m), and Compliance Flag Count.
  - One-click coaching action: *"Assign TRID Refresher Course"*.
* **Why It Matters**: Shows branch executives how the copilot surfaces systemic risks and coaching needs across their entire sales organization.

---

### Screenshot 8: Back-Office Operations Triage Hub
* **Route**: `/operations`
* **Target Slide**: Slide 4 (Role-Based Product Experience — Operations)
* **What Must Be Visible**:
  - Loan File Readiness Score: `82% Documentation Complete`.
  - Stated vs. Verified Reconciliation Queue: Sarah Miller ($8k cash unverified).
  - Borrower Debt Conflict card: Auto loan ($500 vs. $1,200 statement required).
  - Downstream Integration Sync Health indicators (Salesforce: OK, Encompass: OK, Blend: Pending Docs).
* **Why It Matters**: Shows loan processors and underwriters that they receive clean, pre-structured files rather than vague, scribbled notes.
