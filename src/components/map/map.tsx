"use client";

import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";
import type { MapProps, MapRef, MapStyleOption, MapViewport } from "@/types";
import { MapContext } from "./map-context";

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const getViewport = (map: MapLibreGL.Map): MapViewport => {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
};

const DefaultLoader = () => (
  <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
    <div className="flex gap-1">
      <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" />
      <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
      <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
    </div>
  </div>
);

export const MapLibreMap = forwardRef<MapRef, MapProps>(
  (
    {
      children,
      className,
      theme: themeProp,
      styles,
      projection,
      viewport,
      onViewportChange,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStyleLoaded, setIsStyleLoaded] = useState(false);
    const currentStyleRef = useRef<MapStyleOption | null>(null);
    const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const internalUpdateRef = useRef(false);
    const resolvedTheme = useResolvedTheme(themeProp);

    const isControlled =
      viewport !== undefined && onViewportChange !== undefined;

    const onViewportChangeRef = useRef(onViewportChange);
    onViewportChangeRef.current = onViewportChange;

    const mapStyles = useMemo(
      () => ({
        dark: styles?.dark ?? defaultStyles.dark,
        light: styles?.light ?? defaultStyles.light,
      }),
      [styles],
    );

    // Expose the map instance to the parent component
    useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [
      mapInstance,
    ]);

    const clearStyleTimeout = useCallback(() => {
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current);
        styleTimeoutRef.current = null;
      }
    }, []);

    // Initialize the map
    // biome-ignore lint/correctness/useExhaustiveDependencies: Complex map lifecycle management with intentional dependencies
    useEffect(() => {
      if (!containerRef.current) return;

      const initialStyle =
        resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
      currentStyleRef.current = initialStyle;

      const map = new MapLibreGL.Map({
        container: containerRef.current,
        style: initialStyle,
        renderWorldCopies: false,
        attributionControl: {
          compact: true,
        },
        ...props,
        ...viewport,
      });

      const styleDataHandler = () => {
        clearStyleTimeout();
        // Delay to ensure style is fully processed before allowing layer operations
        // This is a workaround to avoid race conditions with the style loading
        // else we have to force update every layer on setStyle change
        styleTimeoutRef.current = setTimeout(() => {
          setIsStyleLoaded(true);
          if (projection) {
            map.setProjection(projection);
          }
        }, 100);
      };
      const loadHandler = () => setIsLoaded(true);

      // Viewport change handler - skip if triggered by internal update
      const handleMove = () => {
        if (internalUpdateRef.current) return;
        onViewportChangeRef.current?.(getViewport(map));
      };

      map.on("load", loadHandler);
      map.on("styledata", styleDataHandler);
      map.on("move", handleMove);
      setMapInstance(map);

      return () => {
        clearStyleTimeout();
        map.off("load", loadHandler);
        map.off("styledata", styleDataHandler);
        map.off("move", handleMove);
        map.remove();
        setIsLoaded(false);
        setIsStyleLoaded(false);
        setMapInstance(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync controlled viewport to map
    useEffect(() => {
      if (!mapInstance || !isControlled || !viewport) return;
      if (mapInstance.isMoving()) return;

      const current = getViewport(mapInstance);
      const next = {
        center: viewport.center ?? current.center,
        zoom: viewport.zoom ?? current.zoom,
        bearing: viewport.bearing ?? current.bearing,
        pitch: viewport.pitch ?? current.pitch,
      };

      if (
        next.center[0] === current.center[0] &&
        next.center[1] === current.center[1] &&
        next.zoom === current.zoom &&
        next.bearing === current.bearing &&
        next.pitch === current.pitch
      ) {
        return;
      }

      internalUpdateRef.current = true;
      mapInstance.jumpTo(next);
      internalUpdateRef.current = false;
    }, [mapInstance, isControlled, viewport]);

    // Handle style change
    useEffect(() => {
      if (!mapInstance || !resolvedTheme) return;

      const newStyle =
        resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

      if (currentStyleRef.current === newStyle) return;

      clearStyleTimeout();
      currentStyleRef.current = newStyle;
      setIsStyleLoaded(false);

      mapInstance.setStyle(newStyle, { diff: true });
    }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

    const contextValue = useMemo(
      () => ({
        map: mapInstance,
        isLoaded: isLoaded && isStyleLoaded,
      }),
      [mapInstance, isLoaded, isStyleLoaded],
    );

    return (
      <MapContext.Provider value={contextValue}>
        <div
          ref={containerRef}
          className={cn("relative h-full w-full", className)}
        >
          {(!isLoaded || loading) && <DefaultLoader />}
          {/* SSR-safe: children render only when map is loaded on client */}
          {mapInstance && children}
        </div>
      </MapContext.Provider>
    );
  },
);

MapLibreMap.displayName = "Map";
