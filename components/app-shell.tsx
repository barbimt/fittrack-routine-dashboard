"use client";

import { useState } from "react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { PageContent } from "@/components/layout/page-content";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  /** Optional right column (e.g. SummaryPanel) — desktop xl+ */
  aside?: React.ReactNode;
  navItems?: NavItem[];
  footer?: React.ReactNode;
  /**
   * Persistent bottom chrome (save bar, etc.) rendered **outside** the
   * scroll region so it never covers page actions — works on mobile Chrome
   * with dynamic toolbars + safe-area insets (see MDN `env(safe-area-inset-*)`).
   */
  bottomChrome?: React.ReactNode;
}

export function AppShell({
  children,
  aside,
  navItems,
  footer,
  bottomChrome,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const shellNavProps = { navItems, footer };
  const hasBottomChrome = Boolean(bottomChrome);

  const page = aside ? (
    <PageContent className="flex w-full max-w-7xl flex-1 gap-8 px-2 py-2 lg:px-8 lg:pt-3 lg:pb-8 xl:px-10">
      <div className="min-w-0 flex-1">{children}</div>
      {aside}
    </PageContent>
  ) : (
    children
  );

  return (
    <div className="bg-background flex h-dvh max-h-dvh min-h-0 overflow-hidden lg:max-h-none lg:min-h-screen">
      <Sidebar
        className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64"
        {...shellNavProps}
      />

      <MobileNavDrawer
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        {...shellNavProps}
      />

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:pl-64">
        <Header onMenuOpen={() => setSidebarOpen(true)} />

        {/*
          Always scroll inside a dedicated region. `h-0 flex-1` is required so
          the flex item gets a real height in mobile Chrome (otherwise the
          pane can collapse to 0 and the page looks blank).
        */}
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            !hasBottomChrome && "safe-area-pb"
          )}
        >
          <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {page}
          </div>

          {hasBottomChrome ? (
            <div className="app-bottom-chrome shrink-0">{bottomChrome}</div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
