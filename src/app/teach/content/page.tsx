import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { getAllActivities, getAllStories, toActivityCard } from "@/lib/activity-catalog";
import { ContentList } from "@/components/teach/content-list";

export const metadata = {
  title: "Content — Teacher Portal",
};

export default async function ContentPage() {
  const user = await requireAuth();
  const activities = getAllActivities().map(toActivityCard);
  const stories = getAllStories().map((s) => ({
    id: s.id,
    title: s.title.en,
    type: s.type,
    engine: s.engine,
    ecd_level: s.ecd_level,
    difficulty: s.difficulty,
    emoji: "📖",
    stars: 0,
  }));

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Library</h1>
            <p className="mt-1 text-sm text-ink-500">Activities and stories — review, edit, publish</p>
          </div>
          <Link
            href="/teach/content/new"
            className="rounded-xl bg-[var(--color-brand-sun)] px-4 py-2 font-bold text-white transition-all active:scale-95"
          >
            + New Activity
          </Link>
        </div>

        <ContentList activities={activities} stories={stories} />
      </main>
    </div>
  );
}
