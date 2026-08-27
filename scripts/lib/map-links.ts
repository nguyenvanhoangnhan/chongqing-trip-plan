import type { Itinerary } from "../../src/domain/itinerary.ts";
import { buildAmapDirectionUrl, buildAmapPlaceUrl } from "../../src/lib/amap.ts";
import {
  buildBaiduDirectionUrl,
  buildBaiduPlaceUrl,
} from "../../src/lib/baidu-maps.ts";

const MAP_HOSTS = new Set([
  "api.map.baidu.com",
  "uri.amap.com",
  "www.amap.com",
]);

// Both maps echo these back untouched, so finding them in a redirect says
// nothing about whether the place or the route survived.
const PASSTHROUGH_PARAMS = new Set([
  "src",
  "callnative",
  "innersrc",
  "coordinate",
  "output",
]);

// www.amap.com draws its route in the browser and answers every request with
// the same app shell, so an HTTP check cannot tell a route from a blank map.
const BROWSER_ONLY_HOSTS = new Set(["www.amap.com"]);

export type MapLinkVerdict = "routed" | "dead" | "unverifiable";

export function extractMapLinks(html: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) =>
    match[1].replace(/&amp;/g, "&"),
  );

  const found = hrefs.filter((href) => {
    try {
      return MAP_HOSTS.has(new URL(href).hostname);
    } catch {
      return false;
    }
  });

  return [...new Set(found)];
}

/**
 * Neither map returns an error for a request it cannot serve: it redirects to
 * its own home page instead. A link counts as routed only when the redirect
 * still carries a path or a parameter of its own.
 */
export function classifyMapLink(
  href: string,
  redirect: string | null,
): MapLinkVerdict {
  if (BROWSER_ONLY_HOSTS.has(new URL(href).hostname)) {
    return "unverifiable";
  }

  if (!redirect) {
    return "dead";
  }

  // Amap answers with a protocol-relative Location, so read it against the
  // link it came from rather than on its own.
  const target = new URL(redirect, href);
  const carriesPath = target.pathname.replace(/\/+$/, "") !== "";
  const carriesParams = [...target.searchParams.keys()].some(
    (key) => !PASSTHROUGH_PARAMS.has(key),
  );

  return carriesPath || carriesParams ? "routed" : "dead";
}

export type CollectedMapLink = { href: string; label: string };

/**
 * Every map link the itinerary can produce, for both maps. The page only ever
 * renders the one the traveler picked, so reading the markup can never reach
 * the other one and would report it as fine by never looking.
 */
export function collectMapLinks(itinerary: Itinerary): CollectedMapLink[] {
  const links: CollectedMapLink[] = [];

  for (const day of itinerary.days) {
    for (const item of day.items) {
      for (const place of item.places ?? []) {
        links.push({
          href: buildBaiduPlaceUrl(place),
          label: `${item.id} Baidu ${place.label}`,
        });
        links.push({
          href: buildAmapPlaceUrl(place, { native: false }),
          label: `${item.id} Amap ${place.label}`,
        });
      }

      if (!item.route) {
        continue;
      }

      for (const mode of ["driving", "transit"] as const) {
        const endpoints = {
          origin: item.route.origin,
          destination: item.route.destination,
        };

        links.push({
          href: buildBaiduDirectionUrl({ ...endpoints, mode }),
          label: `${item.id} Baidu ${mode}`,
        });
        links.push({
          href: buildAmapDirectionUrl({ ...endpoints, mode }),
          label: `${item.id} Amap ${mode}`,
        });
      }
    }
  }

  return links;
}
