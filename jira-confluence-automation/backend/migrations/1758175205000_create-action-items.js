exports.up = (pgm) => {
  pgm.createTable("action_items", {
    id: "id",
    description: { type: "text", notNull: true },
    owner: { type: "text" },
    due_date: { type: "date" },
    status: { type: "text", notNull: true, default: "open" }, // 'open' | 'complete'
    source_type: { type: "text", notNull: true }, // 'jira_comment' | 'confluence_page'
    source_reference: { type: "text", notNull: true },
    team_id: { type: "integer", references: "teams", onDelete: "SET NULL" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createConstraint("action_items", "action_items_source_unique", {
    unique: ["source_type", "source_reference"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("action_items");
};
