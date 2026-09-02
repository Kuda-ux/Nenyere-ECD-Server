import { AdminLayout } from "@/components/admin/admin-layout";
import Link from "next/link";

export const metadata = { title: "Content (CMS) — Admin" };

export default async function AdminContentPage() {
  return (
    <AdminLayout title="Content Management" subtitle="Activities, stories, media, audio, translations">
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Content Library</h2>
              <p className="mt-1 text-sm text-ink-500">
                Full CMS with draft → review → approved → published workflow
              </p>
            </div>
            <Link
              href="/teach/content"
              className="rounded-xl bg-[var(--color-brand-sun)] px-4 py-2 font-bold text-white transition-all active:scale-95"
            >
              Open Content Library →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h3 className="font-semibold">Media Library</h3>
            <p className="mt-1 text-sm text-ink-500">Images, audio, SVG assets</p>
            <p className="mt-2 text-2xl font-bold">—</p>
            <p className="text-xs text-ink-500">Available after Supabase Storage setup</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h3 className="font-semibold">Translations</h3>
            <p className="mt-1 text-sm text-ink-500">Shona, Ndebele content translations</p>
            <p className="mt-2 text-2xl font-bold">—</p>
            <p className="text-xs text-ink-500">Available after i18n content tables setup</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h3 className="font-semibold">Publishing Queue</h3>
            <p className="mt-1 text-sm text-ink-500">Activities awaiting review/approval</p>
            <p className="mt-2 text-2xl font-bold">0</p>
            <p className="text-xs text-ink-500">All content currently published</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
