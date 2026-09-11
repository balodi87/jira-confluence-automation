# Status Report Filling Instructions

## Overview
This document provides standard operating procedures and instructions for Delivery Managers and Project Leads filling out the status report template in [template.md](template.md).

---

## 1. Header Information & Overall RAG Definition

### 1.1 Header Fields
- **Project Name / Code**: State the formal project name (e.g., `CTCO-AMS`).
- **Reporting Period**: Specify the cadence window (e.g., `Week ending 2026-09-11` or `Monthly Report - August 2026`).
- **Delivery Manager**: Your full name and title.
- **Overall RAG Status**: Must reflect the holistic project state based on standard criteria:

| RAG Status | Decision Criteria |
| :--- | :--- |
| **🟢 GREEN** | SLA $\ge 98\%$, zero unresolved P1 incidents, sprint commitment reliability $\ge 90\%$, billable utilization within $85\text{--}95\%$, no unmitigated critical risks. |
| **🟡 AMBER** | SLA between $95.0\%\text{--}97.9\%$, sprint commitment between $75\text{--}89\%$, 1 isolated P1 incident resolved within SLA, or moderate staffing/dependency blocker. |
| **🔴 RED** | SLA $< 95\%$, active or unresolved P1 incident breach, sprint delivery $< 75\%$, severe client escalation, or critical unmitigated blocker requiring VP intervention. |

---

## 2. Section-by-Section Instructions

### Section 1: Executive Summary
- Keep this concise (2–3 sentences max).
- Structure:
  1. *Sentence 1:* High-level health and core delivery achievement of the period.
  2. *Sentence 2:* Operational performance highlights (e.g., SLA compliance or volume stability).
  3. *Sentence 3:* Key risk, bottleneck, or decision requested from executive leadership.

### Section 2: Key Performance Indicators (KPIs)
- **Current Value**: Ensure numbers match source data (ITSM, Jira, timesheets).
- **Trend Indicators**:
  - `▲` (Improving compared to previous reporting period)
  - `▼` (Declining compared to previous reporting period)
  - `▶` (Stable / unchanged)
- **Status Indicators**: Use `🟢` (On Track / Met), `🟡` (Needs Attention / Borderline), `🔴` (Breached / Off Track).

### Section 3: AMS Incident & Ticket Operations
- **Ticket Inflow vs. Outflow**:
  - Inflow = Total tickets created during reporting period.
  - Outflow = Total tickets resolved during reporting period.
  - Net Backlog Delta = Inflow - Outflow.
- **High-Priority Incidents (P1 / P2)**:
  - List all P1 and P2 incidents that occurred or remained open during the period.
  - Include Root Cause Analysis (RCA) status (e.g., `RCA in draft`, `RCA approved`, `Fix deployed`).

### Section 4: Delivery & Milestone Progress
- **Key Deliverables (This Period)**: List completed user stories, epics, production releases, or infrastructure updates. Use bullet points with clear business impact.
- **Planned Objectives (Next Period)**: List high-priority commitments scheduled for the next period.

### Section 5: Team Capacity & Resource Utilization (40 Headcount)
- Ensure total headcount across pods sums to the full team size (**40**).
- Formula for Utilization:
  $$\text{Utilization \%} = \left( \frac{\text{Billable Hours Logged}}{\text{Total Available Work Hours}} \right) \times 100$$
- Highlight any PTO spikes, on-call rotation changes, or skill shortages in the Notes column.

### Section 6: Risks, Blockers & Escalations
- Every risk/blocker must have:
  - A unique ID (`R-01`, `R-02`, etc.)
  - Clear severity rating (`High`, `Medium`, `Low`)
  - A designated single point of contact (**Action Owner**)
  - A firm **Target Resolution Date**
  - Explicit flag if **VP Support Needed?** is `Yes` or `No` (if `Yes`, clearly articulate what executive action or decision is needed).

### Section 7: Continuous Improvement & Automation Value
- Quantify efficiency gains (e.g., hours saved per week, manual steps eliminated, defect prevention).

---

## 3. Pre-Submission Checklist
- [ ] RAG status matches objective KPI thresholds.
- [ ] Metric counts reconcile with ITSM / Jira dashboards.
- [ ] All 40 team members are accounted for in capacity tables.
- [ ] Every blocker has an assigned owner and target resolution date.
- [ ] No internal confidential credentials or unmasked client PII are present.
