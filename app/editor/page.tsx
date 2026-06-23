import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapRoutineToEditor } from "@/features/routines/editorTypes";
import type { RoutineWithDays } from "@/features/routines/types";
import { AppShell } from "@/components/app-shell";
import { RoutineEditorClient } from "@/components/fitness/routine-editor-client";

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

  if (!routineData) {
    redirect("/empty");
  }

  const routine = mapRoutineToEditor(routineData as RoutineWithDays);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 pb-6 lg:px-8 lg:py-8 lg:pb-8">
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Routine Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Edit your active routine — rename and reorder days, add or remove
            exercises, then save your changes.
          </p>
        </header>

        <RoutineEditorClient routine={routine} />
      </div>
    </AppShell>
  );
}
