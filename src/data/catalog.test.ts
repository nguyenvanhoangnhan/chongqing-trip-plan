import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { GiftCatalogSchema, type GiftCatalog } from "@/domain/gifts";

// The catalog is trip research that the repository does not carry. Run
// `npm run catalog:pull` to check the real thing; without it there is nothing
// to check and the suite says so instead of failing.
const PULLED = "tmp/catalog.json";
const pulled = existsSync(PULLED);
const giftCatalog = (
  pulled ? JSON.parse(readFileSync(PULLED, "utf8")) : { gifts: [], locations: [] }
) as GiftCatalog;

describe.skipIf(!pulled)("gift catalog", () => {
  it("matches the canonical catalog schema", () => {
    expect(() => GiftCatalogSchema.parse(giftCatalog)).not.toThrow();
  });

  it("groups every gift under its own category, losing none", async () => {
    const { groupGiftsByCategory } = await import("@/data/catalog");
    const groups = groupGiftsByCategory(giftCatalog.gifts);

    for (const [category, gifts] of Object.entries(groups)) {
      expect(gifts.every((gift) => gift.category === category)).toBe(true);
    }

    // Grouping reorders by category, so compare the sets rather than the order.
    expect(
      Object.values(groups)
        .flatMap((gifts) => gifts.map(({ id }) => id))
        .sort(),
    ).toEqual(giftCatalog.gifts.map(({ id }) => id).sort());
  });

  it("uses a generic city-center reference instead of a place of stay", () => {
    expect(giftCatalog.context.homeBase.nameZh).toBe("重庆市中心");
    expect(giftCatalog.locations.some((location) => location.nearRaffles)).toBe(
      true,
    );
  });

  it("publishes only a sample shopping plan", () => {
    expect(
      giftCatalog.locations.every((location) => location.visitPlan.inItinerary),
    ).toBe(true);
    expect(
      giftCatalog.locations.some(
        (location) => location.visitPlan.dedicatedShoppingStop,
      ),
    ).toBe(true);

    const publicPlanningData = JSON.stringify({
      context: giftCatalog.context,
      locations: giftCatalog.locations,
    });

    // The plan is a sample, so it must not carry the real trip: no travel
    // dates, no clock times, and no reference to where anyone stayed.
    expect(publicPlanningData).not.toMatch(/(?:29|30|31)\/8|1\/9/);
    expect(publicPlanningData).not.toMatch(/\b\d{1,2}:\d{2}\b/);
    expect(publicPlanningData).not.toMatch(/khách sạn|hotel|lưu trú/i);
  });

  it("gives every stop a label short enough for an itinerary chip", () => {
    for (const location of giftCatalog.locations) {
      expect(location.tagVi.length).toBeGreaterThan(0);
      expect(location.tagVi.length).toBeLessThanOrEqual(24);
    }
  });

  it("offers a broad mix of Chongqing and general Chinese gifts", () => {
    expect(giftCatalog.gifts.length).toBeGreaterThanOrEqual(82);
    expect(giftCatalog.gifts.length).toBeLessThanOrEqual(84);

    const categoryCounts = new Map<string, number>();
    for (const gift of giftCatalog.gifts) {
      categoryCounts.set(
        gift.category,
        (categoryCounts.get(gift.category) ?? 0) + 1,
      );
    }

    for (const category of [
      "tea",
      "craft",
      "stationery",
      "souvenir",
      "homeware",
    ]) {
      expect(categoryCounts.get(category)).toBeGreaterThanOrEqual(5);
    }

    expect(categoryCounts.get("decor")).toBeGreaterThanOrEqual(6);

    expect(
      giftCatalog.gifts.filter((gift) => gift.localRelevance === "signature")
        .length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      giftCatalog.gifts.filter((gift) => gift.localRelevance === "cultural")
        .length,
    ).toBeGreaterThanOrEqual(20);
    expect(giftCatalog.gifts.every((gift) => gift.sources.length > 0)).toBe(
      true,
    );
  });

  it("models every card as one concrete, priced SKU", () => {
    for (const gift of giftCatalog.gifts) {
      expect(gift.brand).toBeTruthy();
      expect(gift.variantVi).toBeTruthy();
      expect(gift.packVi).toBeTruthy();
      expect(gift.sku).toBeTruthy();
      expect(gift.priceCny).toBeGreaterThan(0);
      expect(gift.priceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new URL(gift.priceSourceUrl)).not.toThrow();
    }
  });

  it("serves one to four authenticated product images with source credit for every SKU", () => {
    for (const gift of giftCatalog.gifts) {
      expect(gift.images.length).toBeGreaterThanOrEqual(1);
      expect(gift.images.length).toBeLessThanOrEqual(4);

      for (const image of gift.images) {
        expect(image.src).toMatch(
          /^\/api\/gift-images\/[a-z0-9-]+\.webp$/,
        );
        expect(image.altVi).toBeTruthy();
        expect(() => new URL(image.sourceUrl)).not.toThrow();
      }
    }
  });

  it("does not embed per-image payloads in the public catalog", () => {
    for (const gift of giftCatalog.gifts) {
      for (const image of gift.images) {
        expect(image).not.toHaveProperty("blurDataUrl");
      }
    }
  });

  it("never reuses the same image file across gifts or within a gift", () => {
    const owners = new Map<string, string>();

    for (const gift of giftCatalog.gifts) {
      const seenInGift = new Set<string>();

      for (const image of gift.images) {
        expect(seenInGift.has(image.src)).toBe(false);
        seenInGift.add(image.src);

        expect(owners.get(image.src) ?? gift.id).toBe(gift.id);
        owners.set(image.src, gift.id);
      }
    }
  });

  it("keeps the budget individual and current", () => {
    expect(giftCatalog.metadata.budget).toMatchObject({
      minVnd: 1_500_000,
      maxVnd: 2_000_000,
    });
    expect(giftCatalog.metadata.exchangeRates.rates).toMatchObject({
      CNY: 1,
      VND: 3_860,
      JPY: 23.65,
    });
  });
});
