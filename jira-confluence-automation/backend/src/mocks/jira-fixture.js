// MOCK Jira data — stands in for a real Jira REST API client, which
// requires live credentials not available in this environment (see
// spec/analyze.md §3.1). Includes issue fields, issue links (for blocked
// detection), and comments (for action-item tagging).
module.exports = {
  project: "PLAT",
  issues: [
    {
      key: "PLAT-101",
      summary: "Migrate auth service to new token format",
      status: "Done",
      priority: "High",
      assignee: "alice",
      sprint: "Sprint 24",
      release: "v2.4.0",
      due_date: "2026-09-10",
      completed_date: "2026-09-09",
      links: [],
    },
    {
      key: "PLAT-102",
      summary: "Fix flaky integration test in CI",
      status: "In Progress",
      priority: "Medium",
      assignee: "bob",
      sprint: "Sprint 24",
      release: "v2.4.0",
      due_date: "2026-09-12",
      completed_date: null,
      links: [],
    },
    {
      key: "PLAT-103",
      summary: "Add rate limiting to public API",
      status: "In Progress",
      priority: "High",
      assignee: "carol",
      sprint: "Sprint 24",
      release: "v2.4.0",
      due_date: "2026-09-14",
      completed_date: null,
      links: [{ type: "is blocked by", key: "PLAT-099" }],
    },
    {
      key: "PLAT-104",
      summary: "Upgrade Postgres client library",
      status: "Blocked",
      priority: "Low",
      assignee: "dave",
      sprint: "Sprint 24",
      release: "v2.4.0",
      due_date: "2026-09-05",
      completed_date: null,
      links: [],
    },
  ],
  comments: [
    {
      issue_key: "PLAT-102",
      author: "bob",
      body: "DECISION: We will retry flaky network calls up to 3 times before failing the test. Owner: bob. Due: 2026-09-20.",
    },
    {
      issue_key: "PLAT-103",
      author: "carol",
      body: "Just a status update, nothing tagged here.",
    },
    {
      issue_key: "PLAT-103",
      author: "carol",
      body: "ACTION: Document the new rate-limit headers in the API reference. Owner: carol. Due: 2026-09-25.",
    },
  ],
};
