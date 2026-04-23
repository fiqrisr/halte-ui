"use client";

import { Loader2, LocateFixed } from "lucide-react";
import { useState } from "react";
import { useMapStore } from "@/modules/transit-map/store/map-store";
import { Button } from "@/shared/components/ui/button";

export function LocateFab() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const flyTo = useMapStore((s) => s.flyTo);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        flyTo({ lng: longitude, lat: latitude, zoom: 15 });
        setBusy(false);
      },
      (err) => {
        setError(err.message || "Unable to get your location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div className="pointer-events-none absolute right-4 bottom-6 z-10 flex flex-col items-end gap-2">
      {error && (
        <div className="bg-background text-destructive pointer-events-auto max-w-xs rounded-md border px-3 py-2 text-xs shadow-md">
          {error}
        </div>
      )}
      <Button
        size="icon"
        variant="secondary"
        onClick={handleLocate}
        disabled={busy}
        aria-label="Find nearest halte"
        className="pointer-events-auto size-11 rounded-full shadow-lg"
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <LocateFixed className="size-5" />
        )}
      </Button>
    </div>
  );
}
