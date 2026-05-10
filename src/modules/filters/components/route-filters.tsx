"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  useFilterStore,
} from "@/modules/filters/store/filter-store";
import { useMapStore } from "@/modules/transit-map/store/map-store";
import type { RouteCategory } from "@/types";

const CATEGORY_ACCENT: Record<RouteCategory, string> = {
  brt: "bg-red-500",
  royaltrans: "bg-violet-500",
  wisata: "bg-amber-500",
  rusun: "bg-orange-500",
  transjabodetabek: "bg-blue-500",
  jaklingko: "bg-emerald-500",
  "non-brt": "bg-sky-500",
};

function getContrastText(hex: string): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const int = Number.parseInt(m[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  // Relative luminance approximation.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#111827" : "#ffffff";
}

export function RouteFilters() {
  const transitData = useMapStore((s) => s.transitData);
  const activeRouteIds = useFilterStore((s) => s.activeRouteIds);
  const toggleRoute = useFilterStore((s) => s.toggleRoute);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);

  const catalog = transitData?.routeCatalog;
  const activeSet = useMemo(() => new Set(activeRouteIds), [activeRouteIds]);

  const totalActive = activeRouteIds.length;
  const totalRoutes = transitData?.routes.length ?? 0;

  if (!catalog) {
    return (
      <section className="space-y-3">
        <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          Route Filters
        </h2>
        <p className="text-muted-foreground text-xs">Loading catalog…</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          Route Filters
        </h2>
        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {totalActive}/{totalRoutes}
        </span>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] -mx-2">
        <Accordion
          type="multiple"
          defaultValue={["brt"]}
          className="flex w-full flex-col gap-1 px-2"
        >
          {ALL_CATEGORIES.map((category) => {
            const entries = catalog[category] ?? [];
            if (entries.length === 0) return null;

            const ids = entries.map((e) => e.route_id);
            const activeInCat = ids.reduce(
              (acc, id) => acc + (activeSet.has(id) ? 1 : 0),
              0,
            );
            const allOn = activeInCat === ids.length;
            const someOn = activeInCat > 0 && !allOn;

            return (
              <AccordionItem
                key={category}
                value={category}
                className="border-b-0"
              >
                <AccordionTrigger className="hover:bg-muted/60 group rounded-md px-2 py-2 hover:no-underline">
                  <div className="flex flex-1 items-center gap-3">
                    <Checkbox
                      checked={allOn ? true : someOn ? "indeterminate" : false}
                      onCheckedChange={(next) => {
                        toggleCategory(ids, next === true);
                      }}
                      onClick={(e) => {
                        // Prevent the checkbox toggle from also triggering
                        // the accordion trigger's expand/collapse.
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.stopPropagation();
                        }
                      }}
                      aria-label={`Toggle all ${CATEGORY_LABELS[category]} routes`}
                    />
                    <span
                      className={`size-2 rounded-full ${CATEGORY_ACCENT[category]}`}
                      aria-hidden
                    />
                    <span className="text-foreground flex-1 text-left text-sm font-medium">
                      {CATEGORY_LABELS[category]}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                      {activeInCat}/{entries.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 pl-6">
                  <ul className="space-y-0.5">
                    {entries.map((entry) => {
                      const id = `route-${entry.route_id}`;
                      const checked = activeSet.has(entry.route_id);
                      return (
                        <li key={entry.route_id}>
                          <label
                            htmlFor={id}
                            className="hover:bg-muted/50 flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors"
                          >
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={() =>
                                toggleRoute(entry.route_id)
                              }
                            />
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                              <span
                                className="inline-flex min-w-[2.75rem] shrink-0 justify-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-tight"
                                style={{
                                  backgroundColor: entry.route_color,
                                  color: getContrastText(entry.route_color),
                                }}
                              >
                                {entry.route_short_name}
                              </span>
                              <span className="text-foreground min-w-0 text-sm leading-5 break-words">
                                {entry.route_long_name}
                              </span>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </section>
  );
}
