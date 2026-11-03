import { redirect } from "next/navigation";
import { ProgressDashboardView } from "@/components/fitness/progress-dashboard";
import { loadProgressDashboard } from "@/features/progress/loadProgressDashboard";
import { progressRangeFromParam } from "@/features/progress/range";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { range } = await searchParams;
  const selected = progressRangeFromParam(range);
  const result = await loadProgressDashboard(selected.weeks);
  return <ProgressDashboardView result={result} />;
}
