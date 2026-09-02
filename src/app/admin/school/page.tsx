import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "School Settings — Admin" };

export default async function SchoolSettingsPage() {
  return (
    <AdminLayout title="School Settings" subtitle="Terms, languages, policies">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">School Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Name:</span> Nenyere Day Care Centre
            </div>
            <div>
              <span className="font-medium">Location:</span> Mbare, Harare
            </div>
            <div>
              <span className="font-medium">Default Language:</span> English
            </div>
            <div>
              <span className="font-medium">Timezone:</span> Africa/Harare (CAT, UTC+2)
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Academic Terms</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <span>Term 1, 2026</span>
              <span className="text-xs text-ink-500">Jan – Apr 2026</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <span>Term 2, 2026</span>
              <span className="text-xs text-ink-500">May – Aug 2026</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-surface-2)] p-3">
              <span>Term 3, 2026</span>
              <span className="text-xs text-ink-500">Sep – Dec 2026</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Languages</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-brand-msasa)] px-2.5 py-0.5 text-xs font-medium text-white">Active</span>
              English (en)
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-surface-1)] px-2.5 py-0.5 text-xs font-medium text-ink-500">Ready</span>
              Shona (sn)
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-surface-1)] px-2.5 py-0.5 text-xs font-medium text-ink-500">Planned</span>
              Ndebele (nd)
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Policies</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Data Retention:</span> 7 years after withdrawal
            </div>
            <div>
              <span className="font-medium">Consent Required:</span> Before processing
            </div>
            <div>
              <span className="font-medium">Photo Policy:</span> No learner photos collected
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
