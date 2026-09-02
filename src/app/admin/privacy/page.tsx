import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Privacy — Admin" };

export default async function PrivacyPage() {
  return (
    <AdminLayout title="Privacy & Consent" subtitle="Consent records, retention, DSAR workflows">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consent records */}
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Consent Records</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <div>
                <p className="font-medium">Tariro</p>
                <p className="text-xs text-ink-500">Granted: 2026-01-15 · Paper on file</p>
              </div>
              <span className="rounded-full bg-[var(--color-brand-msasa)] px-2.5 py-0.5 text-xs font-medium text-white">
                Granted
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <div>
                <p className="font-medium">Tinashe</p>
                <p className="text-xs text-ink-500">Granted: 2026-01-15 · Paper on file</p>
              </div>
              <span className="rounded-full bg-[var(--color-brand-msasa)] px-2.5 py-0.5 text-xs font-medium text-white">
                Granted
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <div>
                <p className="font-medium">Rumbidzai</p>
                <p className="text-xs text-ink-500">Granted: 2026-01-20 · Paper on file</p>
              </div>
              <span className="rounded-full bg-[var(--color-brand-msasa)] px-2.5 py-0.5 text-xs font-medium text-white">
                Granted
              </span>
            </div>
          </div>
        </div>

        {/* Retention policy */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Data Retention Policy</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Learner records:</span> 7 years after withdrawal
              </div>
              <div>
                <span className="font-medium">Attempt data:</span> Retained with learner record
              </div>
              <div>
                <span className="font-medium">Observations:</span> Retained with learner record
              </div>
              <div>
                <span className="font-medium">Audit logs:</span> 7 years
              </div>
              <div>
                <span className="font-medium">No photos collected:</span> Per data minimisation principle
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">DSAR Workflow</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-ink-500">
              <li>Guardian submits request (verbally or paper form)</li>
              <li>Admin verifies guardian identity</li>
              <li>Export: generate PDF with all learner data</li>
              <li>Delete: anonymise records after retention period</li>
              <li>Record action in audit log</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
