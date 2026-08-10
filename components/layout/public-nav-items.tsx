"use client";

import Link from "next/link";
import { BarChart3, Calendar, Home } from "lucide-react";
import { Button } from "@/components/fitness/button";
import type { NavItem } from "@/components/layout/sidebar";
import { filterEnabledNavItems } from "@/lib/features";

const ALL_PUBLIC_NAV_ITEMS: NavItem[] = [
  {
    label: "Today's Workout",
    href: "/demo",
    icon: <Home className="h-5 w-5" aria-hidden />,
  },
  {
    label: "Week Overview",
    href: "/week",
    icon: <Calendar className="h-5 w-5" aria-hidden />,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: <BarChart3 className="h-5 w-5" aria-hidden />,
  },
];

/** Public demo nav — only released features with audience `public`. */
export const publicNavItems: NavItem[] = filterEnabledNavItems(
  ALL_PUBLIC_NAV_ITEMS,
  { isAuthenticated: false }
);

export function PublicNavFooter() {
  return (
    <div className="space-y-2 px-1">
      <Button asChild className="w-full">
        <Link href="/signup">Create free account</Link>
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
