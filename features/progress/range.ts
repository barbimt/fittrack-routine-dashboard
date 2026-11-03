export const PROGRESS_RANGES = [
  { id: "4w", label: "4 weeks", weeks: 4 },
  { id: "12w", label: "12 weeks", weeks: 12 },
  { id: "6m", label: "6 months", weeks: 26 },
  { id: "1y", label: "1 year", weeks: 52 },
] as const;

export type ProgressRangeId = (typeof PROGRESS_RANGES)[number]["id"];

export function progressRangeFromParam(value: string | undefined) {
  return (
    PROGRESS_RANGES.find((range) => range.id === value) ?? PROGRESS_RANGES[1]
  );
}

export function progressRangeHref(id: ProgressRangeId): string {
  return id === "12w" ? "/progress" : `/progress?range=${id}`;
}

export function periodLabel(weeks: number): string {
  return (
    PROGRESS_RANGES.find((range) => range.weeks === weeks)?.label ??
    `${weeks} weeks`
  );
}
