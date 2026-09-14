---
description: "Guidelines for parsing ITSM ticket exports and evaluating SLA performance"
---

# ITSM Parser Workflow

## When to Use
- Use `tools/itsm_parser.py` when an ITSM, JSM, or ServiceNow ticket export needs normalized response and resolution timing data.
- Use it to identify tickets that exceed configured response or resolution SLA targets.
- Use it for JSON or CSV exports containing ticket records and ISO-8601 timestamps.

## Input Requirements
- JSON input may be a top-level array of ticket objects or an object with a `tickets` array.
- CSV input is detected from a `.csv` file extension and must include a header row.
- Each ticket should include a creation timestamp and may include acknowledged and resolved timestamps using either naming style:
  - `created` or `created_at`
  - `acknowledged` or `acknowledged_at`
  - `resolved` or `resolved_at`
- SLA targets may be provided as `response_sla_minutes` / `resolution_sla_minutes` or as `response_sla_hours` / `resolution_sla_hours`.
- Timestamps must be valid ISO-8601 values. Naive timestamps are interpreted as UTC.

## Invocation
- Run the script from the workspace root with the export path as its only argument:
  ```text
  python3 tools/itsm_parser.py PATH_TO_TICKET_EXPORT
  ```
- Examples:
  ```text
  python3 tools/itsm_parser.py data/fixtures/sample_servicenow_tickets.json
  python3 tools/itsm_parser.py data/fixtures/tickets.csv
  ```
- The command writes normalized ticket records as indented JSON to standard output.
- Invalid files, malformed JSON, invalid timestamps, or out-of-order timestamps produce a command-line error and nonzero exit status.

## Interpreting Results
- `response_duration_minutes` is the elapsed time from creation to acknowledgement. It is `null` when either timestamp is missing.
- `resolution_duration_minutes` is the elapsed time from creation to resolution. It is `null` when either timestamp is missing.
- `response_sla_breached` and `resolution_sla_breached` are `true` when the corresponding duration exceeds its configured target.
- `sla_breached` is the overall breach flag. It is `true` when a calculated response or resolution breach exists, or when the source explicitly supplies `sla_breached`.
- Preserve the ticket's original fields and use the added duration and breach fields when preparing SLA summaries or incident reports.
