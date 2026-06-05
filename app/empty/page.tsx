"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/fitness/empty-state";
import { Button } from "@/components/fitness/button";
import { Dumbbell, Upload, Sparkles } from "lucide-react";

export default function EmptyRoutinePage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-12 pb-28 lg:pb-12">
        <EmptyState
          icon={
            <div className="bg-accent-soft flex h-16 w-16 items-center justify-center rounded-2xl">
              <Dumbbell className="text-primary h-8 w-8" aria-hidden />
            </div>
          }
          title="No routine yet"
          description="Upload your Excel workout plan or start with our sample routine to see your dashboard come to life."
          primaryAction={{
            label: "Upload routine",
            onClick: () => router.push("/upload"),
          }}
          secondaryAction={{
            label: "Use sample routine",
            onClick: () => router.push("/"),
          }}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/upload" className="gap-2">
              <Upload className="h-4 w-4" aria-hidden />
              Go to upload
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/" className="text-muted-foreground gap-2">
              <Sparkles className="h-4 w-4" aria-hidden />
              Preview dashboard
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
