import { create } from "zustand";
import type { TransitData } from "@/modules/gtfs-data/types";

export interface FlyTarget {
  lng: number;
  lat: number;
  zoom?: number;
  /** Unique token so that repeated selections of the same stop still fly. */
  token: number;
}

export interface MapState {
  transitData: TransitData | null;
  selectedRouteId: string | null;
  selectedStopId: string | null;
  userLocation: [number, number] | null;
  flyTarget: FlyTarget | null;

  setTransitData: (data: TransitData | null) => void;
  setSelectedRoute: (routeId: string | null) => void;
  setSelectedStop: (stopId: string | null) => void;
  setUserLocation: (location: [number, number] | null) => void;
  flyTo: (target: Omit<FlyTarget, "token">) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  transitData: null,
  selectedRouteId: null,
  selectedStopId: null,
  userLocation: null,
  flyTarget: null,

  setTransitData: (transitData) => set({ transitData }),
  setSelectedRoute: (selectedRouteId) => set({ selectedRouteId }),
  setSelectedStop: (selectedStopId) => set({ selectedStopId }),
  setUserLocation: (userLocation) => set({ userLocation }),
  flyTo: (target) =>
    set({ flyTarget: { ...target, token: Date.now() + Math.random() } }),
  clearSelection: () => set({ selectedRouteId: null, selectedStopId: null }),
}));
