"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { SignOutButton } from "@/components/sign-out-button";
import type { ReactNode } from "react";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", description: "Overview & stats" },
  { href: "/admin/school", label: "School Settings", icon: "🏫", description: "Terms, languages" },
  { href: "/admin/users", label: "Staff & Roles", icon: "👥", description: "Manage users" },
  { href: "/admin/classes", label: "Classes", icon: "📚", description: "Enrolments" },
  { href: "/admin/learners", label: "Learner Registry", icon: "🧒", description: "Consent & DSAR" },
  { href: "/admin/content", label: "Content (CMS)", icon: "📝", description: "Activities & media" },
  { href: "/admin/reports", label: "Reports", icon: "📈", description: "Learner reports" },
  { href: "/admin/audit", label: "Audit Log", icon: "🔍", description: "Action history" },
  { href: "/admin/privacy", label: "Privacy", icon: "🔒", description: "Consent records" },
];

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <PortalLayout
      navItems={ADMIN_NAV}
      brandLabel="Nenyere ECD"
      brandIcon="★"
      brandGradient="linear-gradient(135deg, #6C5CE7, #4FC3F7)"
      roleLabel="school admin"
      userName="Admin"
    >
      {/* Page header */}
      <div
        className="mb-6 rounded-2xl p-6 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #6C5CE7, #4FC3F7)" }}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-white/80">{subtitle}</p>}
      </div>

      {children}

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
