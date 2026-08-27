import catalogContext from "../../data/catalog/context.json";
import catalogMetadata from "../../data/catalog/metadata.json";
import shoppingLocations from "../../data/catalog/locations.json";
import craftGifts from "../../data/catalog/gifts/craft.json";
import decorGifts from "../../data/catalog/gifts/decor.json";
import foodGifts from "../../data/catalog/gifts/food.json";
import homewareGifts from "../../data/catalog/gifts/homeware.json";
import souvenirGifts from "../../data/catalog/gifts/souvenir.json";
import stationeryGifts from "../../data/catalog/gifts/stationery.json";
import teaGifts from "../../data/catalog/gifts/tea.json";

import {
  GiftCatalogSchema,
  GiftSchema,
  type Gift,
} from "@/domain/gifts";

type GiftCategory = Gift["category"];

function parseGiftGroup(
  category: GiftCategory,
  input: unknown,
): readonly Gift[] {
  const gifts = GiftSchema.array().parse(input);
  const misplacedGift = gifts.find((gift) => gift.category !== category);

  if (misplacedGift) {
    throw new Error(
      `Gift ${misplacedGift.id} belongs to ${misplacedGift.category}, not ${category}`,
    );
  }

  return gifts;
}

export const giftGroups = {
  food: parseGiftGroup("food", foodGifts),
  tea: parseGiftGroup("tea", teaGifts),
  craft: parseGiftGroup("craft", craftGifts),
  stationery: parseGiftGroup("stationery", stationeryGifts),
  souvenir: parseGiftGroup("souvenir", souvenirGifts),
  homeware: parseGiftGroup("homeware", homewareGifts),
  decor: parseGiftGroup("decor", decorGifts),
} satisfies Record<GiftCategory, readonly Gift[]>;

export const giftCatalog = GiftCatalogSchema.parse({
  schemaVersion: 2,
  metadata: catalogMetadata,
  context: catalogContext,
  locations: shoppingLocations,
  gifts: Object.values(giftGroups).flat(),
});
