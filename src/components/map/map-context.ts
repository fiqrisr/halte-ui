"use client";

import { createContext, useContext } from "react";
import type { MapContextValue, MarkerContextValue } from "@/types";

export const MapContext = createContext<MapContextValue | null>(null);

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
};

export const MarkerContext = createContext<MarkerContextValue | null>(null);

export const useMarkerContext = () => {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
};
