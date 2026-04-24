import type { Feature, FeatureCollection, LineString, Point } from "geojson";

export type RouteCategory =
  | "brt"
  | "royaltrans"
  | "wisata"
  | "rusun"
  | "transjabodetabek"
  | "jaklingko"
  | "non-brt";

export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
  category: RouteCategory;
}

export interface RouteLineProperties {
  shape_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  category: RouteCategory;
}

export interface StopProperties {
  stop_id: string;
  stop_name: string;
  connecting_routes: string[];
  categories: RouteCategory[];
  is_hub: boolean;
  first_bus: string | null;
  last_bus: string | null;
}

export type RouteLineFeature = Feature<LineString, RouteLineProperties>;
export type StopFeature = Feature<Point, StopProperties>;

export type RoutesGeoJSON = FeatureCollection<LineString, RouteLineProperties>;
export type StopsGeoJSON = FeatureCollection<Point, StopProperties>;

export interface RouteCatalogEntry {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
}

export type RouteCatalog = Record<RouteCategory, RouteCatalogEntry[]>;

export interface TransitData {
  routes: Route[];
  routesGeoJSON: RoutesGeoJSON;
  stopsGeoJSON: StopsGeoJSON;
  routeCatalog: RouteCatalog;
}
