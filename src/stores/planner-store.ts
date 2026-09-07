import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Gift } from "@/domain/gifts";
import type { GiftSort } from "@/domain/gift-sort";
import type { PersonId } from "@/domain/people";
import type { DisplayCurrency } from "@/lib/format";

export type CatalogView = "grid" | "list";

type PlannerStore = {
  search: string;
  category: "all" | Gift["category"];
  priority: "all" | Gift["priority"];
  nearRafflesOnly: boolean;
  sort: GiftSort;
  activePersonId: PersonId;
  catalogView: CatalogView;
  currency: DisplayCurrency;
  setSearch: (search: string) => void;
  setCategory: (category: PlannerStore["category"]) => void;
  setPriority: (priority: PlannerStore["priority"]) => void;
  setNearRafflesOnly: (nearRafflesOnly: boolean) => void;
  setSort: (sort: GiftSort) => void;
  setActivePersonId: (activePersonId: PersonId) => void;
  setCatalogView: (catalogView: CatalogView) => void;
  setCurrency: (currency: DisplayCurrency) => void;
  resetFilters: () => void;
};

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      search: "",
      category: "all",
      priority: "all",
      nearRafflesOnly: false,
      sort: "default",
      activePersonId: "traveler-2",
      catalogView: "grid",
      currency: "VND",
      setSearch: (search) => set({ search }),
      setCategory: (category) => set({ category }),
      setPriority: (priority) => set({ priority }),
      setNearRafflesOnly: (nearRafflesOnly) => set({ nearRafflesOnly }),
      setSort: (sort) => set({ sort }),
      setActivePersonId: (activePersonId) => set({ activePersonId }),
      setCatalogView: (catalogView) => set({ catalogView }),
      setCurrency: (currency) => set({ currency }),
      resetFilters: () =>
        set({
          search: "",
          category: "all",
          priority: "all",
          nearRafflesOnly: false,
          sort: "default",
        }),
    }),
    {
      name: "chongqing-planner-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currency: state.currency }),
      skipHydration: true,
      version: 1,
    },
  ),
);
