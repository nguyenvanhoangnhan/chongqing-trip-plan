import type { GiftCatalog } from "@/domain/gifts";

/**
 * A fictional catalog for tests. The real one is private trip research and
 * lives only in Blob, so nothing here names a real product, shop or price.
 */
export const CATALOG_FIXTURE = {
  "schemaVersion": 2,
  "metadata": {
    "updatedAt": "2026-08-24",
    "exchangeRates": {
      "baseCurrency": "CNY",
      "rates": {
        "CNY": 1,
        "VND": 3860,
        "JPY": 23.65
      },
      "referenceDate": "2026-08-23",
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
      "name": "Central reference area",
      "nameZh": "重庆市中心",
      "district": "Yuzhong",
      "mapQuery": "重庆市中心"
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
      "distanceKm": 2,
      "travelMinutes": {
        "min": 15,
        "max": 25
      },
      "bestForVi": "Hạng mục 1",
      "mapQuery": "示例商场1",
      "verificationNoteVi": "Dữ liệu mẫu 1.",
      "visitPlan": {
        "inItinerary": true,
        "dateVi": "Ngày mẫu 1",
        "dedicatedShoppingStop": true,
        "itineraryNoteVi": "Gợi ý mẫu: ăn trưa, dạo khu quà địa phương và quay lại vào buổi mua riêng nếu còn thiếu món."
      },
      "sources": [
        "https://www.capitaland.com/cn/zh/shop/malls-listing/raffles-city-chongqi.html",
        "https://www.ichongqing.info/2023/11/01/raffles-city-chongqing/amp/"
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
      "type": "shopping-street",
      "nearRaffles": true,
      "distanceKm": 0.5,
      "travelMinutes": {
        "min": 5,
        "max": 10
      },
      "bestForVi": "Hạng mục 2",
      "mapQuery": "示例商场2",
      "verificationNoteVi": "Dữ liệu mẫu 2.",
      "visitPlan": {
        "inItinerary": true,
        "dateVi": "Ngày mẫu 2",
        "dedicatedShoppingStop": false,
        "itineraryNoteVi": "Gợi ý mẫu: ghé khi khám phá Giải Phóng Bi, rồi so giá tại siêu thị và các cửa hàng dọc Bát Nhất Lộ."
      },
      "sources": [
        "https://www.ichongqing.info/2020/11/04/visit-chongqings-most-famous-pedestrian-street-jfb-chongqing-travel-guide/",
        "https://scjgj.cq.gov.cn/zz/yzq/zwxx_146775/bmdt_146776/202602/t20260214_15446291.html"
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
      "type": "heritage-area",
      "nearRaffles": true,
      "distanceKm": 1,
      "travelMinutes": {
        "min": 10,
        "max": 20
      },
      "bestForVi": "Hạng mục 3",
      "mapQuery": "示例商场3",
      "verificationNoteVi": "Dữ liệu mẫu 3.",
      "visitPlan": {
        "inItinerary": true,
        "dateVi": "Ngày mẫu 3",
        "dedicatedShoppingStop": false,
        "itineraryNoteVi": "Gợi ý mẫu: ghé vào buổi tối, xem mẫu quà trước rồi đối chiếu giá ở điểm mua sắm khác."
      },
      "sources": [
        "https://whlyw.cq.gov.cn/zjwl/yzq/jqjd_1/202203/t20220304_10463056.html",
        "https://www.cq.gov.cn/ywdt/zwhd/bmdt/202512/t20251208_15218393.html"
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
      "priceCny": 11.82,
      "priceCheckedAt": "2026-08-24",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-1.webp",
          "altVi": "Ảnh món quà 1",
          "sourceUrl": "https://whole-product-image.smzdm.com/whole_product_picture/img14.360buyimg.com_pop_jfs_t1_336177_5_22756_130037_68fb452bF1160e250_e19cce488805ba52.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 1"
      ],
      "priority": "high",
      "localRelevance": "signature",
      "whyBuyVi": "Lý do mua món 1.",
      "askInChinese": "请问有桥头200克麻辣牛油火锅底料吗？",
      "portability": "easy",
      "customs": {
        "level": "caution",
        "noteVi": "Có dầu/bơ bò; bọc chống rò và ưu tiên hành lý ký gửi."
      },
      "nearRaffles": true,
      "purchaseLocationIds": [
        "fictional-location-1"
      ],
      "buyingTipsVi": [
        "Đối chiếu đúng thương hiệu, vị và khối lượng trên card.",
        "Giá trên card là giá tham khảo của đúng SKU tại ngày kiểm tra."
      ],
      "tags": [
        "cốt lẩu",
        "cay tê",
        "gói nhỏ"
      ],
      "sources": [
        "https://www.smzdm.com/ju/s8vjrxn/",
        "https://www.cq.gov.cn/ywdt/zwhd/bmdt/202504/t20250403_14479452.html"
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
      "priceCny": 38,
      "priceCheckedAt": "2026-08-24",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-2.webp",
          "altVi": "Ảnh món quà 2",
          "sourceUrl": "https://6839169.s21i.faiusr.com/2/ABUIABACGAAgxeLAwQYozaSR0QIwoAY4oAY.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 2"
      ],
      "priority": "high",
      "localRelevance": "signature",
      "whyBuyVi": "Lý do mua món 2.",
      "askInChinese": "请问有苗品记重庆沱茶02吗？",
      "portability": "easy",
      "customs": {
        "level": "low",
        "noteVi": "Sản phẩm khô, đóng gói thương mại; giữ nguyên nhãn và kiểm tra quy định hành lý trước chuyến bay."
      },
      "nearRaffles": true,
      "purchaseLocationIds": [
        "fictional-location-1"
      ],
      "buyingTipsVi": [
        "Đối chiếu đúng thương hiệu, vị và khối lượng trên card.",
        "Giá trên card là giá tham khảo của đúng SKU tại ngày kiểm tra."
      ],
      "tags": [
        "trà",
        "tuo cha",
        "nhẹ",
        "dễ mang"
      ],
      "sources": [
        "https://tsylt.com/h-pd-1916.html",
        "https://www.cq.gov.cn/ywdt/zwhd/bmdt/202504/t20250403_14479452.html"
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
      "priceCny": 148,
      "priceCheckedAt": "2026-08-24",
      "priceSourceUrl": "https://example.com/fictional-price",
      "images": [
        {
          "src": "/api/gift-images/fictional-gift-3.webp",
          "altVi": "Ảnh món quà 3",
          "sourceUrl": "https://6839169.s21i.faiusr.com/2/ABUIABACGAAgtd2H0gYo1MWnGTCgBjigBg.jpg"
        }
      ],
      "recipientsVi": [
        "Người nhận 3"
      ],
      "priority": "high",
      "localRelevance": "cultural",
      "whyBuyVi": "Lý do mua món 3.",
      "askInChinese": "请问有十七乘十七厘米的夏布吊脚楼小画吗？",
      "portability": "medium",
      "customs": {
        "level": "low",
        "noteVi": "Sản phẩm khô, đóng gói thương mại; giữ nguyên nhãn và kiểm tra quy định hành lý trước chuyến bay."
      },
      "nearRaffles": false,
      "purchaseLocationIds": [
        "fictional-location-1"
      ],
      "buyingTipsVi": [
        "Xác nhận đúng mẫu nhà sàn, không phải mẫu hoa trà.",
        "Kẹp giữa hai lớp quần áo để tránh cong khung."
      ],
      "tags": [
        "Hạ Bố",
        "tranh nhỏ",
        "nhà sàn",
        "phi vật thể"
      ],
      "sources": [
        "https://tsylt.com/h-pd-2057.html",
        "https://www.cq.gov.cn/ywdt/zwhd/bmdt/202504/t20250403_14479452.html"
      ]
    }
  ]
} as const satisfies GiftCatalog;
