const { pool } = require("../db");
const { getIssueLinks } = require("../ingestion/ingest");

const BLOCKED_STATUS_NAME = "Blocked";

// FR-004: detect overdue issues (past due, not completed) and blocked issues
// (status name OR "is blocked by" issue link), then raise/upsert alerts.
// FR-005: dedupe — do not re-raise an already-open alert for the same
// issue+reason within the notification period.
async function detectAndRaiseAlerts() {
  const { rows: issues } = await pool.query(
    `SELECT id, jira_key, status, due_date, completed_date FROM issues`
  );
  const linksByKey = new Map(getIssueLinks().map((l) => [l.key, l.links]));
  const today = new Date();
  const raised = [];

  for (const issue of issues) {
    const reasons = [];
    const isOverdue =
      !issue.completed_date && issue.due_date && new Date(issue.due_date) < today;
    if (isOverdue) reasons.push("overdue");

    const links = linksByKey.get(issue.jira_key) || [];
    const isBlockedByStatus = issue.status === BLOCKED_STATUS_NAME;
    const isBlockedByLink = links.some((l) => l.type === "is blocked by");
    if (isBlockedByStatus || isBlockedByLink) reasons.push("blocked");

    for (const reason of reasons) {
      const { rows: existing } = await pool.query(
        `SELECT id FROM alerts WHERE issue_id = $1 AND reason = $2 AND acknowledgement_status = 'open'`,
        [issue.id, reason]
      );
      if (existing.length > 0) continue; // already raised and still open — don't duplicate

      await pool.query(
        `INSERT INTO alerts (issue_id, reason, notified_recipients) VALUES ($1, $2, $3)`,
        [issue.id, reason, [issue.jira_key]]
      );
      raised.push({ issue_key: issue.jira_key, reason });
    }
  }
  return raised;
}

async function listAlerts() {
  const { rows } = await pool.query(
    `SELECT a.id, i.jira_key, a.reason, a.raised_at, a.acknowledgement_status
     FROM alerts a JOIN issues i ON i.id = a.issue_id
     ORDER BY a.raised_at DESC`
  );
  return rows;
}

async function acknowledgeAlert(id) {
  const { rows } = await pool.query(
    `UPDATE alerts SET acknowledgement_status = 'acknowledged', acknowledged_at = now()
     WHERE id = $1 RETURNING id, acknowledgement_status`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { detectAndRaiseAlerts, listAlerts, acknowledgeAlert };
