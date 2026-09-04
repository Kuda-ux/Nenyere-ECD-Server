"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { ObservationForm } from "@/components/teach/observation-form";
import { SignOutButton } from "@/components/sign-out-button";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
  { href: "/kids", label: "Child Mode", icon: "🎮", description: "Launch for learners" },
];

const SAMPLE_OBSERVATIONS = [
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

export default function ObservationsPage() {
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

  const learners = data.learners.map((l) => ({
    id: l.id,
    preferred_name: l.preferred_name,
  }));

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
        <h1 className="text-2xl font-bold">Observations 📝</h1>
        <p className="mt-1 text-white/80">Record notes about learner progress and development</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New observation form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">New Observation</h2>
          <ObservationForm learners={learners} />
        </div>

        {/* Recent observations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Recent Observations</h2>
          <div className="space-y-4">
            {SAMPLE_OBSERVATIONS.map((obs) => (
              <div key={obs.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm" style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}>
                      {obs.learner_name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{obs.learner_name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{obs.date}</span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{obs.note}</p>
                {obs.recommendation && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                    💡 Recommended: {obs.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learner quick-reference */}
      <h2 className="mb-4 mt-8 text-lg font-bold text-slate-800">Learner Quick Reference</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.learnerStats.map(({ learner, stats }) => (
          <div key={learner.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm" style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}>
                {learner.preferred_name.charAt(0)}
              </div>
              <span className="font-medium text-slate-800">{learner.preferred_name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>⭐ {stats.totalStars}</span>
              <span>{stats.totalActivities} done</span>
              <span>{stats.avgScore}% avg</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
