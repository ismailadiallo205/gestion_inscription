"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMontant, labelStatut, couleurStatut } from "@/lib/utils";

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
        <div className="spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-ink-900)" }}>Vue d&apos;ensemble</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-400)" }}>
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
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            Classes
          </p>
          <p className="stat-value animate-count-up">
            {stats.totalClasses}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            Élèves
          </p>
          <p className="stat-value animate-count-up">
            {stats.totalEleves}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            Reçu
          </p>
          <p className="stat-value animate-count-up text-xl" style={{ color: "var(--color-paye)" }}>
            {formatMontant(stats.montantRecu)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            Attendu
          </p>
          <p className="stat-value animate-count-up text-xl" style={{ color: "var(--color-du)" }}>
            {formatMontant(stats.montantEnAttente)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            Dossiers
          </p>
          <p className="stat-value animate-count-up" style={{ color: "var(--color-blue-500)" }}>
            {stats.dossiersEnAttente}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-ink-400)" }}>en attente</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-400)" }}>
            En retard
          </p>
          <p className="stat-value animate-count-up" style={{ color: "var(--color-retard)" }}>
            {stats.elevesEnRetard}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-ink-400)" }}>à relancer</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dossiers en attente de confirmation */}
        <div className="glass-card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-ink-900)" }}>
              📋 Dossiers en attente
              {dossiers.length > 0 && (
                <span className="badge" style={{ background: "var(--color-du-bg)", color: "var(--color-du)" }}>
                  {dossiers.length}
                </span>
              )}
            </h2>
          </div>

          {dossiers.length === 0 ? (
            <div className="empty-state py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>
                Aucun dossier en attente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border-soft)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate" style={{ color: "var(--color-ink-900)" }}>
                      {dossier.nomEleve}
                    </p>
                    <p className="text-sm truncate" style={{ color: "var(--color-ink-600)" }}>
                      {dossier.nomParent} · {dossier.telephoneParent}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-ink-400)" }}>
                      {dossier.classe.nom}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleConfirmer(dossier.id)}
                      className="btn-success btn-sm"
                      id={`btn-confirm-${dossier.id}`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRefuser(dossier.id)}
                      className="btn-danger btn-sm"
                      id={`btn-refuse-${dossier.id}`}
                    >
                      ✕
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
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-ink-900)" }}>
              🔔 Élèves à relancer
              {retards.length > 0 && (
                <span className="badge" style={{ background: "var(--color-retard-bg)", color: "var(--color-retard)" }}>
                  {retards.length}
                </span>
              )}
            </h2>
          </div>

          {retards.length === 0 ? (
            <div className="empty-state py-8">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>
                Aucun retard de paiement
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {retards.map((eleve) => (
                <div
                  key={eleve.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: "var(--color-surface-soft)", border: "1px solid var(--color-border-soft)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate" style={{ color: "var(--color-ink-900)" }}>
                      {eleve.nomEleve}
                      <span className="text-xs ml-2" style={{ color: "var(--color-ink-400)" }}>
                        {eleve.identifiantCourt}
                      </span>
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-ink-600)" }}>
                      {eleve.classe.nom}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-retard)" }}>
                      {formatMontant(eleve.montantRetard)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-ink-400)" }}>
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
