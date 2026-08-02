"use client";

import { useEffect, useState } from "react";
import { formatMontant } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    ecoles: 0,
    eleves: 0,
    revenuePaye: 0,
    revenueAttente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-red-500 border-t-red-200" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble SaaS</h1>
        <p className="text-slate-400 text-sm mt-1">
          Métriques globales de la plateforme SkooPay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
        <div className="glass-card p-6 animate-fade-in border-red-500/10 hover:border-red-500/30">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
            🏫
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">
            Total Écoles
          </p>
          <p className="text-2xl font-bold text-white">{stats.ecoles}</p>
        </div>

        <div className="glass-card p-6 animate-fade-in border-blue-500/10 hover:border-blue-500/30" style={{ animationDelay: "100ms" }}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
            👩‍🎓
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">
            Élèves Inscrits
          </p>
          <p className="text-2xl font-bold text-white">{stats.eleves}</p>
        </div>

        <div className="glass-card p-6 animate-fade-in border-emerald-500/10 hover:border-emerald-500/30" style={{ animationDelay: "200ms" }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            💰
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">
            Volume Traité
          </p>
          <p className="text-2xl font-bold text-white">
            {formatMontant(stats.revenuePaye)}
          </p>
        </div>

        <div className="glass-card p-6 animate-fade-in border-amber-500/10 hover:border-amber-500/30" style={{ animationDelay: "300ms" }}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
            ⏳
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">
            Volume en Attente
          </p>
          <p className="text-2xl font-bold text-white">
            {formatMontant(stats.revenueAttente)}
          </p>
        </div>
      </div>

      <div className="glass-card-static p-6 border-red-500/20">
        <h2 className="text-lg font-semibold text-white mb-2">Bienvenue Super Admin</h2>
        <p className="text-slate-400 text-sm">
          Ceci est le panneau de contrôle global. Vous pouvez voir les écoles inscrites, surveiller le volume financier traité par la plateforme, et gérer les activations.
        </p>
      </div>
    </div>
  );
}
