export const PROGRESS_RANGES = [
  { id: "4w", label: "4 weeks", weeks: 4 },
  { id: "12w", label: "12 weeks", weeks: 12 },
  { id: "6m", label: "6 months", weeks: 26 },
  { id: "1y", label: "1 year", weeks: 52 },
] as const;

export type ProgressRangeId = (typeof PROGRESS_RANGES)[number]["id"];

export type ProgressMonth = {
  id: string;
  label: string;
  from: string;
  to: string;
};

const monthLabel = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function progressRangeFromParam(value: string | undefined) {
  return (
    PROGRESS_RANGES.find((range) => range.id === value) ?? PROGRESS_RANGES[1]
  );
}

export function progressRangeHref(id: ProgressRangeId): string {
  return id === "12w" ? "/progress" : `/progress?range=${id}`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Newest first. Each option is that calendar month, ending today when it is the current one. */
export function progressMonths(today = new Date(), count = 12): ProgressMonth[] {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const todayUtc = new Date(Date.UTC(year, month, today.getUTCDate()));

  return Array.from({ length: count }, (_, index) => {
    const start = new Date(Date.UTC(year, month - index, 1));
    const end = new Date(Date.UTC(year, month - index + 1, 0));
    const id = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      id,
      label: monthLabel.format(start),
      from: isoDate(start),
      to: isoDate(end.getTime() > todayUtc.getTime() ? todayUtc : end),
    };
  });
}

export function progressMonthFromParam(
  value: string | undefined,
  today = new Date()
): ProgressMonth | null {
  if (!value) return null;
  return progressMonths(today).find((month) => month.id === value) ?? null;
}
