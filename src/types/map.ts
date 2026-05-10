import type {
  LineLayerSpecification,
  MapOptions,
  MarkerOptions,
  PopupOptions,
  ProjectionSpecification,
  StyleSpecification,
} from "maplibre-gl";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";

export interface MapContextValue {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export type MapStyleOption = string | StyleSpecification;

export type MapRef = maplibregl.Map;

export interface MapProps extends Omit<MapOptions, "container" | "style"> {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  projection?: ProjectionSpecification;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
}

export interface MarkerContextValue {
  marker: maplibregl.Marker;
  map: maplibregl.Map | null;
}

export interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

export interface MarkerContentProps {
  children?: ReactNode;
  className?: string;
}

export interface MarkerPopupProps
  extends Omit<PopupOptions, "className" | "closeButton"> {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
}

export interface MarkerTooltipProps
  extends Omit<PopupOptions, "className" | "closeButton" | "closeOnClick"> {
  children: ReactNode;
  className?: string;
}

export interface MarkerLabelProps {
  children: ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

export interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

export interface MapPopupProps
  extends Omit<PopupOptions, "className" | "closeButton"> {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
}

export interface MapRouteProps {
  id?: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  interactive?: boolean;
}

export interface MapArcDatum {
  id: string | number;
  from: [number, number];
  to: [number, number];
}

export interface MapArcEvent<T extends MapArcDatum = MapArcDatum> {
  arc: T;
  longitude: number;
  latitude: number;
  originalEvent: maplibregl.MapMouseEvent;
}

export type MapArcLinePaint = NonNullable<LineLayerSpecification["paint"]>;
export type MapArcLineLayout = NonNullable<LineLayerSpecification["layout"]>;

export interface MapArcProps<T extends MapArcDatum = MapArcDatum> {
  data: T[];
  id?: string;
  curvature?: number;
  samples?: number;
  paint?: MapArcLinePaint;
  layout?: MapArcLineLayout;
  hoverPaint?: MapArcLinePaint;
  onClick?: (e: MapArcEvent<T>) => void;
  onHover?: (e: MapArcEvent<T> | null) => void;
  interactive?: boolean;
  beforeId?: string;
}

export interface MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> {
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number],
  ) => void;
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number,
  ) => void;
}
