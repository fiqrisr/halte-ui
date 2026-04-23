"use client";

import { MapPin } from "lucide-react";
import type { MapMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import type { RoutesGeoJSON, StopsGeoJSON } from "@/modules/gtfs-data/types";
import { MapPopup, useMap } from "@/shared/components/ui/map";

const ROUTES_SOURCE_ID = "transit-routes";
const ROUTES_LAYER_ID = "transit-routes-line";
const STOPS_SOURCE_ID = "transit-stops";
const STOPS_LAYER_ID = "transit-stops-circle";

interface TransitLayersProps {
  routesGeoJSON: RoutesGeoJSON;
  stopsGeoJSON: StopsGeoJSON;
}

interface SelectedStop {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

export function TransitLayers({
  routesGeoJSON,
  stopsGeoJSON,
}: TransitLayersProps) {
  const { map, isLoaded } = useMap();
  const [selected, setSelected] = useState<SelectedStop | null>(null);

  // Add/update the routes + stops sources and layers.
  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!map.getSource(ROUTES_SOURCE_ID)) {
      map.addSource(ROUTES_SOURCE_ID, {
        type: "geojson",
        data: routesGeoJSON,
      });
    } else {
      const src = map.getSource(ROUTES_SOURCE_ID) as maplibregl.GeoJSONSource;
      src.setData(routesGeoJSON);
    }

    if (!map.getLayer(ROUTES_LAYER_ID)) {
      map.addLayer({
        id: ROUTES_LAYER_ID,
        type: "line",
        source: ROUTES_SOURCE_ID,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", "route_color"],
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });
    }

    if (!map.getSource(STOPS_SOURCE_ID)) {
      map.addSource(STOPS_SOURCE_ID, {
        type: "geojson",
        data: stopsGeoJSON,
      });
    } else {
      const src = map.getSource(STOPS_SOURCE_ID) as maplibregl.GeoJSONSource;
      src.setData(stopsGeoJSON);
    }

    if (!map.getLayer(STOPS_LAYER_ID)) {
      map.addLayer({
        id: STOPS_LAYER_ID,
        type: "circle",
        source: STOPS_SOURCE_ID,
        paint: {
          "circle-radius": 4,
          "circle-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000000",
        },
      });
    }
  }, [map, isLoaded, routesGeoJSON, stopsGeoJSON]);

  // Hover cursor + click-to-open popup on the stops layer.
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [STOPS_LAYER_ID],
      });
      const feature = features[0];
      if (!feature || feature.geometry.type !== "Point") {
        setSelected(null);
        return;
      }
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      const props = feature.properties as {
        stop_id: string;
        stop_name: string;
      };
      setSelected({
        id: props.stop_id,
        name: props.stop_name,
        lng,
        lat,
      });
    };

    map.on("mouseenter", STOPS_LAYER_ID, handleMouseEnter);
    map.on("mouseleave", STOPS_LAYER_ID, handleMouseLeave);
    map.on("click", STOPS_LAYER_ID, handleClick);

    return () => {
      map.off("mouseenter", STOPS_LAYER_ID, handleMouseEnter);
      map.off("mouseleave", STOPS_LAYER_ID, handleMouseLeave);
      map.off("click", STOPS_LAYER_ID, handleClick);
    };
  }, [map, isLoaded]);

  if (!selected) return null;

  return (
    <MapPopup
      longitude={selected.lng}
      latitude={selected.lat}
      onClose={() => setSelected(null)}
      closeButton
      closeOnClick={false}
      focusAfterOpen={false}
      className="w-60 p-0"
    >
      <div className="space-y-1 p-3">
        <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
          Transjakarta Halte
        </p>
        <div className="flex items-start gap-2">
          <MapPin className="text-foreground/60 mt-0.5 size-3.5 shrink-0" />
          <h3 className="text-foreground text-sm font-semibold leading-snug">
            {selected.name}
          </h3>
        </div>
        <p className="text-muted-foreground pt-1 font-mono text-[10px]">
          {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
        </p>
      </div>
    </MapPopup>
  );
}
