import { Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
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
            <p className="text-sm font-semibold text-foreground leading-tight">
              Routine Dashboard
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Start tracking your workout routine today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
