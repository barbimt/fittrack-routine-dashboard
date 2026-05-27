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
      <div className={cn("bg-card rounded-2xl border border-border p-6", className)}>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10">
            <Check className="h-6 w-6 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-card-foreground truncate">{uploadedFile.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
          </div>
          <Button variant="outline" size="sm" type="button" onClick={() => onChangeFile?.()}>
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
        "relative bg-card rounded-2xl border-2 border-dashed border-border p-8 transition-colors",
        "hover:border-primary/50 hover:bg-muted/30",
        error && "border-destructive/50",
        className
      )}
    >
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload Excel file"
      />

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
            error ? "bg-destructive/10" : "bg-primary/10"
          )}
        >
          {error ? (
            <AlertCircle className="h-7 w-7 text-destructive" />
          ) : (
            <Upload className="h-7 w-7 text-primary" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          {isUploading ? "Uploading..." : "Drop your routine file here"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse your files
        </p>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Accepts .xlsx files only</span>
          </div>
        )}
      </div>
    </div>
  );
}
