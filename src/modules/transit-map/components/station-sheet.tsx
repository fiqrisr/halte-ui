"use client";

import { Clock, MapPin, Sunrise, Sunset } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Route, StopFeature } from "@/types";
import { useMapStore } from "../store/map-store";

export const StationSheet = () => {
  const transitData = useMapStore((s) => s.transitData);
  const selectedStopId = useMapStore((s) => s.selectedStopId);
  const setSelectedStop = useMapStore((s) => s.setSelectedStop);
  const setSelectedRoute = useMapStore((s) => s.setSelectedRoute);
  const flyTo = useMapStore((s) => s.flyTo);

  const stop: StopFeature | undefined = useMemo(() => {
    if (!transitData || !selectedStopId) return undefined;
    return transitData.stopsGeoJSON.features.find(
      (f) => f.properties.stop_id === selectedStopId,
    );
  }, [transitData, selectedStopId]);

  const routesById = useMemo(() => {
    const map = new Map<string, Route>();
    for (const r of transitData?.routes ?? []) map.set(r.route_id, r);
    return map;
  }, [transitData]);

  const open = Boolean(stop);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedStop(null);
      }}
    >
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="gap-1.5">
          <p className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            Transjakarta Halte
          </p>
          <SheetTitle className="text-xl leading-tight">
            {stop?.properties.stop_name ?? "—"}
          </SheetTitle>
          {stop && (
            <SheetDescription className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              <span className="font-mono text-xs">
                {(stop.geometry.coordinates[1] as number).toFixed(5)},{" "}
                {(stop.geometry.coordinates[0] as number).toFixed(5)}
              </span>
            </SheetDescription>
          )}
        </SheetHeader>

        {stop && (
          <div className="flex flex-col gap-6 px-4 pb-4">
            <section>
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <Clock className="size-3.5" /> Operating hours
              </div>
              <div className="grid grid-cols-2 gap-2">
                <HoursCard
                  icon={<Sunrise className="size-4" />}
                  label="First bus"
                  value={stop.properties.first_bus ?? "—"}
                />
                <HoursCard
                  icon={<Sunset className="size-4" />}
                  label="Last bus"
                  value={stop.properties.last_bus ?? "—"}
                />
              </div>
            </section>

            <section>
              <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-medium tracking-wide uppercase">
                <span>
                  Connecting routes ({stop.properties.connecting_routes.length})
                </span>
                {stop.properties.is_hub && (
                  <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider">
                    INTERCHANGE HUB
                  </span>
                )}
              </div>
              {stop.properties.connecting_routes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No scheduled routes found for this halte.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {stop.properties.connecting_routes.map((routeId) => {
                    const route = routesById.get(routeId);
                    const bg = route?.route_color ?? "#6b7280";
                    const fg = route?.route_text_color ?? "#ffffff";
                    const label = route?.route_short_name ?? routeId;
                    return (
                      <button
                        key={routeId}
                        type="button"
                        onClick={() => {
                          setSelectedRoute(routeId);
                        }}
                        title={route?.route_long_name}
                        className="inline-flex h-6 min-w-10 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105"
                        style={{
                          backgroundColor: bg,
                          color: fg,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <Button
              variant="outline"
              onClick={() => {
                flyTo({
                  lng: stop.geometry.coordinates[0] as number,
                  lat: stop.geometry.coordinates[1] as number,
                  zoom: 16,
                });
              }}
            >
              Center map on halte
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const HoursCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="bg-muted/40 rounded-md border p-3">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase">
        {icon}
        {label}
      </div>
      <p className="text-foreground pt-1 font-mono text-base font-semibold">
        {value}
      </p>
    </div>
  );
};
