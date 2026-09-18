# Tasks: Jira/Confluence Automation Platform

**Input**: [spec/plan.md](plan.md), [spec/specification.md](specification.md)
**Constitution**: [spec/constitution.md](constitution.md) v1.0.0

Each task lists an ID, the phase/milestone it belongs to, its source
requirement(s), and acceptance criteria. Per Constitution Principle II
(Test-First), every task that produces code MUST have its tests written
and failing before implementation, unless marked `[no-code]`.

---

## Phase 0 — Foundations & Decisions (Milestone M0)

### T001 — Confirm ⚠️ assumptions with stakeholders `[no-code]` ✅ DONE
- **Source**: `plan.md` §1 (all ⚠️-marked rows)
- **Acceptance Criteria**:
  - [x] Dashboard interactivity model (read-only vs. actionable) confirmed
        in writing — interactive, actor/viewer roles (see
        `specification.md` → Resolved Decisions).
  - [x] Auth model (shared service account vs. per-user impersonation)
        confirmed — OIDC SSO for dashboard, shared service account for
        Jira/Confluence access.
  - [x] Ingestion method (polling-only for v1) confirmed.
  - [x] Decisions recorded back into `spec/specification.md` (FR-015–017
        resolved; new "Resolved Decisions" section added; checklist and
        execution status updated).

### T002 — Amend constitution if scope changed `[no-code]`
- **Source**: `plan.md` §1.4 (webhook reference)
- **Acceptance Criteria**:
  - [ ] `spec/constitution.md` Security principle either drops the webhook
        reference or a corresponding webhook FR is added to the spec.
  - [ ] Constitution version bumped per its own Governance section if
        content changes.

---

## Phase 1 — Scaffolding & Infrastructure (Milestone M1)

### T010 — Initialize backend project
- **Acceptance Criteria**:
  - [ ] `backend/` has a working Express app skeleton (`npm start` boots a
        server that responds to a health-check route).
  - [ ] Linting (ESLint) and formatting configured and passing in CI.

### T011 — Initialize frontend project
- **Acceptance Criteria**:
  - [ ] `frontend/` has a working React 18 + Vite skeleton (`npm run dev`
        serves a blank app).
  - [ ] Linting configured and passing in CI.

### T012 — Docker Compose stack
- **Source**: Constitution — Technology Stack, Development Workflow #4
- **Acceptance Criteria**:
  - [ ] `docker-compose.yml` brings up `frontend`, `backend`, and
        `postgres:15` with a single `docker compose up`.
  - [ ] Backend successfully connects to Postgres on container start.

### T013 — Migrations tooling
- **Source**: Constitution — Development Workflow #2
- **Acceptance Criteria**:
  - [ ] A migration runner (e.g., `node-pg-migrate` or equivalent) is
        wired up with `up`/`down` commands.
  - [ ] Running migrations against a fresh DB and rolling back leaves no
        orphaned objects.

### T014 — CI pipeline
- **Source**: Constitution Principle II
- **Acceptance Criteria**:
  - [ ] CI runs lint + unit tests for both `backend/` and `frontend/` on
        every PR.
  - [ ] A PR with a failing test cannot merge (branch protection or
        equivalent CI gate).

### T015 — Secrets handling for Jira/Confluence + OIDC
- **Source**: Constitution Principle IV
- **Acceptance Criteria**:
  - [ ] Credentials are read only from environment variables / a secrets
        manager, never hard-coded.
  - [ ] A test confirms the app fails to start (with a clear error) if
        required secrets are missing, rather than starting insecurely.

**Milestone M1 Gate**: `docker compose up` yields a working empty stack;
CI green on a no-op commit.

---

## Phase 2 — Data Model & Auth (Milestone M2)

### T020 — `Issue` migration + model
- **Source**: FR-001, Key Entities → Issue
- **Acceptance Criteria**:
  - [ ] Migration creates `issues` table (key, summary, status, priority,
        assignee, sprint/release, due_date, completed_date, project/board
        ref).
  - [ ] Model-level unit test inserts/reads a row round-trip correctly.

### T021 — `StatusReport` migration + model
- **Source**: FR-002/FR-003, Key Entities → StatusReport
- **Acceptance Criteria**:
  - [ ] Migration creates `status_reports` table (period, source
        project/board/filter, issue lists or references, blockers, risks,
        published Confluence page reference).
  - [ ] Unit test round-trips a report record.

### T022 — `Alert` migration + model
- **Source**: FR-004/FR-005, Key Entities → Alert
- **Acceptance Criteria**:
  - [ ] Migration creates `alerts` table (issue ref, reason, raised_at,
        notified recipients, acknowledgement_status).
  - [ ] Unit test round-trips an alert record.

### T023 — `ActionItem` migration + model
- **Source**: FR-006/FR-007, Key Entities → ActionItem
- **Acceptance Criteria**:
  - [ ] Migration creates `action_items` table (description, owner,
        due_date, status, source_type, source_reference, team/project ref).
  - [ ] Unit test round-trips an action item record.

### T024 — `PublishTarget` migration + model
- **Source**: FR-003, Key Entities → PublishTarget
- **Acceptance Criteria**:
  - [ ] Migration creates `publish_targets` table (Confluence space, page
        ID/template, report type(s) received).
  - [ ] Unit test round-trips a publish target record.

### T025 — `Team` migration + model
- **Source**: `plan.md` §1 (Team entity assumption)
- **Acceptance Criteria**:
  - [ ] Migration creates `teams` table plus a mapping table to Jira
        project/board(s) and member list, seedable from a config file.
  - [ ] Unit test confirms a team resolves to its mapped project(s).

### T026 — OIDC login flow
- **Source**: `plan.md` §1 (Auth assumption)
- **Acceptance Criteria**:
  - [ ] Unauthenticated requests to any `/api/v1` route (except health
        check) return `401`.
  - [ ] A valid OIDC login results in a session/token that authorizes
        subsequent API calls.
  - [ ] Integration test covers both the happy path and an invalid/expired
        session.

### T027 — Role model (viewer vs. actor)
- **Source**: `plan.md` §1 (Auth assumption), resolves clarify.md §1.1
- **Acceptance Criteria**:
  - [ ] "Viewer" role can read reports/alerts/action items but cannot
        acknowledge or update them (`403` on mutating routes).
  - [ ] "Actor" role can acknowledge alerts and update action-item status.

### T028 — OpenAPI contract draft
- **Source**: Constitution Principle III
- **Acceptance Criteria**:
  - [ ] `/api/v1` routes for all Phase 2 entities are documented in an
        OpenAPI spec file checked into the repo.
  - [ ] Contract reviewed before any frontend code consumes it (Principle
        III gate).

**Milestone M2 Gate**: Authenticated user reaches an empty dashboard;
schema + migration tests pass in CI.

---

## Phase 3 — Weekly Status Report (Milestone M3)

### T030 — Jira issue polling ingestion
- **Source**: FR-001
- **Acceptance Criteria**:
  - [ ] Given a configured project/board/filter, polling retrieves issues
        with status, priority, assignee, due date, completed date, and
        sprint/release fields, and upserts them into `issues`.
  - [ ] Malformed/missing fields from Jira do not crash the job (validated
        at the ingestion boundary per Constitution Principle IV).
  - [ ] Integration test uses a mocked Jira API fixture.

### T031 — Status computation (completed/in-progress/overdue)
- **Source**: FR-002, Edge Case (no due date excluded from overdue)
- **Acceptance Criteria**:
  - [ ] Given a set of issues, the computed rollup correctly buckets
        completed/in-progress/overdue counts for a configurable window.
  - [ ] Issues without a due date are excluded from the overdue bucket but
        included in general totals (unit test covers this explicitly).
  - [ ] An issue moved between projects mid-sprint is not double-counted
        (unit test covers this edge case).

### T032 — Confluence publish (create-or-update with versioning)
- **Source**: FR-003, `plan.md` §1.3 assumption
- **Acceptance Criteria**:
  - [ ] Publishing to an existing `PublishTarget` page creates a new
        Confluence page version rather than overwriting/deleting history.
  - [ ] If the target page no longer exists, the job fails clearly (per
        Edge Case) rather than silently no-op'ing.
  - [ ] Integration test uses a mocked Confluence API fixture.

### T033 — Zero-activity report handling
- **Source**: Edge Case (empty-state report)
- **Acceptance Criteria**:
  - [ ] Running the weekly job for a period with zero issues produces a
        valid empty-state report, not an error or skipped run.

### T034 — Failure isolation (no partial publish)
- **Source**: FR-013
- **Acceptance Criteria**:
  - [ ] If ingestion or computation fails partway, no partial/corrupted
        report is published to Confluence.
  - [ ] A structured log entry records the failure with enough context to
        diagnose it (per FR-012), without leaking secrets.

**Milestone M3 Gate**: End-to-end weekly job run produces a real Confluence
page from real Jira data for at least one pilot project.

---

## Phase 4 — Overdue & Blocker Alerts (Milestone M4)

### T040 — Independent alert-scan scheduler
- **Source**: FR-011, `plan.md` §1 (cadence assumption)
- **Acceptance Criteria**:
  - [ ] Alert scans run on their own configurable schedule, independent of
        the weekly report schedule.
  - [ ] Schedule is configurable per project.

### T041 — Overdue detection
- **Source**: FR-004
- **Acceptance Criteria**:
  - [ ] An issue past its due date and not in a completed status generates
        exactly one open alert.
  - [ ] An issue without a due date never generates an overdue alert.

### T042 — Blocked detection
- **Source**: FR-004, `plan.md` §1 (blocked-detection assumption)
- **Acceptance Criteria**:
  - [ ] An issue with a configured "blocked" status name OR an "is blocked
        by" issue link generates an alert.
  - [ ] Both detection paths are independently unit-tested.

### T043 — Alert de-duplication within notification period
- **Source**: FR-005
- **Acceptance Criteria**:
  - [ ] The same underlying issue condition does not generate more than one
        notification within the configured notification period.
  - [ ] Once the period elapses and the condition still holds, a new
        notification is generated.

### T044 — Confluence alert-page publishing
- **Source**: FR-015 (v1 scope: Confluence-only)
- **Acceptance Criteria**:
  - [ ] Open alerts are published/updated on a configured Confluence alerts
        page.

**Milestone M4 Gate**: Overdue/blocked issues in the pilot project generate
alerts on schedule without duplicate re-notification.

---

## Phase 5 — Decision & Action-Item Tracker (Milestone M5)

### T050 — Tagging-convention parser (Jira comments/labels)
- **Source**: FR-006, `plan.md` §1 (extraction assumption)
- **Acceptance Criteria**:
  - [ ] A Jira comment/label matching the configured tag convention (e.g.
        `DECISION:` / `ACTION:`) is extracted into an `ActionItem` with
        owner, due date, status, and source reference.
  - [ ] Untagged comments are ignored (no false-positive extraction).

### T051 — Scoped Confluence "meeting notes" parser
- **Source**: FR-006, `plan.md` §1 (extraction assumption)
- **Acceptance Criteria**:
  - [ ] Only Confluence pages under the configured space/label are scanned
        for tagged decisions/action items.
  - [ ] Pages outside that scope are never scanned.

### T052 — Deduplication by source reference
- **Source**: FR-014, `plan.md` §1 (dedup assumption)
- **Acceptance Criteria**:
  - [ ] Re-running extraction over the same source does not create
        duplicate `ActionItem` rows (matched on source type + source
        reference ID).
  - [ ] Two different sources describing the same decision are treated as
        distinct items in v1 (documented known limitation).

### T053 — Action-item status update path
- **Source**: FR-007, `plan.md` §1.1 assumption
- **Acceptance Criteria**:
  - [ ] An "actor" role user can mark an `ActionItem` complete via the API.
  - [ ] Subsequent report runs reflect the updated status without
        reverting it based on stale source data.

**Milestone M5 Gate**: Tagged decisions/action items appear in the tracker,
survive re-runs without duplication, and can be marked complete.

---

## Phase 6 — Dashboard (Milestone M6)

### T060 — Project/date-range selector
- **Source**: FR-008
- **Acceptance Criteria**:
  - [ ] User can select a project and date range and the view updates to
        reflect that scope.

### T061 — Status report view
- **Source**: FR-008
- **Acceptance Criteria**:
  - [ ] View renders the current status report (completed/in-
        progress/overdue, blockers, risks) from `/api/v1`.

### T062 — Alerts view + acknowledgement UI
- **Source**: FR-008, `plan.md` §1.1 assumption
- **Acceptance Criteria**:
  - [ ] View lists active alerts; an "actor" user can acknowledge one, and
        it disappears from the active list.

### T063 — Action items view + completion UI
- **Source**: FR-008, T053
- **Acceptance Criteria**:
  - [ ] View lists open action items; an "actor" user can mark one
        complete, and it moves out of the open list.

### T064 — Frontend consumes only the versioned API contract
- **Source**: Constitution Principle III
- **Acceptance Criteria**:
  - [ ] No frontend code calls Jira/Confluence directly; all data comes
        from `/api/v1`.

**Milestone M6 Gate**: A pilot user completes their entire weekly review
from the dashboard without opening Jira or Confluence.

---

## Phase 7 — Observability & Hardening (Milestone M7)

### T070 — Bounded retry/backoff for external API calls
- **Source**: Edge Case (rate limits), resolves clarify.md §2.7
- **Acceptance Criteria**:
  - [ ] Retries use exponential backoff with a defined max-attempt count.
  - [ ] After exhausting retries, the job fails cleanly and logs a
        terminal-failure event (does not retry forever).

### T071 — Job-failure visibility in dashboard
- **Source**: resolves clarify.md §2.6
- **Acceptance Criteria**:
  - [ ] A failed scheduled job surfaces a visible indicator in the
        dashboard (not just in logs).

### T072 — Structured logging coverage
- **Source**: FR-012
- **Acceptance Criteria**:
  - [ ] Every automation run (report, alert scan, tracker sync) emits a
        structured log with outcome, item counts, and duration.
  - [ ] No secrets or full external payloads appear in logs (spot-checked
        in test).

### T073 — Chaos/integration test: simulated Jira outage
- **Source**: FR-013, Edge Cases
- **Acceptance Criteria**:
  - [ ] Simulated Jira/Confluence outage or rate-limit during a job run
        results in no partial/corrupted publish and a visible failure
        signal (per T071).

**Milestone M7 Gate**: Chaos test passes; no partial publishes, failure is
visible.

---

## Phase 8 — Documentation & Rollout (Milestone M8)

### T080 — On-call runbook `[no-code]`
- **Acceptance Criteria**:
  - [ ] Documented triage steps for job failures, credential rotation, and
        Confluence page reconfiguration.

### T081 — Project onboarding guide `[no-code]`
- **Acceptance Criteria**:
  - [ ] Documented steps to add a new Jira project/Confluence target
        without code changes (config-driven).

### T082 — Rollout beyond pilot `[no-code]`
- **Acceptance Criteria**:
  - [ ] All onboarded projects are running weekly reports, alerts, and
        tracker sync in production with no open P1 defects.

**Milestone M8 Gate**: General availability for all onboarded projects.

---

## Summary

| Phase | Task Count | Milestone Gate |
|---|---|---|
| 0 | 2 | Assumptions confirmed |
| 1 | 6 | Empty stack running, CI green |
| 2 | 9 | Auth + schema in place |
| 3 | 5 | Weekly report MVP live |
| 4 | 5 | Alerts live |
| 5 | 4 | Tracker live |
| 6 | 5 | Dashboard GA-ready |
| 7 | 4 | Hardened & observable |
| 8 | 3 | Rolled out |
