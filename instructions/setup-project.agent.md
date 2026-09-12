---
description: "Guidelines for scaffolding new Python projects, virtual environments, and configs"
---

# Setup Project Workflow

## Standards & Constraints
- **Virtual Environment**: Initialize a dedicated virtual environment (`python3 -m venv .venv`).
- **Dependency Management**: Define dependencies with explicit version bounds in `requirements.txt` or `pyproject.toml`.
- **Ignore Rules**: Always scaffold a standard `.gitignore` covering `.venv/`, `__pycache__/`, `.pytest_cache/`, and `.DS_Store`.
- **Project Structure**: Follow standard layout (`src/`, `tests/`, `docs/`, `README.md`).
- **Validation**: Verify interpreter path and package installations before starting implementation.
