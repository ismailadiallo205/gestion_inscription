"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    } else if (status === "authenticated") {
      const user = session?.user as any;
      if (user?.role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || (session?.user as any)?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const menuItems = [
    { name: "Vue d'ensemble", href: "/admin", icon: "📊" },
    { name: "Écoles inscrites", href: "/admin/ecoles", icon: "🏫" },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-300 flex font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-white/5 bg-navy-900/50 hidden md:flex flex-col sticky top-0 h-screen shrink-0">
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
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="px-4 py-3 bg-navy-800/50 rounded-xl mb-2">
            <p className="text-sm font-medium text-white truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="flex items-center gap-2 px-4 py-2 w-full text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-navy-900/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EduPay" className="h-7 w-auto object-contain" />
            <span className="font-bold text-red-400 tracking-tight">Admin</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="text-xs font-medium text-slate-400 hover:text-red-400"
          >
            Déconnexion
          </button>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-white/5 sticky top-[65px] z-10 bg-navy-950/80 backdrop-blur-md">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-red-500/10 text-red-400 font-medium"
                    : "bg-navy-800/50 text-slate-400"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex-1 p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
