import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold text-white"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ★
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          Nenyere ECD Digital Learning Platform
        </h1>
        <p className="max-w-md text-base text-ink-500">
          Offline-first, tablet-first Early Childhood Development learning for
          Nenyere Day Care Centre — aligned to the Zimbabwe Heritage-Based
          Curriculum 2024–2030.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/welcome"
          className="rounded-lg bg-[var(--color-brand-sun)] px-6 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
        >
          Welcome / Sign In
        </Link>
        <Link
          href="/kids"
          className="rounded-lg bg-[var(--color-brand-msasa)] px-6 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
        >
          Child Mode
        </Link>
        <Link
          href="/privacy"
          className="rounded-lg border border-[var(--color-surface-2)] px-6 py-3 text-center font-semibold text-ink-700 transition-colors hover:bg-[var(--color-surface-1)]"
        >
          Privacy Policy
        </Link>
      </div>

      <p className="text-xs text-ink-500">
        Project status: Foundation phase — under active development.
      </p>
    </main>
  );
}
