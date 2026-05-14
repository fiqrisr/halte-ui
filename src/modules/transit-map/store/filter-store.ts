import { create } from "zustand";
import type { RouteCategory } from "@/types";
import type { FilterState } from "../types/store";

export const ALL_CATEGORIES: RouteCategory[] = [
  "brt",
  "royaltrans",
  "wisata",
  "rusun",
  "transjabodetabek",
  "mikrotrans",
  "non-brt",
];

export const CATEGORY_LABELS: Record<RouteCategory, string> = {
  brt: "BRT Corridors",
  royaltrans: "RoyalTrans",
  wisata: "Bus Wisata",
  rusun: "Rumah Susun",
  transjabodetabek: "Transjabodetabek",
  mikrotrans: "Mikrotrans",
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

  enableRoute: (routeId) =>
    set((state) => {
      if (state.activeRouteIds.includes(routeId)) return {};
      return { activeRouteIds: [...state.activeRouteIds, routeId] };
    }),

  disableRoute: (routeId) =>
    set((state) => ({
      activeRouteIds: state.activeRouteIds.filter((id) => id !== routeId),
    })),
}));
