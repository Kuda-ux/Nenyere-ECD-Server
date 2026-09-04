import { requireAuth } from "@/lib/auth";
import { AdminDashboard } from "@/components/portal/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard — Nenyere ECD",
};

export default async function AdminPage() {
  const user = await requireAuth();
  const userName = user.profile?.display_name ?? user.email ?? "Admin";

  return <AdminDashboard userName={userName} />;
}
