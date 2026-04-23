import { BusFront } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 h-16 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-foreground text-background flex size-8 items-center justify-center rounded-md">
            <BusFront className="size-4" />
          </span>
          <span className="text-foreground text-base font-semibold tracking-tight">
            Halte<span className="text-muted-foreground">.ui</span>
          </span>
        </Link>
        <nav className="text-muted-foreground flex items-center gap-5 text-sm">
          <Link href="/" className="hover:text-foreground transition-colors">
            Map
          </Link>
          <a
            href="https://github.com/AnmolSaini16/mapcn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
