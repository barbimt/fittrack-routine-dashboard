import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapRoutineToTrainingDays } from "@/features/routines/routineMapper";
import { getOrCreateDaySession } from "@/features/routines/actions/sessionActions";
import type { RoutineWithDays } from "@/features/routines/types";
import { DashboardClient } from "@/components/fitness/dashboard-client";
import { DashboardEmptyState } from "@/components/fitness/dashboard-empty-state";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
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
    return <DashboardEmptyState />;
  }

  const { day: dayParam } = await searchParams;
  const days = mapRoutineToTrainingDays(routineData as RoutineWithDays);
  const routineId = routineData.id as string;
  const initialDay =
    (dayParam ? days.find((day) => day.id === dayParam) : undefined) ?? days[0];

  const sessionResult = await getOrCreateDaySession(routineId, initialDay.id);

  const mergedDays = sessionResult.ok
    ? days.map((d) => (d.id === initialDay.id ? sessionResult.mergedDay : d))
    : days;

  return (
    <DashboardClient
      days={mergedDays}
      routineName={routineData.name as string}
      routineId={routineId}
      initialDayId={initialDay.id}
      initialSessionId={sessionResult.ok ? sessionResult.sessionId : null}
      initialSessionCompleted={
        sessionResult.ok && sessionResult.sessionStatus === "completed"
      }
    />
  );
}
