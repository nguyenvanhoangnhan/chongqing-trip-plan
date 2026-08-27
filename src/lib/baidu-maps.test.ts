import { describe, expect, test } from "vitest";

import { buildBaiduDirectionUrl, buildBaiduPlaceUrl } from "./baidu-maps";

describe("Baidu Maps links", () => {
  test("opens a POI detail page directly by UID", () => {
    const href = buildBaiduPlaceUrl({
      label: "测试地点",
      uid: "fictional-poi-uid",
    });

    const url = new URL(href);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("api.map.baidu.com");
    expect(url.pathname).toBe("/place/detail");
    expect(url.searchParams.get("uid")).toBe("fictional-poi-uid");
    expect(url.searchParams.get("output")).toBe("html");
  });

  test("falls back to a Chongqing text search for an unresolved POI", () => {
    const href = buildBaiduPlaceUrl({
      label: "测试地点",
      query: "测试地点 重庆",
    });

    const url = new URL(href);
    expect(url.pathname).toBe("/place/search");
    expect(url.searchParams.get("query")).toBe("测试地点 重庆");
    expect(url.searchParams.get("region")).toBe("重庆");
  });

  test("prefers the POI over the search fallback when both are known", () => {
    const href = buildBaiduPlaceUrl({
      label: "测试地点",
      query: "测试地点 重庆",
      uid: "fictional-poi-uid",
    });

    const url = new URL(href);
    expect(url.pathname).toBe("/place/detail");
    expect(url.searchParams.get("query")).toBeNull();
  });

  test("never sends coordinates, which are ambiguous in a stacked city", () => {
    const href = buildBaiduPlaceUrl({
      label: "测试地点",
      uid: "fictional-poi-uid",
    });

    const url = new URL(href);
    expect(url.pathname).not.toBe("/marker");
    expect(url.searchParams.get("location")).toBeNull();
    expect(url.searchParams.get("coord_type")).toBeNull();
  });

  test("opens the full public-transport route planner for two places", () => {
    const href = buildBaiduDirectionUrl({
      origin: { name: "测试起点" },
      destination: { name: "测试终点" },
      mode: "transit",
    });

    const url = new URL(href);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("api.map.baidu.com");
    expect(url.pathname).toBe("/direction");
    expect(url.searchParams.get("origin")).toBe("测试起点");
    expect(url.searchParams.get("destination")).toBe("测试终点");
    expect(url.searchParams.get("mode")).toBe("transit");
    expect(url.searchParams.get("region")).toBe("重庆");
    expect(url.searchParams.get("output")).toBe("html");
    expect(url.searchParams.get("src")).toBe("webapp.chongqing.tripplan");
  });

  test("routes by place name rather than by coordinate", () => {
    const href = buildBaiduDirectionUrl({
      origin: { name: "测试起点" },
      destination: { name: "测试终点" },
      mode: "driving",
    });

    const url = new URL(href);
    expect(url.searchParams.get("origin")).not.toContain("latlng:");
    expect(url.searchParams.get("destination")).not.toContain("latlng:");
    expect(url.searchParams.get("coord_type")).toBeNull();
  });

  test("keeps a long endpoint within the length Baidu still routes", () => {
    const href = buildBaiduDirectionUrl({
      origin: { name: "N".repeat(200) },
      destination: { name: "测试终点".repeat(60) },
      mode: "transit",
    });

    const url = new URL(href);
    const origin = url.searchParams.get("origin") ?? "";
    const destination = url.searchParams.get("destination") ?? "";

    expect([...origin].length).toBe(100);
    expect([...destination].length).toBe(100);
  });
});
