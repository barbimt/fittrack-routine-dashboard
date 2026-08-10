import { HelpArticle } from "@/components/layout/help-article";

export default function SupportPage() {
  return (
    <HelpArticle
      title="Contact Support"
      description="How to get help while FitTrack is early."
    >
      <section className="space-y-3">
        <h2>Reach out</h2>
        <p>
          For account issues, import problems, or feedback, email{" "}
          <a
            href="mailto:support@fittrack.app"
            className="text-foreground font-medium underline underline-offset-2"
          >
            support@fittrack.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2>What to include</h2>
        <ul>
          <li>The email on your FitTrack account</li>
          <li>What you were trying to do (import, editor, Today session)</li>
          <li>Roughly when it happened and what you saw on screen</li>
          <li>
            Browser and device (for example iPhone Safari, desktop Chrome)
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Email confirmations</h2>
        <p>
          When you change your login email, FitTrack sends a confirmation link
          before the new address becomes active. Check your inbox (and spam) for
          that message.
        </p>
      </section>

      {/* Add FAQ, status page link, or a contact form here later. */}
    </HelpArticle>
  );
}
