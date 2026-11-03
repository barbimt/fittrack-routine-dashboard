import { createClient } from "@/lib/supabase/server";
import { parseProgressDashboard, type ProgressLoadResult } from "./schema";

export type { ProgressLoadResult };

export async function loadProgressDashboard(
  weeks = 12
): Promise<ProgressLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("progress_dashboard", {
    p_weeks: weeks,
  });

  if (error) {
    return { ok: false, error: "Could not load your training progress." };
  }

  try {
    return { ok: true, data: parseProgressDashboard(data) };
  } catch {
    return {
      ok: false,
      error: "Training progress came back in an unexpected shape.",
    };
  }
}
