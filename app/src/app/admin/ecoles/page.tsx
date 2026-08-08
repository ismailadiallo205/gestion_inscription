"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type Ecole = {
  id: string;
  nom: string;
  email: string;
  type: string;
  waveActivationStatut: string;
  actif: boolean;
  createdAt: string;
  _count: {
    classes: number;
  };
};

export default function AdminEcolesPage() {
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal d'ajout d'école
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    type: "presentiel",
    ville: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchEcoles = () => {
    setLoading(true);
    fetch("/api/admin/ecoles")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setEcoles(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEcoles();
  }, []);

  const toggleActif = async (ecole: Ecole, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const action = ecole.actif ? "suspendre" : "réactiver";
    if (!confirm(`Voulez-vous vraiment ${action} "${ecole.nom}" ?`)) return;
    const res = await fetch(`/api/admin/ecoles/${ecole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !ecole.actif }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || `Échec de l'action "${action}" (${res.status})`);
      return;
    }
    fetchEcoles();
  };

  const supprimerEcole = async (ecole: Ecole, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        `Supprimer définitivement "${ecole.nom}" ? Cette action est irréversible.`
      )
    )
      return;

    const res = await fetch(`/api/admin/ecoles/${ecole.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Suppression impossible");
      return;
    }

    fetchEcoles();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ecoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'ajout");

      setIsModalOpen(false);
      setFormData({ nom: "", email: "", motDePasse: "", type: "presentiel", ville: "" });
      fetchEcoles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Écoles Inscrites</h1>
          <p className="text-ink-400 text-sm mt-1">
            Gérez toutes les écoles utilisant SkooPay
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Ajouter une école
        </button>
      </div>

      {/* Modal Ajout École */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">Nouvelle École</h2>
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
                <label className="block text-sm font-medium text-ink-600 mb-2">Nom de l'école</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Ex: École de l'Excellence"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Email (Contact)</label>
                <input
                  type="email"
                  required
                  className="glass-input"
                  placeholder="Ex: contact@ecole.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Mot de passe provisoire</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="Mot de passe à communiquer à l'école"
                  value={formData.motDePasse}
                  onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Type</label>
                  <select
                    className="glass-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="en_ligne">En Ligne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Ville</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Ex: Dakar"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  />
                </div>
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
                      Création...
                    </>
                  ) : (
                    "Créer l'école"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink-600">
            <thead className="text-xs uppercase bg-surface-soft text-ink-400 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Nom de l'école</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Classes</th>
                <th className="px-6 py-4 font-medium">Intégration Wave</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Date d'inscription</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-ink-400">
                    <div className="flex justify-center mb-2">
                      <div className="spinner border-red-500 border-t-red-200" style={{ width: 24, height: 24 }} />
                    </div>
                    Chargement...
                  </td>
                </tr>
              ) : ecoles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-ink-400">
                    Aucune école inscrite.
                  </td>
                </tr>
              ) : (
                ecoles.map((ecole) => (
                  <tr
                    key={ecole.id}
                    className={`border-b border-border hover:bg-surface-soft transition-colors ${!ecole.actif ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <Link href={`/admin/ecoles/${ecole.id}`} className="font-medium text-ink-900 hover:text-blue-600 transition-colors">
                        {ecole.nom}
                      </Link>
                      <div className="text-xs text-ink-400 capitalize">{ecole.type.replace("_", " ")}</div>
                    </td>
                    <td className="px-6 py-4">{ecole.email}</td>
                    <td className="px-6 py-4">{ecole._count.classes}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          ecole.waveActivationStatut === "actif"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-100 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {ecole.waveActivationStatut === "actif" ? "Actif" : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          ecole.actif
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {ecole.actif ? "Active" : "Suspendue"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-400">
                      {new Date(ecole.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleActif(ecole, e)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            ecole.actif
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {ecole.actif ? "Suspendre" : "Réactiver"}
                        </button>
                        <button
                          onClick={(e) => supprimerEcole(ecole, e)}
                          disabled={ecole._count.classes > 0}
                          title={
                            ecole._count.classes > 0
                              ? "Impossible : cette école a encore des classes"
                              : "Supprimer définitivement"
                          }
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-ink-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-400"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
