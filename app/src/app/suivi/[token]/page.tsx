"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function VerificationSuiviPage() {
  const router = useRouter();
  const [identifiantCourt, setIdentifiantCourt] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    try {
      const res = await fetch("/api/verification-suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiantCourt, dateNaissance }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || "Aucun dossier trouvé");
        return;
      }

      router.push(`/suivi/${data.token}`);
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="EduPay" className="h-10 w-auto object-contain" />
        </Link>

        <div className="glass-card-static p-8 animate-fade-in">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <KeyRound size={20} strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold text-ink-900 mb-1">Suivre mon dossier</h1>
          <p className="text-sm text-ink-400 mb-6">
            Entrez l&apos;identifiant reçu par l&apos;école ainsi que la date de naissance de l&apos;élève.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {erreur && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {erreur}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Identifiant de l&apos;élève
              </label>
              <input
                type="text"
                required
                className="glass-input uppercase"
                placeholder="Ex: KE-4821"
                value={identifiantCourt}
                onChange={(e) => setIdentifiantCourt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                Date de naissance de l&apos;élève
              </label>
              <input
                type="date"
                required
                className="glass-input"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <span className="spinner" /> : "Voir mon dossier"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
