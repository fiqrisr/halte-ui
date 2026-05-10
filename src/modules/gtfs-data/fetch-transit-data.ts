import type { TransitData } from "@/types";

const TRANSIT_DATA_URL = "/api/transit-data.json";

export async function fetchTransitData(): Promise<TransitData> {
  const response = await fetch(TRANSIT_DATA_URL, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(
      `Failed to load transit data: ${response.status} ${response.statusText}`,
    );
  }
  return (await response.json()) as TransitData;
}
