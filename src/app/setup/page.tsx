import Link from "next/link";

export default function SetupPage() {
  return (
    <main className="setup-page">
      <Link href="/">← Back to calendar</Link>
      <h1>Let’s get your calendar online.</h1>
      <p>
        This first version runs with fictional sample events. It needs no API
        keys to deploy. Team login, shared storage, map view, and AI entry are
        the next milestones.
      </p>
      <p className="setup-status">
        Use sample information only. Events added here reset when you reload.
        Your admin account is planned for cebe@slidely.ai; sign-in is not
        enabled yet.
      </p>
      <section>
        <h2>1. Import your GitHub repository</h2>
        <ol>
          <li>
            Open{" "}
            <a href="https://vercel.com/new" target="_blank" rel="noreferrer">
              Vercel’s New Project page
            </a>{" "}
            and sign in.
          </li>
          <li>
            Find <strong>cebe-fyi/slidely-event-cal</strong> and click{" "}
            <strong>Import</strong>. If it is missing, use{" "}
            <strong>Configure GitHub App</strong> to allow this repository.
          </li>
          <li>
            Keep <strong>Next.js</strong> as the framework and the root
            directory unchanged. Leave the build and install commands at their
            defaults.
          </li>
          <li>
            Click <strong>Deploy</strong>. This demo does not require
            environment variables. Once the status says <strong>Ready</strong>,
            click <strong>Visit</strong>.
          </li>
        </ol>
        <p>
          If the Vercel project already exists: open it, go to Settings → Git,
          confirm this repository is connected and the production branch is
          main, then open Deployments. A push to main should start its first
          deployment. If Vercel still reports no production deployment, use Add
          New → Project to import the now-populated repository.
        </p>
      </section>
      <section>
        <h2>2. Create a Supabase development project</h2>
        <ol>
          <li>
            Open the{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              Supabase dashboard
            </a>{" "}
            and sign in.
          </li>
          <li>
            Click <strong>New project</strong>, choose your organization, and
            name it <strong>slidely-event-cal-dev</strong>.
          </li>
          <li>
            Generate a strong database password and save it in your password
            manager. Choose an appropriate nearby region and click{" "}
            <strong>Create new project</strong>.
          </li>
          <li>
            After provisioning, click <strong>Connect</strong> and locate the
            project URL and publishable key.
          </li>
        </ol>
        <p>
          Do not create tables yourself. Codex will prepare and test the
          database migrations and permissions in the next phase.
        </p>
      </section>
      <section>
        <h2>3. Add settings when the database integration is ready</h2>
        <ol>
          <li>
            In Vercel, open this project →{" "}
            <strong>Settings → Environment Variables</strong>.
          </li>
          <li>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> with the project URL.
          </li>
          <li>
            Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> with the
            publishable key.
          </li>
          <li>
            Use the development database for Preview and Development. Before
            launch, connect Production to a separate production database.
          </li>
          <li>
            Deploy again after changing environment settings. Codex will then
            help configure OTP email delivery, domain restrictions, and your
            admin account.
          </li>
        </ol>
        <p>
          Never paste database passwords or secret/service-role API keys into
          chat. This preview does not yet read Supabase settings.
        </p>
      </section>
    </main>
  );
}
