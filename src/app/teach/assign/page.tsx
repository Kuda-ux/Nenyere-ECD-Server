import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { getAllActivities, toActivityCard } from "@/lib/activity-catalog";
import { AssignActivityForm } from "@/components/teach/assign-activity-form";

export const metadata = {
  title: "Assign Activities — Teacher Portal",
};

export default async function AssignPage() {
  const user = await requireAuth();
  const activities = getAllActivities().map(toActivityCard);

  // Placeholder learners
  const learners = [
    { id: "00000000-0000-0000-0000-000000001001", preferred_name: "Tari", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001002", preferred_name: "Tina", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001003", preferred_name: "Rumbi", ecd_level: "ECD_B" },
  ];

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
            <Link href="/teach" className="text-sm text-[var(--color-ink-500)] hover:underline">
              ← Dashboard
            </Link>
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
        <h1 className="mb-2 text-2xl font-bold">Assign Activities</h1>
        <p className="mb-6 text-sm text-ink-500">Pick activities for your class or individual learners</p>

        <AssignActivityForm activities={activities} learners={learners} />
      </main>
    </div>
  );
}
