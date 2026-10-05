const { pool } = require("../db");
const jiraFixture = require("../mocks/jira-fixture");
const confluenceFixture = require("../mocks/confluence-fixture");

// Ingests the (mocked) Jira project's issues, upserting by jira_key.
async function ingestJiraIssues() {
  const client = await pool.connect();
  let count = 0;
  try {
    for (const issue of jiraFixture.issues) {
      await client.query(
        `INSERT INTO issues (jira_key, summary, status, priority, assignee, sprint, release, due_date, completed_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (jira_key) DO UPDATE SET
           summary = EXCLUDED.summary,
           status = EXCLUDED.status,
           priority = EXCLUDED.priority,
           assignee = EXCLUDED.assignee,
           sprint = EXCLUDED.sprint,
           release = EXCLUDED.release,
           due_date = EXCLUDED.due_date,
           completed_date = EXCLUDED.completed_date,
           updated_at = now()`,
        [
          issue.key,
          issue.summary,
          issue.status,
          issue.priority,
          issue.assignee,
          issue.sprint,
          issue.release,
          issue.due_date,
          issue.completed_date,
        ]
      );
      count += 1;
    }
  } finally {
    client.release();
  }
  return { source: "jira_issues", count };
}

// Returns the raw links per issue (used for blocked detection). In a real
// integration this would come from the Jira API; here it's fixture data.
function getIssueLinks() {
  return jiraFixture.issues.map((i) => ({ key: i.key, links: i.links || [] }));
}

// Returns raw Jira comments (used for action-item tag extraction).
function getJiraComments() {
  return jiraFixture.comments;
}

// Returns raw Confluence pages scoped to the configured "meeting notes" space.
function getConfluenceMeetingNotes() {
  return confluenceFixture.pages.map((p) => ({
    source: "confluence_page",
    reference: p.id,
    title: p.title,
    body: p.body,
  }));
}

module.exports = {
  ingestJiraIssues,
  getIssueLinks,
  getJiraComments,
  getConfluenceMeetingNotes,
};
