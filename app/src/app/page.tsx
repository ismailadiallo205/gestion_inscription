"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Globe2, Landmark, Zap, Wallet, MessageSquare, ArrowRight, Building2 } from "lucide-react";
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
          <Link href="/connexion" className="btn-secondary btn-sm text-sm">
            Connexion école
          </Link>
          <Link href="/inscription" className="btn-primary btn-sm text-sm">
            Inscrire mon école
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-500/20 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Simplicité façon Wave
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-ink-900 leading-tight tracking-tight mb-6" style={{ color: "var(--color-ink-900)" }}>
            Gérez vos inscriptions
            <br />
            <span style={{ color: "var(--color-blue-500)" }}>
              sans prise de tête
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "var(--color-ink-600)" }}>
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
          <p className="text-sm mb-4 text-left font-medium flex items-center gap-2" style={{ color: "var(--color-ink-600)" }}>
            <Search size={16} strokeWidth={2} />
            Trouver une école ou un cours
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
              {loading ? <span className="spinner" /> : "Rechercher"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Résultats ─────────────────────────────── */}
      {hasSearched && (
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          {ecoles.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="empty-state-icon">
                <Building2 size={24} strokeWidth={1.75} />
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: "var(--color-ink-900)" }}>
                Aucune école trouvée
              </p>
              <p style={{ color: "var(--color-ink-400)" }}>
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-blue-100)", color: "var(--color-blue-600)" }}>
                      <Building2 size={22} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg transition-colors" style={{ color: "var(--color-ink-900)" }}>
                        {ecole.nomPublic || ecole.nom}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {ecole.ville && (
                          <span className="text-sm flex items-center gap-1" style={{ color: "var(--color-ink-600)" }}>
                            <MapPin size={13} strokeWidth={2} />
                            {ecole.ville}
                          </span>
                        )}
                        <span className="text-sm flex items-center gap-1" style={{ color: "var(--color-ink-400)" }}>
                          {ecole.type === "en_ligne" ? (
                            <>
                              <Globe2 size={13} strokeWidth={2} /> En ligne
                            </>
                          ) : (
                            <>
                              <Landmark size={13} strokeWidth={2} /> Présentiel
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge" style={{ background: "var(--color-blue-100)", color: "var(--color-blue-700)" }}>
                      {ecole._count.classes} classe
                      {ecole._count.classes > 1 ? "s" : ""}
                    </span>
                    <div
                      className="mt-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1"
                      style={{ color: "var(--color-blue-600)" }}
                    >
                      Voir les classes <ArrowRight size={14} strokeWidth={2} />
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
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-blue-100)", color: "var(--color-blue-600)" }}>
                <Zap size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-ink-900)" }}>
                3 champs suffisent
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-600)" }}>
                Nom de la classe, mensualité, nombre de mois. Le reste est
                pré-rempli intelligemment.
              </p>
            </div>
            <div className="glass-card-static p-8 text-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-paye-bg)", color: "var(--color-paye)" }}>
                <Wallet size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-ink-900)" }}>
                Paiement direct Wave
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-600)" }}>
                L&apos;argent va directement sur le compte de l&apos;école.
                Confirmation automatique par webhook.
              </p>
            </div>
            <div className="glass-card-static p-8 text-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-du-bg)", color: "var(--color-du)" }}>
                <MessageSquare size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-ink-900)" }}>
                Suivi SMS simple
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-600)" }}>
                Un lien par SMS, pas de compte à créer. Le parent voit tout :
                payé, à venir, en retard.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-ink-400)" }}>
            <img src="/logo.png" alt="EduPay" className="h-5 w-auto object-contain opacity-70" />
            © {new Date().getFullYear()}
          </div>
          <div className="text-sm" style={{ color: "var(--color-ink-400)" }}>
            Simplifier les paiements scolaires en Afrique
          </div>
        </div>
      </footer>
    </div>
  );
}
