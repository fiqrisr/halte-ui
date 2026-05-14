"use client";

import { BusFront, Search } from "lucide-react";
import Link from "next/link";
import { RouteFilters } from "@/modules/transit-map";
import { SearchPalette } from "./search-palette";

export type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
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
          <aside className="bg-background flex w-full shrink-0 flex-col border-b md:h-screen md:w-80 md:border-r md:border-b-0">
            <div className="flex items-center gap-2 px-5 py-5">
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

            <div className="space-y-6 px-5 flex flex-col">
              <button
                type="button"
                onClick={openSearch}
                className="bg-muted/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
              >
                <Search className="size-4" />
                <span className="flex-1 text-left">Search halte or route…</span>
                <kbd className="bg-background text-muted-foreground pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              <RouteFilters />
            </div>

            <div className="text-muted-foreground hidden border-t px-5 py-3 text-[11px] md:block">
              GTFS · Open data · Built with mapcn
            </div>
          </aside>

          <main className="relative flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </>
  );
};
