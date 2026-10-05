# Module 17 Completion Report

## Specification Contents
```markdown
# Feature Specification: Jira/Confluence Automation Platform

**Feature Branch**: `001-jira-confluence-automation`
**Created**: 2026-09-18
**Status**: Draft
**Input**: User description: "Jira/Confluence automation project — weekly project status reporting, overdue work/blocker alerts, and a decision/action-item tracker, published to Confluence, built on React 18 + Vite / Node.js + Express / PostgreSQL 15."

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a project/delivery manager, I want Jira issue data automatically collected,
summarized, and published to Confluence on a schedule, so that I no longer
have to manually gather status updates, chase overdue work, or hunt for
decisions scattered across comments and meeting notes.

### Acceptance Scenarios

1. **Given** a configured Jira project/board and a reporting period, **When**
   the weekly report job runs, **Then** a status report is generated
   summarizing completed, in-progress, and overdue issues, sprint/release
   info, and recorded blockers/risks, and is published to the configured
   Confluence page.
2. **Given** an issue whose due date has passed without a status change,
   **When** the overdue/blocker scan runs, **Then** the issue is flagged and
   a notification is sent to the assignee/team and/or posted to a Confluence
   alerts page.
3. **Given** a Jira comment or Confluence meeting note tagged as containing a
   decision or action item, **When** the tracker job runs, **Then** the
   decision/action item is extracted with an owner, due date, and status, and
   is added to (or updated in) the tracker report.
4. **Given** a user viewing the web dashboard, **When** they select a
   project and date range, **Then** they see the current status report,
   outstanding alerts, and open action items without needing to open Jira or
   Confluence directly.
5. **Given** Jira/Confluence API credentials are invalid or the API is
   unreachable, **When** any automation job runs, **Then** the job fails
   gracefully, logs a structured error, and does not publish a partial or
   corrupted report.

### Edge Cases
- An issue has no due date — it MUST be excluded from overdue detection but
  still counted in general status totals.
- An issue is moved between projects/boards mid-sprint — the report MUST
  reflect its state at the time of report generation, not double-count it.
- A Confluence target page does not exist or was deleted — the system MUST
  surface a clear error rather than silently failing to publish.
- Duplicate decision/action items are extracted from both a Jira comment and
  a linked Confluence page — the tracker MUST deduplicate by source
  reference before persisting.
- Jira/Confluence rate limits are hit during a sync — the system MUST back
  off and retry rather than dropping data.
- A report is requested for a period with zero issues/activity — the system
  MUST still generate a valid (empty-state) report, not an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect to Jira to retrieve issues by project,
  board, or saved filter, including status, priority, assignee, due date,
  completed date, and sprint/release fields.
- **FR-002**: System MUST generate a Weekly Project Status Report summarizing
  issues completed, in progress, and overdue within a configurable reporting
  window.
- **FR-003**: System MUST publish generated reports to a configured
  Confluence page/space, creating a new page version rather than overwriting
  history destructively.
- **FR-004**: System MUST detect issues that are overdue (past due date and
  not in a completed status) or blocked (linked blocker/dependency present)
  and generate an alert for each.
- **FR-005**: System MUST notify the responsible assignee/team for each
  overdue/blocker alert via a configurable channel (e.g., Confluence alert
  page; email/chat integration out of scope for this spec) and MUST record
  when each alert was raised to avoid duplicate re-notification within the
  same period.
- **FR-006**: System MUST extract decisions and action items from Jira
  comments/labels and Confluence meeting notes, capturing owner, due date,
  status, and a link back to the originating source.
- **FR-007**: System MUST track the completion status of each action item
  over time and reflect status changes in subsequent report runs.
- **FR-008**: System MUST expose a web dashboard (React frontend) allowing a
  user to select a project and date range and view the current status
  report, active alerts, and open action items.
- **FR-009**: System MUST persist ingested issues, alerts, and action items
  in PostgreSQL so that report history and trend data survive across job
  runs and application restarts.
- **FR-010**: System MUST authenticate to Jira/Confluence using securely
  stored credentials (API token/OAuth) that are never exposed to the
  frontend or logged in plaintext.
- **FR-011**: System MUST run all Jira/Confluence report and alert jobs on a
  configurable schedule (e.g., weekly for status reports) as well as
  on-demand via an authenticated API call.
- **FR-012**: System MUST log structured outcomes (success/failure, item
  counts, duration) for every automation run, without logging secrets or
  full external payloads.
- **FR-013**: System MUST handle Jira/Confluence API errors (auth failure,
  rate limiting, unreachable page) without publishing partial or corrupted
  report content.
- **FR-014**: System MUST deduplicate decision/action items that originate
  from multiple linked sources (e.g., a Jira comment and a Confluence page
  referencing the same decision).

- **FR-015**: System MUST notify responsible users via a Confluence alerts
  page for v1 (email/chat integration is out of scope until a later
  iteration).
- **FR-016**: System MUST support at least 10 concurrent Jira
  projects/boards and a combined total of up to ~5,000 open issues for v1;
  ingestion/polling frequency is sized against this target.
- **FR-017**: System MUST retain report/alert/action-item history
  indefinitely for v1 (no automated purge); a retention/purge policy will
  be defined in a later iteration.

### Key Entities

- **Issue**: A Jira issue snapshot at time of ingestion — key, summary,
  status, priority, assignee, sprint/release, due date, completed date.
- **StatusReport**: A generated weekly (or on-demand) summary — reporting
  period, source project/board/filter, completed/in-progress/overdue issue
  lists, blockers, risks, and the Confluence page it was published to.
- **Alert**: An overdue or blocker notification — related issue, reason
  (overdue/blocked), raised timestamp, notified recipient(s), acknowledgement
  status.
- **ActionItem**: A tracked decision or follow-up task — description, owner,
  due date, status, source reference (Jira comment or Confluence page link),
  linked project/team identifier.
- **PublishTarget**: A Confluence destination — space, page ID/template,
  and the report type(s) it receives.

## Resolved Decisions

The following decisions were open as `[NEEDS CLARIFICATION]` or unstated
contradictions after initial review (see `spec/clarify.md`). They have now
been confirmed and are reflected in `spec/plan.md` §1 (full rationale/risk
notes live there; this section records the ratified outcome):

- **Dashboard interactivity**: The dashboard is interactive, not read-only.
  Authenticated users with the "actor" role may acknowledge alerts and mark
  action items complete; "viewer" role is read-only.
- **Platform authentication**: Dashboard login uses org-wide OIDC SSO.
  Jira/Confluence access uses one shared service account per environment
  for v1 (not per-user impersonation).
- **Ingestion method**: Polling only for v1; webhook-based ingestion is
  deferred to a later iteration.
- **Notification channel, scale, and retention**: See FR-015, FR-016, and
  FR-017 above.

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) in
      functional requirements
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No `[NEEDS CLARIFICATION]` markers remain (resolved — see Resolved
      Decisions and FR-015–017)
- [x] Requirements are testable and unambiguous where not marked
- [x] Success criteria are measurable (report generated, alert raised,
      action item tracked, each with explicit triggering conditions)
- [x] Scope is clearly bounded (three automations: status report, overdue
      alerts, decision/action tracker; dashboard is interactive for
      "actor"-role users, read-only for "viewer"-role users)
- [x] Dependencies and assumptions identified (Jira/Confluence
      availability, credential provisioning)

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted (actors, actions, data, constraints)
- [x] Ambiguities marked and resolved (notification channel, scale,
      retention — see Resolved Decisions)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
```

## Commit History
```text
88aa863 (HEAD -> main, origin/main, origin/HEAD) feat: complete end-to-end prototype per specification
863f75c Implement backend scaffold, DB schema, and full Docker Compose stack
a5da387 Add T001 spec resolution, task analysis, and frontend scaffold (T011/T012)
304e87d Add spec-kit clarify, plan, and tasks for Jira/Confluence automation
58e2bbd Add ctco-ams project skeleton, Jira/Confluence spec-kit files, and module-16 report
fc4d9b3 Add bulk Markdown validation script and Module 15 completion report
27be831 Fix broken catalog links and register missing instruction files
dd628f1 Add SRP validation instruction file and results for instructions/
7d94361 Annotate backlog tasks with batch-processing approach (1/2/3)
475a7a1 Update Module 14 report with MCP issue creation status
4cde656 Add Module 14 completion report
83c78f7 Update backlog.md with Phase 1 GitHub issue references
776c797 Update module task repository
10160ec Add compound interest and ITSM tools
87796a3 Add instruction catalog, workflow files, quiz generator, and module reports
c5e4a04 Add project setup, templates, guidelines, module 8 report, and implementation backlog
f9d9861 Add project technical specification
da2480c Add project files and automation examples
5c1a79b Add Jira Confluence automation ideas
```

## Commit Count
```text
19
```

## Project Files
```text
.gitignore
.vscode/mcp.json
.vscode/path/to/mcp-echo.ps1
.vscode/path/to/mcp-status.ps1
PROJECT_IDEAS.md
TODO.md
backlog.md
calculator/main.py
calculator/operations.py
ctco-ams/backend/package.json
ctco-ams/backend/src/app.js
ctco-ams/backend/src/export/emailExporter.js
ctco-ams/backend/src/export/pdfExporter.js
ctco-ams/backend/src/ingestion/itsmParser.js
ctco-ams/backend/src/ingestion/jiraParser.js
ctco-ams/backend/src/ingestion/rosterParser.js
ctco-ams/backend/src/kpi/mttrCalculator.js
ctco-ams/backend/src/kpi/ragEvaluator.js
ctco-ams/backend/src/kpi/slaCalculator.js
ctco-ams/backend/src/models/reportSchema.ts
ctco-ams/backend/src/routes/monthlyReport.js
ctco-ams/backend/src/routes/weeklyReport.js
ctco-ams/backend/tests/.gitkeep
ctco-ams/docker-compose.yml
ctco-ams/frontend/package.json
ctco-ams/frontend/src/App.jsx
ctco-ams/frontend/src/api/reportClient.js
ctco-ams/frontend/src/components/IncidentTable.jsx
ctco-ams/frontend/src/components/MetricCard.jsx
ctco-ams/frontend/src/components/RagBadge.jsx
ctco-ams/frontend/src/components/ResourceOverview.jsx
ctco-ams/frontend/src/pages/MonthlyDashboard.jsx
ctco-ams/frontend/src/pages/WeeklyDashboard.jsx
ctco-ams/frontend/vite.config.js
ctco-ams/shared/types/index.ts
hello-genai/project-jira-automation/README.md
hello-genai/project-jira-automation/dashboard.html
hello-genai/project-jira-automation/data/sample_jira_export.json
hello-genai/project-jira-automation/scripts/generate_report.py
hello-genai/work/module-03-report.md
hello-genai/work/module-08-report.md
hello-genai/work/module-09-report.md
hello-genai/work/module-10-report.md
hello-genai/work/module03-task
hello.txt
instructions/calculate-compound-interest.agent.md
instructions/create-function.agent.md
instructions/create-quiz.agent.md
instructions/create-status-report.agent.md
instructions/creating-instructions.agent.md
instructions/itsm_parser.agent.md
instructions/main.agent.md
instructions/setup-project.agent.md
instructions/validate-instructions.agent.md
instructions/write-tests.agent.md
jira-confluence-automation/backend/.gitignore
jira-confluence-automation/backend/Dockerfile
jira-confluence-automation/backend/migrations/1758175200000_create-teams.js
jira-confluence-automation/backend/migrations/1758175201000_create-issues.js
jira-confluence-automation/backend/migrations/1758175202000_create-publish-targets.js
jira-confluence-automation/backend/migrations/1758175203000_create-status-reports.js
jira-confluence-automation/backend/migrations/1758175204000_create-alerts.js
jira-confluence-automation/backend/migrations/1758175205000_create-action-items.js
jira-confluence-automation/backend/package-lock.json
jira-confluence-automation/backend/package.json
jira-confluence-automation/backend/src/app.js
jira-confluence-automation/backend/src/auth/auth.js
jira-confluence-automation/backend/src/db.js
jira-confluence-automation/backend/src/ingestion/ingest.js
jira-confluence-automation/backend/src/jobs/sync.js
jira-confluence-automation/backend/src/kpi/actionItems.js
jira-confluence-automation/backend/src/kpi/alerts.js
jira-confluence-automation/backend/src/kpi/statusReport.js
jira-confluence-automation/backend/src/mocks/confluence-fixture.js
jira-confluence-automation/backend/src/mocks/jira-fixture.js
jira-confluence-automation/backend/src/publish/confluencePublisher.js
jira-confluence-automation/docker-compose.yml
jira-confluence-automation/frontend/.gitignore
jira-confluence-automation/frontend/.oxlintrc.json
jira-confluence-automation/frontend/Dockerfile
jira-confluence-automation/frontend/README.md
jira-confluence-automation/frontend/index.html
jira-confluence-automation/frontend/package-lock.json
jira-confluence-automation/frontend/package.json
jira-confluence-automation/frontend/public/favicon.svg
jira-confluence-automation/frontend/public/icons.svg
jira-confluence-automation/frontend/src/App.css
jira-confluence-automation/frontend/src/App.jsx
jira-confluence-automation/frontend/src/api/client.js
jira-confluence-automation/frontend/src/assets/hero.png
jira-confluence-automation/frontend/src/assets/react.svg
jira-confluence-automation/frontend/src/assets/vite.svg
jira-confluence-automation/frontend/src/index.css
jira-confluence-automation/frontend/src/main.jsx
jira-confluence-automation/frontend/vite.config.js
project_spec.md
reports/example.md
reports/instructions.md
reports/template.md
requirements.txt
spec/analyze.md
spec/checklist.md
spec/clarify.md
spec/constitution.md
spec/plan.md
spec/specification.md
spec/tasks.md
tools/bulk_validate_docs.py
tools/compound_interest.py
tools/itsm_parser.py
validation-rules.md
work/instructions-srp-validation.md
work/module-08-report.md
work/module-09-report.md
work/module-10-report.md
work/module-12-report.md
work/module-13-report.md
work/module-14-report.md
work/module-15-report.md
work/module-16-report.md
```
