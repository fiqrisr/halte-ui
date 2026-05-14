# halte.ui

An interactive, modern transit map for the **Transjakarta BRT network**, built with Next.js and MapLibre GL.

**Live:** [https://halte.fiqri.dev](https://halte.fiqri.dev)

## Tech Stack

- **Framework** — [Next.js](https://nextjs.org) 16 (App Router, React Compiler)
- **UI** — React 19, TailwindCSS v4, `shadcn/ui` (new-york), Lucide React, `vaul` (Drawer)
- **Map** — [MapLibre GL](https://maplibre.org)
- **State** — [Zustand](https://zustand-demo.pmnd.rs)
- **Data** — GTFS (routes, stops, shapes, trips, stop times) processed via custom script
- **Spatial** — [@turf](https://turfjs.org) for nearest-point queries
- **Linting/Formatting** — [Biome](https://biomejs.dev)
- **Package Manager** — [pnpm](https://pnpm.io)

## Getting Started

> **Requires [pnpm](https://pnpm.io).**

Install dependencies:

```bash
pnpm install
```

Run the development server (GTFS data is pre-processed automatically via the `predev` script):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command                      | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `pnpm dev`                   | Start dev server (runs GTFS generation first)         |
| `pnpm build`                 | Production build (runs GTFS generation first)         |
| `pnpm start`                 | Start production server                               |
| `pnpm lint`                  | Lint with Biome                                       |
| `pnpm format`                | Format with Biome                                     |
| `pnpm generate:transit-data` | Manually re-generate processed transit data from GTFS |

## Project Structure

```
halte-ui/
├── data/
│   └── gtfs/                        # Raw GTFS source files (routes, stops, shapes, trips, stop_times)
├── public/
│   └── api/
│       └── transit-data.json        # Generated transit data (do not edit manually)
├── scripts/
│   └── generate-transit-data.ts     # Processes GTFS CSVs into optimised JSON for the app
└── src/
    ├── app/                         # Next.js App Router (page, layout, global styles)
    ├── components/
    │   ├── map/                     # Custom MapLibre GL React primitives
    │   │   ├── map.tsx              #   Root <Map> component
    │   │   ├── map-arc.tsx          #   Arc/great-circle line layer
    │   │   ├── map-cluster-layer.tsx#   Clustered point layer
    │   │   ├── map-context.ts       #   React context for map instance
    │   │   ├── map-controls.tsx     #   Navigation/zoom controls
    │   │   ├── map-marker.tsx       #   Custom DOM marker
    │   │   ├── map-popup.tsx        #   MapLibre popup wrapper
    │   │   ├── map-route.tsx        #   GeoJSON route line layer
    │   │   ├── marker-label.tsx     #   Marker label overlay
    │   │   ├── marker-popup.tsx     #   Popup attached to a marker
    │   │   ├── marker-tooltip.tsx   #   Tooltip overlay
    │   │   ├── popup-close-button.tsx
    │   │   └── index.ts             #   Barrel exports
    │   └── ui/                      # shadcn/ui primitives (accordion, button, card, drawer, …)
    ├── hooks/
    │   ├── use-mobile.ts            # Client-side mobile breakpoint detection
    │   └── use-resolved-theme.ts    # Light/dark theme resolver
    ├── layouts/
    │   └── main-layout/             # App shell (sidebar, search palette, mobile bottom bar)
    ├── lib/                         # Shared utilities (cn(), getContrastText(), …)
    ├── modules/
    │   └── transit-map/             # Core feature module
    │       ├── api/
    │       │   └── transit-data.ts  #   fetchTransitData()
    │       ├── components/
    │       │   ├── route-card.tsx   #   Route detail card / mobile drawer
    │       │   ├── route-filters.tsx#   Category & route filter accordion
    │       │   ├── station-card.tsx #   Station detail card / mobile drawer
    │       │   ├── transit-layers.tsx#  MapLibre route + stop layers
    │       │   └── transit-map-view.tsx# Top-level map view component
    │       ├── store/
    │       │   ├── filter-store.ts  #   Route/category filter state
    │       │   └── map-store.ts     #   Map & transit data state
    │       ├── types/
    │       │   └── store.ts         #   Store type definitions
    │       └── index.ts             #   Barrel exports
    └── types/                       # Shared TypeScript types
        ├── map.ts                   #   MapLibre / map-related types
        ├── transit.ts               #   GTFS / transit data types
        ├── ui.ts                    #   UI component prop types
        └── index.ts                 #   Barrel re-exports
```
