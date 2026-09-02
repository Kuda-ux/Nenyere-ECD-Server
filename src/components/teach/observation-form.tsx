"use client";

import { useState } from "react";

type Learner = {
  id: string;
  preferred_name: string;
};

export function ObservationForm({ learners }: { learners: Learner[] }) {
  const [learnerId, setLearnerId] = useState("");
  const [note, setNote] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — will call a Server Action to persist observation
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLearnerId("");
    setNote("");
    setRecommendation("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Learner</label>
        <select
          value={learnerId}
          onChange={(e) => setLearnerId(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Select a learner...</option>
          {learners.map((l) => (
            <option key={l.id} value={l.id}>{l.preferred_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Observation Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          rows={4}
          placeholder="e.g. Holds stylus with whole hand; benefits from thicker tracing lines."
          className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Recommended Activity (optional)</label>
        <input
          type="text"
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="e.g. Straight-line tracing (easy)"
          className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-[var(--color-brand-sun)] px-6 py-2.5 font-bold text-white transition-all active:scale-95"
      >
        Save Observation
      </button>

      {saved && (
        <p className="text-sm font-medium text-[var(--color-brand-msasa)]">
          ✓ Observation saved!
        </p>
      )}
    </form>
  );
}
