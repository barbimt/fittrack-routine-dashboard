import { createClient } from "@/lib/supabase/server";
import { parseProgressDashboard, type ProgressLoadResult } from "./schema";

export type { ProgressLoadResult };

export async function loadProgressDashboard(
  from: string
): Promise<ProgressLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("progress_dashboard", {
    p_from: from,
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
