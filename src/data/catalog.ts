import { GiftSchema, type Gift } from "@/domain/gifts";

type GiftCategory = Gift["category"];

const CATEGORIES = [
  "food",
  "tea",
  "craft",
  "stationery",
  "souvenir",
  "homeware",
  "decor",
] as const satisfies readonly GiftCategory[];

export type GiftGroups = Record<GiftCategory, readonly Gift[]>;

/**
 * The catalog itself is trip research and lives only in Blob. This groups a
 * catalog's gifts the way the planner reads them, and refuses a gift filed
 * under a category the planner does not show.
 */
export function groupGiftsByCategory(input: readonly unknown[]): GiftGroups {
  const gifts = GiftSchema.array().parse(input);
  const grouped = {} as { [K in GiftCategory]: Gift[] };

  for (const category of CATEGORIES) {
    grouped[category] = [];
  }

  for (const gift of gifts) {
    grouped[gift.category].push(gift);
  }

  return grouped;
}
