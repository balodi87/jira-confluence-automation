exports.up = (pgm) => {
  pgm.createTable("teams", {
    id: "id",
    name: { type: "text", notNull: true, unique: true },
    jira_project_keys: { type: "text[]", notNull: true, default: "{}" },
    members: { type: "text[]", notNull: true, default: "{}" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("teams");
};
