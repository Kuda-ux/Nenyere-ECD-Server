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

export default function ReportsPage() {
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
        <h1 className="text-2xl font-bold">Reports 📈</h1>
        <p className="mt-1 text-white/80">Learner/class reports (print/PDF)</p>
      </div>

      {/* Print controls */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Generate Reports</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-medium text-slate-800">Class Report</h3>
            <p className="mt-1 text-sm text-slate-500">Progress summary for all learners</p>
            <select className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option>All Learners</option>
              <option>ECD A Only</option>
              <option>ECD B Only</option>
            </select>
            <button
              onClick={() => window.print()}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Print Report
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-medium text-slate-800">Individual Learner Report</h3>
            <p className="mt-1 text-sm text-slate-500">Detailed progress for a single learner</p>
            <select className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {data.learners.map((l) => (
                <option key={l.id}>{l.preferred_name} ({l.ecd_level})</option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Class progress summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Class Progress Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Learner</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Level</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Activities Completed</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Total Stars</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Avg Score</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Skills Practised</th>
              </tr>
            </thead>
            <tbody>
              {data.learnerStats.map(({ learner, stats }) => (
                <tr key={learner.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{learner.preferred_name}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{learner.ecd_level}</span>
                  </td>
                  <td className="px-4 py-2 text-center text-slate-700">{stats.totalActivities}</td>
                  <td className="px-4 py-2 text-center font-bold text-slate-700">⭐ {stats.totalStars}</td>
                  <td className="px-4 py-2 text-center text-slate-700">{stats.avgScore}%</td>
                  <td className="px-4 py-2 text-center text-slate-700">{stats.totalSkills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
