---
description: "Guidelines for writing clean, typed, and documented Python functions"
---

# Create Function Workflow

## Standards & Constraints
- **Type Annotations**: Include type hints for all parameters and return types (`def func(x: int) -> bool:`).
- **Docstrings**: Provide Google-style or PEP 257 docstrings detailing purpose, `Args`, `Returns`, and `Raises`.
- **Single Responsibility**: Keep functions focused on a single task; limit Cyclomatic Complexity ($\le 5$).
- **Pure Functions**: Favor deterministic functions without hidden side effects.
- **Error Handling**: Use explicit, custom exceptions rather than bare `except Exception:`.
