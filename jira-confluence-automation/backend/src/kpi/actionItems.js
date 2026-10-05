const { pool } = require("../db");
const { getJiraComments, getConfluenceMeetingNotes } = require("../ingestion/ingest");

// v1 extraction: explicit tagging convention only (DECISION:/ACTION:), per
// spec/plan.md §1 assumption — no NLP inference. Matches:
//   "DECISION: <description>. Owner: <name>. Due: <YYYY-MM-DD>."
//   "ACTION: <description>. Owner: <name>. Due: <YYYY-MM-DD>."
const TAG_RE = /(DECISION|ACTION):\s*(.+?)\.\s*Owner:\s*(\w+)\.\s*Due:\s*(\d{4}-\d{2}-\d{2})\./g;

function extractTags(text) {
  const matches = [];
  let m;
  while ((m = TAG_RE.exec(text)) !== null) {
    matches.push({ description: m[2].trim(), owner: m[3].trim(), due_date: m[4] });
  }
  return matches;
}

// FR-006/FR-014: extract tagged decisions/action items from Jira comments and
// scoped Confluence meeting-notes pages, deduping by (source_type, source_reference).
async function extractAndStoreActionItems() {
  const stored = [];

  for (const comment of getJiraComments()) {
    const tags = extractTags(comment.body);
    for (const [i, tag] of tags.entries()) {
      const sourceReference = `jira_comment:${comment.issue_key}:${i}`;
      const row = await upsertActionItem({ ...tag, sourceType: "jira_comment", sourceReference });
      if (row) stored.push(row);
    }
  }

  for (const page of getConfluenceMeetingNotes()) {
    const tags = extractTags(page.body);
    for (const [i, tag] of tags.entries()) {
      const sourceReference = `confluence_page:${page.reference}:${i}`;
      const row = await upsertActionItem({ ...tag, sourceType: "confluence_page", sourceReference });
      if (row) stored.push(row);
    }
  }

  return stored;
}

async function upsertActionItem({ description, owner, due_date, sourceType, sourceReference }) {
  const { rows } = await pool.query(
    `INSERT INTO action_items (description, owner, due_date, source_type, source_reference)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (source_type, source_reference) DO NOTHING
     RETURNING id, description, owner, due_date, status, source_type, source_reference`,
    [description, owner, due_date, sourceType, sourceReference]
  );
  return rows[0] || null; // null means it already existed (dedup working)
}

async function listActionItems() {
  const { rows } = await pool.query(
    `SELECT id, description, owner, due_date, status, source_type, source_reference
     FROM action_items ORDER BY created_at DESC`
  );
  return rows;
}

async function completeActionItem(id) {
  const { rows } = await pool.query(
    `UPDATE action_items SET status = 'complete', updated_at = now() WHERE id = $1
     RETURNING id, status`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { extractAndStoreActionItems, listActionItems, completeActionItem };
