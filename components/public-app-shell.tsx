"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  PublicNavFooter,
  publicNavItems,
} from "@/components/layout/public-nav-items";
import { createClient } from "@/lib/supabase/client";

interface PublicAppShellProps {
  children: React.ReactNode;
  aside?: React.ReactNode;
}

export function PublicAppShell({ children, aside }: PublicAppShellProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(Boolean(user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === true) {
    return <AppShell aside={aside}>{children}</AppShell>;
  }

  return (
    <AppShell
      navItems={publicNavItems}
      footer={<PublicNavFooter />}
      aside={aside}
    >
      {children}
    </AppShell>
  );
}
