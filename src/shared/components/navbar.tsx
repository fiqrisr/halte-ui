"use client";

import { BusFront, Search, X } from "lucide-react";
import Link from "next/link";
import { useMapStore } from "@/modules/transit-map/store/map-store";
import { Button } from "@/shared/components/ui/button";

export function Navbar() {
  const selectedRouteId = useMapStore((s) => s.selectedRouteId);
  const setSelectedRoute = useMapStore((s) => s.setSelectedRoute);

  const triggerSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      }),
    );
  };

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 h-16 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-foreground text-background flex size-8 items-center justify-center rounded-md">
            <BusFront className="size-4" />
          </span>
          <span className="text-foreground text-base font-semibold tracking-tight">
            Halte<span className="text-muted-foreground">.ui</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={triggerSearch}
            className="bg-muted/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 flex w-full max-w-sm items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search halte or route…</span>
            <kbd className="bg-background text-muted-foreground pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <nav className="text-muted-foreground flex items-center gap-3 text-sm">
          {selectedRouteId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRoute(null)}
              className="h-8 gap-1.5"
            >
              <X className="size-3.5" />
              Exit focus
            </Button>
          )}
          <a
            href="https://github.com/AnmolSaini16/mapcn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hidden transition-colors sm:inline"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
