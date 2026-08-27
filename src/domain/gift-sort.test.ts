import { describe, expect, it } from "vitest";

import { sortGifts } from "@/domain/gift-sort";

const gifts = [
  { id: "medium", priceCny: 50, priority: "medium" as const },
  { id: "high", priceCny: 80, priority: "high" as const },
  { id: "low", priceCny: 20, priority: "low" as const },
];

describe("sortGifts", () => {
  it("sorts prices in both directions", () => {
    expect(sortGifts(gifts, "price-asc").map((gift) => gift.id)).toEqual([
      "low",
      "medium",
      "high",
    ]);
    expect(sortGifts(gifts, "price-desc").map((gift) => gift.id)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });

  it("puts recommended gifts first", () => {
    expect(sortGifts(gifts, "priority").map((gift) => gift.id)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });

  it("preserves catalog order by default", () => {
    expect(sortGifts(gifts, "default").map((gift) => gift.id)).toEqual([
      "medium",
      "high",
      "low",
    ]);
  });
});
