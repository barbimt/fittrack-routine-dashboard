"use client";

import { useCallback, useReducer } from "react";
import { UploadDropzone } from "@/components/fitness/upload-dropzone";
import { Button } from "@/components/fitness/button";
import { AlertTriangle } from "lucide-react";
import { parseRoutineWorkbook } from "../utils/parseRoutineWorkbook";
import type { ParsedRoutine } from "../types";
import { ImportPreview } from "./ImportPreview";
import { ImportWarnings } from "./ImportWarnings";
import { saveRoutine } from "../actions/saveRoutineAction";

type ImportPhase = "idle" | "parsing" | "preview" | "saving" | "error";

type ImportState = {
  phase: ImportPhase;
  selectedFile: File | null;
  routine: ParsedRoutine | null;
  fatalError: string | null;
  parseWarnings: ParsedRoutine["warnings"];
  saveError: string | null;
};

type ImportAction =
  | { type: "reset" }
  | { type: "invalid_format"; file: File }
  | { type: "parse_start"; file: File }
  | {
      type: "parse_error";
      error: string;
      warnings: ParsedRoutine["warnings"];
    }
  | { type: "parse_ok"; routine: ParsedRoutine }
  | { type: "save_start" }
  | { type: "save_error"; error: string };

const initialState: ImportState = {
  phase: "idle",
  selectedFile: null,
  routine: null,
  fatalError: null,
  parseWarnings: [],
  saveError: null,
};

function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "reset":
      return initialState;
    case "invalid_format":
      return {
        ...initialState,
        phase: "error",
        selectedFile: action.file,
        fatalError: "This is not an Excel file. Upload a .xlsx file.",
      };
    case "parse_start":
      return {
        ...initialState,
        phase: "parsing",
        selectedFile: action.file,
      };
    case "parse_error":
      return {
        ...state,
        phase: "error",
        fatalError: action.error,
        parseWarnings: action.warnings,
        routine: null,
      };
    case "parse_ok":
      return {
        ...state,
        phase: "preview",
        routine: action.routine,
        fatalError: null,
        parseWarnings: [],
      };
    case "save_start":
      return { ...state, phase: "saving", saveError: null };
    case "save_error":
      return { ...state, phase: "preview", saveError: action.error };
    default:
      return state;
  }
}

export function RoutineImportForm() {
  const [state, dispatch] = useReducer(importReducer, initialState);
  const { phase, selectedFile, routine, fatalError, parseWarnings, saveError } =
    state;

  const resetImport = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const handleSave = useCallback(async () => {
    if (!routine) return;
    dispatch({ type: "save_start" });
    const result = await saveRoutine(routine);
    // Successful saves redirect from the server action; only errors return.
    if (!result.ok) {
      dispatch({ type: "save_error", error: result.error });
    }
  }, [routine]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      dispatch({ type: "invalid_format", file });
      return;
    }

    dispatch({ type: "parse_start", file });
    const result = await parseRoutineWorkbook(file);

    if (!result.ok) {
      dispatch({
        type: "parse_error",
        error: result.error,
        warnings: result.warnings,
      });
      return;
    }

    dispatch({ type: "parse_ok", routine: result.routine });
  }, []);

  const uploadedMeta =
    selectedFile && (phase === "preview" || phase === "saving")
      ? { name: selectedFile.name, size: selectedFile.size }
      : null;

  return (
    <div className="space-y-8">
      <section aria-label="File upload">
        <UploadDropzone
          onFileSelect={(file) => void handleFileSelect(file)}
          uploadedFile={uploadedMeta}
          error={phase === "error" ? fatalError : null}
          isUploading={phase === "parsing"}
          onChangeFile={resetImport}
        />
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
          <ImportPreview routine={routine} />

          {saveError ? (
            <div
              className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 rounded-lg border p-3 text-sm"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{saveError}</p>
            </div>
          ) : null}

          <div className="bg-background/95 border-border sticky bottom-0 z-10 -mx-4 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0">
            <Button
              size="lg"
              type="button"
              className="w-full sm:w-auto"
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
