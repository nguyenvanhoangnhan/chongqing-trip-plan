import { z } from "zod";

const LocalizedNameSchema = z.object({
  vi: z.string().min(1),
  zh: z.string().min(1),
  pinyin: z.string().min(1),
});

const SourceUrlSchema = z.string().url();

export const ShoppingLocationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  itineraryOrder: z.number().int().positive(),
  name: LocalizedNameSchema,
  tagVi: z.string().min(1).max(24),
  type: z.enum(["mall", "supermarket", "shopping-street", "heritage-area"]),
  nearRaffles: z.boolean(),
  distanceKm: z.number().min(0),
  travelMinutes: z.object({
    min: z.number().int().min(0),
    max: z.number().int().min(0),
  }),
  bestForVi: z.string().min(1),
  mapQuery: z.string().min(1),
  verificationNoteVi: z.string().min(1),
  visitPlan: z.object({
    inItinerary: z.boolean(),
    dateVi: z.string().min(1),
    dedicatedShoppingStop: z.boolean(),
    itineraryNoteVi: z.string().min(1),
  }),
  sources: z.array(SourceUrlSchema).min(1),
});

export const GiftImageSchema = z.object({
  src: z.string().regex(/^\/api\/gift-images\/[a-z0-9-]+\.webp$/),
  altVi: z.string().min(1),
  sourceUrl: SourceUrlSchema,
});

export const GiftSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: LocalizedNameSchema,
  brand: z.string().min(1),
  variantVi: z.string().min(1),
  packVi: z.string().min(1),
  sku: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum([
    "food",
    "tea",
    "craft",
    "stationery",
    "souvenir",
    "homeware",
    "decor",
  ]),
  priceCny: z.number().positive(),
  priceCheckedAt: z.string().date(),
  priceSourceUrl: SourceUrlSchema,
  images: z.array(GiftImageSchema).min(1).max(4),
  recipientsVi: z.array(z.string().min(1)).min(1),
  priority: z.enum(["high", "medium", "low"]),
  localRelevance: z.enum(["signature", "regional", "cultural"]),
  whyBuyVi: z.string().min(1),
  askInChinese: z.string().min(1),
  portability: z.enum(["easy", "medium", "difficult"]),
  customs: z.object({
    level: z.enum(["low", "caution", "avoid"]),
    noteVi: z.string().min(1),
  }),
  nearRaffles: z.boolean(),
  purchaseLocationIds: z.array(z.string().min(1)).min(1),
  buyingTipsVi: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)),
  sources: z.array(SourceUrlSchema).min(1),
});

export const GiftCatalogSchema = z
  .object({
    schemaVersion: z.literal(2),
    metadata: z.object({
      updatedAt: z.string().date(),
      exchangeRates: z.object({
        baseCurrency: z.literal("CNY"),
        rates: z.object({
          CNY: z.literal(1),
          VND: z.number().positive(),
          JPY: z.number().positive(),
        }),
        referenceDate: z.string().date(),
        noteVi: z.string().min(1),
      }),
      budget: z.object({
        minVnd: z.literal(1_500_000),
        maxVnd: z.literal(2_000_000),
        noteVi: z.string().min(1),
      }),
    }),
    context: z.object({
      homeBase: z.object({
        name: z.string().min(1),
        nameZh: z.string().min(1),
        district: z.string().min(1),
        mapQuery: z.string().min(1),
      }),
      shoppingStrategyVi: z.array(z.string().min(1)).min(1),
      verificationNoteVi: z.string().min(1),
    }),
    locations: z.array(ShoppingLocationSchema).min(1),
    gifts: z.array(GiftSchema).min(1),
  })
  .superRefine((catalog, context) => {
    const locationIds = new Set(
      catalog.locations.map((location) => location.id),
    );
    const giftIds = new Set<string>();
    const imageOwners = new Map<string, string>();

    for (const gift of catalog.gifts) {
      if (giftIds.has(gift.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate gift id: ${gift.id}`,
          path: ["gifts", gift.id],
        });
      }
      giftIds.add(gift.id);

      for (const image of gift.images) {
        const owner = imageOwners.get(image.src);

        if (owner) {
          context.addIssue({
            code: "custom",
            message: `Image ${image.src} is already used by ${owner}`,
            path: ["gifts", gift.id, "images"],
          });
        }

        imageOwners.set(image.src, gift.id);
      }

      for (const locationId of gift.purchaseLocationIds) {
        if (!locationIds.has(locationId)) {
          context.addIssue({
            code: "custom",
            message: `Gift ${gift.id} references unknown location ${locationId}`,
            path: ["gifts", gift.id, "purchaseLocationIds"],
          });
        }
      }
    }
  });

export type Gift = z.infer<typeof GiftSchema>;
export type GiftImage = z.infer<typeof GiftImageSchema>;
export type GiftCatalog = z.infer<typeof GiftCatalogSchema>;
export type ShoppingLocation = z.infer<typeof ShoppingLocationSchema>;
