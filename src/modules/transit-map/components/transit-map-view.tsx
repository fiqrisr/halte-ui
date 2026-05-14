"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Map as MapCanvas, MapControls } from "@/components/map";
import { fetchTransitData } from "../api/transit-data";
import { useFilterStore } from "../store/filter-store";
import { useMapStore } from "../store/map-store";
import { RouteCard } from "./route-card";
import { StationCard } from "./station-card";
import { TransitLayers } from "./transit-layers";

const JAKARTA_CENTER: [number, number] = [106.8229, -6.1944];
const INITIAL_ZOOM = 11;

export const TransitMapView = () => {
  const transitData = useMapStore((s) => s.transitData);
  const setTransitData = useMapStore((s) => s.setTransitData);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const initActiveRoutes = useFilterStore((s) => s.initActiveRoutes);
  const filterInitialized = useFilterStore((s) => s.initialized);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTransitData()
      .then((d) => {
        if (cancelled) return;
        setTransitData(d);
        // First-load default: show every route.
        if (!filterInitialized) {
          initActiveRoutes(d.routes.map((r) => r.route_id));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setTransitData, initActiveRoutes, filterInitialized]);

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <MapCanvas center={JAKARTA_CENTER} zoom={INITIAL_ZOOM}>
        <MapControls
          position="top-right"
          showZoom
          showCompass
          showLocate
          onLocate={({ longitude, latitude }) =>
            setUserLocation([longitude, latitude])
          }
        />
        <TransitLayers />
      </MapCanvas>

      <StationCard />
      <RouteCard />

      {!transitData && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 text-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm backdrop-blur">
            <Loader2 className="size-4 animate-spin" />
            Loading Transjakarta network…
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-background text-destructive max-w-sm rounded-md border px-3 py-2 text-sm shadow-sm">
            Failed to load transit data: {error}
          </div>
        </div>
      )}
    </div>
  );
};
