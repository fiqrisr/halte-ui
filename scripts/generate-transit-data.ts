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

interface TripRow {
  trip_id: string;
  route_id: string;
}

interface StopTimeRow {
  trip_id: string;
  stop_id: string;
  departure_time: string;
}

type RouteCategory =
  | "brt"
  | "royaltrans"
  | "wisata"
  | "rusun"
  | "transjabodetabek"
  | "jaklingko"
  | "non-brt";

interface OutputRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
  route_text_color: string;
  category: RouteCategory;
}

// Authoritative short-name lists from Transjakarta's published route catalogue.
const OFFICIAL_BRT_ROUTES = [
  "1",
  "2",
  "2A",
  "3",
  "3F",
  "3H",
  "4",
  "4D",
  "5",
  "5C",
  "6",
  "6A",
  "6B",
  "6V",
  "7",
  "7F",
  "8",
  "9",
  "9A",
  "9C",
  "9N",
  "10",
  "10D",
  "10H",
  "11",
  "12",
  "13",
  "13B",
  "13E",
  "14",
  "L13E",
];
const ROYALTRANS_ROUTES = [
  "1K",
  "1T",
  "6P",
  "B13",
  "B14",
  "D31",
  "D32",
  "S12",
  "S14",
  "S31",
];
const WISATA_ROUTES = ["BW1", "BW2", "BW4"];
const RUSUN_ROUTES = [
  "2F",
  "2H",
  "3A",
  "3B",
  "3C",
  "4E",
  "9F",
  "10A",
  "10B",
  "11B",
  "11C",
  "11M",
  "11P",
  "11R",
  "12C",
  "12F",
  "12H",
];
const TRANSJABODETABEK_ROUTES = [
  "B11",
  "B21",
  "B25",
  "B41",
  "B51",
  "D11",
  "D21",
  "D41",
  "P11",
  "S11",
  "S21",
  "S22",
  "S61",
  "SH1",
  "SH2",
  "T11",
  "T12",
  "T31",
];

function classifyRoute(routeShortName: string): RouteCategory {
  const nameUpper = (routeShortName ?? "").trim().toUpperCase();
  if (OFFICIAL_BRT_ROUTES.includes(nameUpper)) return "brt";
  if (ROYALTRANS_ROUTES.includes(nameUpper)) return "royaltrans";
  if (WISATA_ROUTES.includes(nameUpper)) return "wisata";
  if (RUSUN_ROUTES.includes(nameUpper)) return "rusun";
  if (TRANSJABODETABEK_ROUTES.includes(nameUpper)) return "transjabodetabek";
  if (nameUpper.startsWith("JAK")) return "jaklingko";
  return "non-brt";
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
  const tripRows = parseCsv<TripRow>(resolve(GTFS_DIR, "trips.txt"));
  const stopTimeRows = parseCsv<StopTimeRow>(
    resolve(GTFS_DIR, "stop_times.txt"),
  );

  const routes: OutputRoute[] = routeRows
    .filter((r) => r.route_id)
    .map((r) => ({
      route_id: r.route_id,
      route_short_name: r.route_short_name ?? "",
      route_long_name: r.route_long_name ?? "",
      route_color: normalizeHex(r.route_color, "#6b7280"),
      route_text_color: normalizeHex(r.route_text_color, "#ffffff"),
      category: classifyRoute(r.route_short_name ?? ""),
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
    category: RouteCategory;
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
      category: matchedRoute.category,
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

  // --- Stop-level aggregation: connecting routes, first/last bus ---
  // Map any platform-level stop_id to its parent station id so that
  // per-platform stop_times aggregate up to the station we render.
  const platformToStation = new Map<string, string>();
  for (const s of stopRows) {
    if (s.location_type === "1") {
      platformToStation.set(s.stop_id, s.stop_id);
    } else if (s.parent_station) {
      platformToStation.set(s.stop_id, s.parent_station);
    }
  }

  const tripToRoute = new Map<string, string>();
  for (const t of tripRows) {
    if (t.trip_id && t.route_id) tripToRoute.set(t.trip_id, t.route_id);
  }

  const stationRoutes = new Map<string, Set<string>>();
  const stationFirst = new Map<string, string>();
  const stationLast = new Map<string, string>();

  for (const row of stopTimeRows) {
    const stationId = platformToStation.get(row.stop_id);
    if (!stationId) continue;
    const routeId = tripToRoute.get(row.trip_id);
    if (routeId) {
      let set = stationRoutes.get(stationId);
      if (!set) {
        set = new Set();
        stationRoutes.set(stationId, set);
      }
      set.add(routeId);
    }
    const dep = row.departure_time;
    if (dep && /^\d{1,2}:\d{2}:\d{2}$/.test(dep)) {
      const prevFirst = stationFirst.get(stationId);
      if (!prevFirst || dep < prevFirst) stationFirst.set(stationId, dep);
      const prevLast = stationLast.get(stationId);
      if (!prevLast || dep > prevLast) stationLast.set(stationId, dep);
    }
  }

  function toHhMm(time: string | undefined): string | null {
    if (!time) return null;
    const [h, m] = time.split(":");
    if (!h || !m) return null;
    // GTFS allows hours > 23 (e.g., "25:10:00"); clamp visually to 24h.
    const hh = Math.min(Number(h), 23).toString().padStart(2, "0");
    return `${hh}:${m}`;
  }

  // Only emit top-level stations (location_type=1) as stop features.
  type StopProps = {
    stop_id: string;
    stop_name: string;
    connecting_routes: string[];
    categories: RouteCategory[];
    is_hub: boolean;
    first_bus: string | null;
    last_bus: string | null;
  };

  const routeById = new Map(routes.map((r) => [r.route_id, r] as const));

  const stopFeatures: GeoJSON.Feature<GeoJSON.Point, StopProps>[] = stopRows
    .filter((s) => s.location_type === "1")
    .map((s) => {
      const lng = Number(s.stop_lon);
      const lat = Number(s.stop_lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      const connecting = Array.from(
        stationRoutes.get(s.stop_id) ?? new Set<string>(),
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const categorySet = new Set<RouteCategory>();
      for (const routeId of connecting) {
        const r = routeById.get(routeId);
        if (r) categorySet.add(r.category);
      }
      return point<StopProps>([lng, lat], {
        stop_id: s.stop_id,
        stop_name: s.stop_name,
        connecting_routes: connecting,
        categories: Array.from(categorySet),
        is_hub: connecting.length > 3,
        first_bus: toHhMm(stationFirst.get(s.stop_id)),
        last_bus: toHhMm(stationLast.get(s.stop_id)),
      });
    })
    .filter((f): f is GeoJSON.Feature<GeoJSON.Point, StopProps> => f !== null);

  const stopsGeoJSON = featureCollection(stopFeatures);
  const hubCount = stopFeatures.filter((f) => f.properties.is_hub).length;

  // Pre-computed catalog used by the sidebar's hierarchical filter UI.
  // Keyed by category so the frontend doesn't have to group at render time.
  type CatalogEntry = {
    route_id: string;
    route_short_name: string;
    route_long_name: string;
    route_color: string;
  };
  const routeCatalog: Record<RouteCategory, CatalogEntry[]> = {
    brt: [],
    royaltrans: [],
    wisata: [],
    rusun: [],
    transjabodetabek: [],
    jaklingko: [],
    "non-brt": [],
  };
  for (const r of routes) {
    routeCatalog[r.category].push({
      route_id: r.route_id,
      route_short_name: r.route_short_name,
      route_long_name: r.route_long_name,
      route_color: r.route_color,
    });
  }
  // Sort each bucket for stable, human-friendly display order.
  for (const key of Object.keys(routeCatalog) as RouteCategory[]) {
    routeCatalog[key].sort((a, b) =>
      a.route_short_name.localeCompare(b.route_short_name, undefined, {
        numeric: true,
      }),
    );
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify({ routes, routesGeoJSON, stopsGeoJSON, routeCatalog }),
    "utf-8",
  );

  console.log(
    `[transit-data] Wrote ${routes.length} routes, ${routeFeatures.length} line features (${rawPointCount} -> ${simplifiedPointCount} points, ${(
      (1 - simplifiedPointCount / Math.max(rawPointCount, 1)) * 100
    ).toFixed(
      1,
    )}% reduction), ${stopFeatures.length} stops (${hubCount} hubs) -> ${OUT_FILE}`,
  );
}

main();
