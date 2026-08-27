import { describe, expect, test } from "vitest";

import {
  classifyMapLink,
  collectMapLinks,
  extractMapLinks,
} from "./map-links.ts";

// Every redirect below was observed from the real endpoints, because both maps
// answer a request they cannot serve with a success rather than an error.
const BAIDU_PLACE = "https://api.map.baidu.com/place/detail?uid=X&output=html";
const BAIDU_DIRECTION = "https://api.map.baidu.com/direction?origin=A&mode=bus";
const AMAP_SEARCH = "https://uri.amap.com/search?keyword=A&city=B";
const AMAP_NAVIGATION = "https://uri.amap.com/navigation?from=A&to=B";
const AMAP_SITE_DIRECTION = "https://www.amap.com/dir?from%5Bname%5D=A";

describe("extractMapLinks", () => {
  test("pulls every map link out of a rendered page, decoded and deduplicated", () => {
    const html = `
      <a href="${BAIDU_PLACE}&amp;src=y">place</a>
      <a href="${BAIDU_PLACE}&amp;src=y">the same place again</a>
      <a href="${AMAP_SEARCH}">amap</a>
      <a href="/gifts">not a map</a>
      <a href="https://example.com/">not a map either</a>
    `;

    expect(extractMapLinks(html)).toEqual([
      `${BAIDU_PLACE}&src=y`,
      AMAP_SEARCH,
    ]);
  });

  test("finds nothing in a page with no map links", () => {
    expect(extractMapLinks("<a href='/login'>in</a>")).toEqual([]);
  });
});

describe("classifyMapLink", () => {
  test("counts a redirect that carries the place or the route as routed", () => {
    expect(
      classifyMapLink(
        BAIDU_PLACE,
        "https://map.baidu.com/poi//@15547287,4202554,13z?uid=X&info_merge=1",
      ),
    ).toBe("routed");
    expect(
      classifyMapLink(
        BAIDU_DIRECTION,
        "https://map.baidu.com/dir/A/B/@11862201,3427644,16z?querytype=bt",
      ),
    ).toBe("routed");
    expect(
      classifyMapLink(BAIDU_DIRECTION, "http://map.baidu.com/?l=&s=nav%26sn%3DA"),
    ).toBe("routed");
    expect(
      classifyMapLink(
        AMAP_SEARCH,
        "https://ditu.amap.com/search?query=A&city=B&src=z&callnative=0&innersrc=uriapi",
      ),
    ).toBe("routed");
  });

  test("catches the bare home page both maps fall back to", () => {
    expect(classifyMapLink(BAIDU_DIRECTION, "http://map.baidu.com/")).toBe(
      "dead",
    );
    expect(classifyMapLink(BAIDU_DIRECTION, null)).toBe("dead");
  });

  test("sees through a fallback dressed up in passthrough parameters", () => {
    // Amap echoes src, callnative and innersrc back even when it dropped the
    // route, so those parameters prove nothing on their own.
    expect(
      classifyMapLink(
        AMAP_NAVIGATION,
        "https://ditu.amap.com/?src=z&callnative=0&innersrc=uriapi",
      ),
    ).toBe("dead");
  });

  test("resolves a protocol-relative redirect, which Amap actually sends", () => {
    // Amap answers with "//ditu.amap.com/search?..." rather than an absolute
    // URL, so the redirect has to be read against the link it came from.
    expect(
      classifyMapLink(AMAP_SEARCH, "//ditu.amap.com/search?query=A&city=B"),
    ).toBe("routed");
    expect(
      classifyMapLink(AMAP_NAVIGATION, "//ditu.amap.com/?src=z&callnative=0"),
    ).toBe("dead");
  });

  test("refuses to vouch for the Amap site, which routes in the browser", () => {
    // www.amap.com/dir answers 200 with an app shell and draws the route in
    // JavaScript, so an HTTP check cannot tell a real route from a blank map.
    expect(classifyMapLink(AMAP_SITE_DIRECTION, null)).toBe("unverifiable");
  });
});

describe("collectMapLinks", () => {
  const itinerary = {
    schemaVersion: 1 as const,
    title: "Fictional trip",
    subtitle: "Fictional subtitle",
    days: ["day-1", "day-2", "day-3", "day-4", "day-5"].map((id, index) => ({
      id: id as "day-1",
      date: `2035-04-1${index}`,
      headline: `Route ${index + 1}`,
      items: [
        {
          id: `${id}-stop-1`,
          time: "08:00",
          activity: "Fictional stop",
          places: [{ label: "Fictional place", query: "测试地点" }],
          route:
            index === 0
              ? { origin: { name: "起点" }, destination: { name: "终点" } }
              : undefined,
        },
      ],
    })),
  };

  test("covers both maps, because only one of them is in the markup", () => {
    // The page renders whichever map the traveler picked, so scraping it can
    // never reach the other one's links.
    const links = collectMapLinks(itinerary);
    const hosts = new Set(links.map((link) => new URL(link.href).hostname));

    expect(hosts).toEqual(
      new Set(["api.map.baidu.com", "uri.amap.com", "www.amap.com"]),
    );
  });

  test("covers every place and every route in both travel modes", () => {
    const links = collectMapLinks(itinerary);

    // 5 places x 2 maps, plus 1 route x 2 maps x 2 modes.
    expect(links).toHaveLength(14);
    expect(links.every((link) => link.label.length > 0)).toBe(true);
  });
});
