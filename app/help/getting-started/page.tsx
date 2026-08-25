import { HelpArticle } from "@/components/layout/help-article";

export default function GettingStartedPage() {
  return (
    <HelpArticle
      title="Getting Started"
      description="Set up your first routine and start logging completed sets."
    >
      <section className="space-y-3">
        <h2>1. Create or import a routine</h2>
        <p>
          From Today, choose{" "}
          <strong className="text-foreground font-medium">
            Create from scratch
          </strong>{" "}
          to build days and exercises in the Routine Editor, or{" "}
          <strong className="text-foreground font-medium">
            Import routine
          </strong>{" "}
          to upload a FitTrack Excel template.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Follow today&apos;s workout</h2>
        <p>
          Open Today, pick the training day you are doing, then mark each set as
          you complete it. FitTrack tracks progress by{" "}
          <strong className="text-foreground font-medium">
            completed sets
          </strong>
          , not by reps alone.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. Rest between sets</h2>
        <p>
          Use the rest timer on Today when you want a countdown between sets.
          You can start, pause, and resume from the workout screen.
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. Update your profile</h2>
        <p>
          In Settings you can change your display name. Changing email sends a
          confirmation link before it becomes your login address.
        </p>
      </section>
    </HelpArticle>
  );
}
