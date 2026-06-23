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
    <div className="bg-background flex min-h-screen">
      <Sidebar className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64" />

      <MobileNavDrawer open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header onMenuOpen={() => setSidebarOpen(true)} />

        <main className="flex flex-1 flex-col">
          {aside ? (
            <PageContent
              width="7xl"
              className="flex w-full flex-1 gap-8 xl:px-10"
            >
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
