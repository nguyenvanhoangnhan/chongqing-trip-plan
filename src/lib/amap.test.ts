import { describe, expect, test } from "vitest";

import { buildAmapDirectionUrl, buildAmapPlaceUrl } from "./amap";

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

describe("Amap routes", () => {
  const route = {
    origin: { name: "解放碑" },
    destination: { name: "磁器口古镇" },
  };

  test("opens the route planner with both endpoints named, never located", () => {
    const url = new URL(buildAmapDirectionUrl({ ...route, mode: "transit" }));

    expect(url.hostname).toBe("www.amap.com");
    expect(url.pathname).toBe("/dir");
    expect(url.searchParams.get("from[name]")).toBe("解放碑");
    expect(url.searchParams.get("to[name]")).toBe("磁器口古镇");
    expect(url.searchParams.get("from[lnglat]")).toBeNull();
    expect(url.searchParams.get("to[lnglat]")).toBeNull();
  });

  test("maps the shared travel modes onto Amap's own names", () => {
    expect(
      new URL(buildAmapDirectionUrl({ ...route, mode: "driving" })).searchParams.get("type"),
    ).toBe("car");
    expect(
      new URL(buildAmapDirectionUrl({ ...route, mode: "transit" })).searchParams.get("type"),
    ).toBe("bus");
    expect(
      new URL(buildAmapDirectionUrl({ ...route, mode: "walking" })).searchParams.get("type"),
    ).toBe("walk");
  });
});
