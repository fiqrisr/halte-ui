import { create } from "zustand";
import type { RouteCategory } from "@/modules/gtfs-data/types";

export const ALL_CATEGORIES: RouteCategory[] = [
  "brt",
  "royaltrans",
  "wisata",
  "rusun",
  "transjabodetabek",
  "jaklingko",
  "non-brt",
];

export const CATEGORY_LABELS: Record<RouteCategory, string> = {
  brt: "BRT Corridors",
  royaltrans: "RoyalTrans",
  wisata: "Bus Wisata",
  rusun: "Mikrotrans Rusun",
  transjabodetabek: "Transjabodetabek",
  jaklingko: "JakLingko",
  "non-brt": "Non-BRT / Feeders",
};

export interface FilterState {
  /** Currently visible route IDs. An empty array means *nothing* is shown. */
  activeRouteIds: string[];
  /** Whether the store has been hydrated with the full catalog. */
  initialized: boolean;

  initActiveRoutes: (routeIds: string[]) => void;
  toggleRoute: (routeId: string) => void;
  /**
   * Toggle every route in a category at once.
   *  - `isSelected=true`  → add all ids (de-duped).
   *  - `isSelected=false` → remove all ids.
   */
  toggleCategory: (categoryRouteIds: string[], isSelected: boolean) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeRouteIds: [],
  initialized: false,

  initActiveRoutes: (routeIds) =>
    set({ activeRouteIds: [...routeIds], initialized: true }),

  toggleRoute: (routeId) =>
    set((state) => {
      const exists = state.activeRouteIds.includes(routeId);
      return {
        activeRouteIds: exists
          ? state.activeRouteIds.filter((id) => id !== routeId)
          : [...state.activeRouteIds, routeId],
      };
    }),

  toggleCategory: (categoryRouteIds, isSelected) =>
    set((state) => {
      if (isSelected) {
        const next = new Set(state.activeRouteIds);
        for (const id of categoryRouteIds) next.add(id);
        return { activeRouteIds: Array.from(next) };
      }
      const removed = new Set(categoryRouteIds);
      return {
        activeRouteIds: state.activeRouteIds.filter((id) => !removed.has(id)),
      };
    }),
}));
