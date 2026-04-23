"use client";

import { useMemo } from "react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  useFilterStore,
} from "@/modules/filters/store/filter-store";
import type { RouteCategory } from "@/modules/gtfs-data/types";
import { useMapStore } from "@/modules/transit-map/store/map-store";
import { Checkbox } from "@/shared/components/ui/checkbox";

const CATEGORY_ACCENT: Record<RouteCategory, string> = {
  brt: "bg-red-500",
  "non-brt": "bg-sky-500",
  jaklingko: "bg-emerald-500",
};

export function RouteFilters() {
  const activeCategories = useFilterStore((s) => s.activeCategories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);
  const transitData = useMapStore((s) => s.transitData);

  const counts = useMemo(() => {
    const c: Record<RouteCategory, number> = {
      brt: 0,
      "non-brt": 0,
      jaklingko: 0,
    };
    for (const r of transitData?.routes ?? []) c[r.category]++;
    return c;
  }, [transitData]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          Route Filters
        </h2>
        <span className="text-muted-foreground text-[11px]">
          {activeCategories.length}/{ALL_CATEGORIES.length}
        </span>
      </div>

      <ul className="space-y-1">
        {ALL_CATEGORIES.map((category) => {
          const id = `filter-${category}`;
          const checked = activeCategories.includes(category);
          return (
            <li key={category}>
              <label
                htmlFor={id}
                className="hover:bg-muted/60 group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span
                  className={`size-2 rounded-full ${CATEGORY_ACCENT[category]}`}
                  aria-hidden
                />
                <span className="text-foreground flex-1 text-sm font-medium">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {counts[category]}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
