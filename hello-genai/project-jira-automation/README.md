# Weekly Project Status Report

Generate a Markdown status report from a Jira issue export. The script uses only the Python standard library, so it can run locally or from a scheduled job.

## Run

```bash
python3 scripts/generate_report.py \
  --input data/sample_jira_export.json \
  --output data/weekly-status-report.md \
  --week-ending 2026-09-11
```

The input JSON supports `sprint`, `release`, `issues`, `blockers`, and `risks`. Each issue can include `key`, `summary`, `status`, `priority`, `assignee`, `completed_date`, and `due_date`.

The generated Markdown can be reviewed locally or passed to a later Jira/Confluence publishing step.