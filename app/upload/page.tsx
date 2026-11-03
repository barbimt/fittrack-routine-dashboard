"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { Button } from "@/components/fitness/button";
import { RoutineImportForm } from "@/features/routine-import/components/RoutineImportForm";
import { FormatExample } from "@/features/routine-import/components/FormatExample";
import {
  ROUTINE_TEMPLATE_FILENAME,
  ROUTINE_TEMPLATE_URL,
} from "@/features/routine-import/template";

const GUIDE_SEEN_KEY = "fittrack:upload-guide-seen";

const STEPS = [
  { title: "Get the template", body: "One tab for each training day." },
  { title: "Write your exercises", body: "One row for each exercise." },
  { title: "Upload and check", body: "Nothing is saved until you confirm." },
] as const;

function subscribeNoop() {
  return () => {};
}

/** First visit: guide open. Returning users: guide closed. */
function useIsReturningVisitor(): boolean {
  const returning = useSyncExternalStore(
    subscribeNoop,
    () => window.localStorage.getItem(GUIDE_SEEN_KEY) === "1",
    () => false
  );
  useEffect(() => {
    window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
  }, []);
  return returning;
}

export default function UploadPage() {
  const returning = useIsReturningVisitor();

  return (
    <AppShell>
      <PageContent className="max-w-3xl space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Import your routine
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in our Excel template and upload it here.
          </p>
        </header>

        <section
          aria-label="How it works"
          className="border-border bg-card rounded-2xl border p-4 shadow-sm"
        >
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">
                    {step.title}
                  </p>
                  <p className="text-muted-foreground text-sm">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild className="w-full gap-2 sm:w-auto">
              <a
                href={ROUTINE_TEMPLATE_URL}
                download={ROUTINE_TEMPLATE_FILENAME}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download template
              </a>
            </Button>
            <p className="text-muted-foreground text-sm">
              No Excel?{" "}
              <Link
                href="/editor"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Build it in the app
              </Link>
            </p>
          </div>
        </section>

        <RoutineImportForm />

        <details
          key={returning ? "closed" : "open"}
          open={!returning}
          className="group border-border bg-card rounded-2xl border shadow-sm"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="text-foreground block text-base font-semibold">
                How to write your sets
              </span>
              <span className="text-muted-foreground block text-sm">
                See how a row in Excel looks in the app.
              </span>
            </span>
            <ChevronDown
              className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="border-border border-t px-4 pt-3 pb-4">
            <FormatExample />
          </div>
        </details>
      </PageContent>
    </AppShell>
  );
}
