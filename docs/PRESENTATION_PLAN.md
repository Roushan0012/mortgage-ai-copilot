# Darwix AI — Executive Client Presentation Plan (6 Slides)

This presentation plan provides an executive, client-oriented 6-slide deck structure designed for executive leadership, lending operations heads, and chief compliance officers.

---

## Slide 1: The Mortgage Sales Crisis — Cognitive Overload & Regulatory Risk

- **Slide Purpose**: Establish urgent business context, loan officer operational strain, and severe financial penalties associated with conversational lending infractions.
- **Key Message**: Loan officers are tasked with simultaneously building rapport, probing for liabilities, comparing loan products, and capturing Form 1003 data, all while navigating a federal regulatory minefield where verbal misstatements trigger steep CFPB fines and lender buybacks.
- **What Screenshot / Product State to Show**:
  - Split graphic: On the left, a high-stress borrower consultation call with overlapping questions. On the right, pre-meeting loan officer brief showing the complex mixed-profile borrower (John's W-2 salary + Sarah's self-employment + conflicting debts).
- **What NOT to Overload the Slide With**:
  - Do not list exhaustive legal statutory paragraphs or deep technical stack diagrams. Keep focus on the human loan officer and lender risk.

---

## Slide 2: The Proposed Product Journey — Continuous Intelligence Across the Lifecycle

- **Slide Purpose**: Walk stakeholders through the end-to-end user journey across all touchpoints (Before, During, and After Meeting).
- **Key Message**: Darwix AI is not an isolated chatbot or post-call transcription tool—it is an integrated intelligence layer that prepares the officer before the call, guides them in real time during the conversation, and automates downstream enterprise execution post-call.
- **What Screenshot / Product State to Show**:
  - High-level 6-phase journey diagram: `1. Prepare (Pre-Meeting Brief)` → `2. Meet (Live Cockpit)` → `3. Guide (Copilot Deck)` → `4. Synthesize (Summary Hub)` → `5. Approve (Human Gates)` → `6. Synchronize (CRM, LOS, Operations)`.
- **What NOT to Overload the Slide With**:
  - Do not dive into code or API schemas. Emphasize user journey continuity and cross-functional handoffs.

---

## Slide 3: Real-Time AI Copilot & Deterministic Compliance Precedence

- **Slide Purpose**: Demonstrate how the Copilot protects the lender in real time without annoying or distracting the loan officer.
- **Key Message**: Compliance cannot rely on probabilistic generative AI. Darwix AI enforces deterministic rules in sub-10ms for TRID, TILA, and ATR compliance, reserving generative LLM power for consultative coaching and objection handling.
- **What Screenshot / Product State to Show**:
  - Live Meeting Workspace (`/meeting/meet_001/live`) showing the 3-column synchronous layout: conversation stream on the left, customer fact ledger in the center, and high-visibility compliance intervention card (e.g. TRID informal approval warning with exact suggested script and evidence quote) on the right.
- **What NOT to Overload the Slide With**:
  - Do not show raw prompt engineering, JSON schemas, or token counters. Focus on speed (<10ms), explainability, and loan officer control.

---

## Slide 4: Multi-Role Operational Ecosystem — Agent, Customer, Manager & Operations

- **Slide Purpose**: Illustrate how four distinct personas interact with synchronized data while preserving strict privacy and security boundaries.
- **Key Message**: Everyone works from the same source of truth, but sees only what is appropriate for their role. Customers see clear milestones without internal risk scores; managers see branch health; operations triages verification queues.
- **What Screenshot / Product State to Show**:
  - 4-quadrant UI preview:
    - Top Left: Loan Officer Action Center.
    - Top Right: Customer Portal (`/customer/cust_miller_001`) with clean 6-stage milestone tracker.
    - Bottom Left: Manager Governance Dashboard (`/manager`) showing compliance escalation index.
    - Bottom Right: Back-Office Operations Console (`/operations`) showing document verification queue.
- **What NOT to Overload the Slide With**:
  - Avoid dense tabular text. Highlight role separation and clean data boundaries.

---

## Slide 5: Enterprise Automation with Strict Human Approval Gates

- **Slide Purpose**: Address the C-suite's #1 concern: *"Will the AI make unauthorized decisions or corrupt our core systems?"*
- **Key Message**: The AI recommends and prepares; it never autonomously commits. Loan officers must review and approve Form 1003 drafts, CRM notes, and document requests through explicit approval gates before any data enters Encompass or Salesforce.
- **What Screenshot / Product State to Show**:
  - The Post-Meeting Action Center with the Encompass MISMO 3.4 Modal open, showing the loan officer reviewing the drafted payload and clicking *"Approve & Stage Form 1003"*, alongside the tamper-evident audit timeline with idempotency keys.
- **What NOT to Overload the Slide With**:
  - Do not display full 500-line raw XML files. Highlight the approval gate, stated-vs-verified isolation, and duplicate prevention.

---

## Slide 6: Pilot Strategy, Product Metrics & ROI

- **Slide Purpose**: Present a realistic, disciplined pilot rollout plan, clear success criteria, and pilot tradeoff decisions.
- **Key Message**: We launch with high-impact, defensible capabilities that drive our North Star metric (*Meeting-to-Next-Action Completion Rate*), protecting loan officer adoption through strict nudge fatigue governance and offline deterministic reliability.
- **What Screenshot / Product State to Show**:
  - Pilot scorecard card showing the North Star metric, supporting velocity metrics (time-to-follow-up cut from 6 hours to 15 minutes), and guardrail metrics (0 duplicate records, 0 unescalated TRID infractions). Include the `/demo` 1-click evaluator tour.
- **What NOT to Overload the Slide With**:
  - Do not promise impossible 100% full-stack automation on Day 1. Emphasize measured branch pilot rollout with mock adapter fallback.
