"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMontant, formatDate, labelStatut, couleurStatut } from "@/lib/utils";
import { ArrowLeft, Check, Copy, ClipboardList, X, GraduationCap, FileCheck, Trash2, Plus } from "lucide-react";

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
  documentsRequis: Array<{ id: string; nom: string; obligatoire: boolean }>;
  inscriptions: Array<{
    id: string;
    nomEleve: string;
    nomParent: string;
    telephoneParent: string;
    identifiantCourt: string | null;
    statut: string;
    dateInscription: string;
    documentsSoumis: Array<{
      id: string;
      fileUrl: string;
      documentRequis: { nom: string };
    }>;
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
  const [nouveauDoc, setNouveauDoc] = useState("");
  const [ajoutDocEnCours, setAjoutDocEnCours] = useState(false);

  const reloadClasse = () => {
    fetch(`/api/classes/${params.id}`)
      .then((res) => res.json())
      .then(setClasse)
      .catch(console.error);
  };

  const ajouterDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauDoc.trim()) return;
    setAjoutDocEnCours(true);
    try {
      await fetch(`/api/classes/${params.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nouveauDoc.trim(), obligatoire: true }),
      });
      setNouveauDoc("");
      reloadClasse();
    } finally {
      setAjoutDocEnCours(false);
    }
  };

  const supprimerDocument = async (docId: string) => {
    await fetch(`/api/classes/${params.id}/documents/${docId}`, { method: "DELETE" });
    reloadClasse();
  };

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
        <p className="text-lg text-ink-600">Classe non trouvée</p>
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
          className="text-sm text-ink-400 hover:text-blue-600 transition-colors mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} strokeWidth={2} /> Retour aux classes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">{classe.nom}</h1>
            <p className="text-ink-400 text-sm mt-1">
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
            {copied ? (
              <span className="inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> Copié !</span>
            ) : (
              <span className="inline-flex items-center gap-1.5"><Copy size={14} strokeWidth={2} /> Copier le lien d'inscription</span>
            )}
          </button>
        </div>
      </div>

      {/* Lien d'inscription */}
      <div className="glass-card-static p-4 mb-6 flex items-center gap-3">
        <span className="text-sm text-ink-400 shrink-0">Lien direct :</span>
        <code className="text-sm text-blue-600 bg-surface-soft/50 px-3 py-1.5 rounded-lg flex-1 overflow-x-auto">
          {typeof window !== "undefined"
            ? `${window.location.origin}/ecole/${classe.ecole.slug}/${classe.slugInscription}`
            : `/ecole/${classe.ecole.slug}/${classe.slugInscription}`}
        </code>
      </div>

      {/* Documents requis à l'inscription */}
      <div className="glass-card-static p-6 mb-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-1 flex items-center gap-2">
          <FileCheck size={18} strokeWidth={2} /> Documents requis à l'inscription
        </h2>
        <p className="text-sm text-ink-400 mb-4">
          Les parents devront fournir ces documents (PNG, JPEG ou PDF) en remplissant le formulaire.
        </p>

        {classe.documentsRequis.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {classe.documentsRequis.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-2 bg-surface-soft border border-border px-3 py-1.5 rounded-lg text-sm text-ink-600"
              >
                {doc.nom}
                <button
                  onClick={() => supprimerDocument(doc.id)}
                  className="text-ink-400 hover:text-red-500 transition-colors"
                  title="Retirer ce document"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={ajouterDocument} className="flex gap-2">
          <input
            type="text"
            className="glass-input flex-1"
            placeholder="Ex: Extrait de naissance, Bulletin précédent..."
            value={nouveauDoc}
            onChange={(e) => setNouveauDoc(e.target.value)}
          />
          <button
            type="submit"
            disabled={ajoutDocEnCours || !nouveauDoc.trim()}
            className="btn-secondary btn-sm inline-flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Plus size={14} strokeWidth={2} /> Ajouter
          </button>
        </form>
      </div>

      {/* Dossiers en attente */}
      {enAttente.length > 0 && (
        <div className="glass-card-static p-6 mb-6 border-blue-500/20">
          <h2 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} strokeWidth={2} /> Dossiers en attente
            <span className="badge bg-blue-100 text-blue-600">
              {enAttente.length}
            </span>
          </h2>
          <div className="space-y-3">
            {enAttente.map((insc) => (
              <div
                key={insc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-soft/50 border border-border"
              >
                <div>
                  <p className="font-medium text-ink-900">{insc.nomEleve}</p>
                  <p className="text-sm text-ink-400">
                    {insc.nomParent} · {insc.telephoneParent}
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    {formatDate(insc.dateInscription)}
                  </p>
                  {insc.documentsSoumis.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {insc.documentsSoumis.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg"
                        >
                          <FileCheck size={12} strokeWidth={2} />
                          {doc.documentRequis.nom}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(insc.id, "confirmer")}
                    className="btn-success btn-sm inline-flex items-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={2} /> Confirmer
                  </button>
                  <button
                    onClick={() => handleAction(insc.id, "refuser")}
                    className="btn-danger btn-sm inline-flex items-center gap-1.5"
                  >
                    <X size={14} strokeWidth={2} /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des élèves confirmés */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-ink-900">
            Élèves inscrits ({confirmes.length})
          </h2>
        </div>

        {confirmes.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon"><GraduationCap size={24} strokeWidth={1.75} /></div>
            <p className="text-sm text-ink-400">
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
                        <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded-lg">
                          {insc.identifiantCourt || "—"}
                        </span>
                      </td>
                      <td className="font-medium text-ink-900">
                        {insc.nomEleve}
                      </td>
                      <td className="text-ink-600">{insc.nomParent}</td>
                      <td className="text-ink-400 font-mono text-sm">
                        {insc.telephoneParent}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-surface-soft overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{
                                width: `${
                                  total > 0 ? (payes / total) * 100 : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-ink-400">
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
