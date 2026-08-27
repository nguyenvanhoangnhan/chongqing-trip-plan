import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MapProvider = "baidu" | "amap";

type MapProviderStore = {
  provider: MapProvider;
  setProvider: (provider: MapProvider) => void;
};

export const useMapProviderStore = create<MapProviderStore>()(
  persist(
    (set) => ({
      provider: "baidu",
      setProvider: (provider) => set({ provider }),
    }),
    {
      name: "chongqing-map-provider",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
    },
  ),
);
