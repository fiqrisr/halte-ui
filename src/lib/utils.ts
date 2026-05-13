import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Theme } from "@/types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

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

export const getDocumentTheme = (): Theme | null => {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
};

export const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
