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
  tempEnabledRouteId: string | null;
  userLocation: [number, number] | null;
  flyTarget: FlyTarget | null;

  setTransitData: (data: TransitData | null) => void;
  setHoveredRouteId: (routeId: string | null) => void;
  clearHoveredRouteId: () => void;
  setUserLocation: (location: [number, number] | null) => void;
  flyTo: (target: Omit<FlyTarget, "token">) => void;
  selectRoute: (routeId: string, disableFn?: (id: string) => void) => void;
  deselectRoute: (disableFn?: (id: string) => void) => void;
  selectStop: (stopId: string, disableFn?: (id: string) => void) => void;
  deselectStop: () => void;
}

export interface FilterState {
  activeRouteIds: string[];
  initialized: boolean;

  initActiveRoutes: (routeIds: string[]) => void;
  toggleRoute: (routeId: string) => void;
  toggleCategory: (categoryRouteIds: string[], isSelected: boolean) => void;
  enableRoute: (routeId: string) => void;
  disableRoute: (routeId: string) => void;
}
