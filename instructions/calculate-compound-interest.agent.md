---
description: "Guidelines for calculating and presenting compound interest results"
---

# Calculate Compound Interest Workflow

## When to Use
- Use `tools/compound_interest.py` for compound-interest calculations when the principal, annual rate, compounding frequency, and investment period are known.
- Use it for repeatable command-line calculations rather than estimating or calculating the result manually.
- Treat the annual rate as a decimal fraction: `0.05` represents 5%.

## Invocation
- Run the script from the workspace root with four positional arguments in this order:
  ```text
  python3 tools/compound_interest.py PRINCIPAL ANNUAL_RATE COMPOUNDS_PER_YEAR YEARS
  ```
- Example for $1,000 at 5% annually, compounded monthly, for 10 years:
  ```text
  python3 tools/compound_interest.py 1000 0.05 12 10
  ```
- Principal, annual rate, and years must be non-negative. `COMPOUNDS_PER_YEAR` must be greater than zero.

## Presenting Results
- Report both values from the script output:
  - **Final amount**: the principal plus accumulated interest.
  - **Interest earned**: the final amount minus the original principal.
- Preserve the script's currency formatting and two decimal places.
- Keep the labels clear and distinguish the final amount from the interest earned.
