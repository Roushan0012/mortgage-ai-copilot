# Client Validation Story & Research Hypothesis

This document defines the core product hypothesis, customer research foundation, and structured prototype validation framework for Darwix AI. 

> **Important Assessment Note**: In accordance with professional product management ethics, all findings below are structured as **Prototype Validation Questions & Evaluation Criteria**. We do not fabricate user feedback or post-deployment testimonials prior to conducting formal enterprise pilot testing.

---

## 1. Problem Statement

In U.S. residential mortgage origination, customer consultation meetings represent the single highest-value and highest-risk touchpoint in the loan lifecycle:

1. **Inconsistent Meeting Quality**: Loan officers vary wildly in conversational discipline. Junior officers frequently forget to probe for recurring co-borrower liabilities, fail to identify self-employment guideline constraints early, or struggle to compare conforming vs. FHA product options.
2. **Severe Regulatory Liabilities**: Under intense sales pressure, officers inadvertently make verbal pre-approval statements (`"You should be approved"`) before formal underwriting, or quote interest rates without disclosing the APR—exposing lending institutions to statutory penalties under CFPB TRID (12 CFR § 1026.19) and TILA Regulation Z (12 CFR § 1026.24).
3. **Severe Downstream Execution Drag**: Post-meeting administration takes 45–60 minutes per call. Officers manually transcribe notes, re-enter numbers into Salesforce FSC, create Form 1003 loan drafts in ICE Encompass, and draft document request lists. Stated cash income verbally mentioned on calls is frequently entered as qualifying income, creating underwriting failure points weeks later.
4. **Manager Blind Spots**: Branch managers have zero visibility into live in-call risks until post-close quality control audits or regulatory examination reviews flag non-compliant loan files.

---

## 2. Core Product Hypothesis

> **Hypothesis**: By coupling an ultra-low-latency deterministic compliance engine with contextual Large Language Model reasoning, we can assist Loan Officers in real time, extract structured Form 1003 parameters, and stage downstream enterprise actions behind human approval gates—**slashing post-call administration by 85%, eliminating verbal compliance violations to 0%, and reducing loan time-to-close by 4.5 days, while preserving 100% human accountability.**

---

## 3. The 5-Stage Functional Prototype

The Darwix AI prototype demonstrates this complete lifecycle across five interconnected experiences:

1. **Before (Pre-Meeting)**: Synthesizes CRM history, credit tier, and missing docs into a 30-second preparation brief (`/meeting/meet_001`).
2. **During (Live Consultation)**: Real-time multi-speaker diarization, Fact Ledger capture, audio coaching, and deterministic compliance banners (`/meeting/meet_001/live`).
3. **After (Summary & Action Center)**: Automated executive wrap-up, underwriting risk matrix, and stated vs. verified income segregation (`/meeting/meet_001/summary`).
4. **Manager (Governance Portal)**: Branch compliance score, escalation queues, team coaching recommendations, and adoption metrics (`/manager`).
5. **Operations (Downstream Hub)**: Document triage readiness score, stated vs. verified reconciliation, and debt conflict resolution (`/operations`).

---

## 4. Prototype Validation Questions & Test Criteria

These eight validation questions form the evaluation protocol for pilot branch testing:

### 1. Does the loan officer understand what to ask next?
* **Hypothesis**: The pre-meeting briefing and dynamic suggested questions reduce cognitive blank-outs and ensure all underwriting gaps (e.g., Sarah Miller's 18-month self-employment history) are probed thoroughly.
* **Evaluation Metric**: Percentage of underwriting-required questions asked during call (Target: >95%).

### 2. Are in-call AI nudges useful rather than distracting?
* **Hypothesis**: Nudge fatigue controls (15-second cooldown debounce, max 3 onscreen cards, low-confidence suppression <75%) keep the officer focused on the borrower without visual overload.
* **Evaluation Metric**: Officer dismissal rate vs. acceptance rate; qualitative feedback on visual distraction.

### 3. Does the loan officer trust the extracted evidence?
* **Hypothesis**: Providing exact transcript citations, speaker attribution, and confidence ratings for every extracted Form 1003 field builds immediate operator trust.
* **Evaluation Metric**: Extracted fact override rate by loan officers in the post-meeting review (Target: <5% manual correction).

### 4. Are high-risk compliance alerts appropriately strict?
* **Hypothesis**: Deterministic regex matching for TRID informal approval and 18 U.S.C. § 1014 liability omission prevents catastrophic compliance breaches without false-positive nuisance alerts.
* **Evaluation Metric**: False-positive rate on compliance flags (Target: <2%); officer adoption of suggested safe disclaimers (Target: 100%).

### 5. Does structured capture meaningfully reduce post-meeting work?
* **Hypothesis**: Auto-populating Form 1003 parameters and generating comprehensive executive wrap-ups reduces post-call administrative wrap time from 45 minutes to under 5 minutes.
* **Evaluation Metric**: Measured time from meeting end to file sign-off (Target: <5 minutes).

### 6. Are human approval gates acceptable to operators and legal?
* **Hypothesis**: Requiring explicit one-click MLO approval before syncing to Salesforce CRM or ICE Encompass provides the necessary regulatory accountability without feeling cumbersome.
* **Evaluation Metric**: Approval modal dwell time (Target: 30–60 seconds per file); zero unreviewed automated commits.

### 7. Does manager visibility surface genuinely useful coaching exceptions?
* **Hypothesis**: Showing aggregated compliance scores (94.2%) and surfacing specific verbal approval infractions enables branch managers to coach officers proactively rather than punitively.
* **Evaluation Metric**: Manager engagement with coaching queue; reduction in repeat compliance flags per officer over 30 days.

### 8. Does the end-to-end workflow feel realistic to mortgage professionals?
* **Hypothesis**: Segregating stated vs. verified income, clamping LOS files to 'Documentation Pending', and generating Blend-style needs lists matches actual institutional origination practices.
* **Evaluation Metric**: Qualitative feedback from licensed MLOs, underwriters, and compliance officers during pilot walkthroughs.
