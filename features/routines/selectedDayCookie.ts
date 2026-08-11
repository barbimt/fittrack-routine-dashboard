import { isUuid } from "@/lib/uuid";

/** Remembers the last training day on Today across editor navigations (no URL). */
export const SELECTED_DAY_COOKIE = "fittrack_selected_day";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // ~6 months

export function readSelectedDayCookie(
  cookieValue: string | undefined,
  validDayIds: string[]
): string | null {
  if (!cookieValue || !isUuid(cookieValue)) return null;
  return validDayIds.includes(cookieValue) ? cookieValue : null;
}

export function writeSelectedDayCookie(dayId: string): void {
  if (typeof document === "undefined" || !isUuid(dayId)) return;
  document.cookie = `${SELECTED_DAY_COOKIE}=${encodeURIComponent(dayId)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}
