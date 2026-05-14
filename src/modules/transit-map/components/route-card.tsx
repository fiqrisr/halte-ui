"use client";

import { Bus, X } from "lucide-react";
import { useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { RouteLineFeature, StopFeature } from "@/types";
import { CATEGORY_LABELS, useFilterStore } from "../store/filter-store";
import { useMapStore } from "../store/map-store";

export const RouteCard = () => {
  const isMobile = useMobile();
  const transitData = useMapStore((s) => s.transitData);
  const selectedRouteId = useMapStore((s) => s.selectedRouteId);
  const deselectRoute = useMapStore((s) => s.deselectRoute);
  const selectStop = useMapStore((s) => s.selectStop);
  const disableRoute = useFilterStore((s) => s.disableRoute);

  const route = useMemo(() => {
    if (!transitData || !selectedRouteId) return undefined;
    return transitData.routes.find((r) => r.route_id === selectedRouteId);
  }, [transitData, selectedRouteId]);

  const routeFeatures = useMemo<RouteLineFeature[]>(() => {
    if (!transitData || !selectedRouteId) return [];
    return transitData.routesGeoJSON.features.filter(
      (f) => f.properties.route_id === selectedRouteId,
    );
  }, [transitData, selectedRouteId]);

  // Order stops along the route by projecting each onto the nearest route coordinate.
  const orderedStops = useMemo<StopFeature[]>(() => {
    if (!transitData || !selectedRouteId) return [];

    const stopsForRoute = transitData.stopsGeoJSON.features.filter((f) =>
      f.properties.connecting_routes.includes(selectedRouteId),
    );

    if (!stopsForRoute.length || !routeFeatures.length) return stopsForRoute;

    // Flatten all route-segment coordinates into one polyline.
    const routeCoords: [number, number][] = [];
    for (const f of routeFeatures) {
      for (const c of f.geometry.coordinates) {
        routeCoords.push(c as [number, number]);
      }
    }

    if (!routeCoords.length) return stopsForRoute;

    return [...stopsForRoute]
      .map((stop) => {
        const [lng, lat] = stop.geometry.coordinates as [number, number];
        let minDist = Infinity;
        let minIdx = 0;
        for (let i = 0; i < routeCoords.length; i++) {
          const [rlng, rlat] = routeCoords[i];
          const d = (lng - rlng) ** 2 + (lat - rlat) ** 2;
          if (d < minDist) {
            minDist = d;
            minIdx = i;
          }
        }
        return { stop, idx: minIdx };
      })
      .sort((a, b) => a.idx - b.idx)
      .map((s) => s.stop);
  }, [transitData, selectedRouteId, routeFeatures]);

  const routeColor = route
    ? route.route_color.startsWith("#")
      ? route.route_color
      : `#${route.route_color}`
    : "";
  const routeTextColor = route
    ? route.route_text_color.startsWith("#")
      ? route.route_text_color
      : `#${route.route_text_color}`
    : "";

  // Mobile: render as a bottom Drawer
  if (isMobile) {
    return (
      <Drawer
        open={!!selectedRouteId}
        onOpenChange={(open) => !open && deselectRoute(disableRoute)}
      >
        <DrawerContent>
          <DrawerTitle className="sr-only">Route Details</DrawerTitle>
          {route && (
            <>
              <div
                className="h-1.5 w-full shrink-0"
                style={{ backgroundColor: routeColor }}
              />
              <div className="flex items-start gap-2 border-b px-4 pt-3 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: routeColor,
                        color: routeTextColor,
                      }}
                    >
                      <Bus className="size-3" />
                      {route.route_short_name}
                    </span>
                    <span className="text-muted-foreground truncate text-[10px] font-medium">
                      {CATEGORY_LABELS[route.category]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-tight">
                    {route.route_long_name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    {orderedStops.length}{" "}
                    {orderedStops.length === 1 ? "stop" : "stops"} along this
                    route
                  </p>
                </div>
              </div>
              <div className="max-h-[58vh] overflow-y-auto">
                {orderedStops.length === 0 ? (
                  <p className="text-muted-foreground px-4 py-3 text-xs">
                    No stops found for this route.
                  </p>
                ) : (
                  <>
                    <div className="px-4 pt-3 pb-1.5">
                      <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                        Stops
                      </span>
                    </div>
                    <div className="relative px-4 pb-8">
                      <div
                        className="absolute top-3 bottom-3 w-px"
                        style={{
                          left: "26px",
                          backgroundColor: routeColor,
                          opacity: 0.25,
                        }}
                      />
                      <div className="flex flex-col">
                        {orderedStops.map((stop, idx) => (
                          <StopRow
                            key={stop.properties.stop_id}
                            stop={stop}
                            routeColor={routeColor}
                            isFirst={idx === 0}
                            isLast={idx === orderedStops.length - 1}
                            onSelect={() =>
                              selectStop(stop.properties.stop_id, disableRoute)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: absolute-positioned card
  if (!route || !selectedRouteId) return null;

  return (
    <div className="pointer-events-auto absolute top-4 left-4 z-60 w-72">
      <Card className="gap-0 overflow-hidden p-0 shadow-lg">
        {/* Colored accent stripe */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: routeColor }}
        />

        {/* Header */}
        <CardHeader className="grid-cols-[1fr_auto] items-start gap-2 border-b px-4 pt-3 pb-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: routeColor, color: routeTextColor }}
              >
                <Bus className="size-3" />
                {route.route_short_name}
              </span>
              <span className="text-muted-foreground truncate text-[10px] font-medium">
                {CATEGORY_LABELS[route.category]}
              </span>
            </div>
            <CardTitle className="text-sm leading-tight">
              {route.route_long_name}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {orderedStops.length}{" "}
              {orderedStops.length === 1 ? "stop" : "stops"} along this route
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground -mr-1 -mt-0.5 size-7 shrink-0"
            onClick={() => deselectRoute(disableRoute)}
            aria-label="Close route"
          >
            <X className="size-3.5" />
          </Button>
        </CardHeader>

        {/* Stop list */}
        <CardContent className="p-0">
          {orderedStops.length === 0 ? (
            <p className="text-muted-foreground px-4 py-3 text-xs">
              No stops found for this route.
            </p>
          ) : (
            <>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                  Stops
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {/* px-4 container for the timeline; absolute line uses left-[26px]
                    because 16px padding + 10px (half of size-5 dot) = 26px */}
                <div className="relative px-4 pb-3">
                  <div
                    className="absolute top-3 bottom-3 w-px"
                    style={{
                      left: "26px",
                      backgroundColor: routeColor,
                      opacity: 0.25,
                    }}
                  />
                  <div className="flex flex-col">
                    {orderedStops.map((stop, idx) => (
                      <StopRow
                        key={stop.properties.stop_id}
                        stop={stop}
                        routeColor={routeColor}
                        isFirst={idx === 0}
                        isLast={idx === orderedStops.length - 1}
                        onSelect={() =>
                          selectStop(stop.properties.stop_id, disableRoute)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

type StopRowProps = {
  stop: StopFeature;
  routeColor: string;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
};

const StopRow = ({
  stop,
  routeColor,
  isFirst,
  isLast,
  onSelect,
}: StopRowProps) => {
  const { stop_name, is_hub, first_bus, last_bus } = stop.properties;
  const isTerminus = isFirst || isLast;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex cursor-pointer items-start gap-3 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-accent/60"
    >
      {/* Timeline dot — z-10 so it renders above the vertical line */}
      <div className="relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center">
        {isTerminus ? (
          /* Terminus: solid filled circle */
          <div
            className="size-3.5 rounded-full shadow-sm ring-2 ring-background"
            style={{ backgroundColor: routeColor }}
          />
        ) : is_hub ? (
          /* Interchange hub: rotated square (diamond) */
          <div
            className="size-3 rotate-45 rounded-[2px] shadow-sm ring-1 ring-background"
            style={{ backgroundColor: routeColor }}
          />
        ) : (
          /* Regular stop: open circle */
          <div
            className="size-2.5 rounded-full border-[1.5px] bg-background"
            style={{ borderColor: routeColor }}
          />
        )}
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1 pt-px">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span
            className={cn(
              "text-xs leading-tight",
              isTerminus
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80 group-hover:text-foreground",
            )}
          >
            {stop_name}
          </span>
          {is_hub && (
            <span className="inline-block rounded bg-amber-100 px-1 text-[8px] font-semibold leading-[1.4rem] text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              HUB
            </span>
          )}
        </div>
        {(first_bus || last_bus) && (
          <p className="text-muted-foreground mt-0.5 font-mono text-[9px]">
            {first_bus ?? "—"} – {last_bus ?? "—"}
          </p>
        )}
      </div>
    </button>
  );
};
