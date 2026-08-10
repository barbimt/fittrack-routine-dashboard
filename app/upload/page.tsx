"use client";

import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { RoutineImportForm } from "@/features/routine-import/components/RoutineImportForm";
import { downloadRoutineTemplate } from "@/features/routine-import/utils/downloadRoutineTemplate";
import { COLUMN_LABELS } from "@/features/routine-import/types";
import { Button } from "@/components/fitness/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  PencilLine,
  Upload,
} from "lucide-react";

const STEPS = [
  {
    icon: Download,
    title: "Download the FitTrack template",
    body: "Start from our .xlsx — not a random gym spreadsheet. Each person uses their own copy.",
  },
  {
    icon: PencilLine,
    title: "Fill in your days and exercises",
    body: "One sheet per training day. Keep the header row. Replace the sample rows with your routine.",
  },
  {
    icon: Upload,
    title: "Upload your filled file",
    body: "Preview days and exercises here, then import. Wrong format? You’ll see what to fix.",
  },
] as const;

export default function UploadPage() {
  return (
    <AppShell>
      <PageContent className="max-w-3xl">
        <header className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Upload Routine
          </h1>
          <p className="text-muted-foreground mt-2">
            Import a FitTrack Excel template — one sheet per day, with{" "}
            {COLUMN_LABELS.EXERCISE} and {COLUMN_LABELS.SETS_X_REPS} columns.
            Any workout table can work if you copy it into this format first.
          </p>
        </header>

        <Card className="border-primary/20 bg-accent-soft/40 mb-6 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How to import</CardTitle>
            <CardDescription>
              FitTrack does not read arbitrary Excel layouts. Use the template
              so every routine shares the same structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                      <step.icon
                        className="text-primary h-4 w-4 shrink-0"
                        aria-hidden
                      />
                      {step.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              onClick={() => downloadRoutineTemplate()}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download FitTrack template
            </Button>
            <p className="text-muted-foreground text-xs">
              File name:{" "}
              <span className="font-medium">fittrack-routine-template.xlsx</span>
              . Rename it after filling (e.g.{" "}
              <span className="font-medium">my-routine-fittrack.xlsx</span>) if
              you like — format matters more than the name.
            </p>
          </CardContent>
        </Card>

        <section className="mb-8" aria-labelledby="upload-file-heading">
          <h2
            id="upload-file-heading"
            className="text-foreground mb-1 text-lg font-semibold"
          >
            Upload your filled template
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Only .xlsx files in the FitTrack column layout. Preview before you
            save.
          </p>
          <RoutineImportForm />
        </section>

        <Card className="mb-8 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="text-primary h-5 w-5" aria-hidden />
              What the template looks like
            </CardTitle>
            <CardDescription>
              Row 1 headers must stay. Put variable loads in{" "}
              <span className="font-medium">{COLUMN_LABELS.SETS_X_REPS}</span>{" "}
              (e.g. <span className="font-mono">1x12 15kg-3x12 20kg</span>) and
              leave {COLUMN_LABELS.WEIGHT} empty when weight changes per set.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border bg-surface-muted/50 border-b">
                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                      {COLUMN_LABELS.EXERCISE}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                      {COLUMN_LABELS.SETS_X_REPS}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                      {COLUMN_LABELS.WEIGHT}
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                      {COLUMN_LABELS.NOTES}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-border/50 border-b">
                    <td className="px-3 py-2">Hip Thrust</td>
                    <td className="px-3 py-2">4x10</td>
                    <td className="px-3 py-2">60kg</td>
                    <td className="px-3 py-2">Same load every set</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="px-3 py-2">Dumbbell Row</td>
                    <td className="px-3 py-2 font-medium">
                      1x12 15kg-3x12 20kg
                    </td>
                    <td className="text-muted-foreground px-3 py-2">(empty)</td>
                    <td className="px-3 py-2">Weight changes per set</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Leg Press</td>
                    <td className="px-3 py-2">3x10-2x8</td>
                    <td className="px-3 py-2">80kg</td>
                    <td className="px-3 py-2">Reps change, same weight</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Sheet name example:{" "}
              <span className="font-medium">Day 1 - FULL BODY</span> → day name
              + focus.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick checklist</CardTitle>
            <CardDescription>
              Checked when you select a file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "File is .xlsx (not .xls or Google Sheets link)",
                "Built from the FitTrack template (or same columns)",
                "One sheet = one training day",
                `Required columns: ${COLUMN_LABELS.EXERCISE}, ${COLUMN_LABELS.SETS_X_REPS}`,
                `Optional: ${COLUMN_LABELS.WEIGHT}, ${COLUMN_LABELS.NOTES}`,
              ].map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-3 text-sm"
                >
                  <CheckCircle2
                    className="text-success mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </PageContent>
    </AppShell>
  );
}
