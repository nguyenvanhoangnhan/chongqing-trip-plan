"use client";

import { ExternalLink, MapPin } from "lucide-react";

import type { ItineraryPlace } from "@/domain/itinerary";
import { buildAmapPlaceUrl } from "@/lib/amap";
import { buildBaiduPlaceUrl } from "@/lib/baidu-maps";
import { useMapProviderStore } from "@/stores/map-provider-store";

type PlaceLinkProps = {
  place: ItineraryPlace;
  isMobile: boolean;
};

export function PlaceLink({ place, isMobile }: PlaceLinkProps) {
  const provider = useMapProviderStore((state) => state.provider);

  const href =
    provider === "amap"
      ? buildAmapPlaceUrl(place, { native: isMobile })
      : buildBaiduPlaceUrl(place);

  return (
    <a href={href} target="_blank" rel="noreferrer">
      <MapPin size={14} aria-hidden="true" />
      {place.label}
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}
