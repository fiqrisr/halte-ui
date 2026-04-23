"use client";

import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTransitData } from "@/modules/gtfs-data/fetch-transit-data";
import type { TransitData } from "@/modules/gtfs-data/types";
import {
  Map as MapCanvas,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
} from "@/shared/components/ui/map";

const JAKARTA_CENTER: [number, number] = [106.8229, -6.1944];
const INITIAL_ZOOM = 11;

export function TransitMapView() {
  const [data, setData] = useState<TransitData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTransitData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <MapCanvas center={JAKARTA_CENTER} zoom={INITIAL_ZOOM}>
        <MapControls />
        {data?.shapes.map((shape) => {
          const route = data.routes.find((r) => r.route_id === shape.route_id);
          return (
            <MapRoute
              key={shape.shape_id}
              coordinates={shape.coordinates}
              color={route?.route_color ?? "#6b7280"}
              width={3}
              opacity={0.75}
            />
          );
        })}
        {data?.stops.map((stop) => (
          <MapMarker
            key={stop.stop_id}
            longitude={stop.lng}
            latitude={stop.lat}
          >
            <MarkerContent>
              <div className="size-2.5 cursor-pointer rounded-full border-2 border-white bg-foreground shadow-md transition-transform hover:scale-125" />
            </MarkerContent>
            <MarkerPopup className="w-60 p-0">
              <div className="space-y-1 p-3">
                <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                  Transjakarta Halte
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 text-foreground/60 shrink-0" />
                  <h3 className="text-foreground text-sm font-semibold leading-snug">
                    {stop.stop_name}
                  </h3>
                </div>
                <p className="text-muted-foreground pt-1 font-mono text-[10px]">
                  {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                </p>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </MapCanvas>

      {!data && !error && (
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
