import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Learner Registry — Admin" };

const placeholderLearners = [
  { id: "00000000-0000-0000-0000-000000001001", name: "Tariro (Tari)", level: "ECD_A", consent: "Granted", status: "Active" },
  { id: "00000000-0000-0000-0000-000000001002", name: "Tinashe (Tina)", level: "ECD_A", consent: "Granted", status: "Active" },
  { id: "00000000-0000-0000-0000-000000001003", name: "Rumbidzai (Rumbi)", level: "ECD_B", consent: "Granted", status: "Active" },
];

const consentColors: Record<string, string> = {
  Granted: "bg-[var(--color-brand-msasa)] text-white",
  Pending: "bg-[var(--color-brand-sun)] text-white",
  Withdrawn: "bg-red-100 text-red-700",
};

export default async function LearnersPage() {
  return (
    <AdminLayout title="Learner Registry" subtitle="Consent status, export/delete (DSAR)">
      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-2)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-2)]">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">ECD Level</th>
              <th className="px-4 py-3 text-left font-semibold">Consent</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {placeholderLearners.map((learner) => (
              <tr key={learner.id} className="border-b border-[var(--color-surface-2)] last:border-0">
                <td className="px-4 py-3 font-medium">{learner.name}</td>
                <td className="px-4 py-3 text-ink-500">{learner.level}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${consentColors[learner.consent] ?? consentColors["Pending"]}`}>
                    {learner.consent}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">{learner.status}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-medium text-[var(--color-brand-sun)] hover:underline">
                    Export
                  </button>
                  <span className="mx-2 text-ink-500">·</span>
                  <button className="text-sm font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">Data Subject Access Requests (DSAR)</h2>
        <p className="text-sm text-ink-500">
          Parents/guardians may request export or deletion of their child&apos;s data.
          Export produces a PDF with all attempts, responses, and observations.
          Delete anonymises records after retention period.
        </p>
      </div>
    </AdminLayout>
  );
}
