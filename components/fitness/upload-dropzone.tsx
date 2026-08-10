"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  onFileSelect?: (file: File) => void;
  onChangeFile?: () => void;
  isUploading?: boolean;
  uploadedFile?: { name: string; size: number } | null;
  error?: string | null;
  className?: string;
}

export function UploadDropzone({
  onFileSelect,
  onChangeFile,
  isUploading,
  uploadedFile,
  error,
  className,
}: UploadDropzoneProps) {
  const isXlsx = (file: File) => file.name.toLowerCase().endsWith(".xlsx");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && isXlsx(file)) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isXlsx(file)) {
        onFileSelect?.(file);
      }
      e.target.value = "";
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (uploadedFile) {
    return (
      <div
        className={cn(
          "bg-card border-border rounded-2xl border p-6",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="bg-success/10 flex h-12 w-12 items-center justify-center rounded-xl">
            <Check className="text-success h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-card-foreground truncate font-medium">
              {uploadedFile.name}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatFileSize(uploadedFile.size)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onChangeFile?.()}
          >
            Change file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "bg-card border-border relative rounded-2xl border-2 border-dashed p-8 transition-colors",
        "hover:border-primary/50 hover:bg-muted/30",
        error && "border-destructive/50",
        className
      )}
    >
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileInput}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Upload Excel file"
      />

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
            error ? "bg-destructive/10" : "bg-primary/10"
          )}
        >
          {error ? (
            <AlertCircle className="text-destructive h-7 w-7" />
          ) : (
            <Upload className="text-primary h-7 w-7" />
          )}
        </div>

        <h3 className="text-card-foreground mb-1 text-lg font-semibold">
          {isUploading ? "Reading file…" : "Drop your FitTrack .xlsx here"}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          or click to browse — use the filled template, not any spreadsheet
        </p>

        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <FileSpreadsheet className="h-4 w-4" />
            <span>FitTrack template · .xlsx only</span>
          </div>
        )}
      </div>
    </div>
  );
}
