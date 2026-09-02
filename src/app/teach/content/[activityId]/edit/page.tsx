import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { ActivityEditor } from "@/components/teach/activity-editor";
import { getActivityById } from "@/lib/activity-catalog";

export const metadata = {
  title: "Edit Activity — Teacher Portal",
};

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const user = await requireAuth();
  const { activityId } = await params;
  const activity = getActivityById(activityId);

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
            <Link href="/teach/content" className="text-sm text-[var(--color-ink-500)] hover:underline">
              ← Content
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
        <h1 className="mb-6 text-2xl font-bold">
          {activity ? `Edit: ${activity.title.en}` : "New Activity"}
        </h1>
        <ActivityEditor activity={activity} />
      </main>
    </div>
  );
}
