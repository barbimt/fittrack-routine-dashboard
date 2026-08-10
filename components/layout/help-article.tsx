import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageContent } from "@/components/layout/page-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HelpArticleProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Shared shell for Settings → Help pages. Edit page bodies to expand content. */
export function HelpArticle({ title, description, children }: HelpArticleProps) {
  return (
    <AppShell>
      <PageContent className="max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mb-4 -ml-2 gap-1.5"
          asChild
        >
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </header>

        <article className="text-foreground space-y-6 text-sm leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </article>
      </PageContent>
    </AppShell>
  );
}
