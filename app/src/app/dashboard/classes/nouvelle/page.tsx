"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NIVEAUX_STANDARD, NIVEAUX_GROUPES, formatMontant } from "@/lib/utils";
import { calculerMontantTotal } from "@/lib/echeancier";
import { ArrowLeft, Settings, Lightbulb, FileText, Plus, X } from "lucide-react";

export default function NouvelleClassePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 3 champs obligatoires
  const [niveauStandard, setNiveauStandard] = useState("");
  const [section, setSection] = useState("");
  const [montantMensualite, setMontantMensualite] = useState("");
  const [nbMois, setNbMois] = useState("10");

  // Champs avancés (pré-remplis)
  const [fraisInscription, setFraisInscription] = useState("0");
  const [jourEcheanceMensuel, setJourEcheanceMensuel] = useState("5");
  const [documentsRequis, setDocumentsRequis] = useState<
    { nom: string; obligatoire: boolean }[]
  >([]);

  const ajouterDocument = () =>
    setDocumentsRequis([...documentsRequis, { nom: "", obligatoire: true }]);

  const retirerDocument = (index: number) =>
    setDocumentsRequis(documentsRequis.filter((_, i) => i !== index));

  const modifierDocument = (index: number, nom: string) =>
    setDocumentsRequis(
      documentsRequis.map((d, i) => (i === index ? { ...d, nom } : d))
    );

  const montantTotal =
    montantMensualite && nbMois
      ? parseInt(fraisInscription || "0") +
        parseInt(montantMensualite) * parseInt(nbMois)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    if (!niveauStandard) {
      setErreur("Veuillez sélectionner un niveau scolaire");
      setLoading(false);
      return;
    }

    const nom = section.trim() ? `${niveauStandard} ${section.trim()}` : niveauStandard;

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
          documentsRequis: documentsRequis.filter((d) => d.nom.trim()),
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
          className="text-sm text-ink-400 hover:text-blue-600 transition-colors mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} strokeWidth={2} /> Retour aux classes
        </Link>
        <h1 className="text-2xl font-bold text-ink-900">Nouvelle classe</h1>
        <p className="text-ink-400 text-sm mt-1">
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
          <h2 className="text-lg font-semibold text-ink-900 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
              1
            </span>
            Informations essentielles
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="niveau-classe"
                className="block text-sm font-medium text-ink-600 mb-2"
              >
                Niveau scolaire *
              </label>
              <select
                id="niveau-classe"
                value={niveauStandard}
                onChange={(e) => setNiveauStandard(e.target.value)}
                className="glass-select"
                required
              >
                <option value="">Sélectionner un niveau...</option>
                {NIVEAUX_GROUPES.map((groupe) => (
                  <optgroup key={groupe.label} label={groupe.label}>
                    {groupe.niveaux.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="section-classe"
                className="block text-sm font-medium text-ink-600 mb-2"
              >
                Section / groupe <span className="text-ink-400 font-normal">(optionnel)</span>
              </label>
              <input
                id="section-classe"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Ex: A, B, Groupe 1..."
                className="glass-input"
              />
              <p className="text-xs text-ink-400 mt-1.5">
                Utile s'il y a plusieurs classes du même niveau (ex: 6e A, 6e B)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="mensualite"
                  className="block text-sm font-medium text-ink-600 mb-2"
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
                  className="block text-sm font-medium text-ink-600 mb-2"
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
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-400">
                    Total par élève pour l&apos;année
                  </span>
                  <span className="text-xl font-bold text-blue-600">
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
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-surface-soft flex items-center justify-center text-ink-400">
                <Settings size={14} strokeWidth={2} />
              </span>
              Personnaliser ces réglages
            </h2>
            <span
              className={`text-ink-400 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {!showAdvanced && (
            <p className="text-xs text-ink-400 mt-3 ml-9">
              Valeurs par défaut : inscription 0 FCFA, échéance le 5 du mois.
              90% des écoles n&apos;ont pas besoin de toucher à ça.
            </p>
          )}

          {showAdvanced && (
            <div className="space-y-5 mt-6 ml-9 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="frais"
                    className="block text-sm font-medium text-ink-600 mb-2"
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
                    className="block text-sm font-medium text-ink-600 mb-2"
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

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300 flex items-start gap-2">
                <Lightbulb size={14} strokeWidth={2} className="shrink-0 mt-0.5" />
                <span>Rappels SMS pré-configurés : 3 jours avant l&apos;échéance,
                le jour même, et 3 jours après si impayé.</span>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium text-ink-600 mb-3 flex items-center gap-2">
                  <FileText size={14} strokeWidth={2} /> Documents à demander aux parents
                </p>
                <div className="space-y-2">
                  {documentsRequis.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={doc.nom}
                        onChange={(e) => modifierDocument(index, e.target.value)}
                        placeholder="Ex: Extrait de naissance"
                        className="glass-input"
                      />
                      <button
                        type="button"
                        onClick={() => retirerDocument(index)}
                        className="text-ink-400 hover:text-red-500 transition-colors p-2 shrink-0"
                        title="Retirer"
                      >
                        <X size={16} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={ajouterDocument}
                  className="btn-secondary btn-sm mt-3 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} strokeWidth={2} /> Ajouter un document
                </button>
                {documentsRequis.length === 0 && (
                  <p className="text-xs text-ink-400 mt-2">
                    Aucun document demandé — le parent remplit juste le formulaire.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bouton de création */}
        <button
          type="submit"
          disabled={loading || !niveauStandard || !montantMensualite || !nbMois}
          className="btn-primary w-full text-lg py-4"
          id="btn-create-class"
        >
          {loading ? <span className="spinner" /> : "Créer la classe"}
        </button>
      </form>
    </div>
  );
}
