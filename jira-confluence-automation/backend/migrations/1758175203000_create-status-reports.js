exports.up = (pgm) => {
  pgm.createTable("status_reports", {
    id: "id",
    period_start: { type: "date", notNull: true },
    period_end: { type: "date", notNull: true },
    source_project_key: { type: "text", notNull: true },
    completed_issue_keys: { type: "text[]", notNull: true, default: "{}" },
    in_progress_issue_keys: { type: "text[]", notNull: true, default: "{}" },
    overdue_issue_keys: { type: "text[]", notNull: true, default: "{}" },
    blockers: { type: "jsonb", notNull: true, default: "[]" },
    risks: { type: "jsonb", notNull: true, default: "[]" },
    publish_target_id: { type: "integer", references: "publish_targets", onDelete: "SET NULL" },
    published_page_version: { type: "integer" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("status_reports");
};
