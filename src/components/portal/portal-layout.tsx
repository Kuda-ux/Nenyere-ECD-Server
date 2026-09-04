"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  description?: string;
};

export function PortalLayout({
  navItems,
  brandLabel,
  brandIcon,
  brandGradient,
  roleLabel,
  userName,
  children,
}: {
  navItems: NavItem[];
  brandLabel: string;
  brandIcon: string;
  brandGradient: string;
  roleLabel: string;
  userName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col text-white shadow-2xl"
        style={{ background: brandGradient }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
            {brandIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">{brandLabel}</span>
            <span className="text-xs text-white/70 capitalize">{roleLabel}</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/teach" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group mb-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                  isActive
                    ? "bg-white/25 shadow-md backdrop-blur-sm"
                    : "hover:bg-white/10",
                ].join(" ")}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/90"}`}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-white/60">{item.description}</span>
                  )}
                </div>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/20 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{userName}</span>
              <span className="text-xs text-white/60 capitalize">{roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin" className="hover:text-slate-700">Admin</Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{navItems.find((n) => pathname.startsWith(n.href) && n.href !== "/admin")?.label ?? "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/kids"
              className="rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              🧒 Child Mode
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
