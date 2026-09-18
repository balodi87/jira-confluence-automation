# Requirements Checklist: Spec vs. Implementation

**Compared**: `spec/specification.md` against the current codebase
(`jira-confluence-automation/`).
**Current implementation state**: A React (Vite) frontend showing
hardcoded placeholder data, an Express backend with a health-check
endpoint, and a PostgreSQL 15 database with the full v1 schema (6 tables)
migrated and verified. All three run together via `docker compose up`. No
Jira/Confluence integration, no auth, no scheduled jobs, and no automated
tests exist yet.

**Legend**: ✅ Implemented & verified working · 🟡 Partially implemented ·
❌ Not implemented

---

## Functional Requirements

| Req | Requirement (summary) | Implemented? | Works? | Evidence / Notes |
|---|---|:---:|:---:|---|
| FR-001 | Retrieve Jira issues by project/board/filter | ❌ | — | No backend exists; no Jira API client anywhere in the repo. |
| FR-002 | Generate Weekly Status Report (completed/in-progress/overdue) | ❌ | — | No status-computation logic exists. |
| FR-003 | Publish reports to Confluence (versioned, not overwritten) | ❌ | — | No Confluence API integration exists. |
| FR-004 | Detect overdue/blocked issues, generate alerts | ❌ | — | No detection logic exists. |
| FR-005 | Notify assignee/team, dedupe within notification period | ❌ | — | No notification mechanism exists. |
| FR-006 | Extract decisions/action items (tagging convention per Resolved Decisions) | ❌ | — | No parser exists. |
| FR-007 | Track action-item completion status over time | ❌ | — | No `ActionItem` entity or update path exists. |
| FR-008 | Web dashboard: select project/date range, view report/alerts/action items | 🟡 | 🟡 | A React page renders at `http://localhost:5173/` with a hardcoded 2-row table (`Platform Core`, `Mobile App`). Verified rendering correctly in-browser (screenshot confirmed). **Does not** support project/date-range selection, and shows no alerts or action-item views — those are separate placeholder pieces of FR-008 that are missing entirely. |
| FR-009 | Persist issues/alerts/action items in PostgreSQL | 🟡 | 🟡 | Full schema now exists and is verified: `teams`, `issues`, `publish_targets`, `status_reports`, `alerts`, `action_items` (T020–T025 migrations applied, rollback/re-apply tested cleanly). Still 🟡 because no application code writes/reads through these tables yet — the schema exists but nothing populates it (that's Phase 3+ ingestion work). |
| FR-010 | Secure credential storage for Jira/Confluence auth | ❌ | — | No secrets handling, no credential storage exists (T015 not started). |
| FR-011 | Scheduled + on-demand job execution | ❌ | — | No job scheduler/queue infrastructure exists at all (flagged as a missing artifact in `spec/analyze.md` §3.1/§4). |
| FR-012 | Structured logging for every automation run | ❌ | — | No backend exists to log from. |
| FR-013 | Handle Jira/Confluence API errors without partial/corrupted publish | ❌ | — | No ingestion/publish logic exists yet to fail safely. |
| FR-014 | Deduplicate decision/action items by source reference | ❌ | — | No extraction pipeline exists. |
| FR-015 *(resolved)* | Notify via Confluence alerts page only (v1) | ❌ | — | Decision recorded in spec; not yet built. |
| FR-016 *(resolved)* | Support ≥10 projects / ~5,000 issues (v1 scale target) | ❌ (untestable) | — | Design target only; nothing exists yet to load-test against it. |
| FR-017 *(resolved)* | Retain history indefinitely for v1 | ❌ (untestable) | — | No data model exists yet to apply retention to. |

---

## User Scenarios (Acceptance Criteria)

| # | Scenario | Implemented? | Works? | Notes |
|---|---|:---:|:---:|---|
| 1 | Weekly report generated & published to Confluence | ❌ | — | No ingestion, computation, or publish logic exists. |
| 2 | Overdue/blocked issue flagged and notified | ❌ | — | No detection logic exists. |
| 3 | Decision/action item extracted with owner/due date/status | ❌ | — | No parser exists. |
| 4 | Dashboard shows status/alerts/action items for selected project+range | 🟡 | 🟡 | Only a static, non-interactive placeholder table renders; no selector, no alerts, no action items. |
| 5 | Job fails gracefully on invalid/unreachable Jira/Confluence | ❌ | — | No job exists to fail. |

---

## Key Entities (Data Model)

| Entity | Schema exists? | Notes |
|---|:---:|---|
| Issue | ✅ | `issues` table migrated and verified (T020). |
| StatusReport | ✅ | `status_reports` table migrated and verified (T021). |
| Alert | ✅ | `alerts` table migrated and verified (T022). |
| ActionItem | ✅ | `action_items` table migrated and verified (T023); sequenced after `teams` to fix the FK-ordering bug noted in `spec/analyze.md` §3.2. |
| PublishTarget | ✅ | `publish_targets` table migrated and verified (T024). |
| Team | ✅ | `teams` table migrated and verified (T025); project/member mapping stored as array columns rather than a join table (simplicity per Constitution Principle VI); config-file loader for seeding is still open. |

Note: schema existing does not mean FR-009 is fully satisfied — no
application code reads/writes these tables yet (see FR-009 above).

---

## Non-Functional / Cross-Cutting (from Constitution)

| Principle | Status | Notes |
|---|:---:|---|
| I. Spec-First | ✅ (process) | All work traced through `/specify` → `/clarify` → `/plan` → `/tasks` → `/analyze` documents. |
| II. Test-First | ❌ | No tests exist anywhere in the codebase yet (no backend to test; frontend has no test files either). |
| III. Contract Stability (OpenAPI) | ❌ | No API exists, so no contract has been drafted (T028 not started). |
| IV. Security by Design | ❌ | No credential handling, no input validation boundary exists yet. |
| V. Observability | ❌ | No logging framework, no structured logs anywhere. |
| VI. Simplicity & YAGNI | ✅ | Current minimal scaffold (static frontend + bare DB) is appropriately simple for where the project actually is. |

---

## Summary

| Category | ✅ Done | 🟡 Partial | ❌ Not Started |
|---|:---:|:---:|:---:|
| Functional Requirements (17) | 0 | 2 (FR-008, FR-009) | 15 |
| User Scenarios (5) | 0 | 1 | 4 |
| Key Entities (6) | 6 (schema only) | 0 | 0 |
| Constitution Principles (6) | 2 (process-only) | 0 | 4 |

**Overall**: The project has completed Phase 1 (T010–T013) and the
migration portion of Phase 2 (T020–T025) per `spec/tasks.md`. Concretely
done so far:
- `T010` (backend scaffold) — done, verified: `GET /api/v1/health` returns
  `{"status":"ok"}`.
- `T011` (frontend scaffold) — done, verified rendering in-browser.
- `T012` (Docker Compose stack) — done: `docker compose up` brings up
  `postgres`, `backend`, and `frontend` together; backend confirmed
  connecting to Postgres.
- `T013` (migrations tooling) — done: `node-pg-migrate` wired up;
  up/down/re-up cycle verified with no orphaned objects.
- `T020–T025` (data model migrations) — schema done and verified; the
  FK-ordering bug from `spec/analyze.md` §3.2 was fixed by migrating
  `teams` first.

Still not done: OpenAPI contract + OIDC auth (T026–T028), all of Phase
3–8 (Jira/Confluence ingestion, alerts, tracker, dashboard wiring,
observability, rollout), CI (T014), secrets handling (T015), and all unit
tests (deferred alongside T014). No functional requirement is fully
implemented end-to-end yet — FR-008 and FR-009 remain 🟡 because their
infrastructure exists but the actual requirement behavior (live data,
real persistence through application code) does not yet.
