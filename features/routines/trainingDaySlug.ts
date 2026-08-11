import type { TrainingDay } from "@/lib/mock-data";

/** Client backup so sidebar "Today" can restore `/?day=glutes` after /editor. */
export const DAY_SLUG_STORAGE_KEY = "fittrack_day_slug";

/** Prefer focus (e.g. Glutes) for a readable Today URL: `/?day=glutes`. */
export function slugifyTrainingDayLabel(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function trainingDaySlug(
  day: Pick<TrainingDay, "focus" | "dayName">
): string {
  const fromFocus = slugifyTrainingDayLabel(day.focus);
  if (fromFocus) return fromFocus;
  const fromName = slugifyTrainingDayLabel(day.dayName);
  return fromName || "day";
}

/**
 * Unique slug per day in the routine. Duplicate focuses become
 * `glutes`, `glutes-2`, …
 */
export function assignTrainingDaySlugs(
  days: Pick<TrainingDay, "id" | "focus" | "dayName">[]
): Map<string, string> {
  const used = new Map<string, number>();
  const byId = new Map<string, string>();

  for (const day of days) {
    const base = trainingDaySlug(day);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    byId.set(day.id, count === 0 ? base : `${base}-${count + 1}`);
  }

  return byId;
}

export function findTrainingDayBySlug<T extends TrainingDay>(
  days: T[],
  slug: string | undefined
): T | undefined {
  if (!slug) return undefined;
  const slugs = assignTrainingDaySlugs(days);
  return days.find((day) => slugs.get(day.id) === slug);
}

export function rememberDaySlug(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  window.sessionStorage.setItem(DAY_SLUG_STORAGE_KEY, slug);
  window.dispatchEvent(new Event("fittrack:day-slug"));
}

export function readRememberedDaySlug(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(DAY_SLUG_STORAGE_KEY);
}

export function todayHrefFromRememberedDay(): string {
  const slug = readRememberedDaySlug();
  return slug ? `/?day=${encodeURIComponent(slug)}` : "/";
}
