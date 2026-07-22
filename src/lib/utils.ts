import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTicketId(uuid: string): string {
  if (!uuid) return "TKT-000";
  const numericChunk = uuid.replace(/[^0-9]/g, "").slice(0, 3).padStart(3, "0");
  return `TKT-${numericChunk}`;
}
