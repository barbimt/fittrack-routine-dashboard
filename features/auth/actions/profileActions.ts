"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  email: string;
  displayName: string;
};

export type ProfileActionResult =
  | { ok: true; emailChangePending?: boolean }
  | { ok: false; error: string };

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? profile?.email ?? "";
  const displayName =
    profile?.display_name?.trim() ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "") ||
    (typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "") ||
    (email.includes("@") ? email.split("@")[0] : "");

  return { email, displayName };
}

export async function updateUserProfile(input: {
  displayName: string;
  email: string;
}): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();

  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      // Keep mirrored email in sync when it already matches auth.
      ...(email === (user.email ?? "").toLowerCase() ? { email } : {}),
    })
    .eq("id", user.id);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  // Keep auth metadata aligned for OAuth-style name fields.
  // Email changes require confirmation — only send when it actually changed.
  const emailChanged = email !== (user.email ?? "").toLowerCase();
  const { error: authError } = await supabase.auth.updateUser({
    ...(emailChanged ? { email } : {}),
    data: {
      display_name: displayName,
      full_name: displayName,
    },
  });

  if (authError) {
    return { ok: false, error: authError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true, emailChangePending: emailChanged };
}
