const { ingestJiraIssues } = require("../ingestion/ingest");
const { computeStatusReport } = require("../kpi/statusReport");
const { detectAndRaiseAlerts } = require("../kpi/alerts");
const { extractAndStoreActionItems } = require("../kpi/actionItems");
const { publishStatusReport } = require("../publish/confluencePublisher");
const jiraFixture = require("../mocks/jira-fixture");

// FR-011/012/013: on-demand job orchestration with structured logging and
// failure isolation — if any step throws, no publish happens and the
// failure is logged with outcome/duration, never silently swallowed.
async function runSync() {
  const startedAt = Date.now();
  const log = { job: "sync", startedAt: new Date(startedAt).toISOString() };

  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const ingestResult = await ingestJiraIssues();
    const report = await computeStatusReport({ from, to });
    const alerts = await detectAndRaiseAlerts();
    const actionItems = await extractAndStoreActionItems();
    const publishResult = await publishStatusReport(jiraFixture.project, report);

    const result = {
      ...log,
      outcome: "success",
      durationMs: Date.now() - startedAt,
      counts: {
        issuesIngested: ingestResult.count,
        alertsRaised: alerts.length,
        actionItemsExtracted: actionItems.length,
      },
      published: publishResult,
    };
    console.log(JSON.stringify(result));
    return result;
  } catch (err) {
    const result = {
      ...log,
      outcome: "failure",
      durationMs: Date.now() - startedAt,
      error: err.message,
    };
    console.error(JSON.stringify(result));
    throw err; // ensure caller (route) surfaces the failure; nothing partial gets published
  }
}

module.exports = { runSync };
