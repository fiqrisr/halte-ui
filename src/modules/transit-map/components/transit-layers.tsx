"use client";

import { featureCollection, lineString, point } from "@turf/helpers";
import nearestPoint from "@turf/nearest-point";
import type { FeatureCollection, LineString } from "geojson";
import { MapPin } from "lucide-react";
import type { FilterSpecification, MapMouseEvent } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";
import { MapPopup, useMap } from "@/components/map";
import { useMobile } from "@/hooks/use-mobile";
import type { SelectedStop } from "@/types";
import { useFilterStore } from "../store/filter-store";
import { useMapStore } from "../store/map-store";

const ROUTES_SOURCE_ID = "transit-routes";
const ROUTES_LAYER_ID = "transit-routes-line";
const STOPS_SOURCE_ID = "transit-stops";
const STOPS_LAYER_ID = "transit-stops-circle";
const USER_SOURCE_ID = "user-location";
const USER_LAYER_ID = "user-location-circle";
const NEAREST_SOURCE_ID = "nearest-stop-line";
const NEAREST_LAYER_ID = "nearest-stop-line-layer";

export const TransitLayers = () => {
  const isMobile = useMobile();
  const { map, isLoaded } = useMap();
  const transitData = useMapStore((s) => s.transitData);
  const selectedRouteId = useMapStore((s) => s.selectedRouteId);
  const hoveredRouteId = useMapStore((s) => s.hoveredRouteId);
  const userLocation = useMapStore((s) => s.userLocation);
  const flyTarget = useMapStore((s) => s.flyTarget);
  const selectRoute = useMapStore((s) => s.selectRoute);
  const selectStop = useMapStore((s) => s.selectStop);
  const setHoveredRouteId = useMapStore((s) => s.setHoveredRouteId);
  const clearHoveredRouteId = useMapStore((s) => s.clearHoveredRouteId);
  const activeRouteIds = useFilterStore((s) => s.activeRouteIds);
  const disableRoute = useFilterStore((s) => s.disableRoute);

  const [hoverPopup, setHoverPopup] = useState<SelectedStop | null>(null);

  const routesGeoJSON = transitData?.routesGeoJSON;
  const stopsGeoJSON = transitData?.stopsGeoJSON;

  // --- Initial source + layer registration ---
  useEffect(() => {
    if (!map || !isLoaded || !routesGeoJSON || !stopsGeoJSON) return;

    if (!map.getSource(ROUTES_SOURCE_ID)) {
      map.addSource(ROUTES_SOURCE_ID, {
        type: "geojson",
        data: routesGeoJSON,
      });
    } else {
      (map.getSource(ROUTES_SOURCE_ID) as maplibregl.GeoJSONSource).setData(
        routesGeoJSON,
      );
    }

    if (!map.getSource(STOPS_SOURCE_ID)) {
      map.addSource(STOPS_SOURCE_ID, {
        type: "geojson",
        data: stopsGeoJSON,
      });
    } else {
      (map.getSource(STOPS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(
        stopsGeoJSON,
      );
    }

    if (!map.getLayer(ROUTES_LAYER_ID)) {
      // Insert the routes layer beneath the stops layer so highlighted
      // polylines never visually swallow the stop/hub circles on top.
      const beforeId = map.getLayer(STOPS_LAYER_ID)
        ? STOPS_LAYER_ID
        : undefined;
      map.addLayer(
        {
          id: ROUTES_LAYER_ID,
          type: "line",
          source: ROUTES_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": ["get", "route_color"],
            // Placeholders — the dedicated paint effect below drives the
            // actual opacity/width based on selected/hovered route state.
            "line-width": 3,
            "line-opacity": 0.4,
          },
        },
        beforeId,
      );
    }

    if (!map.getLayer(STOPS_LAYER_ID)) {
      map.addLayer({
        id: STOPS_LAYER_ID,
        type: "circle",
        source: STOPS_SOURCE_ID,
        paint: {
          // Hubs render larger with a bold outline for visual prominence.
          "circle-radius": ["case", ["==", ["get", "is_hub"], true], 7, 4],
          "circle-color": [
            "case",
            ["==", ["get", "is_hub"], true],
            "#facc15",
            "#ffffff",
          ],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "is_hub"], true],
            3,
            2,
          ],
          "circle-stroke-color": "#000000",
        },
      });
    }

    if (!map.getSource(NEAREST_SOURCE_ID)) {
      map.addSource(NEAREST_SOURCE_ID, {
        type: "geojson",
        data: featureCollection([]),
      });
    }
    if (!map.getLayer(NEAREST_LAYER_ID)) {
      map.addLayer({
        id: NEAREST_LAYER_ID,
        type: "line",
        source: NEAREST_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 2.5,
          "line-dasharray": [2, 2],
        },
      });
    }

    if (!map.getSource(USER_SOURCE_ID)) {
      map.addSource(USER_SOURCE_ID, {
        type: "geojson",
        data: featureCollection([]),
      });
    }
    if (!map.getLayer(USER_LAYER_ID)) {
      map.addLayer({
        id: USER_LAYER_ID,
        type: "circle",
        source: USER_SOURCE_ID,
        paint: {
          "circle-radius": 7,
          "circle-color": "#0ea5e9",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
    }
  }, [map, isLoaded, routesGeoJSON, stopsGeoJSON]);

  // --- Fit the map to show the full selected route ---
  useEffect(() => {
    if (!map || !isLoaded || !routesGeoJSON || !selectedRouteId) return;

    const features = routesGeoJSON.features.filter(
      (f) => f.properties.route_id === selectedRouteId,
    );
    if (!features.length) return;

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const f of features) {
      for (const [lng, lat] of f.geometry.coordinates) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }

    if (!Number.isFinite(minLng)) return;

    // Desktop: left padding offsets the route card overlay (288px + margins).
    // Mobile: no left card, but extra bottom padding for the Drawer sheet.
    const padding = isMobile
      ? { top: 60, bottom: 280, left: 40, right: 40 }
      : { top: 60, bottom: 60, left: 316, right: 60 };
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding, duration: 1200, maxZoom: 14 },
    );
  }, [map, isLoaded, selectedRouteId, routesGeoJSON, isMobile]);

  // --- Data-driven paint: Focus Mode + Hover Highlight ---
  // Rules:
  //  1. If a route is selected: matching -> 1.0 / 6px, others -> 0.1 / 2px.
  //  2. Else if a route is hovered: matching -> 1.0 / 5px, others -> 0.4 / 3px.
  //  3. Otherwise: every route rendered at 0.4 / 3px so the hover state pops.
  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(ROUTES_LAYER_ID)) return;

    let opacity: maplibregl.ExpressionSpecification | number;
    let width: maplibregl.ExpressionSpecification | number;

    if (selectedRouteId) {
      opacity = [
        "case",
        ["==", ["get", "route_id"], selectedRouteId],
        1.0,
        0.1,
      ];
      width = ["case", ["==", ["get", "route_id"], selectedRouteId], 6, 2];
    } else if (hoveredRouteId) {
      opacity = ["case", ["==", ["get", "route_id"], hoveredRouteId], 1.0, 0.4];
      width = ["case", ["==", ["get", "route_id"], hoveredRouteId], 5, 3];
    } else {
      opacity = 0.4;
      width = 3;
    }

    map.setPaintProperty(ROUTES_LAYER_ID, "line-opacity", opacity);
    map.setPaintProperty(ROUTES_LAYER_ID, "line-width", width);
  }, [map, isLoaded, selectedRouteId, hoveredRouteId]);

  // --- Category filter ---
  // Routes carry a single `category`; stops carry an array `categories`
  // (because a hub can be served by multiple route classes), so the stop
  // filter checks whether ANY of its categories is currently active.
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (map.getLayer(ROUTES_LAYER_ID)) {
      map.setFilter(ROUTES_LAYER_ID, [
        "in",
        ["get", "route_id"],
        ["literal", activeRouteIds],
      ]);
    }
    if (map.getLayer(STOPS_LAYER_ID)) {
      if (activeRouteIds.length === 0) {
        // No routes active → hide every stop.
        map.setFilter(STOPS_LAYER_ID, ["==", ["literal", 1], 0]);
      } else {
        // A stop is shown if ANY of its connecting routes is active.
        const stopFilter = [
          "any",
          ...activeRouteIds.map((id) => [
            "in",
            id,
            ["get", "connecting_routes"],
          ]),
        ] as unknown as FilterSpecification;
        map.setFilter(STOPS_LAYER_ID, stopFilter);
      }
    }
  }, [map, isLoaded, activeRouteIds]);

  // --- Route hover interactions ---
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMove = (e: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(e.point, {
        layers: [ROUTES_LAYER_ID],
      })[0];
      if (!feature) return;
      const props = feature.properties as { route_id?: string };
      if (props.route_id) {
        setHoveredRouteId(props.route_id);
        map.getCanvas().style.cursor = "pointer";
      }
    };
    const handleLeave = () => {
      clearHoveredRouteId();
      map.getCanvas().style.cursor = "";
    };
    const handleClick = (e: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(e.point, {
        layers: [ROUTES_LAYER_ID],
      })[0];
      if (!feature) return;
      const props = feature.properties as { route_id?: string };
      if (props.route_id) {
        selectRoute(props.route_id);
      }
    };

    map.on("mousemove", ROUTES_LAYER_ID, handleMove);
    map.on("mouseleave", ROUTES_LAYER_ID, handleLeave);
    map.on("click", ROUTES_LAYER_ID, handleClick);

    return () => {
      map.off("mousemove", ROUTES_LAYER_ID, handleMove);
      map.off("mouseleave", ROUTES_LAYER_ID, handleLeave);
      map.off("click", ROUTES_LAYER_ID, handleClick);
    };
  }, [map, isLoaded, setHoveredRouteId, clearHoveredRouteId, selectRoute]);

  // --- User location + nearest-stop dashed line ---
  const nearestLine = useMemo<FeatureCollection<LineString> | null>(() => {
    if (!userLocation || !stopsGeoJSON || stopsGeoJSON.features.length === 0) {
      return null;
    }
    const user = point(userLocation);
    const nearest = nearestPoint(user, stopsGeoJSON);
    const line = lineString([
      userLocation,
      nearest.geometry.coordinates as [number, number],
    ]);
    return featureCollection([line]);
  }, [userLocation, stopsGeoJSON]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const userSource = map.getSource(USER_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    const nearestSource = map.getSource(NEAREST_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!userSource || !nearestSource) return;

    if (userLocation) {
      userSource.setData(featureCollection([point(userLocation)]));
    } else {
      userSource.setData(featureCollection([]));
    }
    nearestSource.setData(nearestLine ?? featureCollection([]));
  }, [map, isLoaded, userLocation, nearestLine]);

  // --- Interactions on the stops layer ---
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMouseEnter = (e: MapMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = map.queryRenderedFeatures(e.point, {
        layers: [STOPS_LAYER_ID],
      })[0];
      if (!feature || feature.geometry.type !== "Point") return;
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      const props = feature.properties as {
        stop_id: string;
        stop_name: string;
      };
      setHoverPopup({
        id: props.stop_id,
        name: props.stop_name,
        lng,
        lat,
      });
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoverPopup(null);
    };
    const handleClick = (e: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(e.point, {
        layers: [STOPS_LAYER_ID],
      })[0];
      if (!feature) {
        return;
      }
      const props = feature.properties as { stop_id: string };
      selectStop(props.stop_id, disableRoute);
      setHoverPopup(null);
    };

    map.on("mouseenter", STOPS_LAYER_ID, handleMouseEnter);
    map.on("mousemove", STOPS_LAYER_ID, handleMouseEnter);
    map.on("mouseleave", STOPS_LAYER_ID, handleMouseLeave);
    map.on("click", STOPS_LAYER_ID, handleClick);

    return () => {
      map.off("mouseenter", STOPS_LAYER_ID, handleMouseEnter);
      map.off("mousemove", STOPS_LAYER_ID, handleMouseEnter);
      map.off("mouseleave", STOPS_LAYER_ID, handleMouseLeave);
      map.off("click", STOPS_LAYER_ID, handleClick);
    };
  }, [map, isLoaded, selectStop, disableRoute]);

  // --- FlyTo driven by the store ---
  useEffect(() => {
    if (!map || !isLoaded || !flyTarget) return;
    map.flyTo({
      center: [flyTarget.lng, flyTarget.lat],
      zoom: flyTarget.zoom,
      essential: true,
      speed: 1.4,
    });
  }, [map, isLoaded, flyTarget]);

  if (!hoverPopup) return null;

  return (
    <MapPopup
      longitude={hoverPopup.lng}
      latitude={hoverPopup.lat}
      closeButton={false}
      closeOnClick={false}
      focusAfterOpen={false}
      className="w-auto max-w-55 p-0"
    >
      <div className="flex items-start gap-2 p-2.5">
        <MapPin className="text-foreground/60 mt-0.5 size-3.5 shrink-0" />
        <span className="text-foreground text-xs font-semibold leading-tight">
          {hoverPopup.name}
        </span>
      </div>
    </MapPopup>
  );
};
