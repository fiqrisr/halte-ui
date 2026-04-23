import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Papa from "papaparse";

interface RouteRow {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
}

interface ShapeRow {
  shape_id: string;
  shape_pt_sequence: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
}

interface StopRow {
  stop_id: string;
  stop_name: string;
  stop_lat: string;
  stop_lon: string;
  location_type: string;
  parent_station: string;
}

interface OutputRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
}

interface OutputShape {
  shape_id: string;
  route_id: string;
  coordinates: [number, number][];
}

interface OutputStop {
  stop_id: string;
  stop_name: string;
  lng: number;
  lat: number;
}

const ROOT = resolve(process.cwd());
const GTFS_DIR = resolve(ROOT, "data/gtfs");
const OUT_FILE = resolve(ROOT, "public/api/transit-data.json");

// Keep every Nth shape point to reduce JSON size while preserving the polyline.
const SHAPE_POINT_STRIDE = 3;

function parseCsv<T>(path: string): T[] {
  const raw = readFileSync(path, "utf-8");
  const result = Papa.parse<T>(raw, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  });
  return result.data.filter((row): row is T => row !== null);
}

function normalizeHex(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  if (!v) return fallback;
  return v.startsWith("#") ? v : `#${v}`;
}

function buildRouteIndex(routes: OutputRoute[]): Map<string, OutputRoute> {
  const byShortName = new Map<string, OutputRoute>();
  for (const r of routes) {
    byShortName.set(r.route_short_name.toUpperCase(), r);
  }
  return byShortName;
}

function inferRouteFromShapeId(
  shapeId: string,
  index: Map<string, OutputRoute>,
): OutputRoute | undefined {
  // Shape ids look like "10B-R01_shp", "1-L01_shp" — prefix before first "-"
  // should match a route_short_name.
  const prefix = shapeId.split("-")[0]?.toUpperCase();
  if (!prefix) return undefined;
  return index.get(prefix);
}

function main() {
  console.log("[transit-data] Reading GTFS CSVs from", GTFS_DIR);

  const routeRows = parseCsv<RouteRow>(resolve(GTFS_DIR, "routes.txt"));
  const shapeRows = parseCsv<ShapeRow>(resolve(GTFS_DIR, "shapes.txt"));
  const stopRows = parseCsv<StopRow>(resolve(GTFS_DIR, "stops.txt"));

  const routes: OutputRoute[] = routeRows
    .filter((r) => r.route_id)
    .map((r) => ({
      route_id: r.route_id,
      route_short_name: r.route_short_name ?? "",
      route_long_name: r.route_long_name ?? "",
      route_color: normalizeHex(r.route_color, "#6b7280"),
      route_text_color: normalizeHex(r.route_text_color, "#ffffff"),
    }));

  const routeIndex = buildRouteIndex(routes);

  // Group shape points by shape_id, preserving sequence order.
  const shapeGroups = new Map<string, ShapeRow[]>();
  for (const row of shapeRows) {
    if (!row.shape_id) continue;
    const list = shapeGroups.get(row.shape_id);
    if (list) list.push(row);
    else shapeGroups.set(row.shape_id, [row]);
  }

  const shapes: OutputShape[] = [];
  for (const [shape_id, rows] of shapeGroups) {
    const matchedRoute = inferRouteFromShapeId(shape_id, routeIndex);
    if (!matchedRoute) continue;

    rows.sort(
      (a, b) => Number(a.shape_pt_sequence) - Number(b.shape_pt_sequence),
    );

    const coordinates: [number, number][] = [];
    for (let i = 0; i < rows.length; i++) {
      if (i !== 0 && i !== rows.length - 1 && i % SHAPE_POINT_STRIDE !== 0) {
        continue;
      }
      const lat = Number(rows[i].shape_pt_lat);
      const lon = Number(rows[i].shape_pt_lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        coordinates.push([lon, lat]);
      }
    }

    if (coordinates.length >= 2) {
      shapes.push({
        shape_id,
        route_id: matchedRoute.route_id,
        coordinates,
      });
    }
  }

  // Only render top-level stations (location_type=1) to avoid rendering
  // thousands of individual platform markers.
  const stops: OutputStop[] = stopRows
    .filter((s) => s.location_type === "1")
    .map((s) => ({
      stop_id: s.stop_id,
      stop_name: s.stop_name,
      lng: Number(s.stop_lon),
      lat: Number(s.stop_lat),
    }))
    .filter((s) => Number.isFinite(s.lng) && Number.isFinite(s.lat));

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ routes, shapes, stops }), "utf-8");

  console.log(
    `[transit-data] Wrote ${routes.length} routes, ${shapes.length} shapes, ${stops.length} stops -> ${OUT_FILE}`,
  );
}

main();
