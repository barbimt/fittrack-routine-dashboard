"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { EmptyState } from "@/components/fitness/empty-state";
import { Button } from "@/components/fitness/button";
import { Dumbbell, Sparkles } from "lucide-react";

export function DashboardEmptyState() {
  const router = useRouter();

  return (
    <AppShell>
      <PageContent className="flex min-h-[70vh] max-w-lg flex-col items-center justify-center py-12">
        <EmptyState
          icon={
            <div className="bg-accent-soft flex h-16 w-16 items-center justify-center rounded-2xl">
              <Dumbbell className="text-primary h-8 w-8" aria-hidden />
            </div>
          }
          title="Choose how to start"
          description="Import an Excel workout plan, or create a routine from scratch in the editor."
          primaryAction={{
            label: "Import routine",
            onClick: () => router.push("/upload"),
          }}
          secondaryAction={{
            label: "Create from scratch",
            onClick: () => router.push("/editor"),
          }}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/demo" className="text-muted-foreground gap-2">
              <Sparkles className="h-4 w-4" aria-hidden />
              Preview example
            </Link>
          </Button>
        </div>
      </PageContent>
    </AppShell>
  );
}
