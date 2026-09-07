# Darwix AI — Real-Time AI Copilot for U.S. Mortgage Sales

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Compliance](https://img.shields.io/badge/Compliance-TRID%20%7C%20TILA%20%7C%20RESPA-red.svg)](#compliance-engine)

> **Darwix AI** is an enterprise-grade real-time AI copilot engineered for U.S. Mortgage Loan Officers (MLOs), branch managers, and mortgage lending institutions. It combines ultra-low latency contextual intelligence with strict, deterministic regulatory compliance guardrails to increase sales conversion, eliminate regulatory infractions, and automate Fannie Mae Form 1003 data capture during live consultations.

---

## Executive Summary & Product Objective

In modern mortgage originations, loan officers operate in high-cognitive-load environments. During a 30-minute borrower consultation, an MLO must:
1. Establish borrower rapport and uncover financing motivations.
2. Accurately capture dozens of granular fields for the Uniform Residential Loan Application (Form 1003).
3. Handle product comparisons and pricing objections in real time.
4. Strictly comply with federal lending mandates: **CFPB TRID**, **TILA Regulation Z**, **RESPA Section 8**, **Dodd-Frank ATR/QM**, and **ECOA Fair Lending**.

A single verbal regulatory misstep—such as providing an informal approval before underwriting sign-off or quoting an interest rate without disclosing the Annual Percentage Rate (APR)—can trigger severe CFPB civil penalties, lender buybacks, and consumer deceptive practice claims.

**Darwix AI solves this by introducing a dual-engine architecture:**
- **Deterministic Compliance Engine (Priority 1)**: Sub-10ms pattern evaluation enforcing hard regulatory rules with zero tolerance for generative hallucinations.
- **Contextual AI Inference Engine (Priority 2)**: Groq-accelerated LLM reasoning for objection handling, competitive positioning, discovery questioning, and real-time 1003 fact extraction.
- **Human-in-the-Loop Governance**: Advisory-only interventions requiring explicit Loan Officer sign-off (`Accept`, `Dismiss`, `Ask Question`, `Escalate`).

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client ["Client Layer (Next.js 16 App Router)"]
        UI_Dash["Loan Officer Pipeline (/dashboard)"]
        UI_Brief["Pre-Meeting Briefing (/meeting/[id])"]
        UI_Live["Live Copilot Cockpit (/meeting/[id]/live)"]
        UI_Summ["Post-Meeting Summary (/meeting/[id]/summary)"]
        UI_Mgr["Manager Operations Portal (/manager)"]
        UI_Cust["Customer 360 Dossier (/customer/[id])"]
    end

    subgraph DualEngine ["Darwix Processing Core"]
        direction TB
        subgraph DeterministicEngine ["1. Deterministic Compliance Engine (Priority 1)"]
            TRID["TRID Informal Approval Guard"]
            TILA["TILA Reg Z APR Disclosure Check"]
            FRAUD["Liabilities Omission / Fraud Prevention"]
            QM["Dodd-Frank ATR/QM Income Verification"]
            UDAAP["Deceptive Competitor Pricing Guard"]
        end

        subgraph AIEngine ["2. Contextual AI Engine (Priority 2)"]
            GroqSDK["Groq Ultra-Fast LPU Inference (Llama 3.3)"]
            FactExtract["1003 Loan Application Fact Extractor"]
            Objection["Objection Handling & Sales Nudges"]
        end

        subgraph Arbiter ["3. Safety Arbiter & Coordinator"]
            Override["Deterministic Priority Override"]
            Dedupe["Deduplication & Severity Sorter"]
            CardDispatch["Intervention Dispatcher"]
        end
    end

    subgraph Integrations ["Enterprise Integration Hub"]
        LOS["Encompass LOS (MISMO 3.4)"]
        CRM["Salesforce Financial Services Cloud"]
        PPE["Optimal Blue Pricing Engine"]
    end

    UI_Live --> DualEngine
    DeterministicEngine --> Arbiter
    AIEngine --> Arbiter
    Arbiter --> UI_Live
    UI_Summ --> Integrations
```

---

## Core Regulatory Scenarios Covered

The architecture provides explicit handling for high-risk mortgage consultation situations:

| Scenario / Trigger | Regulatory Authority | System Action & Intervention |
| :--- | :--- | :--- |
| **Informal Approval Statement**<br>*"You're 100% approved in my book"* | **CFPB TRID (12 CFR § 1026.19)** | **CRITICAL WARNING**: Prohibits unauthorized commitment; prompts immediate verbal retraction script and queues conditional pre-qualification letter. |
| **Indicative Rate Without APR**<br>*"I can give you a rate of 5.875%"* | **TILA Reg Z (12 CFR § 1026.24)** | **HIGH WARNING**: Mandates oral APR disclosure and disclosure that interest rates float until formal lock agreement. |
| **Omitting Liabilities / Leases**<br>*"Can we leave off Sarah's auto lease?"* | **18 U.S.C. § 1014 / Fannie Mae B3-6-01** | **CRITICAL WARNING**: Fraud prevention block. Informs borrower all debts must be declared; auto-populates lease into Form 1003 liabilities ledger. |
| **Unverifiable Cash Income**<br>*"Client paid $15,000 cash for a private job"* | **Dodd-Frank ATR/QM (12 CFR § 1026.43)** | **HIGH ALERT**: Clarifies 2-year tax return documentation requirements for self-employed income; blocks unverified cash from qualifying DTI. |
| **Unverified Competitor Guarantee**<br>*"I'll beat Rocket Mortgage by 50 bps"* | **FTC Act Section 5 / CFPB UDAAP** | **MEDIUM ADVISORY**: Prompts request for competing written Loan Estimate before binding rate matching. |

---

## 3-Column Live Meeting Cockpit

The live consultation interface (`/meeting/[id]/live`) is engineered for rapid visual scanning and low cognitive friction:

- **LEFT COLUMN (30%) — Live Conversation Stream**: Dual-channel speaker diarization (`Loan Officer`, `Primary Borrower`, `Co-Borrower`), simulated audio visualizer, real-time transcript streaming, and compliance trigger badges.
- **CENTER COLUMN (40%) — Customer & Meeting Context**: Instant borrower dossier (John & Sarah Miller), live 1003 fact verification ledger, and interactive scenario & payment calculator (LTV, DTI, PITI breakdown).
- **RIGHT COLUMN (30%) — Darwix AI Copilot**: Actionable intervention card deck sorted by severity (`critical`, `high`, `medium`, `info`). Supports **Accept**, **Dismiss** (with mandatory compliance justification), **Ask Nudge**, **View Evidence**, and **Escalate**.

---

## Enterprise Integrations Hub

Darwix AI is designed with decoupled adapter contracts ready for enterprise deployment:
- **Encompass by ICE Mortgage Technology**: Bidirectional Fannie Mae MISMO 3.4 XML payload generation and condition synchronization.
- **Salesforce Financial Services Cloud (FSC)**: Real-time consultation activity logging, lead stage updates, and automated follow-up task dispatching.
- **Optimal Blue PPE**: Real-time secondary marketing rate queries.

---

## Repository Structure

```
/
├── app/                        # Next.js 16 App Router
│   ├── dashboard/              # Loan Officer Pipeline & Metrics
│   ├── meeting/[id]/           # Pre-meeting preparation briefing
│   │   ├── live/               # 3-Column Live Meeting Cockpit
│   │   └── summary/            # Post-meeting recap & integration sync
│   ├── manager/                # Lending operations & compliance portal
│   ├── customer/[id]/          # Customer 360 borrower dossier
│   └── api/                    # Server-side API route handlers
├── components/
│   ├── copilot/                # Actionable intervention cards & deck
│   ├── customer/               # Borrower profiles & 1003 ledger
│   ├── dashboard/              # Pipeline overview components
│   ├── layout/                 # Global navigation & headers
│   ├── meeting/                # Transcript viewer & audio visualizers
│   └── shared/                 # Design system primitives (Badge, Button, Card)
├── lib/
│   ├── ai/                     # Groq LLM inference client & prompts
│   ├── compliance/             # Deterministic compliance rule engine
│   ├── interventions/          # Coordinator, arbiter, and action handlers
│   ├── meeting/                # Meeting manager & state store
│   ├── integrations/           # Encompass LOS & Salesforce CRM adapters
│   ├── data/                   # Realistic mock data (Miller family) & repository
│   ├── validation/             # Zod validation schemas
│   └── utils/                  # Currency, percentage, and date utilities
├── types/                      # Comprehensive TypeScript domain models
└── docs/
    ├── ARCHITECTURE.md         # Full architecture specification & Mermaid diagrams
    └── PRODUCT_DECISIONS.md    # Architecture decision records (ADRs)
```

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20+ (tested on Node v22.18.0)
- npm or pnpm

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/Roushan0012/mortgage-ai-copilot.git
   cd mortgage-ai-copilot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy the provided `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to add optional keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```
   > **Note**: If `GROQ_API_KEY` is omitted, Darwix AI gracefully operates in deterministic offline heuristic mode with zero downtime for local demonstration and testing.

4. Start Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Validation & Code Quality

Run the verification test suite before committing:

```bash
# 1. Typecheck TypeScript models and routes
npm run typecheck

# 2. Lint project files
npm run lint

# 3. Compile optimized production build
npm run build
```

---

## Security & Privacy Compliance

- **Gramm-Leach-Bliley Act (GLBA) Safeguards**: All synthetic test borrower data masks Nonpublic Personal Information (`***-**-6789`).
- **Zero Client Credential Leakage**: API secrets (`GROQ_API_KEY`, `ELEVENLABS_API_KEY`) reside exclusively in server-side runtime environments and are strictly excluded from client-side bundles.
- **Immutable Audit Trail**: All compliance alerts, officer overrides, and dismissed nudges require auditable justifications recorded to the compliance ledger.

---

## License

Enterprise Assessment Prototype — Proprietary & Confidential.
