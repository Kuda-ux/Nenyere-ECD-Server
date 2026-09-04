"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { PILLARS } from "@/lib/activity-catalog";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
  { href: "/kids", label: "Child Mode", icon: "🎮", description: "Launch for learners" },
];

export default function ClassPage() {
  const { data, loading } = usePortalData();

  if (loading || !data) {
    return (
      <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
        <div className="flex h-96 items-center justify-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#FF9F43]" />
        </div>
      </PortalLayout>
    );
  }

  const masteryColors: Record<string, string> = {
    Mastered: "bg-green-500 text-white",
    Practising: "bg-amber-500 text-white",
    Emerging: "bg-blue-400 text-white",
    "Not Started": "bg-slate-200 text-slate-500",
  };

  function getMasteryLevel(completed: number, total: number, avgScore: number): string {
    if (completed === 0) return "Not Started";
    const pct = total > 0 ? (completed / total) * 100 : 0;
    if (pct >= 80 && avgScore >= 80) return "Mastered";
    if (pct >= 50) return "Practising";
    return "Emerging";
  }

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
        <h1 className="text-2xl font-bold">My Class 🧒</h1>
        <p className="mt-1 text-white/80">Roster & skill matrix — {data.totalLearners} learners</p>
      </div>

      {/* Skill matrix */}
      <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Learner</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Level</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">⭐ Stars</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Activities</th>
              {PILLARS.filter((p) => p.key !== "themes").slice(0, 6).map((pillar) => (
                <th key={pillar.key} className="px-4 py-3 text-center font-semibold text-slate-700">
                  {pillar.emoji} {pillar.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.learnerStats.map(({ learner, stats, pillarProgress }) => (
              <tr key={learner.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/kids/profile?learner=${learner.id}`} className="flex items-center gap-2 font-medium text-slate-800 hover:text-[#FF9F43]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm" style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}>
                      {learner.preferred_name.charAt(0)}
                    </div>
                    {learner.preferred_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{learner.ecd_level}</span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{stats.totalStars}</td>
                <td className="px-4 py-3 text-center text-slate-600">{stats.totalActivities}</td>
                {PILLARS.filter((p) => p.key !== "themes").slice(0, 6).map((pillar) => {
                  const pp = pillarProgress.find((p) => p.pillar === pillar.key);
                  const level = getMasteryLevel(pp?.completedActivities ?? 0, pp?.totalActivities ?? 0, stats.avgScore);
                  return (
                    <td key={pillar.key} className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${masteryColors[level]}`}>
                        {level}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Learners who need support */}
      <h2 className="mb-4 text-lg font-bold text-slate-800">🤝 Learners Who May Need Support</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.learnerStats.filter((s) => {
          const emerging = s.pillarProgress.filter((p) => p.percentage > 0 && p.percentage < 50);
          return emerging.length > 0 || s.stats.totalActivities === 0;
        }).map(({ learner, stats, pillarProgress }) => (
          <div key={learner.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}>
                {learner.preferred_name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-800">{learner.preferred_name}</p>
                <p className="text-xs text-slate-500">{learner.ecd_level} · {stats.totalActivities} activities</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {pillarProgress.filter((p) => p.percentage > 0 && p.percentage < 50).slice(0, 3).map((p) => (
                <p key={p.pillar} className="text-xs text-slate-600">
                  {p.emoji} {p.label}: {p.completedActivities}/{p.totalActivities}
                </p>
              ))}
              {stats.totalActivities === 0 && (
                <p className="text-xs text-amber-600">No activities started yet</p>
              )}
            </div>
            <Link
              href={`/kids/profile?learner=${learner.id}`}
              className="mt-3 inline-block text-sm font-medium text-[#FF9F43] hover:underline"
            >
              View profile →
            </Link>
          </div>
        ))}
        {data.learnerStats.every((s) => s.stats.totalActivities > 0 && s.pillarProgress.every((p) => p.percentage === 0 || p.percentage >= 50)) && (
          <div className="col-span-full rounded-2xl bg-green-50 p-6 text-center">
            <p className="text-lg font-medium text-green-700">🎉 All learners are progressing well!</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
