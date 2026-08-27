import type { ItineraryPlace } from "@/domain/itinerary";

const AMAP_SOURCE = "webapp.chongqing.tripplan";
const AMAP_REGION = "重庆";

type AmapPlaceOptions = {
  /** Open the Amap app rather than the website. */
  native: boolean;
};

/**
 * Amap keeps its own POI ids, so a Baidu uid is worthless here and the Chinese
 * name is the only handle both maps share. Amap's route planner insists on
 * coordinates, which this city makes unreliable, so only places are linked.
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
