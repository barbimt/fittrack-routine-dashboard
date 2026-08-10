"use client";

import { useActionState } from "react";
import {
  signInWithGoogle,
  type AuthActionState,
} from "@/features/auth/actions/authActions";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(signInWithGoogle, null);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? "Redirecting…" : "Continue with Google"}
        </Button>
      </form>
      {state?.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
