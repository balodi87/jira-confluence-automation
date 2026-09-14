"""Calculate compound interest from command-line inputs."""

import argparse


def calculate_compound_interest(
    principal: float,
    annual_rate: float,
    compounds_per_year: int,
    years: float,
) -> tuple[float, float]:
    """Return the final amount and interest earned."""
    final_amount = principal * (1 + annual_rate / compounds_per_year) ** (
        compounds_per_year * years
    )
    interest_earned = final_amount - principal
    return final_amount, interest_earned


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate compound interest. Annual rate is a decimal fraction."
    )
    parser.add_argument("principal", type=float, help="Initial principal amount")
    parser.add_argument(
        "annual_rate", type=float, help="Annual interest rate (for example, 0.05 for 5%)"
    )
    parser.add_argument(
        "compounds_per_year", type=int, help="Number of times interest compounds per year"
    )
    parser.add_argument("years", type=float, help="Total number of years")
    args = parser.parse_args()

    if args.principal < 0:
        parser.error("principal must be non-negative")
    if args.annual_rate < 0:
        parser.error("annual_rate must be non-negative")
    if args.compounds_per_year <= 0:
        parser.error("compounds_per_year must be greater than zero")
    if args.years < 0:
        parser.error("years must be non-negative")

    final_amount, interest_earned = calculate_compound_interest(
        args.principal,
        args.annual_rate,
        args.compounds_per_year,
        args.years,
    )
    print(f"Final amount: ${final_amount:,.2f}")
    print(f"Interest earned: ${interest_earned:,.2f}")


if __name__ == "__main__":
    main()
