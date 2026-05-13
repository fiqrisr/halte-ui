"use client";

import { X } from "lucide-react";

export const PopupCloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close popup"
    className="focus-visible:ring-ring hover:bg-muted text-foreground absolute top-0.5 right-0.5 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2"
  >
    <X className="size-3.5" />
  </button>
);
