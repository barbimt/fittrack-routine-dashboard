"use client";

import { Dumbbell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuOpen?: () => void;
  title?: string;
}

export function Header({ onMenuOpen, title = "FitTrack" }: HeaderProps) {
  return (
    <header className="border-border bg-background safe-area-pt sticky top-0 z-30 shrink-0 border-b lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          className="h-11 w-11"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div
            className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg"
            aria-hidden
          >
            <Dumbbell className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-foreground font-semibold">{title}</span>
        </div>

        <div className="w-11" aria-hidden />
      </div>
    </header>
  );
}
