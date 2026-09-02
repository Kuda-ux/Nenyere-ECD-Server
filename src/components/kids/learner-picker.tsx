"use client";

import { useRouter } from "next/navigation";

type Learner = {
  id: string;
  preferred_name: string;
  first_name: string;
  avatar_key: string;
  ecd_level: string;
};

// Avatar emoji map — simple, warm, recognisable for ECD children
const AVATAR_EMOJI: Record<string, string> = {
  star: "⭐",
  elephant: "🐘",
  lion: "🦁",
  bird: "🐦",
  fish: "🐟",
  rabbit: "🐰",
  sun: "☀️",
  flower: "🌸",
  tree: "🌳",
  butterfly: "🦋",
};

export function LearnerPicker() {
  const router = useRouter();

  // Placeholder learners — will be replaced with Supabase data
  // when the database is connected. These match the seed data.
  const learners: Learner[] = [
    {
      id: "00000000-0000-0000-0000-000000001001",
      preferred_name: "Tari",
      first_name: "Tariro",
      avatar_key: "star",
      ecd_level: "ECD_A",
    },
    {
      id: "00000000-0000-0000-0000-000000001002",
      preferred_name: "Tina",
      first_name: "Tinashe",
      avatar_key: "elephant",
      ecd_level: "ECD_A",
    },
    {
      id: "00000000-0000-0000-0000-000000001003",
      preferred_name: "Rumbi",
      first_name: "Rumbidzai",
      avatar_key: "lion",
      ecd_level: "ECD_B",
    },
  ];

  function handleSelect(learner: Learner) {
    // Navigate to child dashboard after selection
    router.push(`/kids/dashboard?learner=${learner.id}`);
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8">
      {/* Mascot + greeting */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl text-5xl"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ⭐
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Who are you?
        </h1>
        <p
          className="text-lg text-[var(--color-ink-500)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Tap your picture to start playing!
        </p>
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {learners.map((learner) => (
          <button
            key={learner.id}
            onClick={() => handleSelect(learner)}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-white p-6 transition-all hover:border-[var(--color-brand-sun)] hover:shadow-lg active:scale-95"
            style={{ minHeight: "160px", minWidth: "140px" }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-4xl"
              style={{ backgroundColor: "var(--color-surface-1)" }}
              aria-hidden="true"
            >
              {AVATAR_EMOJI[learner.avatar_key] ?? "⭐"}
            </div>
            <span
              className="text-xl font-semibold text-[var(--color-ink-900)]"
              style={{ fontFamily: "var(--font-kids)" }}
            >
              {learner.preferred_name}
            </span>
          </button>
        ))}
      </div>

      {/* Exit gate — hold to exit (top-left, per design-system.md §2.4) */}
      <button
        className="mt-4 text-sm text-[var(--color-ink-500)] underline-offset-4 hover:underline"
        onClick={() => router.push("/welcome")}
      >
        ← Exit Child Mode
      </button>
    </div>
  );
}
