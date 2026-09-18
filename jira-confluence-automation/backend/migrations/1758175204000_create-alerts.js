exports.up = (pgm) => {
  pgm.createTable("alerts", {
    id: "id",
    issue_id: { type: "integer", notNull: true, references: "issues", onDelete: "CASCADE" },
    reason: { type: "text", notNull: true }, // 'overdue' | 'blocked'
    raised_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    notified_recipients: { type: "text[]", notNull: true, default: "{}" },
    acknowledgement_status: { type: "text", notNull: true, default: "open" }, // 'open' | 'acknowledged'
    acknowledged_at: { type: "timestamptz" },
  });
  pgm.createIndex("alerts", ["issue_id", "reason"]);
};

exports.down = (pgm) => {
  pgm.dropTable("alerts");
};
