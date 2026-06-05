"use client";

import { Dumbbell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuOpen?: () => void;
  title?: string;
}

export function Header({ onMenuOpen, title = "FitTrack" }: HeaderProps) {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur lg:hidden">
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
    </header>
  );
}
