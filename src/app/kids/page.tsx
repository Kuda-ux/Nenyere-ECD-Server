import type { Metadata } from "next";
import { LearnerPicker } from "@/components/kids/learner-picker";

export const metadata: Metadata = {
  title: "Child Mode",
  robots: { index: false, follow: false },
};

export default function KidsPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-8"
      style={{ backgroundColor: "var(--color-surface-0)" }}
    >
      <LearnerPicker />
    </div>
  );
}
