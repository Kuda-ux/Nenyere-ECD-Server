"use client";

import { useState } from "react";
import Link from "next/link";

type ContentItem = {
  id: string;
  title: string;
  type: string;
  engine: string;
  ecd_level: string;
  difficulty: string;
  emoji: string;
  stars: number;
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-[var(--color-brand-msasa)] text-white",
  draft: "bg-[var(--color-surface-1)] text-[var(--color-ink-500)]",
  review: "bg-[var(--color-brand-sun)] text-white",
  approved: "bg-[var(--color-brand-sky)] text-white",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  review: "In Review",
  approved: "Approved",
};

export function ContentList({
  activities,
  stories,
}: {
  activities: ContentItem[];
  stories: ContentItem[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [tab, setTab] = useState<"activities" | "stories">("activities");

  const items = tab === "activities" ? activities : stories;
  const filtered = filter === "all" ? items : items.filter((i) => i.ecd_level === filter);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("activities")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "activities"
              ? "bg-[var(--color-brand-sun)] text-white"
              : "bg-white text-[var(--color-ink-500)] hover:bg-[var(--color-surface-1)]"
          }`}
        >
          Activities ({activities.length})
        </button>
        <button
          onClick={() => setTab("stories")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "stories"
              ? "bg-[var(--color-brand-sun)] text-white"
              : "bg-white text-[var(--color-ink-500)] hover:bg-[var(--color-surface-1)]"
          }`}
        >
          Stories ({stories.length})
        </button>
      </div>

      {/* ECD level filter */}
      <div className="flex gap-2">
        {["all", "ECD_A", "ECD_B"].map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === level
                ? "bg-[var(--color-ink-900)] text-white"
                : "bg-white text-[var(--color-ink-500)] hover:bg-[var(--color-surface-1)]"
            }`}
          >
            {level === "all" ? "All Levels" : level}
          </button>
        ))}
      </div>

      {/* Content table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-2)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-2)]">
              <th className="px-4 py-3 text-left font-semibold">Title</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Level</th>
              <th className="px-4 py-3 text-left font-semibold">Difficulty</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-surface-2)] last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-500">{item.type}</td>
                <td className="px-4 py-3 text-ink-500">{item.ecd_level}</td>
                <td className="px-4 py-3 text-ink-500">{item.difficulty}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS["published"]}`}>
                    {STATUS_LABELS["published"]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/teach/content/${item.id}/edit`}
                    className="text-sm font-medium text-[var(--color-brand-sun)] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
