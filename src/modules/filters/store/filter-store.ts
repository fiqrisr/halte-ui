import { create } from "zustand";
import type { RouteCategory } from "@/modules/gtfs-data/types";

export const ALL_CATEGORIES: RouteCategory[] = ["brt", "non-brt", "jaklingko"];

export const CATEGORY_LABELS: Record<RouteCategory, string> = {
  brt: "BRT Corridors",
  "non-brt": "Non-BRT / Feeders",
  jaklingko: "JakLingko",
};

export interface FilterState {
  activeCategories: RouteCategory[];
  toggleCategory: (category: RouteCategory) => void;
  setActiveCategories: (categories: RouteCategory[]) => void;
  resetCategories: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeCategories: [...ALL_CATEGORIES],
  toggleCategory: (category) =>
    set((state) => {
      const isActive = state.activeCategories.includes(category);
      return {
        activeCategories: isActive
          ? state.activeCategories.filter((c) => c !== category)
          : [...state.activeCategories, category],
      };
    }),
  setActiveCategories: (activeCategories) => set({ activeCategories }),
  resetCategories: () => set({ activeCategories: [...ALL_CATEGORIES] }),
}));
