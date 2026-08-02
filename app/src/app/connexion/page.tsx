"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
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
        router.push("/dashboard");
      }
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
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 font-bold text-xl shadow-lg shadow-amber-500/20">
              S
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Skoo<span className="text-amber-400">Pay</span>
            </span>
          </Link>
          <p className="text-slate-400 mt-4 text-sm">
            Connectez-vous à votre espace école
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="glass-card-static p-8">
          <h1 className="text-xl font-bold text-white mb-6">Connexion</h1>

          {erreur && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="directeur@ecole.sn"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
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
            className="btn-primary w-full mt-6"
            id="btn-login"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              "Se connecter"
            )}
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Inscrire mon école
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
