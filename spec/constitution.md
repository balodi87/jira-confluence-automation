# Jira/Confluence Automation Constitution

## Core Principles

### I. Spec-First Development
Every feature begins as a written specification (`/specify`) describing user
needs and outcomes before any implementation detail is decided. Specs are the
source of truth; code that diverges from an approved spec/plan must trigger a
spec update, not a silent deviation.

### II. Test-First (NON-NEGOTIABLE)
Tests are written before implementation and MUST fail before code is written
to satisfy them (Red-Green-Refactor). Every backend endpoint and frontend
component that touches business logic requires unit tests; integration tests
are required for all Jira/Confluence API interactions and database access
paths.

### III. Contract Stability
REST API contracts between the React frontend and Express backend are
explicit (OpenAPI/JSON schema) and versioned. Breaking changes to a contract
require a new version path (e.g. `/api/v2/...`) rather than mutating an
existing one in place.

### IV. Security by Design
Jira/Confluence credentials, API tokens, and OAuth secrets are never
committed to source control, logged, or exposed to the frontend. All
external API calls go through the backend; the frontend never talks to
Jira/Confluence directly. Input from external systems (webhooks, imports) is
validated and sanitized at the boundary.

### V. Observability
Backend services emit structured logs (JSON) for every external API call
(Jira/Confluence), including request outcome and latency, without logging
secrets or full PII payloads. Failures in sync/automation jobs must be
observable (logged and surfaced), never silently swallowed.

### VI. Simplicity & YAGNI
Prefer the simplest design that satisfies the current spec. New
abstractions, services, or dependencies require justification tied to an
actual requirement, not speculative future need.

## Technology Stack

The following stack is fixed for this project; changes require a
constitution amendment:

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15, run via Docker (local dev and CI)
- **Containerization**: Docker / Docker Compose for local environment parity

## Development Workflow

1. Features flow through Spec Kit phases: `/constitution` → `/specify` →
   `/clarify` → `/plan` → `/tasks` → `/implement`.
2. All database schema changes are made via migrations, never manual edits
   against a running database.
3. Pull requests must reference the spec/task they implement and include
   passing tests before merge.
4. Docker Compose is the required way to run the full stack (frontend,
   backend, PostgreSQL) locally to avoid environment drift.

## Governance

This constitution supersedes ad-hoc practices. Amendments require a written
rationale and update to this file, including a version bump below. All
specs, plans, and tasks must verify compliance with these principles before
implementation begins; unjustified complexity or deviation must be flagged
during `/analyze` or code review.

**Version**: 1.0.0 | **Ratified**: 2026-09-18 | **Last Amended**: 2026-09-18
