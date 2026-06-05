"use client";

import { AppShell } from "@/components/app-shell";
import { RoutineEditorMock } from "@/components/fitness/routine-editor-mock";
import { trainingDays } from "@/lib/mock-data";

export default function EditorPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Routine Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual mock for editing days, exercises, sets, and rest — logic
            comes later.
          </p>
        </header>

        <RoutineEditorMock days={trainingDays} />
      </div>
    </AppShell>
  );
}
