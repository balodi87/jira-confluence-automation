# Validation Rules

Checks to run against files in this workspace before considering a change complete.

1. **Required sections present** — Markdown docs (e.g. `walkthrough.md`, reports) must contain a `## Summary` section and, where applicable, a `## Quiz` section. Flag any file missing either heading.
2. **No broken internal links/paths** — Any relative link or file path referenced in a `.md` file (images, other docs, scripts) must resolve to an existing file in the workspace.
3. **Consistent heading hierarchy** — Markdown files must not skip heading levels (e.g. `#` directly to `###`) and should have exactly one top-level `#` title.
4. **No trailing whitespace or tabs/spaces mixing** — Source files (`.py`, `.md`, `.txt`) must not contain trailing whitespace on lines, and indentation within a single file must be consistent (all spaces or all tabs).
5. **Python files parse and lint cleanly** — `.py` files must have valid syntax (no `SyntaxError`) and must not contain bare `except:` clauses or unused imports.
6. **Non-empty, terminated files** — Every file must end with a single trailing newline and must not be empty (0 bytes) unless intentionally a placeholder.
