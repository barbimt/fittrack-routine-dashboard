import Link from "next/link";
import { Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <p
                role="status"
                className="border-primary/20 bg-primary/5 text-foreground mb-4 rounded-md border px-3 py-2 text-sm"
              >
                Cuenta creada con éxito. Inicia sesión para continuar.
              </p>
            )}
            <LoginForm />
            <p className="text-muted-foreground mt-6 text-center text-sm">
              Want to explore first?{" "}
              <Link
                href="/demo"
                className="text-primary font-medium hover:underline"
              >
                Try the interactive demo
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
