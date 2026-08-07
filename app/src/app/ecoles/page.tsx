"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { NIVEAUX_GROUPES, formatMontant } from "@/lib/utils";
import { Search, MapPin, School, ArrowRight } from "lucide-react";

interface ClassePreview {
  id: string;
  nom: string;
  niveauStandard: string | null;
  slugInscription: string;
  montantMensualite: number;
}

interface EcolePreview {
  id: string;
  nom: string;
  nomPublic: string | null;
  logoUrl: string | null;
  slug: string;
  ville: string | null;
  type: string;
  classes: ClassePreview[];
}

export default function AnnuaireEcolesPage() {
  const [q, setQ] = useState("");
  const [niveau, setNiveau] = useState("");
  const [ecoles, setEcoles] = useState<EcolePreview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEcoles = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (niveau) params.set("niveau", niveau);

    fetch(`/api/ecoles?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEcoles(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, niveau]);

  useEffect(() => {
    const timeout = setTimeout(fetchEcoles, 300); // léger debounce sur la recherche
    return () => clearTimeout(timeout);
  }, [fetchEcoles]);

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-lg font-bold text-ink-900 tracking-tight">
            Skoo<span className="text-blue-600">Pay</span>
          </span>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-ink-900">Trouver une école</h1>
          <p className="text-ink-400 mt-2">
            Recherchez par nom d&apos;école ou filtrez par niveau scolaire
          </p>
        </div>

        {/* Barre de recherche + filtre */}
        <div className="glass-card-static p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom de l'école..."
              className="glass-input pl-10"
            />
          </div>
          <select
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            className="glass-select sm:w-64"
          >
            <option value="">Tous les niveaux</option>
            {NIVEAUX_GROUPES.map((groupe) => (
              <optgroup key={groupe.label} label={groupe.label}>
                {groupe.niveaux.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : ecoles.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-state-icon"><School size={24} strokeWidth={1.75} /></div>
            <p className="text-ink-400">
              {niveau
                ? `Aucune école ne propose actuellement le niveau "${niveau}"`
                : "Aucune école trouvée"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {ecoles.map((ecole) => (
              <div key={ecole.id} className="glass-card-static p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-soft border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {ecole.logoUrl ? (
                      <img src={ecole.logoUrl} alt={ecole.nom} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-ink-400">
                        {(ecole.nomPublic || ecole.nom).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/ecole/${ecole.slug}`}
                      className="font-semibold text-ink-900 hover:text-blue-600 transition-colors"
                    >
                      {ecole.nomPublic || ecole.nom}
                    </Link>
                    {ecole.ville && (
                      <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} strokeWidth={2} /> {ecole.ville}
                      </p>
                    )}

                    {ecole.classes.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ecole.classes.map((c) => (
                          <Link
                            key={c.id}
                            href={`/ecole/${ecole.slug}/${c.slugInscription}`}
                            className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            {c.nom} · {formatMontant(c.montantMensualite)}/mois
                            <ArrowRight size={11} strokeWidth={2} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-400 mt-2">Aucune classe active pour l&apos;instant</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
