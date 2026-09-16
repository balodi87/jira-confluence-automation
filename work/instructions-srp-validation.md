# Instructions SRP Validation Results

Reviewed per [instructions/validate-instructions.agent.md](../instructions/validate-instructions.agent.md), Approach 2 (Iterative Reread).

| File | Verdict | Notes |
|---|---|---|
| `calculate-compound-interest.agent.md` | Pass | Single concern: when/how to invoke the compound-interest script and how to present its output. |
| `create-function.agent.md` | Pass | Single concern: coding standards for writing one Python function (types, docstrings, complexity, purity, errors). |
| `create-quiz.agent.md` | Pass | Single concern: format/structure/tone rules for generating a multiple-choice quiz. |
| `create-status-report.agent.md` | Pass | Single concern: format and required sections for the weekly status report. |
| `creating-instructions.agent.md` | Pass | Single concern: conventions for authoring instruction files (naming, frontmatter, constraints, catalog registration all serve that one purpose). |
| `itsm_parser.agent.md` | Pass | Single concern: end-to-end usage of the ITSM parser tool (inputs, invocation, output interpretation). |
| `main.agent.md` | Pass | Single concern: catalog/index of instruction files. Note: not a workflow file, but its one responsibility (listing) is internally cohesive. |
| `setup-project.agent.md` | Pass | Single concern: standards for scaffolding a new Python project. |
| `write-tests.agent.md` | Pass | Single concern: standards for writing pytest unit/integration tests. |

**Result: 9/9 pass.** No SRP violations found — no refinement pass was needed.

## Secondary issue (outside SRP scope) — Resolved
`main.agent.md` linked to `write-meeting-notes.agent.md` and `generate-jira-query.agent.md`, neither of which existed in `instructions/`. Fixed by removing those two dead entries and registering the three previously-uncataloged files (`validate-instructions.agent.md`, `calculate-compound-interest.agent.md`, `itsm_parser.agent.md`) per the catalog registration rule in `creating-instructions.agent.md`.
