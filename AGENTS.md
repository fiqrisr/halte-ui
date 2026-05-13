<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Halte.ui — AI Agent Rules

## Project Overview

**Halte.ui** is an interactive, modern transit map web application for the **Transjakarta BRT network** in Jakarta, Indonesia. It visualizes GTFS (General Transit Feed Specification) data — routes, stops/halte, and schedules — on a MapLibre GL map with filtering, search, and station detail features.

### Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler enabled)
- **Language**: TypeScript (strict mode)
- **React**: v19
- **Styling**: Tailwind CSS v4 + `tw-animate-css`
- **UI Components**: shadcn/ui (new-york style) + custom map component primitives (`src/components/map/`)
- **Icons**: Lucide React
- **Map**: MapLibre GL
- **State Management**: Zustand
- **Linting / Formatting**: Biome
- **Package Manager**: pnpm
- **Data**: GTFS CSVs parsed at build time via `scripts/generate-transit-data.ts` into `public/api/transit-data.json`

---

## Coding Conventions

### File & Directory Naming

- **All file and directory names MUST use kebab-case** (e.g., `transit-map-view.tsx`, `map-store.ts`, `route-filters.tsx`).
- No PascalCase, camelCase, or snake_case for file names.

### Exports

- **Always use named exports.** Do not use `export default` except where required by Next.js conventions (e.g., `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, etc.).

### Functions

- **Use arrow functions everywhere** — for components, helpers, callbacks, and store definitions.
- Exception: Next.js App Router pages and layouts that require `export default function` are acceptable as regular function declarations.

### Components

- Use arrow functions with named exports:
  ```tsx
  export const MyComponent = ({ prop }: MyComponentProps) => {
    return <div>{prop}</div>;
  };
  ```
- Co-locate component-specific types in the same file or in the module's types if shared.

### Types

- Prefer `type` over `interface` unless declaration merging is needed.
- Shared types go in `src/types/` with a barrel export via `src/types/index.ts`.
- Module-specific types can live alongside the module code.

### Imports

- Use the `@/*` path alias (maps to `src/*`) for all internal imports. Never use relative paths that traverse above the current module (e.g., avoid `../../`).
- Biome auto-organizes imports — do not manually reorder.

### Styling

- Use Tailwind CSS utility classes exclusively. Do not write custom CSS unless absolutely necessary.
- Follow shadcn/ui patterns for component styling using `cn()` from `@/lib/utils`.

### State Management

- Use Zustand stores for client-side state.
- Store files live inside their respective module under a `store/` directory (e.g., `src/modules/transit-map/store/map-store.ts`).

### Linting & Formatting

- Biome is the sole linter and formatter. Do not use ESLint or Prettier.
- Run `pnpm lint` to check and `pnpm format` to auto-format.

---

## Project Structure

```
halte-ui/
├── data/gtfs/              # Raw GTFS CSV files (routes, shapes, stops, stop_times, trips)
├── public/api/             # Generated transit-data.json (build artifact, do not edit manually)
├── scripts/                # Build-time scripts (e.g., generate-transit-data.ts)
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, global styles)
│   ├── components/
│   │   ├── map/            # Custom MapLibre GL component primitives (Map, Marker, Popup, Route, etc.)
│   │   └── ui/             # shadcn/ui primitives (button, card, sheet, etc.) with barrel index.ts
│   ├── hooks/              # Shared React hooks (e.g., useResolvedTheme)
│   ├── layouts/
│   │   └── main-layout/    # App shell (sidebar, search palette) with barrel index.ts
│   ├── lib/                # Shared utilities (e.g., cn(), getContrastText())
│   ├── modules/
│   │   └── transit-map/    # Core feature module (map, layers, filters, station sheet)
│   └── types/              # Shared TypeScript types — map.ts, transit.ts, ui.ts, barrel index.ts
├── biome.json              # Biome config
├── components.json         # shadcn/ui config
├── next.config.ts          # Next.js config
├── tsconfig.json           # TypeScript config
└── package.json
```

### Module Structure

Each feature module under `src/modules/` follows this pattern and exposes a barrel `index.ts` at its root:

```
module-name/
├── api/            # Data-fetching utilities
├── components/     # UI components specific to this module
├── store/          # Zustand store(s) for this module
├── types/          # Module-specific types
└── index.ts        # Barrel re-exports for public API
```

Current `transit-map/` module layout:

```
transit-map/
├── api/
│   └── transit-data.ts         # fetchTransitData()
├── components/
│   ├── route-filters.tsx        # Category/route filter accordion
│   ├── station-sheet.tsx        # Station detail bottom sheet
│   ├── transit-layers.tsx       # MapLibre layers (routes + stops)
│   └── transit-map-view.tsx     # Top-level map view component
├── store/
│   ├── filter-store.ts          # Route/category filter state
│   └── map-store.ts             # Map & transit data state
├── types/
│   └── store.ts                 # Store type definitions
└── index.ts                     # Barrel exports
```

### Map Component Primitives (`src/components/map/`)

Custom MapLibre GL React wrappers. These replace the previous `mapcn` registry dependency:

```
map/
├── map.tsx                 # Root <Map> component (MapLibre GL canvas)
├── map-arc.tsx             # Arc/great-circle line layer
├── map-cluster-layer.tsx   # Clustered point layer
├── map-context.ts          # React context for MapLibre map instance
├── map-controls.tsx        # Navigation / zoom controls
├── map-marker.tsx          # Custom DOM marker
├── map-popup.tsx           # MapLibre popup wrapper
├── map-route.tsx           # GeoJSON route line layer
├── marker-label.tsx        # Marker label overlay
├── marker-popup.tsx        # Popup attached to a marker
├── marker-tooltip.tsx      # Tooltip overlay for markers
├── popup-close-button.tsx  # Close button for popups
└── index.ts                # Barrel exports
```

### Shared Types (`src/types/`)

Type files are split by domain:

```
types/
├── map.ts       # MapLibre / map-related types (e.g., Theme)
├── transit.ts   # GTFS / transit data types (Route, Stop, Trip, etc.)
├── ui.ts        # UI component prop types
└── index.ts     # Barrel re-exports
```

### Shared Hooks (`src/hooks/`)

```
hooks/
└── use-resolved-theme.ts   # Detects light/dark theme from document class or system preference
```

---

## Important Notes

- **GTFS data pipeline**: Raw GTFS CSVs live in `data/gtfs/`. The script `scripts/generate-transit-data.ts` processes them into `public/api/transit-data.json` at build time (via `predev` / `prebuild` hooks). Never edit the generated JSON manually.
- **React Compiler** is enabled (`reactCompiler: true` in `next.config.ts`). Do not add manual `useMemo`/`useCallback` unless profiling proves necessity.
- **Do not add ESLint or Prettier** — Biome handles everything.
- **shadcn/ui components** in `src/components/ui/` are generated via the shadcn CLI. Edit them if needed but follow existing patterns.
- **Map primitives** live in `src/components/map/` — custom MapLibre GL React wrappers. Do not re-add the `mapcn` registry; extend these components instead.
