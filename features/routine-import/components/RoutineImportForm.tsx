"use client";

import { useCallback, useId, useState } from "react";
import { UploadDropzone } from "@/components/fitness/upload-dropzone";
import { EmptyState } from "@/components/fitness/empty-state";
import { Button } from "@/components/fitness/button";
import { FileSpreadsheet, AlertTriangle } from "lucide-react";
import { parseRoutineWorkbook } from "../utils/parseRoutineWorkbook";
import type { ParsedRoutine } from "../types";
import { ImportPreview } from "./ImportPreview";
import { ImportWarnings } from "./ImportWarnings";

type ImportPhase = "idle" | "parsing" | "preview" | "error";

export function RoutineImportForm() {
  const inputId = useId();
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [routine, setRoutine] = useState<ParsedRoutine | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<ParsedRoutine["warnings"]>([]);

  const resetImport = useCallback(() => {
    setPhase("idle");
    setSelectedFile(null);
    setRoutine(null);
    setFatalError(null);
    setParseWarnings([]);
  }, []);

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
    selectedFile && (phase === "preview" || phase === "parsing")
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

      {phase === "preview" && selectedFile && routine ? (
        <>
          <ImportPreview
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            routine={routine}
          />
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Button size="lg" type="button" disabled aria-describedby="import-next-step-hint">
              Import routine
            </Button>
            <p id="import-next-step-hint" className="text-sm text-muted-foreground sm:text-right">
              Next step: connect Supabase to save this routine.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
