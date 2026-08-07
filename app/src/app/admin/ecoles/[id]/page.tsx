"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";
import { ArrowLeft, Building2, GraduationCap, Wallet, BookOpen } from "lucide-react";

interface EcoleDetail {
  id: string;
  nom: string;
  nomPublic: string | null;
  email: string;
  ville: string | null;
  type: string;
  slug: string;
  waveActivationStatut: string;
  actif: boolean;
  createdAt: string;
  nombreEleves: number;
  revenuTotal: number;
  classes: Array<{
    id: string;
    nom: string;
    statut: string;
    montantMensualite: number;
    _count: { inscriptions: number };
  }>;
}

export default function AdminEcoleDetailPage() {
  const params = useParams();
  const [ecole, setEcole] = useState<EcoleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEcole = () => {
    fetch(`/api/admin/ecoles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setEcole(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEcole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const toggleActif = async () => {
    if (!ecole) return;
    const action = ecole.actif ? "suspendre" : "réactiver";
    if (!confirm(`Voulez-vous vraiment ${action} "${ecole.nom}" ?`)) return;
    await fetch(`/api/admin/ecoles/${ecole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !ecole.actif }),
    });
    fetchEcole();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-red-500 border-t-red-200" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!ecole) {
    return (
      <div className="empty-state">
        <p className="text-lg text-ink-600">École non trouvée</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/admin/ecoles"
        className="text-sm text-ink-400 hover:text-blue-600 transition-colors mb-4 inline-flex items-center gap-1"
      >
        <ArrowLeft size={14} strokeWidth={2} /> Retour aux écoles
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink-900">{ecole.nom}</h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                ecole.actif
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {ecole.actif ? "Active" : "Suspendue"}
            </span>
          </div>
          <p className="text-ink-400 text-sm mt-1">
            {ecole.email} {ecole.ville && `· ${ecole.ville}`} · Inscrite le{" "}
            {new Date(ecole.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/ecoles/${ecole.id}/integration`} className="btn-secondary btn-sm">
            Intégration Wave
          </Link>
          <button
            onClick={toggleActif}
            className={`btn-sm rounded-lg border font-medium px-4 py-2 transition-colors ${
              ecole.actif
                ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {ecole.actif ? "Suspendre l'école" : "Réactiver l'école"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card-static p-5">
          <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
            <BookOpen size={16} strokeWidth={2} className="text-blue-400" />
            Classes
          </div>
          <p className="text-2xl font-bold text-ink-900">{ecole.classes.length}</p>
        </div>
        <div className="glass-card-static p-5">
          <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
            <GraduationCap size={16} strokeWidth={2} className="text-emerald-400" />
            Élèves confirmés
          </div>
          <p className="text-2xl font-bold text-ink-900">{ecole.nombreEleves}</p>
        </div>
        <div className="glass-card-static p-5">
          <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
            <Wallet size={16} strokeWidth={2} className="text-emerald-400" />
            Revenu total encaissé
          </div>
          <p className="text-2xl font-bold text-ink-900">{formatMontant(ecole.revenuTotal)}</p>
        </div>
      </div>

      <div className="glass-card-static overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-ink-900">Classes</h2>
        </div>
        {ecole.classes.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon"><Building2 size={24} strokeWidth={1.75} /></div>
            <p className="text-sm text-ink-400">Aucune classe créée pour l'instant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Mensualité</th>
                  <th>Élèves</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {ecole.classes.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-ink-900">{c.nom}</td>
                    <td className="text-ink-600">{formatMontant(c.montantMensualite)}</td>
                    <td className="text-ink-600">{c._count.inscriptions}</td>
                    <td>
                      <span className={`badge text-xs ${c.statut === "actif" ? "bg-emerald-500/10 text-emerald-400" : "bg-ink-100 text-ink-400"}`}>
                        {c.statut === "actif" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
