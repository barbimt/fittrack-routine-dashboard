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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
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
            <p className="text-foreground text-sm leading-tight font-semibold">
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
