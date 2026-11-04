import { redirect } from "next/navigation";
import { ProgressDashboardView } from "@/components/fitness/progress-dashboard";
import { loadProgressDashboard } from "@/features/progress/loadProgressDashboard";
import {
  progressMonthFromParam,
  progressMonths,
  progressRangeFromParam,
} from "@/features/progress/range";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { range, month } = await searchParams;
  const today = new Date();
  const selectedMonth = progressMonthFromParam(month, today);
  const selectedRange = progressRangeFromParam(range);
  const result = selectedMonth
    ? await loadProgressDashboard({
        from: selectedMonth.from,
        to: selectedMonth.to,
      })
    : await loadProgressDashboard({ weeks: selectedRange.weeks });
  return (
    <ProgressDashboardView
      result={result}
      months={progressMonths(today)}
      selectedMonthId={selectedMonth?.id}
      selectedRangeId={selectedMonth ? undefined : selectedRange.id}
    />
  );
}
