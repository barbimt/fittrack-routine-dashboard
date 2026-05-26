"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./sidebar";

/** Bottom tab bar — first five routes for thumb reach on mobile */
const mobileNavItems = navItems.slice(0, 5);

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-1.5 safe-area-pb">
        {mobileNavItems.map((item) => {
          const shortLabel = item.label.split(" ")[0];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[52px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
