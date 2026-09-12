---
description: "Guidelines and best practices for creating effective agent instruction files"
---

# Instruction File Creation Guide

## Purpose
This document specifies standard formats, naming conventions, and structural rules for authoring reusable agent instruction files within the `instructions/` directory.

## Core Rules & Conventions
- **File Naming**: Use kebab-case with the `.agent.md` suffix (e.g., `feature-name.agent.md`).
- **YAML Frontmatter**: Include an optional concise `description` header summarizing the instruction's purpose.
- **Output Constraints**: Define explicit, unambiguous constraints (e.g., Markdown format, exact line/item counts rather than loose ranges, required headers, bullet points).
- **Exact Quantity Specification**: Avoid open ranges (e.g., use "Exactly 5 questions" instead of "3–5 questions") to guarantee deterministic output length.
- **Tone & Style**: Specify clear tone guidelines (e.g., professional, objective, no conversational filler).
- **Catalog Registration**: Register every new instruction file in [instructions/main.agent.md](instructions/main.agent.md).
