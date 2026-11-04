import { redirect } from "next/navigation";
import { ProgressDashboardView } from "@/components/fitness/progress-dashboard";
import { loadProgressDashboard } from "@/features/progress/loadProgressDashboard";
import {
  progressMonthFromParam,
  progressMonths,
} from "@/features/progress/range";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { from } = await searchParams;
  const today = new Date();
  const selected = progressMonthFromParam(from, today);
  const result = await loadProgressDashboard(selected.from);
  return (
    <ProgressDashboardView
      result={result}
      months={progressMonths(today)}
      selectedFrom={selected.from}
    />
  );
}
