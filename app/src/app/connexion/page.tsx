"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
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
        setErreur(
          result.error === "COMPTE_SUSPENDU"
            ? "Ce compte a été suspendu. Contactez le support."
            : "Email ou mot de passe incorrect"
        );
        return;
      }

      // Le compte peut être une école ou un super-admin — on redirige
      // vers le bon tableau de bord selon le rôle renvoyé par la session.
      const session = await getSession();
      const role = (session?.user as any)?.role;

      router.push(role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="EduPay" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-sm" style={{ color: "var(--color-ink-600)" }}>
            Connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-static p-8">
          <h1 className="text-xl font-bold mb-6" style={{ color: "var(--color-ink-900)" }}>
            Connexion
          </h1>

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
                placeholder="vous@ecole.sn"
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
            className="btn-primary w-full mt-6"
          >
            {loading ? <span className="spinner" /> : "Se connecter"}
          </button>

          <p className="text-center text-sm text-ink-400 mt-6">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-blue-600 hover:underline font-medium">
              Inscrire mon école
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
