import type { Metadata } from "next";
import { ChildDashboard } from "@/components/kids/child-dashboard";

export const metadata: Metadata = {
  title: "Play",
  robots: { index: false, follow: false },
};

export default async function ChildDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ learner?: string }>;
}) {
  const { learner } = await searchParams;
  return <ChildDashboard learnerId={learner ?? ""} />;
}
