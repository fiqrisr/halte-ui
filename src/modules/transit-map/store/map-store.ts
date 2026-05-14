import { create } from "zustand";
import type { MapState } from "../types/store";

export const useMapStore = create<MapState>((set, get) => ({
  transitData: null,
  selectedRouteId: null,
  hoveredRouteId: null,
  selectedStopId: null,
  tempEnabledRouteId: null,
  userLocation: null,
  flyTarget: null,

  setTransitData: (transitData) => set({ transitData }),
  setHoveredRouteId: (hoveredRouteId) => set({ hoveredRouteId }),
  clearHoveredRouteId: () => set({ hoveredRouteId: null }),
  setUserLocation: (userLocation) => set({ userLocation }),
  flyTo: (target) =>
    set({ flyTarget: { ...target, token: Date.now() + Math.random() } }),

  selectRoute: (routeId, enableFn) => {
    enableFn?.(routeId);
    set({
      selectedRouteId: routeId,
      selectedStopId: null,
      tempEnabledRouteId: routeId,
    });
  },

  deselectRoute: (disableFn) => {
    const { tempEnabledRouteId, selectedRouteId } = get();
    if (tempEnabledRouteId && tempEnabledRouteId === selectedRouteId) {
      disableFn?.(tempEnabledRouteId);
    }
    set({ selectedRouteId: null, tempEnabledRouteId: null });
  },

  selectStop: (stopId, disableFn) => {
    const { tempEnabledRouteId } = get();
    if (tempEnabledRouteId) disableFn?.(tempEnabledRouteId);
    set({
      selectedStopId: stopId,
      selectedRouteId: null,
      tempEnabledRouteId: null,
    });
  },

  deselectStop: () => set({ selectedStopId: null }),
}));
