---
description: "Guidelines for validating instructions/ files against the Single Responsibility Principle"
---

# Validate Instructions Workflow

## Task Definition
- **Files**: Every `*.agent.md` file in `instructions/`.
- **Check**: Single Responsibility Principle (SRP) — each file must describe exactly one cohesive workflow or standard, not a mix of unrelated concerns.
- **Output**: A Markdown table with columns `File`, `Verdict` (Pass/Fail), and `Notes`, plus a short list of any secondary issues spotted (e.g., broken references) that are outside the SRP check itself.

## Approach
This is Approach 2 (Iterative Reread): SRP compliance is a judgment call about topic cohesion, not a mechanical rule, so each file is reread individually rather than checked by a fixed script.

## Iterative Review Prompt
For each file in `instructions/*.agent.md`, in turn:
1. Read the file's frontmatter `description` and body.
2. Identify every distinct concern/topic addressed in the body.
3. Decide: do all concerns serve one single, cohesive responsibility (e.g., "how to use tool X", "standards for producing artifact Y")?
   - **Pass**: All content supports one responsibility.
   - **Fail**: The file mixes two or more unrelated responsibilities that should be split into separate files.
4. Record the verdict and a one-line justification.
5. Move to the next file.

## Refinement Rule
If a file fails, note which parts should move to a new/existing file, then re-run the review on the affected files until all pass or the split is documented as a follow-up task.
