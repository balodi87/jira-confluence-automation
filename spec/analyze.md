# Task & Cross-Artifact Analysis

**Analyzed**: `spec/specification.md`, `spec/constitution.md`, `spec/plan.md`,
`spec/tasks.md`, `spec/clarify.md`
**Verdict**: Task breakdown is directionally solid, but several dependency
orderings are wrong, three data-ingestion capabilities are silently assumed
without a task to build them, and Phase 7 (Observability/Hardening) is
scheduled too late relative to what earlier milestones claim to deliver.

---

## 1. Per-Task Complexity, Risk & Dependencies

### Phase 0 — Foundations

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T001 Confirm assumptions | Low (no-code) | **High** — every downstream phase inherits whichever assumption is confirmed; wrong call on auth model (shared vs. per-user) forces rework of T015/T026/T027. | — |
| T002 Amend constitution | Low | Low | T001 |

### Phase 1 — Scaffolding & Infrastructure

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T010 Init backend | Low | Low | — |
| T011 Init frontend | Low | Low | — |
| T012 Docker Compose stack | Medium | Service startup ordering (DB readiness) | T010, T011 |
| T013 Migrations tooling | Medium | Low | T010, T012 |
| T014 CI pipeline | Medium | Low | T010, T011 |
| T015 Secrets handling (Jira/Confluence + OIDC) | Medium | **Medium** — built before the auth model (T001) and OIDC flow (T026) exist; may need rework if assumption changes. | T010, T001 |

**Missing**: no task establishes a job-scheduling mechanism (cron/queue),
yet T030, T040, and the Phase 5 sync jobs all implicitly need one. See §3.1.

### Phase 2 — Data Model & Auth

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T020 Issue model | Medium | Low | T013 |
| T021 StatusReport model | Medium | Depends on unresolved §1.3 (single evolving page vs. per-run page) affecting what "published page reference" means | T013, T020 |
| T022 Alert model | Medium | Low | T013, T020 |
| T023 ActionItem model | Medium | **Ordering risk**: references a team/project relationship but is scheduled *before* T025 (Team) — see §3.2 | T013 |
| T024 PublishTarget model | Medium | Low | T013 |
| T025 Team model | Medium | Config-file format for seeding is undefined — see §3.6 | T013 |
| T026 OIDC login flow | **High** | Security-critical; directly exposed to the T001 auth-model risk (shared service account vs. per-user impersonation is a materially different implementation) | T015, T001 |
| T027 Role model | Medium | Low | T026 |
| T028 OpenAPI contract draft | Medium | **Scoped only to Phase 2 entities** — no follow-up task extends it for Phase 5/6 mutating routes (alert ack, action-item completion) — see §3.5 | T020–T027 |

### Phase 3 — Weekly Status Report

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T030 Jira issue polling | **High** | External API integration, pagination, schema drift; **acceptance criteria omit comments and issue-links**, which T042 and T050 later depend on — see §3.1 | T020, T015 |
| T031 Status computation | Medium | Timezone/week-boundary handling is undefined (carried over from clarify.md §2.5, still unresolved) — see §3.7 | T030 |
| T032 Confluence publish | **High** | Directly implements the still-provisional §1.3 assumption; also the first place external-write reliability matters, but retry/backoff isn't built until Phase 7 — see §3.4 | T021, T024 |
| T033 Zero-activity handling | Low | Low | T031 |
| T034 Failure isolation (no partial publish) | Medium | Overlaps with/anticipates T070 (Phase 7); doing this safely without bounded retry logic yet in place is only partially achievable — see §3.4 | T030, T032 |

### Phase 4 — Overdue & Blocker Alerts

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T040 Alert-scan scheduler | Medium | Depends on scheduling infra that no task builds — see §3.1 | T012 |
| T041 Overdue detection | Medium | Low | T020, T040 |
| T042 Blocked detection | Medium | **Blocked on missing data**: needs Jira issue-link data that T030 never ingests — see §3.1 | T020, T040 |
| T043 Alert de-dup | Medium | Low | T022, T041, T042 |
| T044 Confluence alert-page publish | Medium-High | Reuses T032's provisional publish logic and its risks | T032, T024 |

### Phase 5 — Decision & Action-Item Tracker

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T050 Jira comment tag parser | **High** | **Blocked on missing data**: T030 doesn't ingest comments at all — see §3.1 | T023, (missing) comment ingestion |
| T051 Confluence meeting-notes parser | **High** | **Blocked on missing capability**: no task reads/ingests Confluence page content anywhere (only publish/write exists, T032/T044) — contradicts `plan.md`'s architecture diagram, which lists Confluence under `ingestion/` — see §3.3 | T023, (missing) Confluence read ingestion |
| T052 Dedup by source reference | Medium | Low | T050, T051 |
| T053 Action-item status update | Medium | Needs a mutating API route not covered by T028's Phase-2-only contract scope — see §3.5 | T023, T027 |

### Phase 6 — Dashboard

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T060 Project/date-range selector | Low-Medium | Low | T028, T031 |
| T061 Status report view | Medium | Low | T032, T028 |
| T062 Alerts view + ack UI | Medium | **Assumes a backend alert-acknowledgement endpoint that no task builds** — see §3.5 | T043, (missing) alert-ack API |
| T063 Action items view + completion UI | Medium | Low | T053 |
| T064 Frontend-only-via-API constraint | Low | Low | T060–T063 |

### Phase 7 — Observability & Hardening

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T070 Bounded retry/backoff | Medium-High | **Retrofit risk**: applied after T030/T032/T040/T044 already exist and ship in earlier milestones — see §3.4 | T030, T032 |
| T071 Job-failure visibility | Medium | Depends on dashboard (T060–064) already existing | T034, T060–064 |
| T072 Structured logging coverage | Medium | Same retrofit risk as T070 | T030–T053 (all jobs) |
| T073 Chaos/integration test | **High** | Validates T070–T072 together; first real test of failure handling across the whole pipeline | T070, T071, T072 |

### Phase 8 — Documentation & Rollout

| Task | Complexity | Key Risk | Depends On |
|---|---|---|---|
| T080 Runbook | Low (no-code) | Low | Phase 7 complete |
| T081 Onboarding guide | Low (no-code) | Low | Phase 5/6 complete |
| T082 Rollout beyond pilot | Medium | No security review/pen-test gate before rollout despite handling credentials + multi-user auth — see §3.8 | All prior phases |

---

## 2. Complexity Distribution

| Complexity | Count | Tasks |
|---|---|---|
| High | 7 | T026, T030, T032, T050, T051, T070, T073 |
| Medium-High | 2 | T044, T072 (borderline) |
| Medium | ~24 | (majority of Phase 2–6 tasks) |
| Low | ~10 | scaffolding, docs, simple views |

Five of the seven **High**-complexity tasks (T030, T032, T050, T051, T070)
cluster around **external system integration and reliability** — this is
where schedule risk is concentrated, not in the dashboard or data model
work.

---

## 3. Cross-Artifact Gaps & Contradictions

### 3.1 Missing ingestion capabilities (tasks.md gap)
`T030`'s acceptance criteria only cover issue fields (status, priority,
assignee, due date, completed date, sprint/release). But:
- `T042` (blocked detection) requires issue-**link** data.
- `T050` (comment tag parsing) requires Jira **comments**.

Neither is ingested by any task. These need to be added (e.g., "T030a —
Ingest issue links" and "T030b — Ingest issue comments") before Phase 4/5
can actually be implemented as scoped.

### 3.2 Migration ordering (tasks.md internal contradiction)
`T023` (ActionItem) is sequenced before `T025` (Team), but ActionItem's
acceptance criteria include a "team/project ref." If this is a foreign key,
the migration order is backwards. Reorder so `T025` precedes `T023`, or
make the reference nullable/deferred and note that explicitly.

### 3.3 Confluence read-ingestion never built (plan.md vs. tasks.md contradiction)
`plan.md`'s architecture diagram places "Jira/Confluence pollers (issues,
**comments, pages**)" under `backend/src/ingestion/`, explicitly promising
Confluence page reading. `tasks.md` only ever *writes* to Confluence (T032,
T044) — no task reads Confluence content for `T051`'s meeting-notes scan.
This is a direct contradiction between what the plan's architecture
promises and what the task list actually builds.

### 3.4 Observability/reliability sequencing contradicts its own stated intent
`plan.md`'s Constitution Compliance Check claims Principle V is "built in
Phase 7, **not bolted on at the end**" — but Phase 7 is the second-to-last
phase, i.e., literally bolted on near the end, contradicting the principle
it claims to satisfy (Constitution: "Failures... must be observable...
never silently swallowed," stated as a Day-1 requirement, not a
later-phase one). Concretely:
- `T034` (Phase 3, "no partial publish") ships before `T070` (Phase 7,
  bounded retry/backoff) exists, so the M3 milestone's "end-to-end" claim
  runs without any real resilience to transient Jira/Confluence failures.
- `T072` (structured logging) is deferred to Phase 7 even though `T012`
  (Phase 1) never gives jobs a logging foundation to retrofit onto later.

**Recommendation**: Pull a minimal logging + bounded-retry foundation into
Phase 1 (infrastructure), and treat T070–T072 as *hardening the coverage*
across all jobs in Phase 7, not introducing the capability for the first
time.

### 3.5 API contract scope gap (tasks.md gap, violates Constitution Principle III)
`T028`'s acceptance criteria explicitly scope the OpenAPI contract to
"Phase 2 entities." But:
- `T053` (action-item completion) needs a mutating route.
- `T062` (alert acknowledgement UI) needs a mutating route that **no
  backend task builds at all** — not even mentioned outside the frontend
  task.

Constitution Principle III requires the contract to exist *before* the
frontend consumes it. As written, `tasks.md` would have the frontend
(T062) built against an endpoint that was never scoped or built on the
backend. Add an explicit backend task (e.g., "T054 — Alert acknowledgement
endpoint + contract extension") before T062.

### 3.6 Team config format undefined (tasks.md gap)
`plan.md`'s assumption states Team → project/board mapping is "sourced from
a config file in v1," but no task defines that file's schema, validation,
or loading mechanism. `T025`'s acceptance criteria test the *resulting*
mapping but not how it's authored/validated.

### 3.7 Timezone/week-boundary handling still unresolved (carried gap)
`clarify.md` §2.5 flagged missing timezone/locale handling for "weekly"
windows and due dates. `plan.md` never added it to its assumptions table,
and `tasks.md`'s `T031` (status computation) acceptance criteria don't
mention it either. This gap has now passed through three documents
unresolved — it should be explicitly assumed (e.g., "all dates evaluated in
UTC, week = Mon–Sun") or explicitly tasked.

### 3.8 No security review before rollout (missing artifact)
Given the platform stores Jira/Confluence credentials, runs OIDC auth, and
persists potentially sensitive issue/PII data (clarify.md §2.8, also still
unresolved re: encryption-at-rest/access control), `tasks.md` has no
security review, dependency-audit, or pen-test task anywhere before `T082`
(rollout). Recommend adding one to Phase 7 or as a Phase 8 gate.

### 3.9 Minor: test rigor consistency
Constitution Principle II requires integration tests specifically for
"Jira/Confluence API interactions and database access paths." `T030` and
`T032` call this out explicitly; `T040`–`T044` and `T050`–`T051` (also
Jira/Confluence-facing) do not explicitly require integration tests in
their acceptance criteria, only implied. Tighten wording for consistency.

---

## 4. Missing Artifacts Checklist

- [ ] Job-scheduling/queue infrastructure task (Phase 1)
- [ ] Jira issue-link ingestion task (blocks T042)
- [ ] Jira comment ingestion task (blocks T050)
- [ ] Confluence page-content read/ingestion task (blocks T051)
- [ ] Alert-acknowledgement backend endpoint + contract extension (blocks T062)
- [ ] Action-item/alert API contract extension beyond Phase 2 scope (blocks T053, T062, T063)
- [ ] Team config-file schema/loader definition (supports T025)
- [ ] Explicit timezone/week-boundary assumption or task (affects T031)
- [ ] Minimal logging/error-handling foundation in Phase 1 (reduces Phase 7 retrofit risk)
- [ ] Security review / credential & PII audit task before rollout (Phase 7/8)

## 5. Recommendation

Do not start implementation from `tasks.md` as-is. At minimum, resolve
§3.1, §3.2, §3.3, and §3.5 — these are hard blockers where a later task
depends on a capability nothing else in the list actually builds. The
remaining items (§3.4, §3.6–§3.9) are important but can be folded into the
existing phases without restructuring the plan.
