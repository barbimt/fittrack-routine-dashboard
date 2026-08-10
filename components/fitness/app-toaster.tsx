"use client";

import { Toaster } from "@/components/ui/toaster";

/** Mount once in the root layout so `notify` / `toast` work app-wide. */
export function AppToaster() {
  return <Toaster />;
}
