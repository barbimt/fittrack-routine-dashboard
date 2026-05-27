import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapRoutineToTrainingDays } from "@/features/routines/routineMapper";
import type { RoutineWithDays } from "@/features/routines/types";
import { DashboardClient } from "@/components/fitness/dashboard-client";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: routineData } = await supabase
    .from("routines")
    .select("*, routine_days(*, routine_exercises(*))")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!routineData) {
    redirect("/empty");
  }

  const days = mapRoutineToTrainingDays(routineData as RoutineWithDays);

  return <DashboardClient days={days} routineName={routineData.name as string} />;
}
