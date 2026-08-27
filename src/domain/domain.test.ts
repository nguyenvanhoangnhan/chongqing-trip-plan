import { describe, expect, it } from "vitest";

import { calculateBudgetVnd, getBudgetState } from "@/domain/selections";
describe("individual budgets", () => {
  const entries = [
    { giftId: "tea", quantity: 2, unitPriceCny: 50, note: "" },
    { giftId: "fan", quantity: 1, unitPriceCny: 100, note: "" },
  ];

  it("calculates a single person's estimated VND total", () => {
    expect(calculateBudgetVnd(entries, 3_500)).toBe(700_000);
  });

  it("classifies the total against the personal target band", () => {
    expect(getBudgetState(1_200_000)).toBe("below");
    expect(getBudgetState(1_500_000)).toBe("within");
    expect(getBudgetState(2_000_000)).toBe("within");
    expect(getBudgetState(2_000_001)).toBe("above");
  });
});
