import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { ObservationForm } from "@/components/teach/observation-form";

export const metadata = {
  title: "Observations — Teacher Portal",
};

// Placeholder observations — will be replaced with Supabase data
const placeholderObservations = [
  {
    id: "obs-1",
    learner_name: "Tari",
    date: "2026-08-28",
    note: "Holds stylus with whole hand; benefits from thicker tracing lines.",
    recommendation: "Straight-line tracing (easy)",
  },
  {
    id: "obs-2",
    learner_name: "Tina",
    date: "2026-08-30",
    note: "Counting to 3 confidently. Needs practice with 4 and 5.",
    recommendation: "Count the Circles",
  },
];

export default async function ObservationsPage() {
  const user = await requireAuth();

  // Placeholder learners
  const learners = [
    { id: "00000000-0000-0000-0000-000000001001", preferred_name: "Tari" },
    { id: "00000000-0000-0000-0000-000000001002", preferred_name: "Tina" },
    { id: "00000000-0000-0000-0000-000000001003", preferred_name: "Rumbi" },
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
        <h1 className="mb-2 text-2xl font-bold">Observations</h1>
        <p className="mb-6 text-sm text-ink-500">Record notes about learner progress</p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* New observation form */}
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">New Observation</h2>
            <ObservationForm learners={learners} />
          </div>

          {/* Recent observations */}
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Recent Observations</h2>
            <div className="space-y-4">
              {placeholderObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="rounded-lg border border-[var(--color-surface-2)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{obs.learner_name}</span>
                    <span className="text-xs text-ink-500">{obs.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-700">{obs.note}</p>
                  {obs.recommendation && (
                    <p className="mt-2 text-xs font-medium text-[var(--color-brand-sun)]">
                      Recommended: {obs.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
