import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getContrastText = (hex: string): string => {
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const int = Number.parseInt(m[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  // Relative luminance approximation.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#111827" : "#ffffff";
};
