"use client";

import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Palette, Database, HelpCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageContent className="max-w-3xl">
        <header className="mb-6">
          <h1 className="text-foreground mb-1 text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences</p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Profile</CardTitle>
              </div>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="alex@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workout-reminders">Workout Reminders</Label>
                  <p className="text-muted-foreground text-sm">
                    Get reminded about scheduled workouts
                  </p>
                </div>
                <Switch id="workout-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="progress-updates">Progress Updates</Label>
                  <p className="text-muted-foreground text-sm">
                    Weekly summary of your progress
                  </p>
                </div>
                <Switch id="progress-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rest-timer">Rest Timer Sound</Label>
                  <p className="text-muted-foreground text-sm">
                    Audio notification when rest is over
                  </p>
                </div>
                <Switch id="rest-timer" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Appearance</CardTitle>
              </div>
              <CardDescription>Customize the app look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Weight Units</Label>
                <Select defaultValue="kg">
                  <SelectTrigger id="units">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Data</CardTitle>
              </div>
              <CardDescription>Manage your workout data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Export Data</p>
                  <p className="text-muted-foreground text-sm">
                    Download all your workout history
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-destructive text-sm font-medium">
                    Reset Progress
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Clear all completed sets and progress
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base">Help & Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                Getting Started Guide
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Contact Support
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </AppShell>
  );
}
