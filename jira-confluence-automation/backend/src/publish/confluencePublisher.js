const fs = require("fs");
const path = require("path");
const { pool } = require("../db");

// MOCK Confluence publisher — writes a versioned local file instead of
// calling the real Confluence API (no credentials available in this
// environment; see spec/analyze.md §3.3). Simulates FR-003's
// "create-or-update with versioning" behavior via an incrementing version
// number stored in status_reports.published_page_version.
const PUBLISH_DIR = path.join(__dirname, "..", "..", "published-pages");

async function publishStatusReport(projectKey, report) {
  if (!fs.existsSync(PUBLISH_DIR)) fs.mkdirSync(PUBLISH_DIR, { recursive: true });

  const { rows: targetRows } = await pool.query(
    `SELECT id FROM publish_targets WHERE confluence_space = $1 LIMIT 1`,
    [projectKey]
  );
  let publishTargetId = targetRows[0]?.id;
  if (!publishTargetId) {
    const { rows } = await pool.query(
      `INSERT INTO publish_targets (confluence_space, confluence_page_id, report_types)
       VALUES ($1, $2, ARRAY['weekly_status']) RETURNING id`,
      [projectKey, `${projectKey}-status-page`]
    );
    publishTargetId = rows[0].id;
  }

  const { rows: lastReport } = await pool.query(
    `SELECT published_page_version FROM status_reports
     WHERE publish_target_id = $1 ORDER BY id DESC LIMIT 1`,
    [publishTargetId]
  );
  const nextVersion = (lastReport[0]?.published_page_version || 0) + 1;

  const filePath = path.join(PUBLISH_DIR, `${projectKey}-status-page.md`);
  const content = renderReportMarkdown(projectKey, report, nextVersion);
  fs.writeFileSync(filePath, content, "utf8");

  const { rows } = await pool.query(
    `INSERT INTO status_reports
       (period_start, period_end, source_project_key, completed_issue_keys,
        in_progress_issue_keys, overdue_issue_keys, blockers, risks,
        publish_target_id, published_page_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, published_page_version`,
    [
      report.period.from,
      report.period.to,
      projectKey,
      report.completed_issue_keys,
      report.in_progress_issue_keys,
      report.overdue_issue_keys,
      JSON.stringify([]),
      JSON.stringify([]),
      publishTargetId,
      nextVersion,
    ]
  );

  return { filePath, version: nextVersion, statusReportId: rows[0].id };
}

function renderReportMarkdown(projectKey, report, version) {
  return `# ${projectKey} Weekly Status Report (v${version})

Period: ${report.period.from || "n/a"} to ${report.period.to || "n/a"}

## Completed (${report.completed_issue_keys.length})
${report.completed_issue_keys.map((k) => `- ${k}`).join("\n") || "_none_"}

## In Progress (${report.in_progress_issue_keys.length})
${report.in_progress_issue_keys.map((k) => `- ${k}`).join("\n") || "_none_"}

## Overdue (${report.overdue_issue_keys.length})
${report.overdue_issue_keys.map((k) => `- ${k}`).join("\n") || "_none_"}
`;
}

module.exports = { publishStatusReport };
