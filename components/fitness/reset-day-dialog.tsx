"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ResetDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  isResetting: boolean;
  onConfirm: () => void;
}

export function ResetDayDialog({
  open,
  onOpenChange,
  dayName,
  isResetting,
  onConfirm,
}: ResetDayDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset today&apos;s workout?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears all completed sets and reps for {dayName} in
            today&apos;s session. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isResetting}
            onClick={onConfirm}
          >
            {isResetting ? "Resetting…" : "Reset day"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
