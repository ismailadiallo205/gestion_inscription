"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, GraduationCap, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
  { href: "/dashboard/eleves", label: "Élèves", icon: GraduationCap },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (status === "authenticated") {
      const user = session?.user as any;
      if (user?.role === "SUPER_ADMIN") {
        router.push("/admin");
      }
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || (session?.user as any)?.role === "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""} md:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="EduPay" className="h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-link w-full text-left hover:text-red-400"
            id="btn-logout"
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:ml-[260px]">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-ink-900 p-2"
            id="btn-menu"
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <img src="/logo.png" alt="EduPay" className="h-7 w-auto object-contain" />
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
