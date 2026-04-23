import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { featureCollection, lineString, point } from "@turf/helpers";
import simplify from "@turf/simplify";
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

const ROOT = resolve(process.cwd());
const GTFS_DIR = resolve(ROOT, "data/gtfs");
const OUT_FILE = resolve(ROOT, "public/api/transit-data.json");

// Douglas–Peucker tolerance (in degrees) applied to each polyline.
const SIMPLIFY_TOLERANCE = 0.0001;

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

  type RouteLineProps = {
    shape_id: string;
    route_id: string;
    route_short_name: string;
    route_long_name: string;
    route_color: string;
  };

  const routeFeatures: GeoJSON.Feature<GeoJSON.LineString, RouteLineProps>[] =
    [];
  let rawPointCount = 0;
  let simplifiedPointCount = 0;

  for (const [shape_id, rows] of shapeGroups) {
    const matchedRoute = inferRouteFromShapeId(shape_id, routeIndex);
    if (!matchedRoute) continue;

    rows.sort(
      (a, b) => Number(a.shape_pt_sequence) - Number(b.shape_pt_sequence),
    );

    const coordinates: [number, number][] = [];
    for (const row of rows) {
      const lat = Number(row.shape_pt_lat);
      const lon = Number(row.shape_pt_lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        coordinates.push([lon, lat]);
      }
    }
    if (coordinates.length < 2) continue;

    rawPointCount += coordinates.length;

    const raw = lineString<RouteLineProps>(coordinates, {
      shape_id,
      route_id: matchedRoute.route_id,
      route_short_name: matchedRoute.route_short_name,
      route_long_name: matchedRoute.route_long_name,
      route_color: matchedRoute.route_color,
    });

    const simplified = simplify(raw, {
      tolerance: SIMPLIFY_TOLERANCE,
      highQuality: true,
      mutate: true,
    });

    simplifiedPointCount += simplified.geometry.coordinates.length;
    routeFeatures.push(simplified);
  }

  const routesGeoJSON = featureCollection(routeFeatures);

  // Only emit top-level stations (location_type=1) as stop features.
  type StopProps = { stop_id: string; stop_name: string };
  const stopFeatures: GeoJSON.Feature<GeoJSON.Point, StopProps>[] = stopRows
    .filter((s) => s.location_type === "1")
    .map((s) => {
      const lng = Number(s.stop_lon);
      const lat = Number(s.stop_lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return point<StopProps>([lng, lat], {
        stop_id: s.stop_id,
        stop_name: s.stop_name,
      });
    })
    .filter((f): f is GeoJSON.Feature<GeoJSON.Point, StopProps> => f !== null);

  const stopsGeoJSON = featureCollection(stopFeatures);

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify({ routes, routesGeoJSON, stopsGeoJSON }),
    "utf-8",
  );

  console.log(
    `[transit-data] Wrote ${routes.length} routes, ${routeFeatures.length} line features (${rawPointCount} -> ${simplifiedPointCount} points, ${(
      (1 - simplifiedPointCount / Math.max(rawPointCount, 1)) * 100
    ).toFixed(1)}% reduction), ${stopFeatures.length} stops -> ${OUT_FILE}`,
  );
}

main();
