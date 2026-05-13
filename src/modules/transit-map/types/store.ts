import type { TransitData } from "@/types";

export interface FlyTarget {
  lng: number;
  lat: number;
  zoom?: number;
  token: number;
}

export interface MapState {
  transitData: TransitData | null;
  selectedRouteId: string | null;
  hoveredRouteId: string | null;
  selectedStopId: string | null;
  userLocation: [number, number] | null;
  flyTarget: FlyTarget | null;

  setTransitData: (data: TransitData | null) => void;
  setSelectedRoute: (routeId: string | null) => void;
  setHoveredRouteId: (routeId: string | null) => void;
  clearHoveredRouteId: () => void;
  setSelectedStop: (stopId: string | null) => void;
  setUserLocation: (location: [number, number] | null) => void;
  flyTo: (target: Omit<FlyTarget, "token">) => void;
  clearSelection: () => void;
}

export interface FilterState {
  activeRouteIds: string[];
  initialized: boolean;

  initActiveRoutes: (routeIds: string[]) => void;
  toggleRoute: (routeId: string) => void;
  toggleCategory: (categoryRouteIds: string[], isSelected: boolean) => void;
}
