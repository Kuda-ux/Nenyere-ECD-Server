import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export const metadata = {
  title: "My Class — Teacher Portal",
};

export default async function ClassPage() {
  const user = await requireAuth();

  // Placeholder learners — will be replaced with Supabase data
  const learners = [
    { id: "00000000-0000-0000-0000-000000001001", preferred_name: "Tari", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001002", preferred_name: "Tina", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001003", preferred_name: "Rumbi", ecd_level: "ECD_B" },
  ];

  const skillAreas = [
    "Counting 1-5",
    "Shape Recognition",
    "Colour ID",
    "Phonics",
    "Tracing",
  ];

  // Placeholder mastery data — will come from Supabase
  const mastery: Record<string, Record<string, string>> = {
    "00000000-0000-0000-0000-000000001001": {
      "Counting 1-5": "Practising",
      "Shape Recognition": "Emerging",
      "Colour ID": "Mastered",
      "Phonics": "Not Started",
      "Tracing": "Emerging",
    },
    "00000000-0000-0000-0000-000000001002": {
      "Counting 1-5": "Emerging",
      "Shape Recognition": "Practising",
      "Colour ID": "Practising",
      "Phonics": "Not Started",
      "Tracing": "Not Started",
    },
    "00000000-0000-0000-0000-000000001003": {
      "Counting 1-5": "Mastered",
      "Shape Recognition": "Mastered",
      "Colour ID": "Mastered",
      "Phonics": "Practising",
      "Tracing": "Practising",
    },
  };

  const masteryColors: Record<string, string> = {
    "Mastered": "bg-[var(--color-brand-msasa)] text-white",
    "Practising": "bg-[var(--color-brand-sun)] text-white",
    "Emerging": "bg-[var(--color-brand-sky)] text-white",
    "Not Started": "bg-[var(--color-surface-1)] text-[var(--color-ink-500)]",
  };

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
        <h1 className="mb-2 text-2xl font-bold">My Class</h1>
        <p className="mb-6 text-sm text-ink-500">Roster & skill matrix</p>

        {/* Skill matrix */}
        <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-2)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-surface-2)]">
                <th className="px-4 py-3 text-left font-semibold">Learner</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                {skillAreas.map((skill) => (
                  <th key={skill} className="px-4 py-3 text-center font-semibold">{skill}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => (
                <tr key={learner.id} className="border-b border-[var(--color-surface-2)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/teach/learners/${learner.id}`}
                      className="font-medium hover:underline"
                    >
                      {learner.preferred_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{learner.ecd_level}</td>
                  {skillAreas.map((skill) => {
                    const stage = mastery[learner.id]?.[skill] ?? "Not Started";
                    return (
                      <td key={skill} className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${masteryColors[stage] ?? masteryColors["Not Started"]}`}>
                          {stage}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Support flags */}
        <h2 className="mb-4 mt-8 text-lg font-semibold">Learners Who May Need Support</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {learners.filter((l) => {
            const m = mastery[l.id];
            return m && Object.values(m).some((v) => v === "Emerging");
          }).map((learner) => (
            <div
              key={learner.id}
              className="rounded-xl border border-[var(--color-brand-sun)] bg-white p-4"
            >
              <p className="font-medium">{learner.preferred_name}</p>
              <p className="mt-1 text-sm text-ink-500">
                {Object.entries(mastery[learner.id] ?? {})
                  .filter(([, v]) => v === "Emerging")
                  .map(([k]) => k)
                  .join(", ")}
              </p>
              <Link
                href={`/teach/learners/${learner.id}`}
                className="mt-2 inline-block text-sm font-medium text-[var(--color-brand-sun)] hover:underline"
              >
                View profile →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
