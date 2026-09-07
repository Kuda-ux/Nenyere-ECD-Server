import type { Metadata } from "next";
import { KidsPortal } from "@/components/kids/kids-portal";

export const metadata: Metadata = {
  title: "Child Mode",
  robots: { index: false, follow: false },
};

export default function KidsPage() {
  return (
    <div className="kids-bg-rainbow flex min-h-screen flex-col items-center justify-center px-6 py-8">
      <KidsPortal />
    </div>
  );
}
