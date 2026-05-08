# halte.ui

An interactive, modern transit map for the **Transjakarta BRT network**, built with Next.js and MapLibre GL.

## Tech Stack

- **Framework** — [Next.js](https://nextjs.org) 16 (App Router)
- **UI** — React 19, TailwindCSS v4, Radix UI, `shadcn/ui`, Lucide React
- **Map** — [MapLibre GL](https://maplibre.org)
- **State** — [Zustand](https://zustand-demo.pmnd.rs)
- **Data** — GTFS (routes, stops, shapes, trips, stop times) processed via custom script
- **Spatial** — [@turf](https://turfjs.org) for nearest-point queries
- **Linting/Formatting** — [Biome](https://biomejs.dev)

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
src/
├── app/                  # Next.js App Router (layout, global styles)
├── modules/
│   ├── filters/          # Route filter state & UI
│   ├── gtfs-data/        # GTFS data fetching & types
│   ├── layout/           # App shell / main layout
│   ├── transit-map/      # Map view, layers, station sheet
│   └── ui-core/          # Shared UI components (search palette, etc.)
└── shared/               # Generic components & utilities
data/
└── gtfs/                 # Raw GTFS source files (routes, stops, shapes, …)
scripts/
└── generate-transit-data.ts  # Processes GTFS into optimised JSON for the app
```
