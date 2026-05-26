"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Upload,
  BarChart3,
  Edit3,
  Settings,
  Dumbbell,
  Home,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { label: "Today", href: "/", icon: <Home className="h-5 w-5" aria-hidden /> },
  { label: "Upload Routine", href: "/upload", icon: <Upload className="h-5 w-5" aria-hidden /> },
  { label: "Week Overview", href: "/week", icon: <Calendar className="h-5 w-5" aria-hidden /> },
  { label: "Progress", href: "/progress", icon: <BarChart3 className="h-5 w-5" aria-hidden /> },
  { label: "Routine Editor", href: "/editor", icon: <Edit3 className="h-5 w-5" aria-hidden /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" aria-hidden /> },
];

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
          aria-hidden
        >
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            FitTrack
          </p>
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
            Routine Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
