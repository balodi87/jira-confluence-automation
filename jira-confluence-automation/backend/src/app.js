const express = require("express");
const cors = require("cors");
const { login, requireAuth, requireActor } = require("./auth/auth");
const { computeStatusReport } = require("./kpi/statusReport");
const { listAlerts, acknowledgeAlert } = require("./kpi/alerts");
const { listActionItems, completeActionItem } = require("./kpi/actionItems");
const { runSync } = require("./jobs/sync");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/v1/auth/login", login);

app.post("/api/v1/sync", requireAuth, requireActor, async (req, res) => {
  try {
    const result = await runSync();
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "Sync failed", detail: err.message });
  }
});

app.get("/api/v1/status-report", requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const report = await computeStatusReport({ from, to });
  res.json(report);
});

app.get("/api/v1/alerts", requireAuth, async (req, res) => {
  res.json(await listAlerts());
});

app.patch("/api/v1/alerts/:id/acknowledge", requireAuth, requireActor, async (req, res) => {
  const updated = await acknowledgeAlert(req.params.id);
  if (!updated) return res.status(404).json({ error: "Alert not found" });
  res.json(updated);
});

app.get("/api/v1/action-items", requireAuth, async (req, res) => {
  res.json(await listActionItems());
});

app.patch("/api/v1/action-items/:id/complete", requireAuth, requireActor, async (req, res) => {
  const updated = await completeActionItem(req.params.id);
  if (!updated) return res.status(404).json({ error: "Action item not found" });
  res.json(updated);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

module.exports = app;
