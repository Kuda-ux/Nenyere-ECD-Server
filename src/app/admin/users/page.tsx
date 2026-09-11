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

const STAFF = [
  { name: "Mrs. Chitiyo", email: "chitiyo@nenyere.edu", role: "SCHOOL_ADMIN", status: "Active", icon: "👩‍🏫", gradient: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" },
  { name: "Mr. Banda", email: "banda@nenyere.edu", role: "TEACHER", status: "Active", icon: "👨‍🏫", gradient: "linear-gradient(135deg, #FF9F43, #FF6B35)" },
  { name: "Mrs. Nkomo", email: "nkomo@nenyere.edu", role: "TEACHER", status: "Active", icon: "👩‍🏫", gradient: "linear-gradient(135deg, #26D0A8, #00B894)" },
  { name: "Content Team", email: "content@nenyere.edu", role: "CONTENT_EDITOR", status: "Active", icon: "📝", gradient: "linear-gradient(135deg, #FFB627, #FF9F43)" },
  { name: "Tablet Device 1", email: "device-1@nenyere.edu", role: "CLASSROOM_DEVICE", status: "Active", icon: "📱", gradient: "linear-gradient(135deg, #9B59D0, #6C5CE7)" },
];

const roleColors: Record<string, string> = {
  SCHOOL_ADMIN: "bg-[#6C5CE7] text-white",
  TEACHER: "bg-[#4FC3F7] text-white",
  CONTENT_EDITOR: "bg-[#FFB627] text-white",
  CLASSROOM_DEVICE: "bg-slate-200 text-slate-600",
};

const roleLabels: Record<string, string> = {
  SCHOOL_ADMIN: "School Admin",
  TEACHER: "Teacher",
  CONTENT_EDITOR: "Content Editor",
  CLASSROOM_DEVICE: "Classroom Device",
};

export default function UsersPage() {
  return (
    <PortalLayout navItems={ADMIN_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)" roleLabel="school admin" userName="Admin">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}>
        <h1 className="text-2xl font-bold">Staff & Roles 👥</h1>
        <p className="mt-1 text-white/80">Manage users and permissions — {STAFF.length} accounts</p>
      </div>

      {/* Role summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(roleLabels).map(([role, label]) => {
          const count = STAFF.filter((s) => s.role === role).length;
          return (
            <div key={role} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${roleColors[role]}`}>
                {label}
              </span>
              <p className="mt-3 text-3xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500">{count === 1 ? "member" : "members"}</p>
            </div>
          );
        })}
      </div>

      {/* Staff table */}
      <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map((staff) => (
              <tr key={staff.email} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-base shadow-sm" style={{ background: staff.gradient }}>
                      {staff.icon}
                    </div>
                    <span className="font-medium text-slate-800">{staff.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{staff.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[staff.role]}`}>
                    {roleLabels[staff.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">{staff.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
