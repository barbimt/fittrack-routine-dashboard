"use client";

import { AppShell } from "@/components/app-shell";
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
import { FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
        <header className="mb-8">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Upload Routine
          </h1>
          <p className="text-muted-foreground mt-2">
            Import your workout routine from Excel. Select a .xlsx file to
            preview days and exercises before saving.
          </p>
        </header>

        <RoutineImportForm />

        <Card className="mt-8 mb-8 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="text-primary h-5 w-5" aria-hidden />
              Example file format
            </CardTitle>
            <CardDescription>
              One sheet per training day. Row 1 must include{" "}
              {COLUMN_LABELS.EXERCISE} and {COLUMN_LABELS.SETS_X_REPS} (English
              headers).
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
                    <td className="px-3 py-2">2s pause at top</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="px-3 py-2">RDL</td>
                    <td className="px-3 py-2">3x8</td>
                    <td className="px-3 py-2">45kg</td>
                    <td className="px-3 py-2">—</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Bulgarian Split Squat</td>
                    <td className="px-3 py-2">3x10 per leg</td>
                    <td className="px-3 py-2">12kg</td>
                    <td className="px-3 py-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Sheet name example:{" "}
              <span className="font-medium">Day 1 - FULL BODY</span>
            </p>
            <div className="border-border mt-4 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="gap-2"
                onClick={() => downloadRoutineTemplate()}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Validation checklist</CardTitle>
            <CardDescription>
              Rules applied when you select a file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {[
                "File must be .xlsx",
                "Each sheet becomes one training day",
                `Required columns: ${COLUMN_LABELS.EXERCISE}, ${COLUMN_LABELS.SETS_X_REPS}`,
                `Optional columns: ${COLUMN_LABELS.WEIGHT}, ${COLUMN_LABELS.NOTES}`,
                `Empty rows and rows without ${COLUMN_LABELS.EXERCISE} are skipped`,
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
      </div>
    </AppShell>
  );
}
