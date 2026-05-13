"use client";

import { Bus, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui";
import { useMapStore } from "@/modules/transit-map";

export const SearchPalette = () => {
  const [open, setOpen] = useState(false);
  const transitData = useMapStore((s) => s.transitData);
  const setSelectedRoute = useMapStore((s) => s.setSelectedRoute);
  const setSelectedStop = useMapStore((s) => s.setSelectedStop);
  const flyTo = useMapStore((s) => s.flyTo);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stops = useMemo(
    () => transitData?.stopsGeoJSON.features ?? [],
    [transitData],
  );
  const routes = useMemo(() => transitData?.routes ?? [], [transitData]);
  const routeCenters = useMemo(() => {
    const centers = new Map<string, [number, number]>();
    if (!transitData) return centers;
    for (const f of transitData.routesGeoJSON.features) {
      if (centers.has(f.properties.route_id)) continue;
      const coords = f.geometry.coordinates;
      if (coords.length === 0) continue;
      const mid = coords[Math.floor(coords.length / 2)] as [number, number];
      centers.set(f.properties.route_id, mid);
    }
    return centers;
  }, [transitData]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search Halte.ui"
      description="Find a Transjakarta halte or route by name."
    >
      <CommandInput placeholder="Search for a halte or a route…" />
      <CommandList>
        <CommandEmpty>No matching halte or route.</CommandEmpty>

        <CommandGroup heading="Haltes">
          {stops.map((stop) => {
            const [lng, lat] = stop.geometry.coordinates as [number, number];
            return (
              <CommandItem
                key={`stop-${stop.properties.stop_id}`}
                value={`halte ${stop.properties.stop_name}`}
                onSelect={() => {
                  setSelectedRoute(null);
                  setSelectedStop(stop.properties.stop_id);
                  flyTo({ lng, lat, zoom: 15 });
                  setOpen(false);
                }}
              >
                <MapPin className="size-4" />
                <span className="flex-1">{stop.properties.stop_name}</span>
                {stop.properties.is_hub && (
                  <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    Hub
                  </span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Routes">
          {routes.map((route) => {
            const center = routeCenters.get(route.route_id);
            return (
              <CommandItem
                key={`route-${route.route_id}`}
                value={`route ${route.route_short_name} ${route.route_long_name}`}
                onSelect={() => {
                  setSelectedStop(null);
                  setSelectedRoute(route.route_id);
                  if (center) {
                    flyTo({ lng: center[0], lat: center[1], zoom: 12 });
                  }
                  setOpen(false);
                }}
              >
                <Bus className="size-4" />
                <span
                  className="inline-flex h-5 min-w-10 items-center justify-center rounded-full px-2 text-[11px] font-semibold"
                  style={{
                    backgroundColor: route.route_color,
                    color: route.route_text_color,
                  }}
                >
                  {route.route_short_name}
                </span>
                <span className="flex-1 truncate">{route.route_long_name}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
