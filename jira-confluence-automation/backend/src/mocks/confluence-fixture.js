// MOCK Confluence data — stands in for a real Confluence REST API client
// (see spec/analyze.md §3.3, which flagged that no Confluence read-ingestion
// task existed). Simulates a "meeting notes" space scoped for tagged
// decision/action-item extraction.
module.exports = {
  space: "PLATENG",
  pages: [
    {
      id: "conf-501",
      title: "Sprint 24 Planning Notes",
      body: "General planning discussion.\nDECISION: Freeze scope for Sprint 24 after planning. Owner: alice. Due: 2026-09-11.\nNo other action items.",
    },
    {
      id: "conf-502",
      title: "Retro Notes - Sprint 23",
      body: "Retro went well.\nACTION: Investigate flaky CI test infrastructure. Owner: bob. Due: 2026-09-20.",
    },
  ],
};
