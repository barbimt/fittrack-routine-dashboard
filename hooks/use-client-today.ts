"use client";

import { useSyncExternalStore } from "react";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

export type ClientToday = {
  label: string;
  iso: string;
};

const emptySubscribe = () => () => {};

function formatClientToday(): ClientToday {
  const now = new Date();
  return {
    label: now.toLocaleDateString("en-US", DATE_FORMAT),
    iso: now.toISOString().split("T")[0] ?? "",
  };
}

export function useClientToday(): ClientToday | null {
  // Server snapshot is false so SSR/client hydration don't disagree on locale.
  const ready = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!ready) return null;
  return formatClientToday();
}
