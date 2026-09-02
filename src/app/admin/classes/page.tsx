import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = { title: "Classes — Admin" };

const placeholderClasses = [
  { name: "ECD A — Morning", level: "ECD_A", year: 2026, learners: 2, teacher: "Mr. Banda" },
  { name: "ECD B — Morning", level: "ECD_B", year: 2026, learners: 1, teacher: "Mrs. Nkomo" },
];

export default async function ClassesPage() {
  return (
    <AdminLayout title="Classes" subtitle="Classes and enrolments">
      <div className="grid gap-4 sm:grid-cols-2">
        {placeholderClasses.map((cls) => (
          <div key={cls.name} className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
            <h3 className="text-lg font-semibold">{cls.name}</h3>
            <div className="mt-3 space-y-1 text-sm text-ink-500">
              <p>Level: {cls.level}</p>
              <p>Academic Year: {cls.year}</p>
              <p>Teacher: {cls.teacher}</p>
              <p>Enrolled Learners: {cls.learners}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
