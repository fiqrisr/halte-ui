import type { Feature, FeatureCollection, LineString, Point } from "geojson";

export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
}

export interface RouteLineProperties {
  shape_id: string;
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
}

export interface StopProperties {
  stop_id: string;
  stop_name: string;
}

export type RouteLineFeature = Feature<LineString, RouteLineProperties>;
export type StopFeature = Feature<Point, StopProperties>;

export type RoutesGeoJSON = FeatureCollection<LineString, RouteLineProperties>;
export type StopsGeoJSON = FeatureCollection<Point, StopProperties>;

export interface TransitData {
  routes: Route[];
  routesGeoJSON: RoutesGeoJSON;
  stopsGeoJSON: StopsGeoJSON;
}
