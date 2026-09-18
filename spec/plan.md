# Implementation Plan: Jira/Confluence Automation Platform

**Branch**: `001-jira-confluence-automation`
**Input Spec**: [spec/specification.md](specification.md)
**Constitution**: [spec/constitution.md](constitution.md) v1.0.0
**Open Review**: [spec/clarify.md](clarify.md)
**Status**: Draft — proceeding with documented assumptions (see §1)

---

## 0. Note on Unresolved Clarifications

`spec/clarify.md` recommended resolving several items before `/plan`. The
specification itself has not yet been updated to close them. To keep
planning moving, this plan makes **explicit, documented assumptions** for
the blocking items and calls out lower-risk ones as deferred. Any assumption
below marked ⚠️ **must be confirmed with stakeholders before the
corresponding phase starts** — treat it as a provisional decision, not a
finalized spec change.

### 1. Assumptions Adopted for Planning Purposes

| Clarify.md Item | Assumption Adopted | Risk if Wrong |
|---|---|---|
| §1.1 Read-only vs. stateful dashboard | ⚠️ Dashboard is **interactive**: users can acknowledge alerts and mark free-text action items complete. Requires a mutating API + auth. | Medium — affects API surface & auth scope (Phase 6). |
| §1.2 Alert cadence vs. report cadence | Alerts run on an independent, more frequent schedule (default: every 4 hours) from status reports (default: weekly). Both configurable per project. | Low — additive; can tighten later. |
| §1.3 Confluence publish model | Each `StatusReport` run **updates the same target Confluence page** (native page versioning), one page per `PublishTarget`. | Medium — reduces page sprawl but limits historical diffing to Confluence's own version history. |
| §1.4 Ingestion method | ⚠️ **Polling only** for v1 (webhooks deferred to a later iteration). Constitution's webhook reference will be amended to reflect this. | Low — simpler, slightly higher latency on data freshness. |
| §2.1 Platform auth | ⚠️ Single-tenant, org-wide SSO (OIDC) for dashboard login; Jira/Confluence access uses **one shared service account** per environment (not per-user impersonation) for v1. | High — if per-user Jira permissions must be respected, this needs redesign before Phase 6. |
| §2.2 "Blocked" detection | Use **both** a configurable Jira status name (e.g., `Blocked`) and issue-link type (`is blocked by`) — either triggers an alert. | Low — additive detection, tunable per project config. |
| §2.3 Decision/action-item extraction | v1 requires an **explicit tagging convention** (e.g., a `DECISION:` / `ACTION:` prefix in a comment, or a Jira label) rather than free-text NLP inference. Confluence "meeting notes" are scoped to pages under a configured label/space, not arbitrary content. | Medium — lower recall than NLP but far lower implementation risk; acceptable per Constitution Principle VI (Simplicity). |
| §2.4 Dedup algorithm | v1 dedup key = `(source type, source reference ID)` exact match only; no fuzzy text matching. | Low — may miss cross-source duplicates (Jira comment + Confluence note describing the same decision); accepted as a known v1 limitation. |
| §2.9 Team entity | Add a `Team` entity mapping team → Jira project/board(s) → member list, sourced from a config file in v1 (not synced from an external HR/identity system). | Low |
| §2.10 Multi-tenancy | Single-tenant (one org) for v1. | Medium if multi-tenant SaaS is actually required — would change schema (`org_id`) and auth model. |
| FR-015 Notification channel | v1 supports Confluence-alerts-page only; email/chat integration deferred. | Low |
| FR-016 Scale | Design for up to 10 concurrent Jira projects / ~5,000 open issues total as v1 target; revisit if exceeded. | Low |
| FR-017 Retention | Retain report/alert/action-item history indefinitely in v1 (no automated purge); revisit once a retention policy is confirmed. | Low |

Everything else in `clarify.md` (NFRs, retry/backoff limits, failure
visibility, PII handling) is addressed inline in the phases below.

---

## 2. Constitution Compliance Check

| Principle | Plan Compliance |
|---|---|
| I. Spec-First | This plan traces every phase back to FRs in `specification.md`; new assumptions are logged above, not silently coded. |
| II. Test-First | Each phase's task breakdown (in a future `/tasks` pass) requires failing tests before implementation; CI gate enforces this from Phase 1 onward. |
| III. Contract Stability | An OpenAPI spec is produced in Phase 2 before any frontend consumes the API; versioned under `/api/v1`. |
| IV. Security by Design | Credentials handled via secrets manager/env injection (Phase 1); frontend never calls Jira/Confluence directly (Phase 3+); input validation at ingestion boundary (Phase 3). |
| V. Observability | Structured logging + job failure surfacing built in Phase 7, not bolted on at the end. |
| VI. Simplicity & YAGNI | Extraction (§2.3) and dedup (§2.4) assumptions intentionally choose the simpler mechanism over NLP/fuzzy-matching for v1. |

No violations requiring a constitution amendment at this stage.

---

## 3. Architecture Overview

```
jira-confluence-automation/
├── backend/
│   ├── src/
│   │   ├── auth/              # OIDC session handling, authz middleware
│   │   ├── ingestion/         # Jira/Confluence pollers (issues, comments, pages)
│   │   ├── domain/            # Issue, StatusReport, Alert, ActionItem, Team, PublishTarget
│   │   ├── jobs/              # Scheduled jobs: weekly report, alert scan, tracker sync
│   │   ├── kpi/               # status computation, overdue/blocked detection, dedup
│   │   ├── publish/           # Confluence page writer/versioning
│   │   ├── api/               # Express routes (/api/v1/...), OpenAPI contract
│   │   └── observability/     # structured logging, job-run outcome records
│   ├── migrations/            # DB schema migrations (never manual edits)
│   └── tests/
├── frontend/                  # React 18 + Vite dashboard
│   ├── src/
│   │   ├── pages/              # StatusReportView, AlertsView, ActionItemsView
│   │   ├── components/
│   │   └── api/                 # typed client against /api/v1
│   └── tests/
├── shared/types/               # generated types from OpenAPI contract
├── docker-compose.yml          # frontend + backend + postgres:15
└── spec/                       # constitution, specification, clarify, plan
```

---

## 4. Phases & Milestones

### Phase 0 — Foundations & Decisions *(no code)*
- Confirm ⚠️-marked assumptions in §1 with stakeholders (dashboard
  interactivity, auth model, ingestion method).
- Amend `spec/constitution.md` if the webhook reference is dropped.
- **Milestone M0**: Assumptions signed off; specification updated or
  formally superseded by this plan.

### Phase 1 — Scaffolding & Infrastructure
- Initialize `backend/` (Express) and `frontend/` (React + Vite) projects.
- Stand up `docker-compose.yml` with PostgreSQL 15 for local/CI parity.
- Configure migrations tooling; CI pipeline running lint + tests on every PR.
- Secrets handling for Jira/Confluence credentials and OIDC config (never
  committed; injected via environment).
- **Milestone M1**: `docker compose up` runs an empty but working
  frontend/backend/DB stack; CI green on a no-op commit.

### Phase 2 — Data Model & Auth
- Migrations for `Issue`, `StatusReport`, `Alert`, `ActionItem`,
  `PublishTarget`, `Team`.
- OIDC login flow + session/authz middleware (per §1 assumption); role
  model limited to "viewer" vs. "actor" (can acknowledge/update) for v1.
- Draft OpenAPI contract for `/api/v1` (Constitution Principle III).
- **Milestone M2**: Authenticated user can log into an otherwise-empty
  dashboard; schema exists with passing migration tests.

### Phase 3 — Weekly Status Report (vertical slice)
- Jira polling ingestion for issues (FR-001).
- Status computation: completed / in-progress / overdue rollups (FR-002).
- Confluence publisher: create-or-update target page with new version
  (FR-003, §1.3 assumption).
- Structured logging + failure-does-not-publish guarantee (FR-013).
- **Milestone M3**: Running the weekly job end-to-end produces a real
  Confluence page from real Jira data for at least one pilot project.

### Phase 4 — Overdue & Blocker Alerts
- Independent alert-scan schedule (§1 assumption).
- Blocked detection via status name + issue-link type (§2.2 assumption).
- Alert persistence + de-dupe within the notification period (FR-004, FR-005).
- Confluence alerts-page publishing channel (FR-015 v1 scope).
- **Milestone M4**: Overdue/blocked issues in the pilot project generate
  alerts on the configured cadence without duplicate re-notification.

### Phase 5 — Decision & Action-Item Tracker
- Tagging-convention parser for Jira comments/labels and scoped Confluence
  "meeting notes" pages (§2.3 assumption).
- Dedup by `(source type, source reference ID)` (§2.4 assumption).
- Action-item status update path (mutating API, tied to §1.1 assumption).
- **Milestone M5**: Tagged decisions/action items appear in the tracker,
  survive re-runs without duplication, and can be marked complete.

### Phase 6 — Dashboard
- Project + date-range selector; views for status report, active alerts,
  open action items (FR-008).
- Alert acknowledgement and action-item completion UI (per §1.1 assumption).
- Frontend consumes only the versioned `/api/v1` contract.
- **Milestone M6**: A pilot user can do their entire weekly review from the
  dashboard without opening Jira or Confluence.

### Phase 7 — Observability & Hardening
- Bounded retry/backoff for Jira/Confluence API calls (fixes clarify.md
  §2.7 gap) with a defined max-attempts + terminal-failure alert.
- Job-failure visibility surfaced in the dashboard (fixes §2.6 gap).
- Rate-limit and outage edge cases from `specification.md` covered by
  integration tests.
- **Milestone M7**: Chaos-test (simulated Jira outage/rate-limit) shows no
  partial/corrupted publishes and a visible failure signal.

### Phase 8 — Documentation & Rollout
- Runbook for on-call (job failure triage), setup guide for adding a new
  Jira project/Confluence target.
- Rollout to remaining pilot projects beyond the Phase 3–5 pilot.
- **Milestone M8**: General availability for all onboarded projects.

---

## 5. Out of Scope for v1 (explicitly deferred)

- Per-user Jira/Confluence permission impersonation (§2.1).
- Multi-tenant support (§2.10).
- Email/chat notification channels (FR-015).
- NLP-based decision/action-item extraction (§2.3) — tagging convention
  only.
- Fuzzy cross-source deduplication (§2.4).
- Webhook-based ingestion (§1.4).
- Automated data retention/purge policy (FR-017).

## 6. Progress Tracking

- [ ] Phase 0 — assumptions confirmed
- [ ] Phase 1 — scaffolding & CI
- [ ] Phase 2 — data model & auth
- [ ] Phase 3 — weekly status report
- [ ] Phase 4 — overdue/blocker alerts
- [ ] Phase 5 — decision/action tracker
- [ ] Phase 6 — dashboard
- [ ] Phase 7 — observability & hardening
- [ ] Phase 8 — documentation & rollout
