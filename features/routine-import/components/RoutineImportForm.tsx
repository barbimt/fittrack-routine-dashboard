"use client";

import { useCallback, useId, useState } from "react";
import Link from "next/link";
import { UploadDropzone } from "@/components/fitness/upload-dropzone";
import { EmptyState } from "@/components/fitness/empty-state";
import { Button } from "@/components/fitness/button";
import { FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { parseRoutineWorkbook } from "../utils/parseRoutineWorkbook";
import type { ParsedRoutine } from "../types";
import { ImportPreview } from "./ImportPreview";
import { ImportWarnings } from "./ImportWarnings";
import { saveRoutine } from "../actions/saveRoutineAction";

type ImportPhase = "idle" | "parsing" | "preview" | "saving" | "saved" | "error";

export function RoutineImportForm() {
  const inputId = useId();
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [routine, setRoutine] = useState<ParsedRoutine | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<ParsedRoutine["warnings"]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMeta, setSavedMeta] = useState<{ dayCount: number; exerciseCount: number } | null>(null);

  const resetImport = useCallback(() => {
    setPhase("idle");
    setSelectedFile(null);
    setRoutine(null);
    setFatalError(null);
    setParseWarnings([]);
    setSaveError(null);
    setSavedMeta(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!routine) return;
    setPhase("saving");
    setSaveError(null);
    const result = await saveRoutine(routine);
    if (result.ok) {
      setSavedMeta({ dayCount: result.dayCount, exerciseCount: result.exerciseCount });
      setPhase("saved");
    } else {
      setSaveError(result.error);
      setPhase("preview");
    }
  }, [routine]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setSelectedFile(file);
      setRoutine(null);
      setParseWarnings([]);
      setFatalError("Invalid file format. Please upload a .xlsx file.");
      setPhase("error");
      return;
    }

    setSelectedFile(file);
    setRoutine(null);
    setFatalError(null);
    setParseWarnings([]);
    setPhase("parsing");

    const result = await parseRoutineWorkbook(file);

    if (!result.ok) {
      setFatalError(result.error);
      setParseWarnings(result.warnings);
      setPhase("error");
      return;
    }

    setRoutine(result.routine);
    setPhase("preview");
  }, []);

  const showDropzone = phase === "idle" || phase === "parsing" || phase === "error";
  const uploadedMeta =
    selectedFile && (phase === "preview" || phase === "parsing" || phase === "saving")
      ? { name: selectedFile.name, size: selectedFile.size }
      : null;

  return (
    <div className="space-y-8">
      <section aria-label="File upload">
        {phase === "idle" && !selectedFile ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-2">
            <EmptyState
              icon={<FileSpreadsheet className="h-8 w-8 text-muted-foreground" aria-hidden />}
              title="No file selected"
              description="Drop your .xlsx routine file here or browse from your device."
              primaryAction={{
                label: "Choose file",
                onClick: () => {
                  document.getElementById(inputId)?.click();
                },
              }}
            />
            <input
              id={inputId}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFileSelect(file);
                event.target.value = "";
              }}
            />
          </div>
        ) : (
          <UploadDropzone
            onFileSelect={(file) => void handleFileSelect(file)}
            uploadedFile={uploadedMeta}
            error={phase === "error" ? fatalError : null}
            isUploading={phase === "parsing"}
            onChangeFile={resetImport}
          />
        )}
      </section>

      {phase === "error" && fatalError ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{fatalError}</p>
        </div>
      ) : null}

      {phase === "error" && parseWarnings.length > 0 ? (
        <ImportWarnings warnings={parseWarnings} title="Import issues" />
      ) : null}

      {(phase === "preview" || phase === "saving") && selectedFile && routine ? (
        <>
          <ImportPreview
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            routine={routine}
          />

          {saveError ? (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{saveError}</p>
            </div>
          ) : null}

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Button
              size="lg"
              type="button"
              disabled={phase === "saving"}
              onClick={() => void handleSave()}
            >
              {phase === "saving" ? "Saving…" : "Import routine"}
            </Button>
          </div>
        </>
      ) : null}

      {phase === "saved" && savedMeta ? (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Routine saved</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {savedMeta.dayCount} {savedMeta.dayCount === 1 ? "day" : "days"} ·{" "}
              {savedMeta.exerciseCount}{" "}
              {savedMeta.exerciseCount === 1 ? "exercise" : "exercises"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button size="sm" type="button" asChild>
              <Link href="/">Go to dashboard</Link>
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={resetImport}>
              Import another
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
