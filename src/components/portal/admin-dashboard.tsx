"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { SignOutButton } from "@/components/sign-out-button";
import { getActivitiesByPillar, PILLARS } from "@/lib/activity-catalog";
import Link from "next/link";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", description: "Overview & stats" },
  { href: "/admin/school", label: "School Settings", icon: "🏫", description: "Terms, languages" },
  { href: "/admin/users", label: "Staff & Roles", icon: "👥", description: "Manage users" },
  { href: "/admin/classes", label: "Classes", icon: "📚", description: "Enrolments" },
  { href: "/admin/learners", label: "Learner Registry", icon: "🧒", description: "Consent & DSAR" },
  { href: "/admin/content", label: "Content (CMS)", icon: "📝", description: "Activities & media" },
  { href: "/admin/reports", label: "Reports", icon: "📈", description: "Learner reports" },
  { href: "/admin/audit", label: "Audit Log", icon: "🔍", description: "Action history" },
  { href: "/admin/privacy", label: "Privacy", icon: "🔒", description: "Consent records" },
];

const STAT_CARDS = [
  { key: "learners", icon: "🧒", label: "Total Learners", gradient: "linear-gradient(135deg, #4FC3F7, #6C5CE7)", getSub: (d: { ecdACount: number; ecdBCount: number }) => `${d.ecdACount} ECD_A · ${d.ecdBCount} ECD_B` },
  { key: "activities", icon: "🎯", label: "Published Activities", gradient: "linear-gradient(135deg, #4CAF50, #00B894)", getSub: (d: { ecdAActivities: number; ecdBActivities: number }) => `${d.ecdAActivities} ECD_A · ${d.ecdBActivities} ECD_B` },
  { key: "stars", icon: "⭐", label: "Total Stars Earned", gradient: "linear-gradient(135deg, #FFB627, #FF9F43)", getSub: () => "Across all learners" },
  { key: "avgScore", icon: "📈", label: "Class Average Score", gradient: "linear-gradient(135deg, #FF6B9D, #E84393)", getSub: () => "Across all activities" },
];

export function AdminDashboard({ userName }: { userName: string }) {
  const { data, loading } = usePortalData();

  if (loading || !data) {
    return (
      <PortalLayout
        navItems={ADMIN_NAV}
        brandLabel="Nenyere ECD"
        brandIcon="★"
        brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)"
        roleLabel="school admin"
        userName={userName}
      >
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#6C5CE7]" />
            <p className="text-slate-500">Loading dashboard data...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const statValues: Record<string, number | string> = {
    learners: data.totalLearners,
    activities: data.totalActivities,
    stars: data.classTotalStars,
    avgScore: `${data.classAvgScore}%`,
  };

  return (
    <PortalLayout
      navItems={ADMIN_NAV}
      brandLabel="Nenyere ECD"
      brandIcon="★"
      brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)"
      roleLabel="school admin"
      userName={userName}
    >
      {/* Welcome banner */}
      <div
        className="mb-8 rounded-2xl p-6 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}
      >
        <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="mt-1 text-white/80">Here&apos;s what&apos;s happening at your school today.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: card.gradient }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl">{card.icon}</span>
            </div>
            <p className="text-sm font-medium text-white/80">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{statValues[card.key]}</p>
            <p className="mt-1 text-xs text-white/70">
              {card.getSub(data as never)}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column: Learner overview + Pillar coverage */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Learner overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Learner Overview</h2>
            <Link href="/admin/learners" className="text-sm font-medium text-[#6C5CE7] hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {data.learnerStats.slice(0, 5).map(({ learner, stats }) => (
              <div key={learner.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
                >
                  {learner.preferred_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{learner.preferred_name}</p>
                  <p className="text-xs text-slate-500">{learner.ecd_level} · {stats.totalActivities} activities</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-slate-700">{stats.totalStars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar coverage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Activity Coverage by Pillar</h2>
          <div className="space-y-3">
            {PILLARS.filter((p) => p.key !== "themes").map((pillar) => {
              const activities = getActivitiesByPillar(pillar.key).length;
              const max = Math.max(activities, 1);
              return (
                <div key={pillar.key} className="flex items-center gap-3">
                  <span className="w-8 text-center text-xl">{pillar.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{pillar.label}</span>
                      <span className="text-xs text-slate-500">{activities} activities</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(max / 10) * 100}%`, background: pillar.gradient }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick management actions */}
      <h2 className="mb-4 text-lg font-bold text-slate-800">Management</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_NAV.filter((n) => n.href !== "/admin").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:scale-105 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden="true">{item.icon}</span>
            <p className="mt-2 font-semibold text-slate-800 group-hover:text-[#6C5CE7]">{item.label}</p>
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
