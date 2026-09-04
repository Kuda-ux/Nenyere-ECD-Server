"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { PILLARS } from "@/lib/activity-catalog";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
  { href: "/kids", label: "Child Mode", icon: "🎮", description: "Launch for learners" },
];

export function TeacherDashboard({ userName }: { userName: string }) {
  const { data, loading } = usePortalData();

  if (loading || !data) {
    return (
      <PortalLayout
        navItems={TEACHER_NAV}
        brandLabel="Nenyere ECD"
        brandIcon="★"
        brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)"
        roleLabel="teacher"
        userName={userName}
      >
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#FF9F43]" />
            <p className="text-slate-500">Loading class data...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const needsSupport = data.learnerStats.filter((s) => {
    const emerging = s.pillarProgress.filter((p) => p.percentage > 0 && p.percentage < 50);
    return emerging.length > 0 || s.stats.totalActivities === 0;
  });

  return (
    <PortalLayout
      navItems={TEACHER_NAV}
      brandLabel="Nenyere ECD"
      brandIcon="★"
      brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)"
      roleLabel="teacher"
      userName={userName}
    >
      {/* Welcome banner */}
      <div
        className="mb-8 rounded-2xl p-6 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}
      >
        <h1 className="text-2xl font-bold">Hello, {userName}! 👋</h1>
        <p className="mt-1 text-white/80">Your class has completed {data.classTotalActivities} activities and earned {data.classTotalStars} stars! 🌟</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="🧒" label="Active Learners" value={data.totalLearners} sub={`${data.ecdACount} ECD_A · ${data.ecdBCount} ECD_B`} gradient="linear-gradient(135deg, #4FC3F7, #6C5CE7)" />
        <StatCard icon="⭐" label="Total Stars" value={data.classTotalStars} sub="Earned by class" gradient="linear-gradient(135deg, #FFB627, #FF9F43)" />
        <StatCard icon="🎯" label="Activities Done" value={data.classTotalActivities} sub={`${data.totalActivities} available`} gradient="linear-gradient(135deg, #4CAF50, #00B894)" />
        <StatCard icon="📈" label="Class Average" value={`${data.classAvgScore}%`} sub="Overall accuracy" gradient="linear-gradient(135deg, #FF6B9D, #E84393)" />
      </div>

      {/* Two-column: Learner progress + Needs support */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Learner progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Learner Progress</h2>
            <Link href="/teach/class" className="text-sm font-medium text-[#FF9F43] hover:underline">
              Full class →
            </Link>
          </div>
          <div className="space-y-3">
            {data.learnerStats.map(({ learner, stats }) => (
              <div key={learner.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-all hover:bg-slate-100">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
                >
                  {learner.preferred_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{learner.preferred_name}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                      style={{ width: `${Math.min(stats.avgScore, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-700">⭐ {stats.totalStars}</span>
                  <span className="text-xs text-slate-500">{stats.totalActivities} done</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs support + Quick actions */}
        <div className="space-y-6">
          {/* Needs support */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <span>🤝</span> May Need Support
            </h2>
            {needsSupport.length === 0 ? (
              <p className="text-sm text-slate-500">All learners are progressing well! 🎉</p>
            ) : (
              <div className="space-y-2">
                {needsSupport.map(({ learner, stats, pillarProgress }) => (
                  <div key={learner.id} className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{learner.preferred_name}</span>
                      <span className="text-xs text-amber-600">
                        {stats.totalActivities === 0 ? "No activities yet" : `${stats.avgScore}% avg`}
                      </span>
                    </div>
                    {pillarProgress.filter((p) => p.percentage > 0 && p.percentage < 50).slice(0, 2).map((p) => (
                      <p key={p.pillar} className="mt-1 text-xs text-slate-500">
                        {p.emoji} {p.label}: {p.completedActivities}/{p.totalActivities} done
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {TEACHER_NAV.filter((n) => n.href !== "/teach" && n.href !== "/kids").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center transition-all hover:scale-105 hover:bg-orange-50"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#FF9F43]">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pillar progress overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Class Progress by Pillar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.filter((p) => p.key !== "themes").map((pillar) => {
            const totalCompleted = data.learnerStats.reduce((sum, s) => {
              const pp = s.pillarProgress.find((p) => p.pillar === pillar.key);
              return sum + (pp?.completedActivities ?? 0);
            }, 0);
            const totalAvailable = data.learnerStats.length > 0
              ? data.learnerStats[0].pillarProgress.find((p) => p.pillar === pillar.key)?.totalActivities ?? 0
              : 0;
            const pct = totalAvailable > 0 ? Math.round((totalCompleted / (totalAvailable * data.learnerStats.length)) * 100) : 0;

            return (
              <div key={pillar.key} className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                <span className="text-2xl">{pillar.emoji}</span>
                <span className="mt-1 text-xs font-medium text-slate-700">{pillar.label}</span>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pillar.gradient }} />
                </div>
                <span className="mt-1 text-xs text-slate-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}

function StatCard({ icon, label, value, sub, gradient }: { icon: string; label: string; value: string | number; sub: string; gradient: string }) {
  return (
    <div
      className="rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      style={{ background: gradient }}
    >
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-white/70">{sub}</p>
    </div>
  );
}
