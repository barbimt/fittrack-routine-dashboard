import { HelpArticle } from "@/components/layout/help-article";

export default function PrivacyPolicyPage() {
  return (
    <HelpArticle
      title="Privacy Policy"
      description="How FitTrack handles your account and workout data."
    >
      <section className="space-y-3">
        <h2>What we store</h2>
        <p>Depending on how you use FitTrack, we may store:</p>
        <ul>
          <li>Account details such as email and display name</li>
          <li>Your workout routine (days, exercises, prescribed sets)</li>
          <li>Session progress such as completed sets and logged reps</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>How we use it</h2>
        <p>
          We use this information to authenticate you, show your active routine,
          and keep your training progress available across devices. We do not
          sell your personal data.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Who can see it</h2>
        <p>
          Workout and profile rows are protected with Supabase Row Level
          Security so each signed-in user only accesses their own data. Service
          operators may access infrastructure logs needed to keep the product
          running and secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Authentication providers</h2>
        <p>
          If you sign in with Google or another provider, that provider shares
          basic account information (such as email and name) according to their
          policies and the permissions you grant.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Contact</h2>
        <p>
          Privacy questions can go to{" "}
          <a
            href="mailto:privacy@fittrack.app"
            className="text-foreground font-medium underline underline-offset-2"
          >
            privacy@fittrack.app
          </a>
          .
        </p>
      </section>

      <p className="text-muted-foreground text-xs">
        Last updated: August 10, 2026
      </p>
    </HelpArticle>
  );
}
