"use client";

import { Bus, Clock, MapPin, Sunrise, Sunset, X } from "lucide-react";
import { useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import type { Route, StopFeature } from "@/types";
import { useFilterStore } from "../store/filter-store";
import { useMapStore } from "../store/map-store";

export const StationCard = () => {
  const transitData = useMapStore((s) => s.transitData);
  const selectedStopId = useMapStore((s) => s.selectedStopId);
  const deselectStop = useMapStore((s) => s.deselectStop);
  const selectRoute = useMapStore((s) => s.selectRoute);
  const activeRouteIds = useFilterStore((s) => s.activeRouteIds);
  const enableRoute = useFilterStore((s) => s.enableRoute);

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

  if (!stop) return null;

  return (
    <div className="absolute top-4 left-4 z-50 w-72 pointer-events-auto">
      <Card className="gap-0 overflow-hidden p-0 shadow-lg">
        {/* Header */}
        <CardHeader className="grid-cols-[1fr_auto] items-start gap-2 border-b px-4 pt-4 pb-3">
          <div className="min-w-0">
            <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-widest uppercase">
              Transjakarta Halte
            </p>
            <CardTitle className="text-sm leading-tight">
              {stop.properties.stop_name}
            </CardTitle>
            <div className="text-muted-foreground mt-1.5 flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="font-mono text-[10px]">
                {(stop.geometry.coordinates[1] as number).toFixed(5)},{" "}
                {(stop.geometry.coordinates[0] as number).toFixed(5)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 size-7 shrink-0"
            onClick={() => deselectStop()}
            aria-label="Close"
          >
            <X className="size-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-4 py-3">
          {/* Operating hours */}
          <div>
            <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase">
              <Clock className="size-3" />
              Operating hours
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-lg border p-2.5">
                <div className="text-muted-foreground mb-1 flex items-center gap-1 text-[9px] font-medium tracking-widest uppercase">
                  <Sunrise className="size-3" /> First bus
                </div>
                <p className="font-mono text-sm font-semibold">
                  {stop.properties.first_bus ?? "—"}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg border p-2.5">
                <div className="text-muted-foreground mb-1 flex items-center gap-1 text-[9px] font-medium tracking-widest uppercase">
                  <Sunset className="size-3" /> Last bus
                </div>
                <p className="font-mono text-sm font-semibold">
                  {stop.properties.last_bus ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Connecting routes */}
          <div>
            <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[10px] font-medium tracking-wide uppercase">
              <span>Routes ({stop.properties.connecting_routes.length})</span>
              {stop.properties.is_hub && (
                <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider">
                  HUB
                </span>
              )}
            </div>

            {stop.properties.connecting_routes.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No scheduled routes found for this halte.
              </p>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                <div className="flex flex-col gap-2 pb-0.5 pr-1">
                  {stop.properties.connecting_routes.map((routeId) => {
                    const route = routesById.get(routeId);
                    const bg = route?.route_color
                      ? `#${route.route_color.replace(/^#/, "")}`
                      : "#6b7280";
                    const fg = route?.route_text_color
                      ? `#${route.route_text_color.replace(/^#/, "")}`
                      : "#ffffff";

                    return (
                      <RouteItem
                        key={routeId}
                        route={route}
                        routeId={routeId}
                        bg={bg}
                        fg={fg}
                        onSelect={() => {
                          const enableFn = !activeRouteIds.includes(routeId)
                            ? enableRoute
                            : undefined;
                          selectRoute(routeId, enableFn);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type RouteItemProps = {
  route: Route | undefined;
  routeId: string;
  bg: string;
  fg: string;
  onSelect: () => void;
};

const RouteItem = ({ route, routeId, bg, fg, onSelect }: RouteItemProps) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[10px] font-medium">
        Route
      </span>
      <button
        type="button"
        onClick={onSelect}
        title={route?.route_long_name}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-opacity hover:opacity-90 active:opacity-75"
        style={{ backgroundColor: bg, color: fg }}
      >
        <Bus className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 text-xs font-semibold leading-snug">
          {route
            ? `${route.route_short_name} - ${route.route_long_name}`
            : routeId}
        </span>
      </button>
    </div>
  );
};
