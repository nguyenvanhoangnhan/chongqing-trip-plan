import type { GiftCatalog } from "@/domain/gifts";

/**
 * A fictional catalog for component tests. The real one is trip research and
 * lives only in Blob, so nothing here names a real product, shop, price or
 * source. The integrity suite checks the real thing separately.
 */
export const CATALOG_FIXTURE = {
  "schemaVersion": 2,
  "metadata": {
    "updatedAt": "2035-01-01",
    "exchangeRates": {
      "baseCurrency": "CNY",
      "rates": {
        "CNY": 1,
        "VND": 3500,
        "JPY": 21
      },
      "referenceDate": "2035-01-01",
      "noteVi": "Tỷ giá mẫu."
    },
    "budget": {
      "minVnd": 1500000,
      "maxVnd": 2000000,
      "noteVi": "Ngân sách mẫu."
    }
  },
  "context": {
    "homeBase": {
      "name": "Fictional reference area",
      "nameZh": "示例市中心",
      "district": "Fictional district",
      "mapQuery": "示例市中心"
    },
    "shoppingStrategyVi": [
      "Lịch mua sắm mẫu."
    ],
    "verificationNoteVi": "Dữ liệu mẫu."
  },
  "locations": [
    {
      "id": "fictional-location-1",
      "itineraryOrder": 1,
      "name": {
        "vi": "Điểm mua 1",
        "zh": "示例商场1",
        "pinyin": "Shìlì shāngchǎng 1"
      },
      "tagVi": "Điểm 1",
      "type": "mall",
      "nearRaffles": true,
      "distanceKm": 1,
      "travelMinutes": {
        "min": 5,
        "max": 10
      },
      "bestForVi": "Hạng mục 1",
      "mapQuery": "示例商场1",
      "verificationNoteVi": "Kiểm lại điểm 1 trước khi đi.",
      "visitPlan": {
        "inItinerary": true,
        "dateVi": "Ngày 1",
        "dedicatedShoppingStop": false,
        "itineraryNoteVi": "Ghi chú lịch trình 1."
      },
      "sources": [
        "https://example.com/fictional-source"
      ]
    },
    {
      "id": "fictional-location-2",
      "itineraryOrder": 2,
      "name": {
        "vi": "Điểm mua 2",
        "zh": "示例商场2",
        "pinyin": "Shìlì shāngchǎng 2"
      },
      "tagVi": "Điểm 2",
      "type": "supermarket",
      "nearRaffles": true,
      "distanceKm": 2,
      "travelMinutes": {
        "min": 10,
        "max": 20
      },
      "bestForVi": "Hạng mục 2",
      "mapQuery": "示例商场2",
      "verificationNoteVi": "Kiểm lại điểm 2 trước khi đi.",
      "visitPlan": {
        "inItinerary": true,
        "dateVi": "Ngày 2",
        "dedicatedShoppingStop": false,
        "itineraryNoteVi": "Ghi chú lịch trình 2."
      },
      "sources": [
        "https://example.com/fictional-source"
      ]
    },
    {
      "id": "fictional-location-3",
      "itineraryOrder": 3,
      "name": {
        "vi": "Điểm mua 3",
        "zh": "示例商场3",
        "pinyin": "Shìlì shāngchǎng 3"
      },
      "tagVi": "Điểm 3",
      "type": "shopping-street",
      "nearRaffles": false,
      "distanceKm": 3,
      "travelMinutes": {
        "min": 15,
        "max": 30
      },
      "bestForVi": "Hạng mục 3",
      "mapQuery": "示例商场3",
      "verificationNoteVi": "Kiểm lại điểm 3 trước khi đi.",
      "visitPlan": {
        "inItinerary": false,
        "dateVi": "Ngày 3",
        "dedicatedShoppingStop": true,
        "itineraryNoteVi": "Ghi chú lịch trình 3."
      },
      "sources": [
        "https://example.com/fictional-source"
      ]
    }
  ],
  "gifts": [
    {
      "id": "fictional-gift-1",
      "name": {
        "vi": "Món quà 1",
        "zh": "礼物1",
        "pinyin": "Lǐwù 1"
      },
      "brand": "Fictional Brand 1",
      "variantVi": "Biến thể 1",
      "packVi": "Gói 1",
      "sku": "fictional-gift-1",
      "category": "food",
      "priceCny": 11,
      "priceCheckedAt": "2035-01-01",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-1.webp",
          "altVi": "Ảnh món quà 1",
          "sourceUrl": "https://example.com/fictional-image.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 1"
      ],
      "priority": "high",
      "localRelevance": "signature",
      "whyBuyVi": "Lý do mua món quà 1.",
      "askInChinese": "请问有礼物1吗？",
      "portability": "easy",
      "customs": {
        "level": "low",
        "noteVi": "Ghi chú hải quan 1."
      },
      "nearRaffles": true,
      "purchaseLocationIds": [
        "fictional-location-1"
      ],
      "buyingTipsVi": [
        "Mẹo mua 1."
      ],
      "tags": [
        "the-loai-1"
      ],
      "sources": [
        "https://example.com/fictional-source"
      ]
    },
    {
      "id": "fictional-gift-2",
      "name": {
        "vi": "Món quà 2",
        "zh": "礼物2",
        "pinyin": "Lǐwù 2"
      },
      "brand": "Fictional Brand 2",
      "variantVi": "Biến thể 2",
      "packVi": "Gói 2",
      "sku": "fictional-gift-2",
      "category": "tea",
      "priceCny": 12,
      "priceCheckedAt": "2035-01-02",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-2.webp",
          "altVi": "Ảnh món quà 2",
          "sourceUrl": "https://example.com/fictional-image.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 2"
      ],
      "priority": "medium",
      "localRelevance": "regional",
      "whyBuyVi": "Lý do mua món quà 2.",
      "askInChinese": "请问有礼物2吗？",
      "portability": "medium",
      "customs": {
        "level": "caution",
        "noteVi": "Ghi chú hải quan 2."
      },
      "nearRaffles": true,
      "purchaseLocationIds": [
        "fictional-location-2"
      ],
      "buyingTipsVi": [
        "Mẹo mua 2."
      ],
      "tags": [
        "the-loai-2"
      ],
      "sources": [
        "https://example.com/fictional-source"
      ]
    },
    {
      "id": "fictional-gift-3",
      "name": {
        "vi": "Món quà 3",
        "zh": "礼物3",
        "pinyin": "Lǐwù 3"
      },
      "brand": "Fictional Brand 3",
      "variantVi": "Biến thể 3",
      "packVi": "Gói 3",
      "sku": "fictional-gift-3",
      "category": "craft",
      "priceCny": 13,
      "priceCheckedAt": "2035-01-03",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-3.webp",
          "altVi": "Ảnh món quà 3",
          "sourceUrl": "https://example.com/fictional-image.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 3"
      ],
      "priority": "low",
      "localRelevance": "cultural",
      "whyBuyVi": "Lý do mua món quà 3.",
      "askInChinese": "请问有礼物3吗？",
      "portability": "difficult",
      "customs": {
        "level": "avoid",
        "noteVi": "Ghi chú hải quan 3."
      },
      "nearRaffles": false,
      "purchaseLocationIds": [
        "fictional-location-3"
      ],
      "buyingTipsVi": [
        "Mẹo mua 3."
      ],
      "tags": [
        "the-loai-3"
      ],
      "sources": [
        "https://example.com/fictional-source"
      ]
    }
  ]
} as const satisfies GiftCatalog;
