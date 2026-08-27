import type {
  ItineraryPlace,
  ItineraryRoutePoint,
} from "@/domain/itinerary";

const BAIDU_MAPS_SOURCE = "webapp.chongqing.tripplan";
const BAIDU_REGION = "重庆";

// Baidu drops the whole route and lands on a blank map when an endpoint runs
// past 100 characters, so keep every endpoint under that ceiling.
const BAIDU_ROUTE_POINT_MAX_LENGTH = 100;

export type BaiduTravelMode = "driving" | "transit" | "walking";

export function buildBaiduPlaceUrl(place: ItineraryPlace): string {
  const url = new URL(
    place.uid
      ? "https://api.map.baidu.com/place/detail"
      : "https://api.map.baidu.com/place/search",
  );

  if (place.uid) {
    url.searchParams.set("uid", place.uid);
  } else if (place.query) {
    url.searchParams.set("query", place.query);
    url.searchParams.set("region", BAIDU_REGION);
  }

  url.searchParams.set("output", "html");
  url.searchParams.set("src", BAIDU_MAPS_SOURCE);
  return url.toString();
}

function formatRoutePoint(point: ItineraryRoutePoint): string {
  const characters = [...point.name];

  return characters.length <= BAIDU_ROUTE_POINT_MAX_LENGTH
    ? point.name
    : characters.slice(0, BAIDU_ROUTE_POINT_MAX_LENGTH).join("");
}

export function buildBaiduDirectionUrl({
  origin,
  destination,
  mode,
}: {
  origin: ItineraryRoutePoint;
  destination: ItineraryRoutePoint;
  mode: BaiduTravelMode;
}): string {
  const url = new URL("https://api.map.baidu.com/direction");
  url.searchParams.set("origin", formatRoutePoint(origin));
  url.searchParams.set("destination", formatRoutePoint(destination));
  url.searchParams.set("mode", mode);
  url.searchParams.set("region", BAIDU_REGION);
  url.searchParams.set("output", "html");
  url.searchParams.set("src", BAIDU_MAPS_SOURCE);
  return url.toString();
}
