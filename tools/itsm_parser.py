"""Parse ITSM ticket exports and calculate SLA durations and breaches."""

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TIMESTAMP_FIELDS = ("created", "created_at", "acknowledged", "acknowledged_at", "resolved", "resolved_at")


def parse_timestamp(value: Any) -> datetime | None:
    """Parse an ISO-8601 timestamp, treating naive values as UTC."""
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        timestamp = value
    else:
        timestamp = datetime.fromisoformat(str(value).strip().replace("Z", "+00:00"))
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.astimezone(timezone.utc)


def duration_minutes(start: datetime | None, end: datetime | None) -> float | None:
    """Return elapsed minutes between two timestamps, or None if incomplete."""
    if start is None or end is None:
        return None
    elapsed = (end - start).total_seconds() / 60
    if elapsed < 0:
        raise ValueError("ticket timestamps must be in chronological order")
    return round(elapsed, 2)


def _number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    return float(value)


def _target_minutes(ticket: dict[str, Any], name: str) -> float | None:
    """Read an SLA target expressed as minutes or hours."""
    minutes = _number(ticket.get(f"{name}_sla_minutes"))
    if minutes is not None:
        return minutes
    hours = _number(ticket.get(f"{name}_sla_hours"))
    return hours * 60 if hours is not None else None


def parse_ticket(ticket: dict[str, Any]) -> dict[str, Any]:
    """Normalize one ticket and add response/resolution duration and SLA fields."""
    timestamps = {field: parse_timestamp(ticket.get(field)) for field in TIMESTAMP_FIELDS}
    created = timestamps["created"] or timestamps["created_at"]
    acknowledged = timestamps["acknowledged"] or timestamps["acknowledged_at"]
    resolved = timestamps["resolved"] or timestamps["resolved_at"]

    response_duration = duration_minutes(created, acknowledged)
    resolution_duration = duration_minutes(created, resolved)
    response_target = _target_minutes(ticket, "response")
    resolution_target = _target_minutes(ticket, "resolution")

    response_breached = (
        response_duration is not None
        and response_target is not None
        and response_duration > response_target
    )
    resolution_breached = (
        resolution_duration is not None
        and resolution_target is not None
        and resolution_duration > resolution_target
    )
    known_breach = ticket.get("sla_breached")
    sla_breached = bool(known_breach) if known_breach is not None else (
        response_breached or resolution_breached
    )

    parsed = dict(ticket)
    parsed["response_duration_minutes"] = response_duration
    parsed["resolution_duration_minutes"] = resolution_duration
    parsed["response_sla_breached"] = response_breached
    parsed["resolution_sla_breached"] = resolution_breached
    parsed["sla_breached"] = sla_breached
    return parsed


def load_tickets(path: str | Path) -> list[dict[str, Any]]:
    """Load tickets from a JSON array/object or a CSV file."""
    source = Path(path)
    if source.suffix.lower() == ".csv":
        with source.open(newline="", encoding="utf-8") as file:
            return list(csv.DictReader(file))

    with source.open(encoding="utf-8") as file:
        data = json.load(file)
    if isinstance(data, list):
        tickets = data
    elif isinstance(data, dict) and isinstance(data.get("tickets"), list):
        tickets = data["tickets"]
    else:
        raise ValueError("JSON input must be an array or an object containing a 'tickets' array")
    if not all(isinstance(ticket, dict) for ticket in tickets):
        raise ValueError("each ticket must be a JSON object")
    return tickets


def parse_export(path: str | Path) -> list[dict[str, Any]]:
    """Load and normalize every ticket in an export."""
    return [parse_ticket(ticket) for ticket in load_tickets(path)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse an ITSM ticket export and calculate SLA metrics.")
    parser.add_argument("input", help="Path to a JSON or CSV ticket export")
    args = parser.parse_args()
    try:
        tickets = parse_export(args.input)
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
        parser.error(str(error))
    print(json.dumps(tickets, indent=2))


if __name__ == "__main__":
    main()
