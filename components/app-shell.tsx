"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  /** Optional right column (e.g. SummaryPanel) — desktop xl+ */
  aside?: React.ReactNode;
}

export function AppShell({ children, aside }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64" />

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="relative flex h-full flex-col bg-sidebar shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-10 h-11 w-11"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <Sidebar onNavigate={() => setSidebarOpen(false)} className="h-full w-full" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header onMenuOpen={() => setSidebarOpen(true)} />

        <main className="flex flex-1 flex-col">
          {aside ? (
            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 xl:px-10">
              <div className="min-w-0 flex-1">{children}</div>
              {aside}
            </div>
          ) : (
            children
          )}
        </main>

        <MobileNavigation />
      </div>
    </div>
  );
}
