"use client";

import { useState } from "react";

type ActivityCard = {
  id: string;
  title: string;
  type: string;
  engine: string;
  ecd_level: string;
  difficulty: string;
  emoji: string;
  stars: number;
};

type Learner = {
  id: string;
  preferred_name: string;
  ecd_level: string;
};

export function AssignActivityForm({
  activities,
  learners,
}: {
  activities: ActivityCard[];
  learners: Learner[];
}) {
  const [selectedLearner, setSelectedLearner] = useState<string>("all");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [assigned, setAssigned] = useState(false);

  function toggleActivity(id: string) {
    setSelectedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAssign() {
    // Placeholder — will call a Server Action to persist assignment
    setAssigned(true);
    setTimeout(() => setAssigned(false), 3000);
    setSelectedActivities(new Set());
  }

  const filteredActivities =
    selectedLearner === "all"
      ? activities
      : activities.filter((a) => {
          const learner = learners.find((l) => l.id === selectedLearner);
          return learner && a.ecd_level === learner.ecd_level;
        });

  return (
    <div className="space-y-6">
      {/* Learner selector */}
      <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
        <label className="mb-2 block text-sm font-semibold">Assign to</label>
        <select
          value={selectedLearner}
          onChange={(e) => setSelectedLearner(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
        >
          <option value="all">Entire Class</option>
          {learners.map((l) => (
            <option key={l.id} value={l.id}>
              {l.preferred_name} ({l.ecd_level})
            </option>
          ))}
        </select>
      </div>

      {/* Activity grid */}
      <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Select Activities</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                selectedActivities.has(activity.id)
                  ? "border-[var(--color-brand-sun)] bg-[var(--color-surface-1)]"
                  : "border-[var(--color-surface-2)] bg-white hover:bg-[var(--color-surface-1)]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">{activity.emoji}</span>
              <div className="flex flex-col">
                <span className="font-medium">{activity.title}</span>
                <span className="text-xs text-ink-500">
                  {activity.ecd_level} · {activity.difficulty}
                </span>
              </div>
              {selectedActivities.has(activity.id) && (
                <span className="ml-auto text-[var(--color-brand-sun)]" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Assign button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleAssign}
          disabled={selectedActivities.size === 0}
          className="rounded-xl bg-[var(--color-brand-sun)] px-6 py-3 font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          Assign {selectedActivities.size > 0 ? `(${selectedActivities.size})` : ""}
        </button>
        {assigned && (
          <span className="text-sm font-medium text-[var(--color-brand-msasa)]">
            ✓ Activities assigned successfully!
          </span>
        )}
      </div>
    </div>
  );
}
