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

export default function PrivacyPage() {
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

  const grantedCount = data.learnerStats.length;
  const pendingCount = 0;
  const withdrawnCount = 0;

  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Privacy & Consent 🔒</h1>
        <p className="mt-1 text-white/80">Consent records, retention, DSAR workflows — {data.totalLearners} learners on file</p>
      </div>

      {/* Consent summary stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <span className="text-3xl">✅</span>
          <p className="mt-2 text-3xl font-bold text-green-600">{grantedCount}</p>
          <p className="text-sm text-slate-600">Consent Granted</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <span className="text-3xl">⏳</span>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-slate-600">Pending</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <span className="text-3xl">❌</span>
          <p className="mt-2 text-3xl font-bold text-red-600">{withdrawnCount}</p>
          <p className="text-sm text-slate-600">Withdrawn</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consent records */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Consent Records</h2>
          <div className="space-y-3">
            {data.learnerStats.map(({ learner }) => {
              const avatarGradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
              const avatarEmoji = AVATAR_EMOJI[learner.avatar_key] ?? "⭐";
              return (
                <div key={learner.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-base shadow-sm" style={{ background: avatarGradient }}>
                      {avatarEmoji}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{learner.preferred_name}</p>
                      <p className="text-xs text-slate-500">{learner.ecd_level} · Paper on file</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-medium text-white">
                    Granted
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retention policy + DSAR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Data Retention Policy</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Learner records</span>
                <span className="text-slate-500">7 years after withdrawal</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Attempt data</span>
                <span className="text-slate-500">Retained with learner record</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Observations</span>
                <span className="text-slate-500">Retained with learner record</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="font-medium text-slate-700">Audit logs</span>
                <span className="text-slate-500">7 years</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
                <span className="font-medium text-slate-700">Photos</span>
                <span className="text-amber-600">Not collected</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-slate-800">DSAR Workflow</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
              <li>Guardian submits request (verbally or paper form)</li>
              <li>Admin verifies guardian identity</li>
              <li>Export: generate PDF with all learner data</li>
              <li>Delete: anonymise records after retention period</li>
              <li>Record action in audit log</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
