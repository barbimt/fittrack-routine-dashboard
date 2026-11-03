const countFormat = new Intl.NumberFormat("en");
const kgFormat = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
});

export function formatCount(value: number): string {
  return countFormat.format(value);
}

export function formatKg(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${kgFormat.format(value)} kg`;
}

export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatWeekStart(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatPercentRatio(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatBestSet(
  weightKg: number | null,
  reps: number | null
): string {
  if (weightKg != null && reps != null) {
    return `${formatKg(weightKg)} × ${reps}`;
  }
  if (reps != null) return `${reps} reps`;
  if (weightKg != null) return formatKg(weightKg);
  return "—";
}

/** Signed percent change. Omitted when the previous value is zero. */
export function relativeChange(
  recent: number,
  previous: number
): { value: number; positive: boolean } | undefined {
  if (previous <= 0) return undefined;
  const value = Math.round(((recent - previous) / previous) * 100);
  return { value, positive: value >= 0 };
}
