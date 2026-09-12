# Module 10 Completion Report

## Instruction Files
instructions/create-function.agent.md
instructions/create-status-report.agent.md
instructions/creating-instructions.agent.md
instructions/main.agent.md
instructions/setup-project.agent.md
instructions/write-tests.agent.md

## main.agent.md Contents
# Instruction Catalog

- [create-status-report.agent.md](instructions/create-status-report.agent.md) — Weekly status report with fixed sections and format
- [create-function.agent.md](instructions/create-function.agent.md) — Guidelines for writing clean, typed, and documented Python functions
- [write-tests.agent.md](instructions/write-tests.agent.md) — Guidelines for writing robust unit and integration tests with pytest
- [setup-project.agent.md](instructions/setup-project.agent.md) — Guidelines for scaffolding new Python projects, virtual environments, and configs
- [creating-instructions.agent.md](instructions/creating-instructions.agent.md) — Standards and best practices for authoring instruction files
- [write-meeting-notes.agent.md](instructions/write-meeting-notes.agent.md) — Meeting summary with action items and owners
- [generate-jira-query.agent.md](instructions/generate-jira-query.agent.md) — JQL queries for common reporting scenarios

## Sample Instruction
- File: instructions/create-status-report.agent.md
- Contents:
---
description: "Generate concise, executive weekly status reports in Markdown"
---

# Weekly Status Report Generator

## Output Requirements
- **Format**: Markdown (`.md`)
- **Tone**: Professional, executive, and action-oriented. Eliminate all fluff, filler words, and subjective adjectives.
- **Structure**: Bullet points only under each section. No introductory or concluding conversational prose.
- **Length Constraint**: Strictly maximum 20 lines total.

## Required Sections
1. `## Accomplishments`
   - Key deliverables, resolved incidents, and deployments completed during the week.
2. `## Blockers`
   - Active impediments, critical dependencies, or escalations requiring intervention with owner and impact.
3. `## Next Week`
   - High-priority planned objectives and target milestones for the upcoming week.
