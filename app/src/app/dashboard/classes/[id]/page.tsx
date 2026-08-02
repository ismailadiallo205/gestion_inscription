"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMontant, formatDate, labelStatut, couleurStatut } from "@/lib/utils";

interface ClasseDetail {
  id: string;
  nom: string;
  niveauStandard: string | null;
  montantMensualite: number;
  nbMois: number;
  fraisInscription: number;
  slugInscription: string;
  jourEcheanceMensuel: number;
  statut: string;
  ecole: { slug: string; nom: string };
  inscriptions: Array<{
    id: string;
    nomEleve: string;
    nomParent: string;
    telephoneParent: string;
    identifiantCourt: string | null;
    statut: string;
    dateInscription: string;
    echeances: Array<{
      id: string;
      type: string;
      numeroMois: number | null;
      montant: number;
      dateLimite: string;
      statut: string;
    }>;
  }>;
}

export default function ClasseDetailPage() {
  const params = useParams();
  const [classe, setClasse] = useState<ClasseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/classes/${params.id}`)
      .then((res) => res.json())
      .then(setClasse)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const copyLink = () => {
    if (!classe) return;
    const url = `${window.location.origin}/ecole/${classe.ecole.slug}/${classe.slugInscription}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (inscriptionId: string, action: string) => {
    try {
      await fetch(`/api/inscriptions/${inscriptionId}/confirmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Recharger
      const res = await fetch(`/api/classes/${params.id}`);
      const data = await res.json();
      setClasse(data);
    } catch (error) {
      console.error("Erreur action:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="empty-state">
        <p className="text-lg text-slate-300">Classe non trouvée</p>
      </div>
    );
  }

  const confirmes = classe.inscriptions.filter((i) => i.statut === "confirme");
  const enAttente = classe.inscriptions.filter(
    (i) => i.statut === "en_attente_confirmation"
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/classes"
          className="text-sm text-slate-400 hover:text-amber-400 transition-colors mb-4 inline-block"
        >
          ← Retour aux classes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{classe.nom}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {formatMontant(classe.montantMensualite)}/mois × {classe.nbMois}{" "}
              mois
              {classe.fraisInscription > 0 &&
                ` + ${formatMontant(classe.fraisInscription)} inscription`}
            </p>
          </div>
          <button
            onClick={copyLink}
            className={`btn-secondary btn-sm ${
              copied ? "border-emerald-500/30 text-emerald-400" : ""
            }`}
            id="btn-copy-link"
          >
            {copied ? "✓ Copié !" : "📋 Copier le lien d'inscription"}
          </button>
        </div>
      </div>

      {/* Lien d'inscription */}
      <div className="glass-card-static p-4 mb-6 flex items-center gap-3">
        <span className="text-sm text-slate-400 shrink-0">Lien direct :</span>
        <code className="text-sm text-amber-400 bg-navy-800/50 px-3 py-1.5 rounded-lg flex-1 overflow-x-auto">
          {typeof window !== "undefined"
            ? `${window.location.origin}/ecole/${classe.ecole.slug}/${classe.slugInscription}`
            : `/ecole/${classe.ecole.slug}/${classe.slugInscription}`}
        </code>
      </div>

      {/* Dossiers en attente */}
      {enAttente.length > 0 && (
        <div className="glass-card-static p-6 mb-6 border-amber-500/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            📋 Dossiers en attente
            <span className="badge bg-amber-500/10 text-amber-400">
              {enAttente.length}
            </span>
          </h2>
          <div className="space-y-3">
            {enAttente.map((insc) => (
              <div
                key={insc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-navy-800/50 border border-white/5"
              >
                <div>
                  <p className="font-medium text-white">{insc.nomEleve}</p>
                  <p className="text-sm text-slate-400">
                    {insc.nomParent} · {insc.telephoneParent}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(insc.dateInscription)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(insc.id, "confirmer")}
                    className="btn-success btn-sm"
                  >
                    ✓ Confirmer
                  </button>
                  <button
                    onClick={() => handleAction(insc.id, "refuser")}
                    className="btn-danger btn-sm"
                  >
                    ✕ Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des élèves confirmés */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            Élèves inscrits ({confirmes.length})
          </h2>
        </div>

        {confirmes.length === 0 ? (
          <div className="empty-state py-12">
            <div className="text-3xl mb-2">👩‍🎓</div>
            <p className="text-sm text-slate-400">
              Aucun élève confirmé pour cette classe
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Élève</th>
                  <th>Parent</th>
                  <th>Téléphone</th>
                  <th>Paiements</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {confirmes.map((insc) => {
                  const payes = insc.echeances.filter(
                    (e) => e.statut === "paye"
                  ).length;
                  const total = insc.echeances.length;
                  const enRetard = insc.echeances.some(
                    (e) => e.statut === "en_retard"
                  );

                  return (
                    <tr key={insc.id}>
                      <td>
                        <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded-lg">
                          {insc.identifiantCourt || "—"}
                        </span>
                      </td>
                      <td className="font-medium text-white">
                        {insc.nomEleve}
                      </td>
                      <td className="text-slate-300">{insc.nomParent}</td>
                      <td className="text-slate-400 font-mono text-sm">
                        {insc.telephoneParent}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-navy-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{
                                width: `${
                                  total > 0 ? (payes / total) * 100 : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {payes}/{total}
                          </span>
                        </div>
                      </td>
                      <td>
                        {enRetard ? (
                          <span className="badge bg-red-500/10 text-red-400">
                            <span className="badge-dot bg-red-400" />
                            En retard
                          </span>
                        ) : payes === total ? (
                          <span className="badge bg-emerald-500/10 text-emerald-400">
                            <span className="badge-dot bg-emerald-400" />
                            À jour
                          </span>
                        ) : (
                          <span className="badge bg-blue-500/10 text-blue-400">
                            <span className="badge-dot bg-blue-400" />
                            En cours
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
