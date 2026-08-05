"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMontant, labelStatut, couleurStatut } from "@/lib/utils";
import { ClipboardList, CheckCircle2, Check, X, Bell, PartyPopper } from "lucide-react";

interface Stats {
  totalEleves: number;
  totalClasses: number;
  montantRecu: number;
  montantEnAttente: number;
  dossiersEnAttente: number;
  elevesEnRetard: number;
}

interface DossierEnAttente {
  id: string;
  nomEleve: string;
  nomParent: string;
  telephoneParent: string;
  classe: { nom: string };
  dateInscription: string;
}

interface EleveEnRetard {
  id: string;
  nomEleve: string;
  identifiantCourt: string;
  telephoneParent: string;
  classe: { nom: string };
  montantRetard: number;
  nbEcheancesRetard: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEleves: 0,
    totalClasses: 0,
    montantRecu: 0,
    montantEnAttente: 0,
    dossiersEnAttente: 0,
    elevesEnRetard: 0,
  });
  const [dossiers, setDossiers] = useState<DossierEnAttente[]>([]);
  const [retards, setRetards] = useState<EleveEnRetard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setDossiers(data.dossiersEnAttente || []);
        setRetards(data.elevesEnRetard || []);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmer = async (inscriptionId: string) => {
    try {
      const res = await fetch(`/api/inscriptions/${inscriptionId}/confirmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirmer" }),
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (error) {
      console.error("Erreur confirmation:", error);
    }
  };

  const handleRefuser = async (inscriptionId: string) => {
    try {
      const res = await fetch(`/api/inscriptions/${inscriptionId}/confirmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refuser" }),
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (error) {
      console.error("Erreur refus:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Vue d&apos;ensemble</h1>
          <p className="text-ink-400 text-sm mt-1">
            Bienvenue sur votre tableau de bord
          </p>
        </div>
        <Link href="/dashboard/classes/nouvelle" className="btn-primary">
          + Nouvelle classe
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 stagger-children">
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            Classes
          </p>
          <p className="stat-value text-ink-900 animate-count-up">
            {stats.totalClasses}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            Élèves
          </p>
          <p className="stat-value text-ink-900 animate-count-up">
            {stats.totalEleves}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            Reçu
          </p>
          <p className="stat-value text-emerald-400 animate-count-up text-xl">
            {formatMontant(stats.montantRecu)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            Attendu
          </p>
          <p className="stat-value text-blue-600 animate-count-up text-xl">
            {formatMontant(stats.montantEnAttente)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            Dossiers
          </p>
          <p className="stat-value text-blue-400 animate-count-up">
            {stats.dossiersEnAttente}
          </p>
          <p className="text-xs text-ink-400 mt-1">en attente</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">
            En retard
          </p>
          <p className="stat-value text-red-400 animate-count-up">
            {stats.elevesEnRetard}
          </p>
          <p className="text-xs text-ink-400 mt-1">à relancer</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dossiers en attente de confirmation */}
        <div className="glass-card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <ClipboardList size={18} strokeWidth={2} /> Dossiers en attente
              {dossiers.length > 0 && (
                <span className="badge bg-blue-100 text-blue-600">
                  {dossiers.length}
                </span>
              )}
            </h2>
          </div>

          {dossiers.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon" style={{ color: "var(--color-paye)", background: "var(--color-paye-bg)" }}>
                <CheckCircle2 size={24} strokeWidth={1.75} />
              </div>
              <p className="text-sm text-ink-400">
                Aucun dossier en attente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-soft/50 border border-border hover:border-border transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900 truncate">
                      {dossier.nomEleve}
                    </p>
                    <p className="text-sm text-ink-400 truncate">
                      {dossier.nomParent} · {dossier.telephoneParent}
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      {dossier.classe.nom}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleConfirmer(dossier.id)}
                      className="btn-success btn-sm"
                      id={`btn-confirm-${dossier.id}`}
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleRefuser(dossier.id)}
                      className="btn-danger btn-sm"
                      id={`btn-refuse-${dossier.id}`}
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Élèves à relancer */}
        <div className="glass-card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <Bell size={18} strokeWidth={2} /> Élèves à relancer
              {retards.length > 0 && (
                <span className="badge bg-red-500/10 text-red-400">
                  {retards.length}
                </span>
              )}
            </h2>
          </div>

          {retards.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon" style={{ color: "var(--color-paye)", background: "var(--color-paye-bg)" }}>
                <PartyPopper size={24} strokeWidth={1.75} />
              </div>
              <p className="text-sm text-ink-400">
                Aucun retard de paiement
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {retards.map((eleve) => (
                <div
                  key={eleve.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-soft/50 border border-red-500/10 hover:border-red-500/20 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900 truncate">
                      {eleve.nomEleve}
                      <span className="text-xs text-ink-400 ml-2">
                        {eleve.identifiantCourt}
                      </span>
                    </p>
                    <p className="text-sm text-ink-400">
                      {eleve.classe.nom}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-red-400 font-semibold text-sm">
                      {formatMontant(eleve.montantRetard)}
                    </p>
                    <p className="text-xs text-ink-400">
                      {eleve.nbEcheancesRetard} échéance
                      {eleve.nbEcheancesRetard > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
