import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard — Nenyere ECD",
};

export default async function AdminPage() {
  const user = await requireAuth();
  const role = user.membership?.role ?? "SCHOOL_ADMIN";

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">School Dashboard</h1>

        {/* Stat tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Total Learners</p>
            <p className="mt-2 text-3xl font-bold">3</p>
            <p className="mt-1 text-xs text-ink-500">2 ECD_A · 1 ECD_B</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Staff Members</p>
            <p className="mt-2 text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-ink-500">Data after Supabase connection</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Published Activities</p>
            <p className="mt-2 text-3xl font-bold">30</p>
            <p className="mt-1 text-xs text-ink-500">3 stories</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <p className="text-sm text-ink-500">Consent Status</p>
            <p className="mt-2 text-3xl font-bold">—</p>
            <p className="mt-1 text-xs text-ink-500">Data after Supabase connection</p>
          </div>
        </div>

        {/* Admin actions */}
        <h2 className="mb-4 mt-8 text-lg font-semibold">Management</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/school"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">School Settings</p>
            <p className="mt-1 text-sm text-ink-500">Terms, languages, policies</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Staff & Roles</p>
            <p className="mt-1 text-sm text-ink-500">Manage users and permissions</p>
          </Link>
          <Link
            href="/admin/classes"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Classes</p>
            <p className="mt-1 text-sm text-ink-500">Classes and enrolments</p>
          </Link>
          <Link
            href="/admin/learners"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Learner Registry</p>
            <p className="mt-1 text-sm text-ink-500">Consent status, export/delete</p>
          </Link>
          <Link
            href="/admin/content"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Content (CMS)</p>
            <p className="mt-1 text-sm text-ink-500">Activities, stories, media</p>
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Reports</p>
            <p className="mt-1 text-sm text-ink-500">Learner/class reports (print)</p>
          </Link>
          <Link
            href="/admin/audit"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Audit Log</p>
            <p className="mt-1 text-sm text-ink-500">Action history</p>
          </Link>
          <Link
            href="/admin/privacy"
            className="rounded-xl border border-[var(--color-surface-2)] bg-white p-4 transition-colors hover:bg-[var(--color-surface-1)]"
          >
            <p className="font-medium">Privacy</p>
            <p className="mt-1 text-sm text-ink-500">Consent records, retention, DSAR</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
