"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTransitData } from "@/modules/gtfs-data/fetch-transit-data";
import { useMapStore } from "@/modules/transit-map/store/map-store";
import { Map as MapCanvas, MapControls } from "@/shared/components/ui/map";
import { LocateFab } from "./components/locate-fab";
import { StationSheet } from "./components/station-sheet";
import { TransitLayers } from "./transit-layers";

const JAKARTA_CENTER: [number, number] = [106.8229, -6.1944];
const INITIAL_ZOOM = 11;

export function TransitMapView() {
  const transitData = useMapStore((s) => s.transitData);
  const setTransitData = useMapStore((s) => s.setTransitData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTransitData()
      .then((d) => {
        if (!cancelled) setTransitData(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setTransitData]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <MapCanvas center={JAKARTA_CENTER} zoom={INITIAL_ZOOM}>
        <MapControls />
        <TransitLayers />
      </MapCanvas>

      <LocateFab />
      <StationSheet />

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
}
