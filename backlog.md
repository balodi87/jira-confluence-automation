# Implementation Backlog: CTCO-AMS Executive Reporting System

Based on [project_spec.md](project_spec.md) and stakeholder requirements, this backlog outlines actionable, granular tasks organized into standard implementation phases.

---

## Phase 1: Setup & Project Scaffolding

- [ ] **1.1 Directory Structure & Package Initialization** (#1)
  - [ ] Create core project folders: `src/`, `src/models/`, `src/parsers/`, `src/generators/`, `src/utils/`, `templates/`, `data/fixtures/`, `tests/`, `output/`
  - [ ] Add `__init__.py` files across all Python source modules
  - [ ] Update `requirements.txt` to include `weasyprint`, `pandas`, `openpyxl`, `jinja2`, `pydantic`, `pytest`
- [ ] **1.2 Data Schema Definition (Pydantic Models)** (#2)
  - [ ] Implement `MetricCard` model with status indicators (`green`, `amber`, `red`) and trend directions in `src/models/report_schema.py`
  - [ ] Implement `IncidentRecord` model with priority, timestamps, SLA compliance flag, and RCA tracking
  - [ ] Implement `ResourceSummary` and `PodCapacity` models supporting 40-headcount allocation and utilization tracking
  - [ ] Implement `VPReportPayload` top-level schema validating weekly and monthly report structures
- [ ] **1.3 Mock Data Fixtures Creation** (#3)
  - [ ] Generate `data/fixtures/sample_servicenow_tickets.json` with realistic P1–P4 incidents and SLA timestamps
  - [ ] Generate `data/fixtures/sample_roster_allocation.xlsx` covering 40 resources across 4 pods (Core AMS, Enhancements, DevOps, QA)
  - [ ] Generate `data/fixtures/sample_jira_delivery.json` with sprint velocity, planned vs. delivered points, and blockers

---

## Phase 2: Core Features (Data Processing & Engine)

- [ ] **2.1 Ingestion & Parsing Engine**
  - [ ] Implement `src/parsers/itsm_parser.py` to parse ticket exports, calculate response/resolution durations, and flag SLA breaches
  - [ ] Implement `src/parsers/roster_parser.py` to calculate pod-level and project-wide billable utilization (%) across the 40 FTEs
  - [ ] Implement `src/parsers/jira_parser.py` to extract sprint story points, milestone completion %, and defect metrics
- [ ] **2.2 KPI & Analytics Engine**
  - [ ] Implement `src/utils/kpi_engine.py` for mathematical calculation of:
    - Overall SLA compliance rate: $\frac{\text{Tickets Met SLA}}{\text{Total Eligible Tickets}} \times 100\%$
    - Mean Time to Resolve (MTTR): $\frac{\sum (\text{Resolved} - \text{Created})}{\text{Total Resolved}}$
    - Ticket inflow vs. outflow delta & backlog aging distribution buckets ($0\text{--}7\text{d}$, $8\text{--}30\text{d}$, $30\text{--}60\text{d}$, $>60\text{d}$)
    - 40-member billable utilization: $\frac{\text{Billable Hours}}{\text{Available Hours}} \times 100\%$
- [ ] **2.3 Governance & RAG Status Evaluator**
  - [ ] Implement automated RAG rule evaluator in `src/utils/rag_evaluator.py` enforcing:
    - **Green**: SLA $\ge 98\%$, zero unresolved P1s, utilization $85\text{--}95\%$, schedule variance $< 5\%$
    - **Amber**: SLA $95\text{--}97.9\%$, 1 isolated P1 resolved within grace, schedule variance $5\text{--}15\%$
    - **Red**: SLA $< 95\%$, active/unresolved P1 breach, critical escalation, or capacity emergency

---

## Phase 3: Core Features (Dual Report Generation Engines)

- [ ] **3.1 Jinja2 Template Development**
  - [ ] Build base layout `templates/base.html` with responsive styles, typography, and theme variables
  - [ ] Build `templates/weekly_dashboard.html`: 7-day executive summary, KPI badges, active blockers, P1/P2 triage log
  - [ ] Build `templates/monthly_dashboard.html`: 30-day macro SLA trends, 40-member pod utilization table, cost/CR summary, risk matrix
- [ ] **3.2 Executive Email Digest Generator**
  - [ ] Build `templates/email_weekly_digest.html` using inlined CSS and email-safe HTML table layouts
  - [ ] Implement `src/generators/email_generator.py` with CSS inliner (premailer/inline styling) compatible with Outlook & Gmail
- [ ] **3.3 Executive PDF Export Engine (WeasyPrint)**
  - [ ] Implement print-specific stylesheet `templates/print_pdf.css` with `@page` landscape formatting, page break rules, and running headers/footers
  - [ ] Implement `src/generators/pdf_generator.py` converting compiled HTML templates to executive slide/deck PDF files via WeasyPrint

---

## Phase 4: Integration & Orchestration

- [ ] **4.1 Report Orchestration Pipeline**
  - [ ] Implement `src/main.py` CLI supporting arguments:
    - `--cadence [weekly|monthly]`
    - `--tickets <path>`
    - `--roster <path>`
    - `--jira <path>`
    - `--format [html|email|pdf|all]`
    - `--output-dir <dir>`
  - [ ] Integrate data ingestion $\to$ KPI computation $\to$ RAG assessment $\to$ multi-format rendering into a unified pipeline
- [ ] **4.2 Live Adapter Interfaces (Extensibility)**
  - [ ] Create abstract adapter class `src/parsers/base_adapter.py`
  - [ ] Scaffold REST API connectors `src/parsers/servicenow_api.py` and `src/parsers/jira_api.py` for future live authentication and polling

---

## Phase 5: Testing & Quality Assurance

- [ ] **5.1 Unit Tests**
  - [ ] Create `tests/test_kpi_engine.py`: Validate edge cases in SLA %, MTTR division by zero, and backlog aging bucket boundaries
  - [ ] Create `tests/test_rag_evaluator.py`: Verify correct assignment of Green, Amber, and Red states based on metric thresholds
  - [ ] Create `tests/test_parsers.py`: Verify robust handling of missing fields, malformed dates, and blank Excel cells
- [ ] **5.2 Integration & Rendering Tests**
  - [ ] Create `tests/test_generators.py`: Verify successful rendering of Weekly HTML, Monthly HTML, Email Digest, and PDF outputs without errors
  - [ ] Validate HTML output portability (standalone files with no broken external CDN references)
  - [ ] Verify PDF pagination and absence of awkward page breaks across table rows

---

## Phase 6: Documentation & Handover

- [ ] **6.1 System Documentation**
  - [ ] Update `README.md` with installation steps, dependency setup, CLI command examples, and architecture overview
  - [ ] Document data ingestion schema contracts and CSV/Excel template specifications for PMO/Operations leads
- [ ] **6.2 Operations Guide**
  - [ ] Create `docs/OPERATIONS_GUIDE.md` detailing weekly cadence checklist, monthly executive presentation prep, and troubleshooting steps
