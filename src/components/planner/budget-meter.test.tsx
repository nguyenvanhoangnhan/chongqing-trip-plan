import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BudgetMeter } from "@/components/planner/budget-meter";

describe("BudgetMeter", () => {
  const exchangeRates = { CNY: 1, VND: 3_860, JPY: 23.65 } as const;

  it("shows an individual's progress inside the target band", () => {
    render(
      <BudgetMeter
        totalCny={1_750_000 / exchangeRates.VND}
        exchangeRates={exchangeRates}
        currency="VND"
      />,
    );

    expect(screen.getByText("Trong ngân sách")).toBeInTheDocument();
    expect(screen.getByText("≈ 1.750.000 ₫")).toBeInTheDocument();
  });

  it("labels a total above the personal maximum", () => {
    render(
      <BudgetMeter
        totalCny={2_100_000 / exchangeRates.VND}
        exchangeRates={exchangeRates}
        currency="JPY"
      />,
    );

    expect(screen.getByText("Vượt ngân sách")).toBeInTheDocument();
    expect(screen.getByText(/JPY$/)).toBeInTheDocument();
  });
});
