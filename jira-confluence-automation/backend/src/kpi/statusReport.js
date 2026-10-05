const { pool } = require("../db");

// FR-002: completed / in-progress / overdue rollup for a project + date window.
// Edge case (spec.md): issues without a due_date are excluded from the
// overdue bucket but still counted in general totals.
async function computeStatusReport({ from, to }) {
  const { rows } = await pool.query(
    `SELECT jira_key, summary, status, due_date, completed_date FROM issues`
  );

  const today = new Date();
  const completed = [];
  const inProgress = [];
  const overdue = [];

  for (const issue of rows) {
    const isCompleted = issue.completed_date !== null;
    if (isCompleted) {
      completed.push(issue.jira_key);
      continue;
    }
    inProgress.push(issue.jira_key);
    if (issue.due_date && new Date(issue.due_date) < today) {
      overdue.push(issue.jira_key);
    }
  }

  return {
    period: { from, to },
    completed_issue_keys: completed,
    in_progress_issue_keys: inProgress,
    overdue_issue_keys: overdue,
    total_issues: rows.length,
  };
}

module.exports = { computeStatusReport };
