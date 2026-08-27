"use client";

import { useEffect } from "react";

import type { MapProvider } from "@/stores/map-provider-store";
import { useMapProviderStore } from "@/stores/map-provider-store";

const providers: readonly { id: MapProvider; label: string }[] = [
  { id: "baidu", label: "Baidu" },
  { id: "amap", label: "Amap" },
];

export function MapProviderSwitcher() {
  const { provider, setProvider } = useMapProviderStore();

  useEffect(() => {
    void useMapProviderStore.persist.rehydrate();
  }, []);

  return (
    <fieldset className="map-provider-switcher">
      <legend>Bản đồ</legend>
      <div role="radiogroup" aria-label="Bản đồ">
        {providers.map((item) => (
          <label key={item.id} data-active={provider === item.id}>
            <input
              type="radio"
              name="map-provider"
              value={item.id}
              checked={provider === item.id}
              onChange={() => setProvider(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
