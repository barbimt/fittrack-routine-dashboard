"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { UploadDropzone } from "@/components/fitness/upload-dropzone";
import { EmptyState } from "@/components/fitness/empty-state";
import { Button } from "@/components/fitness/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadDemoState = "empty" | "ready" | "uploaded" | "error";

export default function UploadPage() {
  const [demoState, setDemoState] = useState<UploadDemoState>("empty");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(
    null
  );

  const handleFileSelect = (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    setDemoState("uploaded");
  };

  const errorMessage =
    demoState === "error"
      ? "Invalid file format. Please upload a .xlsx file with the correct column headers."
      : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Upload Routine
          </h1>
          <p className="mt-2 text-muted-foreground">
            Import your workout routine from Excel — visual prototype only, no parsing yet.
          </p>
        </header>

        {/* Prototype state toggles (for design review) */}
        <div
          className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-surface-muted/50 p-3"
          role="group"
          aria-label="Preview upload states"
        >
          <span className="w-full text-xs font-medium text-muted-foreground mb-1">
            Preview states (mock)
          </span>
          {(
            [
              ["empty", "Empty"],
              ["ready", "Dropzone"],
              ["uploaded", "Uploaded"],
              ["error", "Error"],
            ] as const
          ).map(([state, label]) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setDemoState(state);
                if (state === "uploaded") {
                  setUploadedFile({
                    name: "glutes-hamstrings-routine.xlsx",
                    size: 28416,
                  });
                } else if (state === "empty") {
                  setUploadedFile(null);
                } else {
                  setUploadedFile(null);
                }
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]",
                demoState === state
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="mb-8" aria-label="File upload">
          {demoState === "empty" ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-2">
              <EmptyState
                icon={
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" aria-hidden />
                }
                title="No file selected"
                description="Drop your .xlsx routine file here or browse from your device."
                primaryAction={{
                  label: "Choose file",
                  onClick: () => setDemoState("ready"),
                }}
              />
            </div>
          ) : (
            <UploadDropzone
              onFileSelect={handleFileSelect}
              uploadedFile={demoState === "uploaded" ? uploadedFile : null}
              error={errorMessage}
              isUploading={false}
            />
          )}
        </section>

        {demoState === "uploaded" && uploadedFile && (
          <div className="mb-8 flex justify-end">
            <Button size="lg" type="button">
              Import routine
            </Button>
          </div>
        )}

        <Card className="mb-8 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden />
              Example file format
            </CardTitle>
            <CardDescription>
              Your Excel file should follow this structure for a successful import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Day
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Exercise
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Muscle
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Sets
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Reps
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Weight
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-b border-border/50">
                    <td className="px-3 py-2">Monday</td>
                    <td className="px-3 py-2">Hip Thrust</td>
                    <td className="px-3 py-2">Glutes</td>
                    <td className="px-3 py-2">4</td>
                    <td className="px-3 py-2">10</td>
                    <td className="px-3 py-2">60kg</td>
                    <td className="px-3 py-2">90s</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="px-3 py-2">Monday</td>
                    <td className="px-3 py-2">RDL</td>
                    <td className="px-3 py-2">Hamstrings</td>
                    <td className="px-3 py-2">3</td>
                    <td className="px-3 py-2">8</td>
                    <td className="px-3 py-2">45kg</td>
                    <td className="px-3 py-2">120s</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Tuesday</td>
                    <td className="px-3 py-2">Lat Pulldown</td>
                    <td className="px-3 py-2">Back</td>
                    <td className="px-3 py-2">4</td>
                    <td className="px-3 py-2">12</td>
                    <td className="px-3 py-2">35kg</td>
                    <td className="px-3 py-2">90s</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <Button variant="outline" size="sm" type="button" className="gap-2">
                <Download className="h-4 w-4" aria-hidden />
                Download template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Validation checklist</CardTitle>
            <CardDescription>Future import rules — shown for UI planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {[
                "File must be in .xlsx format",
                "First row should contain column headers",
                "Day column uses names like Monday, Tuesday",
                "Sets and Reps columns contain numbers",
                "Weight may include units (kg, lbs)",
              ].map((requirement) => (
                <li key={requirement} className="flex items-start gap-3 text-sm">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{requirement}</span>
                </li>
              ))}
            </ul>
            {demoState === "error" && (
              <div
                className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
