import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Reports — Admin" };

export default async function ReportsPage() {
  return (
    <AdminLayout title="Reports" subtitle="Learner/class reports (print/PDF)">
      <div className="space-y-6">
        {/* Print controls */}
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Generate Reports</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-surface-2)] p-4">
              <h3 className="font-medium">Class Report</h3>
              <p className="mt-1 text-sm text-ink-500">Progress summary for all learners in a class</p>
              <select className="mt-3 w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm">
                <option>ECD A — Morning</option>
                <option>ECD B — Morning</option>
              </select>
              <button
                onClick={() => window.print()}
                className="mt-3 w-full rounded-lg bg-[var(--color-brand-sun)] px-4 py-2 font-bold text-white"
              >
                Print Report
              </button>
            </div>
            <div className="rounded-lg border border-[var(--color-surface-2)] p-4">
              <h3 className="font-medium">Individual Learner Report</h3>
              <p className="mt-1 text-sm text-ink-500">Detailed progress for a single learner</p>
              <select className="mt-3 w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm">
                <option>Tariro (Tari)</option>
                <option>Tinashe (Tina)</option>
                <option>Rumbidzai (Rumbi)</option>
              </select>
              <button
                onClick={() => window.print()}
                className="mt-3 w-full rounded-lg bg-[var(--color-brand-sun)] px-4 py-2 font-bold text-white"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Sample report preview */}
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Class Progress Summary — ECD A</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-surface-2)]">
                  <th className="px-4 py-2 text-left font-semibold">Learner</th>
                  <th className="px-4 py-2 text-center font-semibold">Activities Completed</th>
                  <th className="px-4 py-2 text-center font-semibold">Avg Stars</th>
                  <th className="px-4 py-2 text-center font-semibold">Skills Practising</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-surface-2)]">
                  <td className="px-4 py-2 font-medium">Tariro</td>
                  <td className="px-4 py-2 text-center">—</td>
                  <td className="px-4 py-2 text-center">—</td>
                  <td className="px-4 py-2 text-center">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Tinashe</td>
                  <td className="px-4 py-2 text-center">—</td>
                  <td className="px-4 py-2 text-center">—</td>
                  <td className="px-4 py-2 text-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-ink-500">
            Data will populate after Supabase connection and learner activity.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
