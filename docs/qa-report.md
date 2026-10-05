# QA Report: Jira/Confluence Automation Platform (Prototype)

**Date**: 2026-10-05
**Environment**: Local Docker Compose stack (`postgres` + `backend` + `frontend`)
**Tooling used**: `chrome-devtools` MCP server (real Chrome instance) — navigation, snapshots, screenshots, console/network inspection, scripted DOM evaluation
**Application under test**: `jira-confluence-automation/` (React 18 + Vite frontend, Node.js + Express backend, PostgreSQL 15)

---

## 1. Scope

This is a **prototype** per `spec/specification.md`. Jira/Confluence
integration is mocked (fixture data); authentication is a dev-only stub
(JWT login with `viewer`/`actor` roles), not real OIDC. QA was performed
against this prototype, not a production system.

## 2. Pages / Views Visited

The application is a single-page app (no client-side routing). Two main
view states were tested:

| # | View | Trigger | Tested? |
|---|---|---|---|
| 1 | **Login** | Default/unauthenticated state, also reachable via "log out" | ✅ |
| 2 | **Dashboard — empty state** | Immediately after login, before any sync | ✅ |
| 3 | **Dashboard — populated state** | After clicking "Run Sync" or "Refresh" with existing data | ✅ |

## 3. Elements Tested

### Login view
- Username text input — filled and submitted successfully
- Role `<select>` (Viewer / Actor) — both values exercised
- "Log in" button — submit triggers `POST /api/v1/auth/login`

### Dashboard view
- "log out" button (present, not deeply exercised beyond visibility)
- "Run Sync (ingest + alerts + tracker + publish)" button — clicked, triggers `POST /api/v1/sync`
- "Refresh" button — clicked, triggers `GET` calls to status-report/alerts/action-items
- Status Report table (Completed / In Progress / Overdue columns) — rendered real computed data
- Alerts table (Issue / Reason / Status / Action) — rendered real alert rows, including open vs. acknowledged states
- "Acknowledge" button per open alert — clicked, triggers `PATCH /api/v1/alerts/:id/acknowledge`, row updates to `acknowledged`
- Action Items table (Description / Owner / Due / Status / Action) — rendered real extracted items
- "Mark Complete" button per open item — clicked, triggers `PATCH /api/v1/action-items/:id/complete`, row updates to `complete`

### Backend endpoints exercised (directly and via UI)
| Endpoint | Method | Verified |
|---|---|---|
| `/api/v1/health` | GET | 200 `{"status":"ok"}` |
| `/api/v1/auth/login` | POST | 200, returns JWT + role |
| `/api/v1/sync` | POST | 200 (actor), 403 (viewer — role enforcement confirmed) |
| `/api/v1/status-report` | GET | 200, correct completed/in-progress/overdue computation |
| `/api/v1/alerts` | GET | 200, list of raised alerts |
| `/api/v1/alerts/:id/acknowledge` | PATCH | 200 (actor), 403 (viewer) |
| `/api/v1/action-items` | GET | 200, list of extracted items |
| `/api/v1/action-items/:id/complete` | PATCH | 200 (actor) |
| Any `/api/v1/*` route | — | 401 confirmed with no bearer token |

### Cross-cutting checks
- Browser console messages (errors/warnings) — checked after every major interaction
- Network requests (status codes) — checked after login and sync
- Role-based authorization (`viewer` vs `actor`) — explicitly tested for both read and mutating routes
- Alert/action-item deduplication across repeated `sync` runs — verified (`ON CONFLICT` behavior)
- Database persistence across container restarts — verified (schema + data survive `docker compose down`/`up`, not `down -v`)

## 4. Bugs Found & Fixed

| # | Bug | Found via | Severity | Fix | Commit |
|---|---|---|---|---|---|
| 1 | Backend `status_reports.period_start`/`period_end` are `NOT NULL`, but the sync job originally passed `null`/`null`, causing every sync to fail at the publish step | Manual end-to-end curl test of `/api/v1/sync` | High (sync completely broken) | Compute a real `from`/`to` date window (last 7 days) in `runSync()` before calling `computeStatusReport` | `88aa863` (part of initial prototype implementation, fixed same session before first successful sync) |
| 2 | Duplicate `import './App.css'` statement in `App.jsx` | Code review while investigating console output | Low (cosmetic/redundant) | Removed the duplicate import | `bc929ea` |
| 3 | Login form's Username input and Role `<select>` missing `id`/`name` attributes, flagged by Chrome DevTools as "A form field element should have an id or name attribute" (count: 2); follow-up "missing autocomplete attribute" notice after first fix | `chrome-devtools` MCP console inspection (`list_console_messages`) | Low (accessibility) | Added `id`/`name` to both fields, linked `<label htmlFor>` to each, added `autoComplete="username"` | `7d60f9f` |

**No functional/logic bugs remain open.** All three identified issues were fixed and verified via the live Chrome instance (DOM attribute check via `evaluate_script` + console re-check showing zero errors/warnings after rebuild).

## 5. Known Limitations (By Design, Not Bugs)

These are documented prototype-scope decisions, not defects:
- Jira/Confluence integration is mocked (fixture data in `backend/src/mocks/`), not live APIs.
- Auth is a dev-only JWT login stub, not real OIDC SSO.
- Confluence "publish" writes a versioned local Markdown file instead of calling a real Confluence API.
- Alert dedup only suppresses *currently open* duplicates — an alert that has been acknowledged can be re-raised on the next sync if the underlying condition (overdue/blocked) still holds. This matches the dedup logic in `spec/plan.md` §1 but could surprise users expecting permanent suppression.
- Decision/action-item extraction uses an explicit tagging convention (`DECISION:`/`ACTION:`), not NLP — untagged text is never extracted.
- No automated test suite exists yet (unit/integration tests are tracked as open work in `spec/tasks.md`).

## 6. Current Status

| Area | Status |
|---|---|
| Login flow | ✅ Working, verified end-to-end |
| Sync pipeline (ingest → alerts → action items → publish) | ✅ Working, verified end-to-end |
| Role-based access control (viewer/actor) | ✅ Working, 401/403 enforcement confirmed |
| Dashboard data views (status report, alerts, action items) | ✅ Working, real backend data rendered |
| Interactive actions (acknowledge alert, complete action item) | ✅ Working, persisted to database |
| Browser console | ✅ Clean (zero errors/warnings after fixes) |
| Network requests | ✅ All 2xx/3xx, no 4xx/5xx in normal flow |
| Accessibility | ✅ No outstanding DevTools-flagged issues |
| Automated tests | ❌ None exist yet (manual/MCP-driven QA only) |
| Production readiness | ❌ Not production-ready — mocked integrations, dev-only auth, no CI (see §5) |

**Overall**: The prototype's core user flow (login → sync → view → act on alerts/action items) is fully functional and bug-free as of this session, with all identified issues fixed and committed.
