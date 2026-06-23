"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mobile hamburger drawer — reuses `Sidebar` nav links (all routes). */
export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  const close = () => onOpenChange(false);

  return (
    <>
      {open && (
        <button
          type="button"
          className="bg-foreground/20 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
        aria-label="Mobile navigation menu"
      >
        <div className="bg-sidebar relative flex h-full flex-col shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 h-11 w-11"
            onClick={close}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <Sidebar onNavigate={close} className="h-full w-full" />
        </div>
      </aside>
    </>
  );
}
