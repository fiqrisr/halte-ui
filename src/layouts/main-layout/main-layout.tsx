"use client";

import { BusFront, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui";
import { RouteFilters } from "@/modules/transit-map";
import { SearchPalette } from "./search-palette";

export type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const openSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      }),
    );
  };

  return (
    <>
      <SearchPalette />
      <div className="bg-neutral-100 dark:bg-neutral-900">
        <div className="mx-auto flex h-screen flex-col bg-background shadow-sm md:flex-row">
          {/* Desktop sidebar — hidden on mobile */}
          <aside className="hidden md:flex md:h-screen md:w-80 md:shrink-0 md:flex-col bg-background border-r">
            <div className="flex shrink-0 items-center gap-2 px-5 py-5">
              <Link href="/" className="flex items-center gap-2">
                <span className="bg-foreground text-background flex size-8 items-center justify-center rounded-md">
                  <BusFront className="size-4" />
                </span>
                <span className="text-foreground text-base font-semibold tracking-tight">
                  Halte
                  <span className="text-muted-foreground">.ui</span>
                </span>
              </Link>
              <span className="text-muted-foreground ml-auto text-[10px] font-medium tracking-widest uppercase">
                Transjakarta
              </span>
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-hidden px-5 pb-2">
              <button
                type="button"
                onClick={openSearch}
                className="bg-muted/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 flex w-full shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
              >
                <Search className="size-4" />
                <span className="flex-1 text-left">Search halte or route…</span>
                <kbd className="bg-background text-muted-foreground pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              <div className="flex-1 min-h-0 overflow-hidden">
                <RouteFilters />
              </div>
            </div>

            <div className="text-muted-foreground shrink-0 border-t px-5 py-3 text-[11px]">
              GTFS · Open data · Built with mapcn
            </div>
          </aside>

          {/* Map — full height on mobile */}
          <main className="relative flex-1 overflow-hidden">{children}</main>
        </div>
      </div>

      {/* Mobile bottom floating bar */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 md:hidden">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/95 px-3 py-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
          <Link href="/" className="flex items-center gap-2 mr-1">
            <span className="bg-foreground text-background flex size-8 shrink-0 items-center justify-center rounded-full">
              <BusFront className="size-4" />
            </span>
            <span className="text-foreground text-sm font-semibold tracking-tight">
              Halte<span className="text-muted-foreground">.ui</span>
            </span>
          </Link>
          <span className="flex-1" />
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            className="text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors hover:bg-muted"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open route filters"
            className="text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile route filters drawer */}
      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent className="h-[85vh] flex flex-col">
          <DrawerTitle className="sr-only">Route Filters</DrawerTitle>
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden px-5 pt-2 pb-6">
            <RouteFilters />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
