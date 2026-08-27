import { describe, expect, test } from "vitest";

import { buildAmapPlaceUrl } from "./amap";

describe("Amap links", () => {
  test("searches Chongqing for the Chinese name of a place", () => {
    const href = buildAmapPlaceUrl(
      { label: "Hồng Nhai Động", query: "洪崖洞民俗风貌区" },
      { native: false },
    );

    const url = new URL(href);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("uri.amap.com");
    expect(url.pathname).toBe("/search");
    expect(url.searchParams.get("keyword")).toBe("洪崖洞民俗风貌区");
    expect(url.searchParams.get("city")).toBe("重庆");
    expect(url.searchParams.get("src")).toBe("webapp.chongqing.tripplan");
  });

  test("hands the link to the Amap app on a phone", () => {
    const href = buildAmapPlaceUrl(
      { label: "Hồng Nhai Động", query: "洪崖洞民俗风貌区" },
      { native: true },
    );

    expect(new URL(href).searchParams.get("callnative")).toBe("1");
  });

  test("keeps a laptop in the browser", () => {
    const href = buildAmapPlaceUrl(
      { label: "Hồng Nhai Động", query: "洪崖洞民俗风貌区" },
      { native: false },
    );

    expect(new URL(href).searchParams.get("callnative")).toBe("0");
  });

  test("never sends coordinates, which are ambiguous in a stacked city", () => {
    const url = new URL(
      buildAmapPlaceUrl(
        { label: "Hồng Nhai Động", query: "洪崖洞民俗风貌区" },
        { native: true },
      ),
    );

    expect(url.searchParams.get("position")).toBeNull();
    expect(url.toString()).not.toContain("latlng");
  });

  test("falls back to the display label when there is no Chinese name", () => {
    const href = buildAmapPlaceUrl(
      { label: "Raffles City", uid: "baidu-only-uid" },
      { native: false },
    );

    // A Baidu POI id means nothing to Amap, so the name is all there is.
    expect(new URL(href).searchParams.get("keyword")).toBe("Raffles City");
  });
});
