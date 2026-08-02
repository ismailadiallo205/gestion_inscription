"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";

interface Ecole {
  id: string;
  nom: string;
  nomPublic: string | null;
  slug: string;
  ville: string | null;
  type: string;
  _count: { classes: number };
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [ville, setVille] = useState("");
  const [type, setType] = useState("");
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const rechercher = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (ville) params.set("ville", ville);
      if (type) params.set("type", type);

      const res = await fetch(`/api/ecoles?${params}`);
      const data = await res.json();
      setEcoles(data);
    } catch {
      console.error("Erreur recherche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="EduPay" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="btn-secondary btn-sm text-sm"
          >
            Connexion école
          </Link>
          <Link
            href="/inscription"
            className="btn-primary btn-sm text-sm"
          >
            Inscrire mon école
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Simplicité façon Wave
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Gérez vos inscriptions
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              sans prise de tête
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Créez une classe en 3 clics. Les parents paient directement sur
            votre compte Wave. Chaque famille suit ses paiements en un coup
            d&apos;œil — sans jamais appeler l&apos;école.
          </p>
        </div>

        {/* ── Barre de recherche ──────────────────── */}
        <div
          className="glass-card-static p-6 max-w-3xl mx-auto animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm text-slate-400 mb-4 text-left font-medium">
            🔍 Trouver une école ou un cours
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nom de l'école ou du cours..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rechercher()}
              className="glass-input flex-1"
              id="search-school"
            />
            <input
              type="text"
              placeholder="Ville"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rechercher()}
              className="glass-input sm:w-40"
              id="search-city"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="glass-select sm:w-44"
              id="search-type"
            >
              <option value="">Tous les types</option>
              <option value="presentiel">Présentiel</option>
              <option value="en_ligne">En ligne</option>
            </select>
            <button
              onClick={rechercher}
              disabled={loading}
              className="btn-primary whitespace-nowrap"
              id="btn-search"
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                "Rechercher"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Résultats ─────────────────────────────── */}
      {hasSearched && (
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          {ecoles.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">🏫</div>
              <p className="text-lg font-medium text-slate-300 mb-2">
                Aucune école trouvée
              </p>
              <p className="text-slate-500">
                Essayez un autre nom ou une autre ville
              </p>
            </div>
          ) : (
            <div className="grid gap-4 stagger-children">
              {ecoles.map((ecole) => (
                <Link
                  key={ecole.id}
                  href={`/ecole/${ecole.slug}`}
                  className="glass-card p-6 flex items-center justify-between group"
                  id={`ecole-${ecole.slug}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-2xl">
                      🏫
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg group-hover:text-amber-400 transition-colors">
                        {ecole.nomPublic || ecole.nom}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {ecole.ville && (
                          <span className="text-sm text-slate-400">
                            📍 {ecole.ville}
                          </span>
                        )}
                        <span className="text-sm text-slate-500">
                          {ecole.type === "en_ligne"
                            ? "🌐 En ligne"
                            : "🏛 Présentiel"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-blue-500/10 text-blue-400">
                      {ecole._count.classes} classe
                      {ecole._count.classes > 1 ? "s" : ""}
                    </span>
                    <div className="mt-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir les classes →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Features ──────────────────────────────── */}
      {!hasSearched && (
        <section className="px-6 pb-24 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            <div className="glass-card-static p-8 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                3 champs suffisent
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nom de la classe, mensualité, nombre de mois. Le reste est
                pré-rempli intelligemment.
              </p>
            </div>
            <div className="glass-card-static p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Paiement direct Wave
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                L&apos;argent va directement sur le compte de l&apos;école.
                Confirmation automatique par webhook.
              </p>
            </div>
            <div className="glass-card-static p-8 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Suivi SMS simple
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Un lien par SMS, pas de compte à créer. Le parent voit tout :
                payé, à venir, en retard.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <img src="/logo.png" alt="EduPay" className="h-5 w-auto object-contain grayscale opacity-50" />
            © {new Date().getFullYear()}
          </div>
          <div className="text-sm text-slate-600">
            Simplifier les paiements scolaires en Afrique
          </div>
        </div>
      </footer>
    </div>
  );
}
