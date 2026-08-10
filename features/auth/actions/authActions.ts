"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string } | null;

function appOrigin(headerList: Headers): string {
  const origin = headerList.get("origin");
  if (origin) return origin;

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Session is present when email confirmation is off (local Supabase default).
  // When confirmation is required, session is null — send them to login to continue.
  if (!data.session) {
    redirect("/login?registered=1");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle(
  _prevState: AuthActionState,
  _formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = appOrigin(headerList);

  // Keep redirectTo exact (no query string) so it matches Supabase Auth
  // additional_redirect_urls. The callback defaults next to "/".
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "Could not start Google sign-in." };
  }

  redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
