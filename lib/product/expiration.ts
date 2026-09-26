import { parseIsoDate } from "@/lib/format";

export type ExpirationStatus = "none" | "expired" | "expiring" | "ok";

/** Days before the expiration date when a product counts as "expiring soon". */
export const EXPIRING_SOON_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days from `today` to `expirationDate` (negative when past). */
export function daysUntil(expirationDate: string, today: Date = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseIsoDate(expirationDate).getTime() - start.getTime()) / DAY_MS);
}

export function getExpirationStatus(
  expirationDate: string | null,
  today: Date = new Date(),
): ExpirationStatus {
  if (!expirationDate) return "none";
  const days = daysUntil(expirationDate, today);
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_DAYS) return "expiring";
  return "ok";
}
