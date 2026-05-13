import { create } from "zustand";
import type { MapState } from "../types/store";

export const useMapStore = create<MapState>((set) => ({
  transitData: null,
  selectedRouteId: null,
  hoveredRouteId: null,
  selectedStopId: null,
  userLocation: null,
  flyTarget: null,

  setTransitData: (transitData) => set({ transitData }),
  setSelectedRoute: (selectedRouteId) => set({ selectedRouteId }),
  setHoveredRouteId: (hoveredRouteId) => set({ hoveredRouteId }),
  clearHoveredRouteId: () => set({ hoveredRouteId: null }),
  setSelectedStop: (selectedStopId) => set({ selectedStopId }),
  setUserLocation: (userLocation) => set({ userLocation }),
  flyTo: (target) =>
    set({ flyTarget: { ...target, token: Date.now() + Math.random() } }),
  clearSelection: () => set({ selectedRouteId: null, selectedStopId: null }),
}));
