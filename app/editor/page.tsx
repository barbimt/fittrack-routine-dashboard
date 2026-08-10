import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapRoutineToEditor } from "@/features/routines/editorTypes";
import type { EditorRoutine } from "@/features/routines/editorTypes";
import type { RoutineWithDays } from "@/features/routines/types";
import { RoutineEditorClient } from "@/components/fitness/routine-editor-client";

const EMPTY_ROUTINE: EditorRoutine = {
  id: "new",
  name: "My routine",
  days: [],
};

export default async function EditorPage() {
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

  const isNew = !routineData;
  const routine = isNew
    ? EMPTY_ROUTINE
    : mapRoutineToEditor(routineData as RoutineWithDays);

  return <RoutineEditorClient routine={routine} isNew={isNew} />;
}
