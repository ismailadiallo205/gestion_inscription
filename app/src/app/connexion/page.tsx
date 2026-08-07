"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        motDePasse,
        redirect: false,
      });

      if (result?.error) {
        setErreur("Email ou mot de passe incorrect");
      } else {
        router.push("/admin");
      }
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <ShieldAlert size={22} strokeWidth={2} />
            </div>
            <span className="text-2xl font-bold text-ink-900 tracking-tight">
              Skoo<span className="text-red-500">Pay</span> Admin
            </span>
          </Link>
          <p className="text-ink-400 mt-4 text-sm">
            Accès réservé à l&apos;administration de la plateforme
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-static p-8 border-red-500/20">
          <h1 className="text-xl font-bold text-ink-900 mb-6">Connexion super-admin</h1>

          {erreur && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-600 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skoopay.sn"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-600 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl font-medium py-2.5 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <span className="spinner border-red-300 border-t-white" /> : "Se connecter"}
          </button>

          <p className="text-center text-sm text-ink-400 mt-6">
            Vous êtes une école ?{" "}
            <Link href="/connexion" className="text-blue-600 hover:underline font-medium">
              Connexion école
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
