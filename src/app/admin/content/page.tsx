"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { SignOutButton } from "@/components/sign-out-button";
import { usePortalData } from "@/hooks/use-portal-data";
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

export default function AdminContentPage() {
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

  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Content Management 📝</h1>
        <p className="mt-1 text-white/80">Activities, stories, media, audio, translations — {data.totalActivities} published</p>
      </div>

      {/* Content summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <span className="text-3xl">🎯</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.totalActivities}</p>
          <p className="text-xs text-slate-500">Total Activities</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <span className="text-3xl">🌱</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.ecdAActivities}</p>
          <p className="text-xs text-slate-500">ECD A Activities</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <span className="text-3xl">🌟</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.ecdBActivities}</p>
          <p className="text-xs text-slate-500">ECD B Activities</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <span className="text-3xl">📚</span>
          <p className="mt-2 text-3xl font-bold text-slate-800">{data.totalPillars}</p>
          <p className="text-xs text-slate-500">Learning Pillars</p>
        </div>
      </div>

      {/* Content library link */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Content Library</h2>
            <p className="mt-1 text-sm text-slate-500">
              Full CMS with draft → review → approved → published workflow
            </p>
          </div>
          <Link
            href="/teach/content"
            className="rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#4FC3F7] px-4 py-2 font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Open Content Library →
          </Link>
        </div>
      </div>

      {/* Activity coverage by pillar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Activity Coverage by Pillar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.filter((p) => p.key !== "themes").map((pillar) => {
            const activities = getActivitiesByPillar(pillar.key).length;
            return (
              <div key={pillar.key} className="flex flex-col items-center rounded-xl bg-slate-50 p-4">
                <span className="text-2xl">{pillar.emoji}</span>
                <span className="mt-1 text-xs font-medium text-slate-700">{pillar.label}</span>
                <p className="mt-2 text-2xl font-bold text-slate-800">{activities}</p>
                <p className="text-xs text-slate-500">activities</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming features */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <span className="text-3xl">🖼️</span>
          <h3 className="mt-2 font-bold text-slate-800">Media Library</h3>
          <p className="mt-1 text-sm text-slate-500">Images, audio, SVG assets</p>
          <p className="mt-2 text-xs text-slate-400">Available after Supabase Storage setup</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <span className="text-3xl">🌍</span>
          <h3 className="mt-2 font-bold text-slate-800">Translations</h3>
          <p className="mt-1 text-sm text-slate-500">Shona, Ndebele content translations</p>
          <p className="mt-2 text-xs text-slate-400">Available after i18n content tables setup</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <span className="text-3xl">📋</span>
          <h3 className="mt-2 font-bold text-slate-800">Publishing Queue</h3>
          <p className="mt-1 text-sm text-slate-500">Activities awaiting review/approval</p>
          <p className="mt-2 text-xs text-slate-400">All content currently published</p>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
