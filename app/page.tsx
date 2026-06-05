import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  mapRoutineToTrainingDays,
  mergeSetLogsIntoDay,
} from "@/features/routines/routineMapper";
import { getOrCreateDaySession } from "@/features/routines/actions/sessionActions";
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
  const routineId = routineData.id as string;
  const firstDay = days[0];

  const sessionResult = await getOrCreateDaySession(routineId, firstDay.id);

  const mergedDays = sessionResult.ok
    ? days.map((d) =>
        d.id === firstDay.id ? mergeSetLogsIntoDay(d, sessionResult.setLogs) : d
      )
    : days;

  return (
    <DashboardClient
      days={mergedDays}
      routineName={routineData.name as string}
      routineId={routineId}
      initialDayId={firstDay.id}
      initialSessionId={sessionResult.ok ? sessionResult.sessionId : null}
    />
  );
}
