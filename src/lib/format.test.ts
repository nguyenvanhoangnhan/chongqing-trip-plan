import { describe, expect, it } from "vitest";

import { formatCnyInCurrency } from "@/lib/format";

const rates = {
  CNY: 1,
  VND: 3_860,
  JPY: 23.65,
} as const;

describe("formatCnyInCurrency", () => {
  it("keeps a concrete CNY price exact", () => {
    expect(formatCnyInCurrency(17.73, "CNY", rates)).toBe("¥17.73");
  });

  it("marks converted VND and JPY prices as estimates", () => {
    expect(formatCnyInCurrency(17.73, "VND", rates)).toBe("≈ 68.438 ₫");
    expect(formatCnyInCurrency(17.73, "JPY", rates)).toBe("≈ 419 JPY");
  });
});
