import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapRoutineToEditor } from "@/features/routines/editorTypes";
import type { EditorRoutine } from "@/features/routines/editorTypes";
import type { RoutineWithDays } from "@/features/routines/types";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
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

  return (
    <AppShell>
      <PageContent className="max-w-4xl">
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {isNew ? "Create routine" : "Routine Editor"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew
              ? "Build your plan from scratch — add training days and exercises, then save."
              : "Edit your active routine — rename and reorder days, add or remove exercises, then save your changes."}
          </p>
        </header>

        <RoutineEditorClient routine={routine} isNew={isNew} />
      </PageContent>
    </AppShell>
  );
}
