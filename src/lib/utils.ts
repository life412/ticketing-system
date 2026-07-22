import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTicketId(input?: string | number | null): string {
  if (typeof input === "number") {
    return `TKT-${String(input).padStart(3, "0")}`;
  }
  if (!input) return "TKT-000";
  const numericChunk = String(input).replace(/[^0-9]/g, "").slice(0, 3).padStart(3, "0");
  return `TKT-${numericChunk}`;
}
