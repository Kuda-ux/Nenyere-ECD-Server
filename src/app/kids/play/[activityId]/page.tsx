"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityRunner } from "@/engine";
import { getActivityById } from "@/lib/activity-catalog";

export default function PlayActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [activityId, setActivityId] = useState<string | null>(null);

  params.then((p) => setActivityId(p.activityId));

  if (!activityId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-0)]">
        <p className="text-lg text-[var(--color-ink-500)]">Loading...</p>
      </div>
    );
  }

  const activity = getActivityById(activityId);

  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-0)]">
        <div className="text-6xl" aria-hidden="true">🔍</div>
        <p className="text-2xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
          Activity not found
        </p>
        <button
          onClick={() => router.push("/kids/dashboard")}
          className="rounded-xl bg-[var(--color-brand-sun)] px-8 py-3 font-bold text-white active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Back to Play
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-1)]">
        <div className="text-6xl" aria-hidden="true">🎉</div>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          Activity complete!
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setCompleted(false)}
            className="rounded-xl bg-[var(--color-brand-sun)] px-6 py-3 font-bold text-white active:scale-95"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            Play Again
          </button>
          <button
            onClick={() => router.push("/kids/dashboard")}
            className="rounded-xl border-2 border-[var(--color-surface-2)] bg-white px-6 py-3 font-bold text-[var(--color-ink-900)] active:scale-95"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)]">
      <ActivityRunner
        activity={activity}
        onExit={() => router.push("/kids/dashboard")}
        onComplete={() => setCompleted(true)}
      />
    </div>
  );
}
