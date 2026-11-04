export type ProgressMonth = {
  id: string;
  label: string;
  from: string;
};

const monthLabel = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});

/** Newest first. Each option starts on the first day of that month and runs through today. */
export function progressMonths(
  today = new Date(),
  count = 6
): ProgressMonth[] {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - index, 1));
    const id = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      id,
      label: monthLabel.format(date),
      from: `${id}-01`,
    };
  });
}

export function progressMonthFromParam(
  value: string | undefined,
  today = new Date()
): ProgressMonth {
  const months = progressMonths(today);
  return months.find((month) => month.id === value) ?? months[0];
}

export function progressMonthHref(id: string, today = new Date()): string {
  const current = progressMonths(today)[0];
  return id === current?.id ? "/progress" : `/progress?from=${id}`;
}
