"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NIVEAUX_STANDARD, formatMontant } from "@/lib/utils";
import { calculerMontantTotal } from "@/lib/echeancier";

export default function NouvelleClassePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 3 champs obligatoires
  const [nom, setNom] = useState("");
  const [montantMensualite, setMontantMensualite] = useState("");
  const [nbMois, setNbMois] = useState("10");

  // Champs avancés (pré-remplis)
  const [niveauStandard, setNiveauStandard] = useState("");
  const [fraisInscription, setFraisInscription] = useState("0");
  const [jourEcheanceMensuel, setJourEcheanceMensuel] = useState("5");

  const montantTotal =
    montantMensualite && nbMois
      ? parseInt(fraisInscription || "0") +
        parseInt(montantMensualite) * parseInt(nbMois)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          montantMensualite: parseInt(montantMensualite),
          nbMois: parseInt(nbMois),
          niveauStandard: niveauStandard || null,
          fraisInscription: parseInt(fraisInscription || "0"),
          jourEcheanceMensuel: parseInt(jourEcheanceMensuel),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Erreur lors de la création");
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/classes/${data.id}`);
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/classes"
          className="text-sm text-slate-400 hover:text-amber-400 transition-colors mb-4 inline-block"
        >
          ← Retour aux classes
        </Link>
        <h1 className="text-2xl font-bold text-white">Nouvelle classe</h1>
        <p className="text-slate-400 text-sm mt-1">
          Seulement 3 informations pour démarrer
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {erreur && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {erreur}
          </div>
        )}

        {/* 3 champs obligatoires */}
        <div className="glass-card-static p-8 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
              1
            </span>
            Informations essentielles
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="nom-classe"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Nom de la classe *
              </label>
              <input
                id="nom-classe"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: 6ème A"
                className="glass-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="mensualite"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Mensualité (FCFA) *
                </label>
                <input
                  id="mensualite"
                  type="number"
                  value={montantMensualite}
                  onChange={(e) => setMontantMensualite(e.target.value)}
                  placeholder="15 000"
                  className="glass-input"
                  min="1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="nb-mois"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Nombre de mois *
                </label>
                <input
                  id="nb-mois"
                  type="number"
                  value={nbMois}
                  onChange={(e) => setNbMois(e.target.value)}
                  placeholder="10"
                  className="glass-input"
                  min="1"
                  max="24"
                  required
                />
              </div>
            </div>

            {/* Aperçu montant total */}
            {montantTotal > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Total par élève pour l&apos;année
                  </span>
                  <span className="text-xl font-bold text-amber-400">
                    {formatMontant(montantTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personnalisation (optionnel) */}
        <div
          className="glass-card-static p-8 mb-6 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-left"
            id="btn-toggle-advanced"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-500/20 flex items-center justify-center text-slate-400 text-sm font-bold">
                ⚙
              </span>
              Personnaliser ces réglages
            </h2>
            <span
              className={`text-slate-400 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {!showAdvanced && (
            <p className="text-xs text-slate-500 mt-3 ml-9">
              Valeurs par défaut : inscription 0 FCFA, échéance le 5 du mois.
              90% des écoles n&apos;ont pas besoin de toucher à ça.
            </p>
          )}

          {showAdvanced && (
            <div className="space-y-5 mt-6 ml-9 animate-fade-in">
              <div>
                <label
                  htmlFor="niveau"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Niveau scolaire
                </label>
                <select
                  id="niveau"
                  value={niveauStandard}
                  onChange={(e) => setNiveauStandard(e.target.value)}
                  className="glass-select"
                >
                  <option value="">Non spécifié</option>
                  {NIVEAUX_STANDARD.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="frais"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Frais d&apos;inscription (FCFA)
                  </label>
                  <input
                    id="frais"
                    type="number"
                    value={fraisInscription}
                    onChange={(e) => setFraisInscription(e.target.value)}
                    className="glass-input"
                    min="0"
                  />
                </div>
                <div>
                  <label
                    htmlFor="jour-echeance"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Jour d&apos;échéance mensuel
                  </label>
                  <input
                    id="jour-echeance"
                    type="number"
                    value={jourEcheanceMensuel}
                    onChange={(e) => setJourEcheanceMensuel(e.target.value)}
                    className="glass-input"
                    min="1"
                    max="28"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300">
                💡 Rappels SMS pré-configurés : 3 jours avant l&apos;échéance,
                le jour même, et 3 jours après si impayé.
              </div>
            </div>
          )}
        </div>

        {/* Bouton de création */}
        <button
          type="submit"
          disabled={loading || !nom || !montantMensualite || !nbMois}
          className="btn-primary w-full text-lg py-4"
          id="btn-create-class"
        >
          {loading ? <span className="spinner" /> : "Créer la classe"}
        </button>
      </form>
    </div>
  );
}
