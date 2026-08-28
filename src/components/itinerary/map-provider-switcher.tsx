"use client";

import { useEffect } from "react";
import { Check, Map as MapIcon } from "lucide-react";

import type { MapProvider } from "@/stores/map-provider-store";
import { useMapProviderStore } from "@/stores/map-provider-store";

const providers: readonly {
  id: MapProvider;
  label: string;
  nameZh: string;
}[] = [
  { id: "baidu", label: "Baidu", nameZh: "百度地图" },
  { id: "amap", label: "Amap", nameZh: "高德地图" },
];

export function MapProviderSwitcher() {
  const { provider, setProvider } = useMapProviderStore();

  useEffect(() => {
    void useMapProviderStore.persist.rehydrate();
  }, []);

  return (
    <fieldset className="map-provider-switcher">
      <legend>
        <MapIcon size={15} aria-hidden="true" /> Mở bản đồ bằng
      </legend>
      <div role="radiogroup" aria-label="Bản đồ">
        {providers.map((item) => {
          const active = provider === item.id;

          return (
            <label key={item.id} data-active={active}>
              <input
                type="radio"
                name="map-provider"
                value={item.id}
                checked={active}
                onChange={() => setProvider(item.id)}
              />
              <strong>{item.label}</strong>
              <span lang="zh-CN">{item.nameZh}</span>
              {active && (
                <Check
                  className="map-provider-switcher__check"
                  size={18}
                  aria-hidden="true"
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
