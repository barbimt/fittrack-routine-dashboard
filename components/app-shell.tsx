"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { PageContent } from "@/components/layout/page-content";

interface AppShellProps {
  children: React.ReactNode;
  /** Optional right column (e.g. SummaryPanel) — desktop xl+ */
  aside?: React.ReactNode;
}

export function AppShell({ children, aside }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-0 max-lg:h-dvh max-lg:max-h-dvh max-lg:overflow-hidden lg:min-h-screen">
      <Sidebar className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64" />

      <MobileNavDrawer open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex min-h-0 flex-1 flex-col max-lg:overflow-hidden lg:pl-64">
        <Header onMenuOpen={() => setSidebarOpen(true)} />

        <main className="safe-area-pb flex min-h-0 flex-1 flex-col max-lg:overflow-y-auto max-lg:overscroll-y-contain">
          {aside ? (
            <PageContent className="flex w-full max-w-7xl flex-1 gap-8 xl:px-10">
              <div className="min-w-0 flex-1">{children}</div>
              {aside}
            </PageContent>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
