import argparse
import json
from datetime import date, datetime, timedelta
from pathlib import Path


DATE_FORMATS = ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S")


def parse_date(value):
    if not value:
        return None

    for date_format in DATE_FORMATS:
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue

    raise ValueError(f"Unsupported date format: {value}")


def load_data(path):
    with path.open(encoding="utf-8") as data_file:
        data = json.load(data_file)

    if not isinstance(data, dict) or not isinstance(data.get("issues"), list):
        raise ValueError("Input must be an object containing an issues list")

    return data


def issue_in_period(issue, start_date, end_date):
    completed_date = parse_date(issue.get("completed_date"))
    return completed_date is not None and start_date <= completed_date <= end_date


def issue_is_overdue(issue, end_date):
    due_date = parse_date(issue.get("due_date"))
    status = issue.get("status", "").lower()
    return due_date is not None and due_date < end_date and status not in {"done", "closed", "resolved"}


def build_report(data, week_ending):
    week_starting = week_ending - timedelta(days=6)
    issues = data["issues"]
    completed = [issue for issue in issues if issue_in_period(issue, week_starting, week_ending)]
    in_progress = [issue for issue in issues if issue.get("status", "").lower() in {"in progress", "in-progress"}]
    overdue = [issue for issue in issues if issue_is_overdue(issue, week_ending)]
    blockers = data.get("blockers", [])
    risks = data.get("risks", [])
    sprint = data.get("sprint", "Not specified")
    release = data.get("release", "Not specified")

    lines = [
        f"# Weekly Project Status Report ({week_starting:%Y-%m-%d} to {week_ending:%Y-%m-%d})",
        "",
        f"- **Sprint:** {sprint}",
        f"- **Release:** {release}",
        f"- **Completed:** {len(completed)}",
        f"- **In progress:** {len(in_progress)}",
        f"- **Overdue:** {len(overdue)}",
        "",
        "## Completed",
        "",
    ]
    lines.extend(format_issue(issue) for issue in completed)
    if not completed:
        lines.append("- None")
    lines.extend(["", "## In Progress", ""])
    lines.extend(format_issue(issue) for issue in in_progress)
    if not in_progress:
        lines.append("- None")
    lines.extend(["", "## Overdue", ""])
    lines.extend(format_issue(issue) for issue in overdue)
    if not overdue:
        lines.append("- None")
    lines.extend(["", "## Blockers", ""])
    lines.extend(format_item(item) for item in blockers)
    if not blockers:
        lines.append("- None")
    lines.extend(["", "## Risks", ""])
    lines.extend(format_item(item) for item in risks)
    if not risks:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines)


def format_issue(issue):
    details = [issue.get("key", "Unknown"), issue.get("summary", "Untitled")]
    metadata = ", ".join(
        value
        for value in (
            issue.get("status"),
            issue.get("priority"),
            issue.get("assignee"),
        )
        if value
    )
    return f"- **{' - '.join(details)}**" + (f" ({metadata})" if metadata else "")


def format_item(item):
    if isinstance(item, str):
        return f"- {item}"

    owner = f" ({item['owner']})" if item.get("owner") else ""
    return f"- {item.get('description', 'Unspecified')}{owner}"


def main():
    parser = argparse.ArgumentParser(description="Generate a weekly project status report")
    parser.add_argument("--input", type=Path, required=True, help="Path to Jira export JSON")
    parser.add_argument("--output", type=Path, required=True, help="Path for generated Markdown")
    parser.add_argument("--week-ending", type=parse_date, default=date.today(), help="Week ending date in YYYY-MM-DD format")
    args = parser.parse_args()

    report = build_report(load_data(args.input), args.week_ending)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report, encoding="utf-8")
    print(f"Report written to {args.output}")


if __name__ == "__main__":
    main()