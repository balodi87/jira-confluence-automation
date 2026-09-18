const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

module.exports = app;
