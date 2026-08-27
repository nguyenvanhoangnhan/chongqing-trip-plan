import type { Gift } from "@/domain/gifts";

export type GiftSort = "default" | "price-asc" | "price-desc" | "priority";

const priorityOrder: Record<Gift["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortGifts<
  T extends Pick<Gift, "priceCny" | "priority">,
>(gifts: readonly T[], sort: GiftSort): T[] {
  const sorted = [...gifts];

  if (sort === "price-asc") {
    return sorted.sort((left, right) => left.priceCny - right.priceCny);
  }

  if (sort === "price-desc") {
    return sorted.sort((left, right) => right.priceCny - left.priceCny);
  }

  if (sort === "priority") {
    return sorted.sort(
      (left, right) =>
        priorityOrder[left.priority] - priorityOrder[right.priority],
    );
  }

  return sorted;
}
