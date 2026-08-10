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
import { saveRoutine } from "../actions/saveRoutineAction";

type ImportPhase = "idle" | "parsing" | "preview" | "saving" | "error";

export function RoutineImportForm() {
  const inputId = useId();
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [routine, setRoutine] = useState<ParsedRoutine | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<ParsedRoutine["warnings"]>(
    []
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetImport = useCallback(() => {
    setPhase("idle");
    setSelectedFile(null);
    setRoutine(null);
    setFatalError(null);
    setParseWarnings([]);
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!routine) return;
    setPhase("saving");
    setSaveError(null);
    const result = await saveRoutine(routine);
    // Successful saves redirect from the server action; only errors return.
    if (!result.ok) {
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

  const uploadedMeta =
    selectedFile &&
    (phase === "preview" || phase === "parsing" || phase === "saving")
      ? { name: selectedFile.name, size: selectedFile.size }
      : null;

  return (
    <div className="space-y-8">
      <section aria-label="File upload">
        {phase === "idle" && !selectedFile ? (
          <div className="border-border bg-card rounded-2xl border border-dashed p-2">
            <EmptyState
              icon={
                <FileSpreadsheet
                  className="text-muted-foreground h-8 w-8"
                  aria-hidden
                />
              }
              title="Upload your FitTrack template"
              description="Choose the .xlsx you filled from the FitTrack template — not a random gym spreadsheet."
              primaryAction={{
                label: "Choose .xlsx file",
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
          className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-lg border p-3 text-sm"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{fatalError}</p>
        </div>
      ) : null}

      {phase === "error" && parseWarnings.length > 0 ? (
        <ImportWarnings warnings={parseWarnings} title="Import issues" />
      ) : null}

      {(phase === "preview" || phase === "saving") &&
      selectedFile &&
      routine ? (
        <>
          <ImportPreview
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            routine={routine}
          />

          {saveError ? (
            <div
              className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-lg border p-3 text-sm"
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
    </div>
  );
}
