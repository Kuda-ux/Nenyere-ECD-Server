import Link from "next/link";

export const metadata = {
  title: "Welcome",
  description: "Sign in to Nenyere ECD Digital Learning Platform",
};

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold text-white"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ★
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to Nenyere ECD
        </h1>
        <p className="max-w-sm text-sm text-ink-500">
          Choose how you want to sign in.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/login"
          className="flex items-center justify-center rounded-xl bg-[var(--color-brand-sun)] px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Sign in as Teacher / Admin
        </Link>
        <Link
          href="/login?mode=device"
          className="flex items-center justify-center rounded-xl border border-[var(--color-surface-2)] px-6 py-4 font-semibold text-ink-700 transition-colors hover:bg-[var(--color-surface-1)]"
        >
          Sign in as Classroom Device
        </Link>
        <Link
          href="/kids"
          className="flex items-center justify-center rounded-xl bg-[var(--color-brand-msasa)] px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Child Mode (Play directly)
        </Link>
      </div>

      <Link
        href="/"
        className="text-sm text-ink-500 underline-offset-4 hover:underline"
      >
        ← Back to home
      </Link>
    </main>
  );
}
