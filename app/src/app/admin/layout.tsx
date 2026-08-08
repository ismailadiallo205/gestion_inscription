"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const estPageConnexion = pathname === "/admin/connexion";

  useEffect(() => {
    if (estPageConnexion) return;
    if (status === "unauthenticated") {
      router.push("/admin/connexion");
    } else if (status === "authenticated") {
      const user = session?.user as any;
      if (user?.role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [status, session, router, estPageConnexion]);

  // La page de connexion admin gère son propre affichage, sans sidebar ni garde d'authentification
  if (estPageConnexion) {
    return <>{children}</>;
  }

  if (status === "loading" || status === "unauthenticated" || (session?.user as any)?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const menuItems = [
    { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { name: "Écoles inscrites", href: "/admin/ecoles", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink-600 flex font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-border bg-surface/50 hidden md:flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="EduPay" className="h-8 w-auto object-contain" />
            <span className="text-lg font-bold text-red-400 tracking-tight">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-red-500/10 text-red-400 font-medium"
                    : "text-ink-400 hover:bg-surface-soft hover:text-ink-900"
                }`}
              >
                <item.icon size={18} strokeWidth={2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-3 bg-surface-soft/50 rounded-xl mb-2">
            <p className="text-sm font-medium text-ink-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-ink-400 truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
            className="flex items-center gap-2 px-4 py-2 w-full text-sm text-ink-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} strokeWidth={2} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EduPay" className="h-7 w-auto object-contain" />
            <span className="font-bold text-red-400 tracking-tight">Admin</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
            className="text-xs font-medium text-ink-400 hover:text-red-400"
          >
            Déconnexion
          </button>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-border sticky top-[65px] z-10 bg-paper/80 backdrop-blur-md">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-red-500/10 text-red-400 font-medium"
                    : "bg-surface-soft/50 text-ink-400"
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><item.icon size={14} strokeWidth={2} /> {item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex-1 p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
