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

const AUDIT_ENTRIES = [
  { action: "LOGIN", actor: "Mrs. Chitiyo", target: "—", timestamp: "2026-09-02 14:00:22", icon: "🔑", color: "bg-blue-100 text-blue-700" },
  { action: "PUBLISH_ACTIVITY", actor: "Mrs. Chitiyo", target: "Count the Circles", timestamp: "2026-09-01 10:15:00", icon: "📤", color: "bg-green-100 text-green-700" },
  { action: "ASSIGN_ACTIVITY", actor: "Mr. Banda", target: "ECD A — Morning", timestamp: "2026-09-01 09:30:00", icon: "📌", color: "bg-purple-100 text-purple-700" },
  { action: "ADD_OBSERVATION", actor: "Mr. Banda", target: "Tariro", timestamp: "2026-08-30 12:00:00", icon: "📝", color: "bg-amber-100 text-amber-700" },
  { action: "CREATE_LEARNER", actor: "Mrs. Chitiyo", target: "Rumbidzai", timestamp: "2026-08-28 08:00:00", icon: "🧒", color: "bg-pink-100 text-pink-700" },
];

export default function AuditPage() {
  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Audit Log 🔍</h1>
        <p className="mt-1 text-white/80">Action history — all mutations logged</p>
      </div>

      {/* Audit entries */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="divide-y divide-slate-100">
          {AUDIT_ENTRIES.map((entry, i) => (
            <div key={i} className="flex items-center gap-4 p-4 transition-all hover:bg-slate-50">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${entry.color}`}>
                {entry.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {entry.action}
                  </code>
                  <span className="text-sm font-medium text-slate-800">{entry.actor}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Target: <span className="font-medium text-slate-600">{entry.target}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{entry.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-slate-800">Audit Log Retention</h2>
        <p className="text-sm text-slate-600">
          All mutations (create, update, delete, publish, assign) are recorded here.
          Audit logs are retained for 7 years per the data retention policy.
          In production with Supabase, these entries are written server-side via
          Server Actions and protected by RLS policies.
        </p>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
