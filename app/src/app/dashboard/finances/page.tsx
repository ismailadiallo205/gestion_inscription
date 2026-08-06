"use client";

import { useEffect, useState } from "react";
import { formatMontant } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Plus, X, Trash2, Pause, Play } from "lucide-react";

interface Depense {
  id: string;
  libelle: string;
  categorie: string;
  montant: number;
  recurrence: string;
  mois: number | null;
  annee: number | null;
  active: boolean;
}

interface Bilan {
  mois: number;
  annee: number;
  revenus: number;
  nombrePaiements: number;
  totalDepenses: number;
  beneficeNet: number;
  depenses: Depense[];
}

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const CATEGORIES = [
  { value: "salaires", label: "Salaires enseignants" },
  { value: "loyer", label: "Loyer" },
  { value: "fournitures", label: "Fournitures" },
  { value: "electricite", label: "Électricité / Eau" },
  { value: "transport", label: "Transport" },
  { value: "autre", label: "Autre" },
];

export default function FinancesPage() {
  const maintenant = new Date();
  const [mois, setMois] = useState(maintenant.getMonth() + 1);
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [bilan, setBilan] = useState<Bilan | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    libelle: "",
    categorie: "salaires",
    montant: "",
    recurrence: "mensuelle",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchBilan = () => {
    setLoading(true);
    fetch(`/api/finances?mois=${mois}&annee=${annee}`)
      .then((res) => res.json())
      .then(setBilan)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBilan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mois, annee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/depenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          montant: parseInt(formData.montant),
          mois: formData.recurrence === "ponctuelle" ? mois : undefined,
          annee: formData.recurrence === "ponctuelle" ? annee : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'ajout");

      setIsModalOpen(false);
      setFormData({ libelle: "", categorie: "salaires", montant: "", recurrence: "mensuelle" });
      fetchBilan();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (depense: Depense) => {
    await fetch(`/api/depenses/${depense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !depense.active }),
    });
    fetchBilan();
  };

  const handleDelete = async (id: string, libelle: string) => {
    if (!confirm(`Supprimer la dépense "${libelle}" ?`)) return;
    await fetch(`/api/depenses/${id}`, { method: "DELETE" });
    fetchBilan();
  };

  const annees = [maintenant.getFullYear() - 1, maintenant.getFullYear(), maintenant.getFullYear() + 1];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Finances</h1>
          <p className="text-ink-400 text-sm mt-1">Revenus, dépenses et bénéfice net par mois</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mois}
            onChange={(e) => setMois(parseInt(e.target.value))}
            className="glass-select"
            style={{ width: "auto" }}
          >
            {MOIS_LABELS.map((label, idx) => (
              <option key={idx} value={idx + 1}>{label}</option>
            ))}
          </select>
          <select
            value={annee}
            onChange={(e) => setAnnee(parseInt(e.target.value))}
            className="glass-select"
            style={{ width: "auto" }}
          >
            {annees.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} strokeWidth={2} />
            Dépense
          </button>
        </div>
      </div>

      {loading || !bilan ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <>
          {/* Cartes résumé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card-static p-5">
              <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
                <TrendingUp size={16} strokeWidth={2} className="text-emerald-400" />
                Revenus encaissés
              </div>
              <p className="text-2xl font-bold text-ink-900">{formatMontant(bilan.revenus)}</p>
              <p className="text-xs text-ink-400 mt-1">{bilan.nombrePaiements} paiement{bilan.nombrePaiements > 1 ? "s" : ""}</p>
            </div>
            <div className="glass-card-static p-5">
              <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
                <TrendingDown size={16} strokeWidth={2} className="text-red-400" />
                Dépenses
              </div>
              <p className="text-2xl font-bold text-ink-900">{formatMontant(bilan.totalDepenses)}</p>
              <p className="text-xs text-ink-400 mt-1">{bilan.depenses.length} poste{bilan.depenses.length > 1 ? "s" : ""}</p>
            </div>
            <div className="glass-card-static p-5">
              <div className="flex items-center gap-2 text-ink-400 text-sm mb-2">
                <Wallet size={16} strokeWidth={2} className={bilan.beneficeNet >= 0 ? "text-emerald-400" : "text-red-400"} />
                Bénéfice net
              </div>
              <p className={`text-2xl font-bold ${bilan.beneficeNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatMontant(bilan.beneficeNet)}
              </p>
              <p className="text-xs text-ink-400 mt-1">{MOIS_LABELS[bilan.mois - 1]} {bilan.annee}</p>
            </div>
          </div>

          {/* Liste des dépenses */}
          <div className="glass-card-static overflow-hidden">
            {bilan.depenses.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon"><Wallet size={24} strokeWidth={1.75} /></div>
                <p className="text-sm text-ink-400">Aucune dépense enregistrée pour ce mois</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Libellé</th>
                      <th>Catégorie</th>
                      <th>Montant</th>
                      <th>Type</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bilan.depenses.map((d) => (
                      <tr key={d.id} className={!d.active ? "opacity-50" : ""}>
                        <td className="font-medium text-ink-900">{d.libelle}</td>
                        <td className="text-ink-400 text-sm">
                          {CATEGORIES.find((c) => c.value === d.categorie)?.label || d.categorie}
                        </td>
                        <td className="text-ink-600">{formatMontant(d.montant)}</td>
                        <td>
                          <span className="badge bg-blue-500/10 text-blue-400 text-xs">
                            {d.recurrence === "mensuelle" ? "Mensuelle" : "Ponctuelle"}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {d.recurrence === "mensuelle" && (
                              <button
                                onClick={() => toggleActive(d)}
                                className="text-ink-400 hover:text-ink-900 transition-colors p-1.5 rounded-lg hover:bg-surface-soft"
                                title={d.active ? "Mettre en pause" : "Réactiver"}
                              >
                                {d.active ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(d.id, d.libelle)}
                              className="text-ink-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                              title="Supprimer"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal ajout dépense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">Nouvelle dépense</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-400 hover:text-ink-900 transition-colors">
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
                <label className="block text-sm font-medium text-ink-600 mb-2">Libellé</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Ex: Salaire M. Ndiaye"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Catégorie</label>
                <select
                  className="glass-select"
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Montant (FCFA)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="glass-input"
                  placeholder="Ex: 150000"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Type</label>
                <select
                  className="glass-select"
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                >
                  <option value="mensuelle">Mensuelle (récurrente, comptée chaque mois)</option>
                  <option value="ponctuelle">Ponctuelle (uniquement {MOIS_LABELS[mois - 1]} {annee})</option>
                </select>
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
                    "Ajouter"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
