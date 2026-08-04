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
            <img src="/logo.png" alt="KlyroEdu" className="h-12 w-auto object-contain" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink-900)" }}>
              Klyro<span style={{ color: "var(--color-blue-500)" }}>Edu</span>
            </span>
          </Link>
          <p className="mt-4 text-sm" style={{ color: "var(--color-ink-600)" }}>
            Créez votre espace école en quelques secondes
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="glass-card-static p-8">
          <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-ink-900)" }}>
            Inscrire mon école
          </h1>

          {erreur && (
            <div className="mb-4 p-3 rounded-xl border text-sm" style={{ background: "var(--color-retard-bg)", borderColor: "rgba(194, 43, 58, 0.2)", color: "var(--color-retard)" }}>
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-ink-600)" }}
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
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-ink-600)" }}
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
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-ink-600)" }}
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
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-ink-600)" }}
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
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-ink-600)" }}
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

          <p className="text-center text-sm mt-6" style={{ color: "var(--color-ink-400)" }}>
            Déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="font-medium transition-colors hover:underline"
              style={{ color: "var(--color-blue-500)" }}
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
