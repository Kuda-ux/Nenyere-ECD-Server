import { requireAuth } from "@/lib/auth";
import { TeacherDashboard } from "@/components/portal/teacher-dashboard";

export const metadata = {
  title: "Teacher Dashboard — Nenyere ECD",
};

export default async function TeachPage() {
  const user = await requireAuth();
  const userName = user.profile?.display_name ?? user.email ?? "Teacher";

  return <TeacherDashboard userName={userName} />;
}
