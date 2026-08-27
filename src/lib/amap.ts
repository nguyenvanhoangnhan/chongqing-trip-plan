import type {
  ItineraryPlace,
  ItineraryRoutePoint,
} from "@/domain/itinerary";

const AMAP_SOURCE = "webapp.chongqing.tripplan";
const AMAP_REGION = "重庆";

type AmapPlaceOptions = {
  /** Open the Amap app rather than the website. */
  native: boolean;
};

export type AmapTravelMode = "driving" | "transit" | "walking";

const AMAP_ROUTE_TYPES: Record<AmapTravelMode, string> = {
  driving: "car",
  transit: "bus",
  walking: "walk",
};

/**
 * Amap keeps its own POI ids, so a Baidu uid is worthless here and the Chinese
 * name is the only handle both maps share.
 */
export function buildAmapPlaceUrl(
  place: ItineraryPlace,
  { native }: AmapPlaceOptions,
): string {
  const url = new URL("https://uri.amap.com/search");

  url.searchParams.set("keyword", place.query ?? place.label);
  url.searchParams.set("city", AMAP_REGION);
  url.searchParams.set("coordinate", "gaode");
  url.searchParams.set("callnative", native ? "1" : "0");
  url.searchParams.set("src", AMAP_SOURCE);
  return url.toString();
}

/**
 * The URI API's navigation endpoint insists on coordinates, which this stacked
 * city makes unreliable. The amap.com route planner resolves endpoint names
 * to POIs itself, so it gets the names and nothing else.
 */
export function buildAmapDirectionUrl({
  origin,
  destination,
  mode,
}: {
  origin: ItineraryRoutePoint;
  destination: ItineraryRoutePoint;
  mode: AmapTravelMode;
}): string {
  const url = new URL("https://www.amap.com/dir");
  url.searchParams.set("from[name]", origin.name);
  url.searchParams.set("to[name]", destination.name);
  url.searchParams.set("type", AMAP_ROUTE_TYPES[mode]);
  return url.toString();
}
