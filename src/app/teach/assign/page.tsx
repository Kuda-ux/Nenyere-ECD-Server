"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
import { getAllActivities, toActivityCard, PILLARS } from "@/lib/activity-catalog";
import { AssignActivityForm } from "@/components/teach/assign-activity-form";
import { SignOutButton } from "@/components/sign-out-button";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
  { href: "/kids", label: "Child Mode", icon: "🎮", description: "Launch for learners" },
];

export default function AssignPage() {
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

  const activities = getAllActivities().map(toActivityCard);
  const learners = data.learners.map((l) => ({
    id: l.id,
    preferred_name: l.preferred_name,
    ecd_level: l.ecd_level,
  }));

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
        <h1 className="text-2xl font-bold">Assign Activities 📌</h1>
        <p className="mt-1 text-white/80">Pick activities for your class or individual learners</p>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Available Activities</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{activities.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Learners</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{learners.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Learning Pillars</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{PILLARS.filter((p) => p.key !== "themes").length}</p>
        </div>
      </div>

      {/* Assignment form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <AssignActivityForm activities={activities} learners={learners} />
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
