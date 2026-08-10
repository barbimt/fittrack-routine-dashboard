"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/features/auth/actions/profileActions";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSettingsFormProps {
  initialDisplayName: string;
  initialEmail: string;
}

export function ProfileSettingsForm({
  initialDisplayName,
  initialEmail,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [email, setEmail] = useState(initialEmail);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    displayName.trim() !== initialDisplayName.trim() ||
    email.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserProfile({ displayName, email });
      if (!result.ok) {
        notify.error({
          title: "Could not save profile",
          description: result.error,
        });
        return;
      }

      if (result.emailChangePending) {
        notify.info({
          title: "Confirm your new email",
          description:
            "We sent a confirmation link to the new address. Your login email updates after you confirm.",
          duration: 6000,
        });
      } else {
        notify.success({ title: "Profile saved" });
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            name="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Your name"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isPending}
          />
          <p className="text-muted-foreground text-xs">
            Changing email sends a confirmation link before it becomes your
            login.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!isDirty || isPending || !displayName.trim()}
          onClick={handleSave}
        >
          {isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
