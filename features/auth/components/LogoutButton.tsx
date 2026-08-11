"use client";

import { logout } from "@/features/auth/actions/authActions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground min-h-11 w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
      >
        <LogOut className="h-5 w-5" aria-hidden />
        Sign out
      </Button>
    </form>
  );
}
