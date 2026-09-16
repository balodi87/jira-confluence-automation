#!/usr/bin/env python3
"""Bulk-validate Markdown files in a directory against validation-rules.md checks.

Checks applied to every *.md file found:
  1. No trailing whitespace on any line.
  2. Heading hierarchy does not skip levels (e.g. H1 -> H3).
  3. Internal Markdown links point to files that exist on disk.
  4. File is non-empty and ends with exactly one trailing newline.
"""
import argparse
import re
import sys
from pathlib import Path

HEADING_RE = re.compile(r"^(#{1,6})\s+\S")
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def check_trailing_whitespace(lines: list[str]) -> list[str]:
    return [f"line {i}: trailing whitespace" for i, line in enumerate(lines, 1) if line != line.rstrip()]


def check_heading_hierarchy(lines: list[str]) -> list[str]:
    issues = []
    last_level = 0
    for i, line in enumerate(lines, 1):
        match = HEADING_RE.match(line)
        if not match:
            continue
        level = len(match.group(1))
        if last_level and level > last_level + 1:
            issues.append(f"line {i}: heading level jumps from H{last_level} to H{level}")
        last_level = level
    return issues


def check_internal_links(lines: list[str], file_path: Path, root: Path) -> list[str]:
    issues = []
    for i, line in enumerate(lines, 1):
        for target in LINK_RE.findall(line):
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            target_path = (file_path.parent / target).resolve()
            if not target_path.exists() and not (root / target).resolve().exists():
                issues.append(f"line {i}: broken link -> {target}")
    return issues


def check_file_termination(raw: bytes) -> list[str]:
    if not raw:
        return ["file is empty"]
    if not raw.endswith(b"\n"):
        return ["file does not end with a trailing newline"]
    if raw.endswith(b"\n\n"):
        return ["file ends with multiple trailing newlines"]
    return []


def validate_file(file_path: Path, root: Path) -> list[str]:
    raw = file_path.read_bytes()
    text = raw.decode("utf-8", errors="replace")
    lines = text.splitlines()

    issues = []
    issues += check_trailing_whitespace(lines)
    issues += check_heading_hierarchy(lines)
    issues += check_internal_links(lines, file_path, root)
    issues += check_file_termination(raw)
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dir", default="instructions", help="Directory to scan for .md files (default: instructions)")
    parser.add_argument("--ext", default=".md", help="File extension to match, e.g. .md or .agent.md (default: .md)")
    args = parser.parse_args()

    root = Path.cwd()
    target_dir = root / args.dir
    files = sorted(p for p in target_dir.rglob(f"*{args.ext}") if p.is_file())

    total_issues = 0
    for file_path in files:
        issues = validate_file(file_path, root)
        rel = file_path.relative_to(root)
        if issues:
            print(f"FAIL {rel}")
            for issue in issues:
                print(f"  - {issue}")
            total_issues += len(issues)
        else:
            print(f"PASS {rel}")

    print(f"\n{len(files)} file(s) checked, {total_issues} issue(s) found.")
    return 1 if total_issues else 0


if __name__ == "__main__":
    sys.exit(main())
