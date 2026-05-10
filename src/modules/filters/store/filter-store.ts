import { create } from "zustand";
import type { FilterState, RouteCategory } from "@/types";

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
