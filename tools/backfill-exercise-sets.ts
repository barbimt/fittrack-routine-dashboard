/**
 * One-off: creates `routine_exercise_sets` rows for exercises saved before the
 * table existed, from their legacy `prescription` / `weight` text.
 *
 *   pnpm db:backfill-sets            # dry run: prints what would change
 *   pnpm db:backfill-sets --apply    # writes
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 * Safe to re-run: exercises that already have set rows are skipped.
 */
import { createClient } from "@supabase/supabase-js";
import {
  legacyExercisePlan,
  mergeNotes,
} from "../features/routines/exercisePlan";
import { buildExerciseSetRows } from "../features/routines/exerciseSets.server";
import { setsToPrescription } from "../features/routines/sets";

const PAGE_SIZE = 200;
const apply = process.argv.includes("--apply");

type LegacyExerciseRow = {
  id: string;
  user_id: string;
  name: string;
  prescription: string;
  planned_sets: number | null;
  target_reps: string | null;
  weight: string | null;
  notes: string | null;
  routine_exercise_sets: { id: string }[];
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see `supabase status`)."
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  let from = 0;
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("routine_exercises")
      .select(
        "id, user_id, name, prescription, planned_sets, target_reps, weight, notes, routine_exercise_sets(id)"
      )
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    const rows = (data ?? []) as LegacyExerciseRow[];
    if (rows.length === 0) break;

    for (const exercise of rows) {
      if (exercise.routine_exercise_sets.length > 0) {
        skipped += 1;
        continue;
      }

      const plan = legacyExercisePlan(exercise);
      const notes = mergeNotes(exercise.notes, plan.extraNotes);
      console.log(
        `${apply ? "WRITE" : "DRY  "} ${exercise.name}: "${exercise.prescription ?? ""}" + "${exercise.weight ?? ""}" → ${setsToPrescription(plan.sets)}${notes !== exercise.notes ? ` · notes: ${notes}` : ""}`
      );

      if (!apply) {
        converted += 1;
        continue;
      }

      const { error: insertError } = await supabase
        .from("routine_exercise_sets")
        .insert(
          buildExerciseSetRows(exercise.id, plan.sets).map((row) => ({
            ...row,
            user_id: exercise.user_id,
          }))
        );
      if (insertError) {
        failed += 1;
        console.error(`  ✗ ${exercise.id}: ${insertError.message}`);
        continue;
      }

      if (notes !== exercise.notes) {
        const { error: updateError } = await supabase
          .from("routine_exercises")
          .update({ notes })
          .eq("id", exercise.id);
        if (updateError) {
          console.error(
            `  ! notes not updated for ${exercise.id}: ${updateError.message}`
          );
        }
      }
      converted += 1;
    }

    from += PAGE_SIZE;
  }

  console.log(
    `\n${apply ? "Converted" : "Would convert"} ${converted} · already done ${skipped} · failed ${failed}`
  );
  if (!apply) console.log("Dry run only. Re-run with --apply to write.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
