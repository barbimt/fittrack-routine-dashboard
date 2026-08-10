import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { ProfileSettingsForm } from "@/features/auth/components/ProfileSettingsForm";
import { getUserProfile } from "@/features/auth/actions/profileActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, Mail, Shield, User } from "lucide-react";

const helpLinks = [
  {
    href: "/help/getting-started",
    label: "Getting Started Guide",
    description: "Import or create a routine and log your first workout",
    icon: BookOpen,
  },
  {
    href: "/help/support",
    label: "Contact Support",
    description: "How to reach us and what to include",
    icon: Mail,
  },
  {
    href: "/help/privacy",
    label: "Privacy Policy",
    description: "How FitTrack handles your account and workout data",
    icon: Shield,
  },
] as const;

export default async function SettingsPage() {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell>
      <PageContent className="max-w-3xl">
        <header className="mb-6">
          <h1 className="text-foreground mb-1 text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and find help
          </p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Profile</CardTitle>
              </div>
              <CardDescription>
                Name is stored on your FitTrack profile. Email comes from your
                account (confirm changes by email).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                initialDisplayName={profile.displayName}
                initialEmail={profile.email}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Help & Support</CardTitle>
              </div>
              <CardDescription>
                Guides and policies for using FitTrack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {helpLinks.map(({ href, label, description, icon: Icon }) => (
                <Button
                  key={href}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 px-3 py-3"
                  asChild
                >
                  <Link href={href}>
                    <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="text-muted-foreground block text-xs font-normal">
                        {description}
                      </span>
                    </span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </AppShell>
  );
}
