"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { SignOutButton } from "@/components/sign-out-button";
import { AVATAR_EMOJI, AVATAR_COLORS } from "@/lib/learner-store";

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

export default function ClassesPage() {
  const { data, loading } = usePortalData();

  if (loading || !data) {
    return (
      <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
        <div className="flex h-96 items-center justify-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#6C5CE7]" />
        </div>
      </PortalLayout>
    );
  }

  const ecdALearners = data.learnerStats.filter((s) => s.learner.ecd_level === "ECD_A");
  const ecdBLearners = data.learnerStats.filter((s) => s.learner.ecd_level === "ECD_B");

  const classes = [
    {
      name: "ECD A — Morning",
      level: "ECD_A",
      year: 2026,
      learners: ecdALearners,
      teacher: "Mr. Banda",
      gradient: "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
      icon: "🌱",
    },
    {
      name: "ECD B — Morning",
      level: "ECD_B",
      year: 2026,
      learners: ecdBLearners,
      teacher: "Mrs. Nkomo",
      gradient: "linear-gradient(135deg, #FF9F43, #FF6B35)",
      icon: "🌟",
    },
  ];

  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Classes 📚</h1>
        <p className="mt-1 text-white/80">Class enrolments and rosters — {data.totalLearners} learners across {classes.length} classes</p>
      </div>

      {/* Class cards */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {classes.map((cls) => {
          const totalStars = cls.learners.reduce((sum, s) => sum + s.stats.totalStars, 0);
          const totalActivities = cls.learners.reduce((sum, s) => sum + s.stats.totalActivities, 0);
          return (
            <div key={cls.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
              {/* Class header */}
              <div className="p-6 text-white" style={{ background: cls.gradient }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{cls.name}</h2>
                    <p className="mt-1 text-sm text-white/80">Teacher: {cls.teacher} · {cls.year}</p>
                  </div>
                  <span className="text-4xl">{cls.icon}</span>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-2xl font-bold">{cls.learners.length}</p>
                    <p className="text-xs text-white/80">Learners</p>
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-2xl font-bold">⭐ {totalStars}</p>
                    <p className="text-xs text-white/80">Stars Earned</p>
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-2xl font-bold">{totalActivities}</p>
                    <p className="text-xs text-white/80">Activities Done</p>
                  </div>
                </div>
              </div>

              {/* Roster */}
              <div className="p-6">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Class Roster</h3>
                {cls.learners.length === 0 ? (
                  <p className="text-sm text-slate-400">No learners enrolled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {cls.learners.map(({ learner, stats }) => {
                      const avatarGradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
                      const avatarEmoji = AVATAR_EMOJI[learner.avatar_key] ?? "⭐";
                      return (
                        <div key={learner.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-all hover:bg-slate-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full text-base shadow-sm" style={{ background: avatarGradient }}>
                            {avatarEmoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{learner.preferred_name}</p>
                            <p className="text-xs text-slate-500">{stats.totalActivities} activities · {stats.avgScore}% avg</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">⭐</span>
                            <span className="font-bold text-slate-700">{stats.totalStars}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Enrolment Summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-3xl font-bold text-blue-600">{data.ecdACount}</p>
            <p className="text-sm text-slate-600">ECD A Learners</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-3xl font-bold text-orange-600">{data.ecdBCount}</p>
            <p className="text-sm text-slate-600">ECD B Learners</p>
          </div>
          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-3xl font-bold text-purple-600">{data.totalLearners}</p>
            <p className="text-sm text-slate-600">Total Enrolled</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
