import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export const metadata = {
  title: "Teacher Dashboard",
};

export default async function TeachPage() {
  const user = await requireAuth();
  const role = user.membership?.role ?? "TEACHER";

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-surface-2)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: "var(--color-brand-sun)" }}
              aria-hidden="true"
            >
              ★
            </div>
            <span className="font-semibold">Nenyere ECD</span>
            <span className="rounded-full bg-[var(--color-surface-1)] px-2.5 py-0.5 text-xs font-medium text-ink-500">
              {role.replace("_", " ").toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-500">
              {user.profile?.display_name ?? user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stat tiles */}
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Active Learners</p>
            <p className="mt-2 text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-ink-500">
              Data available after Supabase connection
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Activities This Week</p>
            <p className="mt-2 text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-ink-500">
              Data available after Supabase connection
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Needs Support</p>
            <p className="mt-2 text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-ink-500">
              Data available after Supabase connection
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="mb-4 mt-8 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            href="/teach/class"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">My Class</p>
            <p className="mt-1 text-sm text-ink-500">Roster & skill matrix</p>
          </Link>
          <Link
            href="/teach/assign"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Assign Activities</p>
            <p className="mt-1 text-sm text-ink-500">Pick activities for class</p>
          </Link>
          <Link
            href="/teach/observations"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Observations</p>
            <p className="mt-1 text-sm text-ink-500">Record notes</p>
          </Link>
          <Link
            href="/teach/content"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Content Library</p>
            <p className="mt-1 text-sm text-ink-500">Activities & stories</p>
          </Link>
          <Link
            href="/kids"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Child Mode</p>
            <p className="mt-1 text-sm text-ink-500">Launch for learners</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
