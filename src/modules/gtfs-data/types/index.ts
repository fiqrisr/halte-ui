export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
}

export interface Shape {
  shape_id: string;
  route_id: string;
  coordinates: [number, number][];
}

export interface Stop {
  stop_id: string;
  stop_name: string;
  lng: number;
  lat: number;
}

export interface TransitData {
  routes: Route[];
  shapes: Shape[];
  stops: Stop[];
}
