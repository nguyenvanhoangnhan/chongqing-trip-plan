"use client";

import { CarFront, TrainFront } from "lucide-react";

import type { ItineraryRoute } from "@/domain/itinerary";
import { buildAmapDirectionUrl } from "@/lib/amap";
import { buildBaiduDirectionUrl } from "@/lib/baidu-maps";
import { useMapProviderStore } from "@/stores/map-provider-store";

type RouteLinksProps = {
  route: ItineraryRoute;
};

const PROVIDER_LABELS = {
  baidu: "Chỉ đường Baidu",
  amap: "Chỉ đường Amap",
} as const;

export function RouteLinks({ route }: RouteLinksProps) {
  const provider = useMapProviderStore((state) => state.provider);
  const buildDirectionUrl =
    provider === "amap" ? buildAmapDirectionUrl : buildBaiduDirectionUrl;
  const endpoints = { origin: route.origin, destination: route.destination };

  return (
    <div
      className="itinerary-stop__directions"
      data-preferred={route.preferredMode}
    >
      <span>{PROVIDER_LABELS[provider]}</span>
      <a
        href={buildDirectionUrl({ ...endpoints, mode: "driving" })}
        target="_blank"
        rel="noreferrer"
      >
        <CarFront size={15} aria-hidden="true" /> Ô tô
      </a>
      <a
        href={buildDirectionUrl({ ...endpoints, mode: "transit" })}
        target="_blank"
        rel="noreferrer"
      >
        <TrainFront size={15} aria-hidden="true" /> Công cộng
      </a>
    </div>
  );
}
