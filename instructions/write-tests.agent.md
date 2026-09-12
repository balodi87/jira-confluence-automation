---
description: "Guidelines for writing robust unit and integration tests with pytest"
---

# Write Tests Workflow

## Standards & Constraints
- **Framework**: Use `pytest` conventions (`test_*.py` naming and `assert` statements).
- **Structure**: Follow the AAA pattern (Arrange, Act, Assert) within each test case.
- **Fixtures**: Use modular `pytest.fixture` functions for setup/teardown; avoid duplicate fixture logic.
- **Coverage**: Cover happy paths, boundary edge cases, and expected exception raising (`pytest.raises`).
- **Isolation**: Mock external network calls, file system side-effects, and database calls using `unittest.mock` or `pytest-mock`.
