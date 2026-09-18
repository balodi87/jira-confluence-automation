# Spec Review: Gaps, Contradictions & Unclear Requirements

**Reviewed**: `spec/constitution.md`, `spec/specification.md`
**Reviewer role**: Senior developer / pre-`/plan` review
**Verdict**: Not ready for `/plan`. Beyond the 3 self-flagged
`[NEEDS CLARIFICATION]` items (FR-015–017), there are additional gaps,
contradictions, and ambiguities that should be resolved via `/clarify`
before technical planning starts.

---

## 1. Contradictions

### 1.1 Read-only dashboard vs. stateful workflows
The checklist asserts "dashboard is read-only surface," but:
- **FR-007** requires tracking action-item completion "over time" — if
  there's no Jira ticket backing every action item (many originate from
  free-text comments/meeting notes), something has to *write* status
  changes. A read-only dashboard has no such write path.
- The **Alert** entity has an `acknowledgement status` field, but no FR
  defines who acknowledges an alert or through what interface.

**Resolve**: Either the dashboard supports explicit user actions (ack alert,
update action-item status) and is *not* read-only, or completion status is
derived entirely from Jira/Confluence state — in which case free-text-only
action items (no backing ticket) can never be marked done. Pick one.

### 1.2 Weekly cadence vs. "notice risks early"
`PROJECT_IDEAS.md`'s original motivation for overdue/blocker alerts is to
catch risk **before** it affects a milestone. But FR-011 describes "a
configurable schedule (e.g., weekly...)" applied uniformly to "all
Jira/Confluence report and alert jobs" — implying alerts might only run
weekly, same as status reports.

**Resolve**: Status reports and overdue/blocker alerts likely need
different cadences (e.g., alerts hourly/daily, reports weekly). The spec
should require independent scheduling per automation type, not one shared
schedule.

### 1.3 Publish target: one evolving page vs. one page per report
- **PublishTarget** entity says "space, page ID/template" (singular page).
- **FR-003** says publishing "creat[es] a new page version rather than
  overwriting history destructively" (implies the *same* page, versioned).
- **StatusReport** entity separately stores "the Confluence page it was
  published to," implying each report could target a different page.

**Resolve**: Clarify whether each report run updates a single, evolving
Confluence page (using native page version history) or creates a new page
per period. This materially changes the data model and Confluence API
calls used in `/plan`.

### 1.4 Polling vs. webhook ingestion
The constitution's Security principle references validating "input from
external systems (**webhooks**, imports)," implying webhook-based ingestion
exists. But every functional requirement (FR-001, FR-011) describes the
system *pulling*/polling Jira on a schedule or on-demand. No FR mentions
receiving or validating an inbound webhook.

**Resolve**: Decide if ingestion is poll-only, webhook-only, or hybrid, and
update either the constitution (drop webhook reference) or the spec (add a
webhook ingestion FR).

---

## 2. Gaps (missing entirely)

### 2.1 Platform authentication & authorization
Nothing in either document defines:
- How a *user* logs into the dashboard (FR-008, FR-011's "authenticated API
  call") — no auth mechanism, session model, or identity provider is named.
- Roles/permissions — can any authenticated user see any project's reports,
  or is access scoped per project/team?
- Whether dashboard access maps to the user's own Jira/Confluence
  permissions, or the system uses one shared service account for all
  ingestion regardless of who's viewing (risk: a user could see data from
  Jira projects they don't actually have access to in Jira itself).

This is a foundational gap — `/plan` cannot proceed without it.

### 2.2 "Blocked" detection method
FR-004 says the system detects issues that are "blocked (linked
blocker/dependency present)" but doesn't specify *how* blocked state is
determined: a Jira status value (e.g., a "Blocked" workflow status), an
issue-link type (e.g., "is blocked by"), a custom field/label, or some
combination. Each has different ingestion/parsing implications.

### 2.3 Decision/action-item extraction method
FR-006 is the highest-risk requirement in the spec: "extract decisions and
action items from Jira comments/labels and Confluence meeting notes" with
no defined contract for *how* extraction works — free-text NLP inference,
required tagging convention (e.g., a `DECISION:` prefix or a Jira label),
or manual user flagging. This needs to be pinned down before `/plan`, since
it drives whether this is a simple parser or a full NLP/LLM component.

Related and also unspecified: how the system identifies which Confluence
pages *are* "meeting notes" in the first place (a specific space? a label?
a page template?) versus scanning arbitrary content.

### 2.4 Deduplication algorithm (FR-014)
"Deduplicate by source reference" is stated, but the matching criteria for
detecting that two extracted items represent the *same* decision (exact
text match, same owner + due date, manual linking by the user) is undefined
and directly affects data model and implementation complexity.

### 2.5 Non-functional requirements
No NFRs are specified anywhere:
- Performance/latency targets for dashboard queries or report generation.
- Scale (tied to open FR-016, but also affects DB indexing/query design).
- Availability/uptime expectations for scheduled jobs.
- Timezone/locale handling for "weekly" report windows and due dates
  (which day does a week start/end on? whose timezone — server, org, or
  per-user?).
- Accessibility or browser-support requirements for the React frontend.

### 2.6 Operational failure visibility
FR-013 says failed jobs must not publish corrupted output, and FR-012
requires structured logging — but nothing specifies how a *human* finds out
a job failed (dashboard banner? separate ops alert? nothing, and someone
has to grep logs?). Without this, failures could go unnoticed indefinitely,
undermining the entire premise of the automation.

### 2.7 Retry/backoff limits
The edge case "back off and retry" on rate limits has no bound: max
attempts, backoff strategy, or terminal failure behavior are all
unspecified, so this requirement isn't currently testable.

### 2.8 Data retention & PII beyond logging
The constitution's Security principle covers not logging secrets/PII, but
says nothing about PII handling in the PostgreSQL store itself (assignee
names/emails persisted indefinitely per FR-009, compounded by the open
FR-017 retention gap). Worth addressing together as one data-governance
decision rather than two separate loose ends.

### 2.9 Team/ownership model
FR-005 references notifying "the responsible assignee/team," but no `Team`
entity or team-to-project/board mapping exists in the Key Entities section.
Without it, "team" notification can't be implemented.

### 2.10 Multi-tenancy
Unstated whether this platform serves one Jira/Confluence org or multiple
(e.g., a shared internal tool vs. a product for many customer orgs). This
affects schema design (`org_id` scoping), credential storage (one set vs.
per-tenant), and the auth gap in §2.1.

---

## 3. Unclear / Ambiguous Requirements

| Ref | Requirement | Ambiguity |
|-----|-------------|-----------|
| FR-002 | "configurable reporting window" | No stated default value or bounds (min/max window length). |
| FR-005 | "avoid duplicate re-notification within the same period" | "Period" is undefined — same as the report cadence? A fixed 24h window? |
| FR-006 | extraction "from Jira comments/labels and Confluence meeting notes" | See §2.3 — no format contract. |
| FR-009 | "persist ... so that report history and trend data survive" | "Trend data" implies analytics/derived aggregates, but no FR defines what trends are computed or displayed. |
| FR-010 | "securely stored credentials (API token/OAuth)" | Doesn't specify per-user vs. shared service-account auth (see §2.1). |
| Edge case | issue moved between projects/boards mid-sprint | "MUST reflect its state at time of report generation" is reasonable, but doesn't say what happens to a *previously published* report referencing the issue under its old project — is it left stale (acceptable, since Confluence pages are snapshots) or does it need reconciliation? Should be stated explicitly rather than implied. |

---

## 4. Process Note

This specification bundles three distinct automations (status reporting,
overdue/blocker alerts, decision/action tracking) plus a dashboard under a
single feature branch (`001-jira-confluence-automation`). Per standard
Spec-Driven Development practice, consider splitting these into separate
specs/features (each with its own `/specify` → `/plan` → `/tasks` cycle) so
each can be scoped, clarified, and shipped independently rather than
blocking on the least-defined piece (currently FR-006, the extraction
engine).

---

## Recommendation

Do not proceed to `/plan` until at minimum:
1. §1.1 (read-only vs. stateful dashboard) is resolved — it affects the
   entire application architecture.
2. §2.1 (platform auth/authz) is defined — foundational for `/plan`.
3. §2.3/§2.4 (extraction + dedup method) are pinned down — highest
   implementation-risk/least-defined requirement.
4. The 3 original `[NEEDS CLARIFICATION]` markers (FR-015–017) are answered.

Everything else in §2/§3 can reasonably be resolved iteratively per-feature
if the spec is split as suggested in §4.
