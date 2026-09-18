exports.up = (pgm) => {
  pgm.createTable("publish_targets", {
    id: "id",
    confluence_space: { type: "text", notNull: true },
    confluence_page_id: { type: "text", notNull: true },
    report_types: { type: "text[]", notNull: true, default: "{}" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("publish_targets");
};
