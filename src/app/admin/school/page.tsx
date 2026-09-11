"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { SignOutButton } from "@/components/sign-out-button";

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

export default function SchoolSettingsPage() {
  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">School Settings 🏫</h1>
        <p className="mt-1 text-white/80">Terms, languages, policies</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">School Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Name</span>
              <span className="text-slate-600">Nenyere Day Care Centre</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Location</span>
              <span className="text-slate-600">Mbare, Harare</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Default Language</span>
              <span className="text-slate-600">English</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Timezone</span>
              <span className="text-slate-600">Africa/Harare (CAT, UTC+2)</span>
            </div>
          </div>
        </div>

        {/* Academic terms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Academic Terms</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-700">Term 1, 2026</p>
                <p className="text-xs text-slate-500">Jan – Apr 2026</p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Current</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-700">Term 2, 2026</p>
                <p className="text-xs text-slate-500">May – Aug 2026</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Upcoming</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-700">Term 3, 2026</p>
                <p className="text-xs text-slate-500">Sep – Dec 2026</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Languages</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#6C5CE7] px-2.5 py-0.5 text-xs font-medium text-white">Active</span>
                <span className="font-medium text-slate-700">English (en)</span>
              </div>
              <span className="text-xs text-slate-500">UI + content</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Ready</span>
                <span className="font-medium text-slate-700">Shona (sn)</span>
              </div>
              <span className="text-xs text-slate-500">Content translation</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">Planned</span>
                <span className="font-medium text-slate-700">Ndebele (nd)</span>
              </div>
              <span className="text-xs text-slate-500">Future</span>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Policies</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Data Retention</span>
              <span className="text-slate-600">7 years after withdrawal</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Consent Required</span>
              <span className="text-slate-600">Before processing</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
              <span className="font-medium text-slate-700">Photo Policy</span>
              <span className="text-amber-600">No photos collected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
