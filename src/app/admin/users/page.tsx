import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Staff & Roles — Admin" };

const placeholderStaff = [
  { name: "Mrs. Chitiyo", email: "chitiyo@nenyere.edu", role: "SCHOOL_ADMIN", status: "Active" },
  { name: "Mr. Banda", email: "banda@nenyere.edu", role: "TEACHER", status: "Active" },
  { name: "Mrs. Nkomo", email: "nkomo@nenyere.edu", role: "TEACHER", status: "Active" },
  { name: "Content Team", email: "content@nenyere.edu", role: "CONTENT_EDITOR", status: "Active" },
  { name: "Tablet Device", email: "device-1@nenyere.edu", role: "CLASSROOM_DEVICE", status: "Active" },
];

const roleColors: Record<string, string> = {
  SCHOOL_ADMIN: "bg-[var(--color-brand-msasa)] text-white",
  TEACHER: "bg-[var(--color-brand-sky)] text-white",
  CONTENT_EDITOR: "bg-[var(--color-brand-sun)] text-white",
  CLASSROOM_DEVICE: "bg-[var(--color-surface-1)] text-ink-500",
};

export default async function UsersPage() {
  return (
    <AdminLayout title="Staff & Roles" subtitle="Manage users and permissions">
      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-2)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-2)]">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {placeholderStaff.map((staff) => (
              <tr key={staff.email} className="border-b border-[var(--color-surface-2)] last:border-0">
                <td className="px-4 py-3 font-medium">{staff.name}</td>
                <td className="px-4 py-3 text-ink-500">{staff.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[staff.role] ?? roleColors["CLASSROOM_DEVICE"]}`}>
                    {staff.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">{staff.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
