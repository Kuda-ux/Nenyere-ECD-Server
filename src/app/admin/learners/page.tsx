"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { usePortalData } from "@/hooks/use-portal-data";
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

export default function LearnersPage() {
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

  const consentColors: Record<string, string> = {
    Granted: "bg-green-500 text-white",
    Pending: "bg-amber-500 text-white",
    Withdrawn: "bg-red-100 text-red-700",
  };

  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Learner Registry 🧒</h1>
        <p className="mt-1 text-white/80">Consent status, export/delete (DSAR) — {data.totalLearners} registered</p>
      </div>

      {/* Learner table */}
      <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ECD Level</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">⭐ Stars</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Activities</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Consent</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.learnerStats.map(({ learner, stats }) => (
              <tr key={learner.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
                      {learner.preferred_name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-800">{learner.preferred_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{learner.ecd_level}</span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">{stats.totalStars}</td>
                <td className="px-4 py-3 text-center text-slate-600">{stats.totalActivities}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${consentColors["Granted"]}`}>
                    Granted
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-medium text-[#6C5CE7] hover:underline">Export</button>
                  <span className="mx-2 text-slate-300">·</span>
                  <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DSAR section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-slate-800">Data Subject Access Requests (DSAR)</h2>
        <p className="text-sm text-slate-600">
          Parents/guardians may request export or deletion of their child&apos;s data.
          Export produces a PDF with all attempts, responses, and observations.
          Delete anonymises records after retention period.
        </p>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
