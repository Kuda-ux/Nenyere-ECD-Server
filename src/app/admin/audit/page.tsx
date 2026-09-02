import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Audit Log — Admin" };

const placeholderAudit = [
  { action: "LOGIN", actor: "Mrs. Chitiyo", target: "—", timestamp: "2026-09-02 14:00:22" },
  { action: "PUBLISH_ACTIVITY", actor: "Mrs. Chitiyo", target: "Count the Circles", timestamp: "2026-09-01 10:15:00" },
  { action: "ASSIGN_ACTIVITY", actor: "Mr. Banda", target: "ECD A — Morning", timestamp: "2026-09-01 09:30:00" },
  { action: "ADD_OBSERVATION", actor: "Mr. Banda", target: "Tariro", timestamp: "2026-08-30 12:00:00" },
  { action: "CREATE_LEARNER", actor: "Mrs. Chitiyo", target: "Rumbidzai", timestamp: "2026-08-28 08:00:00" },
];

export default async function AuditPage() {
  return (
    <AdminLayout title="Audit Log" subtitle="Action history — all mutations logged">
      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-2)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-surface-2)]">
              <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Actor</th>
              <th className="px-4 py-3 text-left font-semibold">Target</th>
            </tr>
          </thead>
          <tbody>
            {placeholderAudit.map((entry, i) => (
              <tr key={i} className="border-b border-[var(--color-surface-2)] last:border-0">
                <td className="px-4 py-3 text-ink-500">{entry.timestamp}</td>
                <td className="px-4 py-3">
                  <code className="rounded bg-[var(--color-surface-1)] px-1.5 py-0.5 text-xs">
                    {entry.action}
                  </code>
                </td>
                <td className="px-4 py-3 font-medium">{entry.actor}</td>
                <td className="px-4 py-3 text-ink-500">{entry.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
