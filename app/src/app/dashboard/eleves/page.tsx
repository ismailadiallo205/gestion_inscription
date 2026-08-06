"use client";

import { useEffect, useState } from "react";
import { formatMontant, couleurStatut, labelStatut } from "@/lib/utils";
import { X, GraduationCap, Trash2 } from "lucide-react";

interface Eleve {
  id: string;
  nomEleve: string;
  nomParent: string;
  telephoneParent: string;
  genre: string | null;
  identifiantCourt: string | null;
  statut: string;
  classe: { nom: string };
  echeances: Array<{ statut: string; montant: number }>;
}

interface Classe {
  id: string;
  nom: string;
}


export default function ElevesPage() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("tous");
  const [filtreGenre, setFiltreGenre] = useState("tous");

  // Modal d'ajout d'élève
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classeId: "",
    nomEleve: "",
    nomParent: "",
    telephoneParent: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, nomEleve: string) => {
    if (!confirm(`Supprimer définitivement ${nomEleve} ? Cette action est irréversible et supprimera aussi son historique de paiement.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/eleves/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      fetchEleves();
    } catch (err) {
      alert("Impossible de supprimer cet élève. Réessayez.");
    } finally {
      setDeletingId(null);
    }
  };


  const fetchEleves = () => {
    setLoading(true);
    fetch("/api/eleves")
      .then((res) => res.json())
      .then(setEleves)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEleves();
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/eleves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'ajout");

      setIsModalOpen(false);
      setFormData({ classeId: "", nomEleve: "", nomParent: "", telephoneParent: "" });
      fetchEleves();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  const filtres = eleves.filter((e) => {
    if (filtreGenre !== "tous" && e.genre !== filtreGenre) return false;
    if (filtre === "tous") return true;
    if (filtre === "confirme") return e.statut === "confirme";
    if (filtre === "en_attente")
      return e.statut === "en_attente_confirmation";
    if (filtre === "en_retard")
      return e.echeances.some((ech) => ech.statut === "en_retard");
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Tous les élèves</h1>
          <p className="text-ink-400 text-sm mt-1">
            {eleves.length} élève{eleves.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Ajouter un élève
        </button>
      </div>

      {/* Modal Ajout Élève */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">Nouvel Élève</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-ink-900 transition-colors"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Classe</label>
                <select
                  required
                  className="glass-select"
                  value={formData.classeId}
                  onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Nom de l'élève</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Ex: Amadou Diallo"
                  value={formData.nomEleve}
                  onChange={(e) => setFormData({ ...formData, nomEleve: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Nom du parent</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Ex: Ousmane Diallo"
                  value={formData.nomParent}
                  onChange={(e) => setFormData({ ...formData, nomParent: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Téléphone du parent (Wave)</label>
                <input
                  type="tel"
                  required
                  className="glass-input"
                  placeholder="Ex: +221771234567"
                  value={formData.telephoneParent}
                  onChange={(e) => setFormData({ ...formData, telephoneParent: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-ink-600 hover:bg-surface-soft border border-transparent hover:border-border transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="spinner border-border border-t-white" style={{ width: 16, height: 16 }} />
                      Ajout...
                    </>
                  ) : (
                    "Ajouter et confirmer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {[
          { key: "tous", label: "Tous" },
          { key: "confirme", label: "Confirmés" },
          { key: "en_attente", label: "En attente" },
          { key: "en_retard", label: "En retard" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtre === f.key
                ? "bg-blue-100 text-blue-600 border border-blue-500/30"
                : "bg-surface-soft/50 text-ink-400 border border-border hover:border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={filtreGenre}
          onChange={(e) => setFiltreGenre(e.target.value)}
          className="glass-select ml-auto"
          style={{ width: "auto", minWidth: "140px" }}
        >
          <option value="tous">Tous les genres</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="glass-card-static overflow-hidden">
        {filtres.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon"><GraduationCap size={24} strokeWidth={1.75} /></div>
            <p className="text-sm text-ink-400">
              Aucun élève avec ce filtre
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Élève</th>
                  <th>Genre</th>
                  <th>Parent</th>
                  <th>Téléphone</th>
                  <th>Classe</th>
                  <th>Paiements</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((eleve) => {
                  const payes = eleve.echeances.filter(
                    (e) => e.statut === "paye"
                  ).length;
                  const total = eleve.echeances.length;
                  const enRetard = eleve.echeances.some(
                    (e) => e.statut === "en_retard"
                  );

                  return (
                    <tr key={eleve.id}>
                      <td>
                        <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded-lg">
                          {eleve.identifiantCourt || "—"}
                        </span>
                      </td>
                      <td className="font-medium text-ink-900">
                        {eleve.nomEleve}
                      </td>
                      <td className="text-ink-400 text-sm">
                        {eleve.genre === "M" ? "Masculin" : eleve.genre === "F" ? "Féminin" : "—"}
                      </td>
                      <td className="text-ink-600">{eleve.nomParent}</td>
                      <td className="text-ink-400 font-mono text-sm">
                        {eleve.telephoneParent}
                      </td>
                      <td>
                        <span className="badge bg-blue-500/10 text-blue-400 text-xs">
                          {eleve.classe.nom}
                        </span>
                      </td>
                      <td>
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-surface-soft overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                style={{
                                  width: `${(payes / total) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-ink-400">
                              {payes}/{total}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </td>
                      <td>
                        {eleve.statut === "en_attente_confirmation" ? (
                          <span className="badge bg-blue-100 text-blue-600">
                            <span className="badge-dot bg-blue-500" />
                            En attente
                          </span>
                        ) : enRetard ? (
                          <span className="badge bg-red-500/10 text-red-400">
                            <span className="badge-dot bg-red-400" />
                            En retard
                          </span>
                        ) : payes === total && total > 0 ? (
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
                      <td>
                        <button
                          onClick={() => handleDelete(eleve.id, eleve.nomEleve)}
                          disabled={deletingId === eleve.id}
                          className="text-ink-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                          title="Supprimer cet élève"
                          id={`btn-delete-${eleve.id}`}
                        >
                          {deletingId === eleve.id ? (
                            <span className="spinner-dark" style={{ width: 14, height: 14 }} />
                          ) : (
                            <Trash2 size={16} strokeWidth={2} />
                          )}
                        </button>
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
