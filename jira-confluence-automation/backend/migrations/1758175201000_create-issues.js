exports.up = (pgm) => {
  pgm.createTable("issues", {
    id: "id",
    jira_key: { type: "text", notNull: true, unique: true },
    summary: { type: "text", notNull: true },
    status: { type: "text", notNull: true },
    priority: { type: "text" },
    assignee: { type: "text" },
    sprint: { type: "text" },
    release: { type: "text" },
    due_date: { type: "date" },
    completed_date: { type: "date" },
    team_id: { type: "integer", references: "teams", onDelete: "SET NULL" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("issues", "status");
  pgm.createIndex("issues", "due_date");
};

exports.down = (pgm) => {
  pgm.dropTable("issues");
};
