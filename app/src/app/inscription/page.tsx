"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InscriptionEcolePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    ville: "",
    type: "presentiel",
  });
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    try {
      const res = await fetch("/api/ecoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Rediriger vers la connexion
      router.push("/connexion?inscrit=1");
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 font-bold text-xl shadow-lg shadow-amber-500/20">
              S
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Skoo<span className="text-amber-400">Pay</span>
            </span>
          </Link>
          <p className="text-slate-400 mt-4 text-sm">
            Créez votre espace école en quelques secondes
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="glass-card-static p-8">
          <h1 className="text-xl font-bold text-white mb-6">
            Inscrire mon école
          </h1>

          {erreur && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Nom de l&apos;école *
              </label>
              <input
                id="nom"
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="École Amina"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email-register"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email *
              </label>
              <input
                id="email-register"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="directeur@ecole.sn"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password-register"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Mot de passe *
              </label>
              <input
                id="password-register"
                type="password"
                value={form.motDePasse}
                onChange={(e) =>
                  setForm({ ...form, motDePasse: e.target.value })
                }
                placeholder="Minimum 8 caractères"
                className="glass-input"
                required
                minLength={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="ville"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Ville
                </label>
                <input
                  id="ville"
                  type="text"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                  placeholder="Dakar"
                  className="glass-input"
                />
              </div>
              <div>
                <label
                  htmlFor="type-ecole"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Type
                </label>
                <select
                  id="type-ecole"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="glass-select"
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="en_ligne">En ligne</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
            id="btn-register"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              "Créer mon espace"
            )}
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
