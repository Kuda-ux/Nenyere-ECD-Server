"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { getAllActivities, getAllStories, toActivityCard, PILLARS } from "@/lib/activity-catalog";
import { ContentList } from "@/components/teach/content-list";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
  { href: "/kids", label: "Child Mode", icon: "🎮", description: "Launch for learners" },
];

export default function ContentPage() {
  const activities = getAllActivities().map(toActivityCard);
  const stories = getAllStories().map((s) => ({
    id: s.id,
    title: s.title.en,
    type: s.type,
    engine: s.engine,
    ecd_level: s.ecd_level,
    difficulty: s.difficulty,
    emoji: "📖",
    stars: 0,
  }));

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
          <h1 className="text-2xl font-bold">Content Library 📚</h1>
          <p className="mt-1 text-white/80">Activities and stories — review, edit, publish</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Total Activities</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{activities.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Stories</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{stories.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-sm text-slate-500">Learning Pillars</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{PILLARS.filter((p) => p.key !== "themes").length}</p>
        </div>
      </div>

      {/* New activity button */}
      <div className="mb-6 text-right">
        <Link
          href="/teach/content/new"
          className="inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          + New Activity
        </Link>
      </div>

      {/* Content list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <ContentList activities={activities} stories={stories} />
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
