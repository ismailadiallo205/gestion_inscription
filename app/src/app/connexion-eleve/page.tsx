"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IdCard, Cake, ArrowRight } from "lucide-react";

export default function ConnexionElevePage() {
  const router = useRouter();
  const [identifiantCourt, setIdentifiantCourt] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur("");
    setLoading(true);

    try {
      const res = await fetch("/api/eleves/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiantCourt, dateNaissance }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || "Connexion impossible");
        return;
      }

      router.push(`/suivi/${data.lienSuiviUnique}`);
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="EduPay" className="h-9 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-ink-900)" }}>
            Suivre mon dossier
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-ink-600)" }}>
            Avec l&apos;identifiant reçu par SMS et la date de naissance de l&apos;élève
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-static p-6">
          {erreur && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="identifiant"
                className="block text-sm font-medium mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-ink-600)" }}
              >
                <IdCard size={14} strokeWidth={2} /> Identifiant
              </label>
              <input
                id="identifiant"
                type="text"
                value={identifiantCourt}
                onChange={(e) => setIdentifiantCourt(e.target.value)}
                placeholder="Ex: EA-4821"
                className="glass-input"
                autoCapitalize="characters"
                required
              />
            </div>

            <div>
              <label
                htmlFor="date-naissance-connexion"
                className="block text-sm font-medium mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-ink-600)" }}
              >
                <Cake size={14} strokeWidth={2} /> Date de naissance de l&apos;élève
              </label>
              <input
                id="date-naissance-connexion"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="glass-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
            id="btn-connexion-eleve"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Accéder à mon suivi <ArrowRight size={16} strokeWidth={2} />
              </span>
            )}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "var(--color-ink-400)" }}>
          Ces informations ont été envoyées par SMS à la confirmation de
          l&apos;inscription.
        </p>
      </div>
    </div>
  );
}
