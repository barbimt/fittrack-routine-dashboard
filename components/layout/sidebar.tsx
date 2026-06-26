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
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { label: "Today", href: "/", icon: <Home className="h-5 w-5" aria-hidden /> },
  {
    label: "Upload Routine",
    href: "/upload",
    icon: <Upload className="h-5 w-5" aria-hidden />,
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
  {
    label: "Routine Editor",
    href: "/editor",
    icon: <Edit3 className="h-5 w-5" aria-hidden />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" aria-hidden />,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
  navItems?: NavItem[];
  footer?: React.ReactNode;
}

export function Sidebar({
  onNavigate,
  className,
  navItems: items = navItems,
  footer,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar flex flex-col border-r",
        className
      )}
    >
      <div className="border-sidebar-border flex items-center gap-2.5 border-b px-6 py-5">
        <div
          className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg"
          aria-hidden
        >
          <Dumbbell className="text-primary-foreground h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            FitTrack
          </p>
          <p className="text-sidebar-foreground text-sm leading-tight font-semibold">
            Routine Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

      <div className="border-sidebar-border border-t px-3 py-3">
        {footer ?? <LogoutButton />}
      </div>
    </aside>
  );
}
