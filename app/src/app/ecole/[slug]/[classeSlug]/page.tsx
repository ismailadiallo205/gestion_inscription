"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";
import { Check, SearchX } from "lucide-react";

interface ClasseInfo {
  nom: string;
  montantMensualite: number;
  nbMois: number;
  fraisInscription: number;
  ecole: { nom: string; nomPublic: string | null };
  slugInscription: string;
}

export default function InscriptionParentPage() {
  const params = useParams();
  const [classe, setClasse] = useState<ClasseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [erreur, setErreur] = useState("");

  const [nomEleve, setNomEleve] = useState("");
  const [nomParent, setNomParent] = useState("");
  const [telephoneParent, setTelephoneParent] = useState("");

  useEffect(() => {
    fetch(`/api/public/classe/${params.classeSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErreur(data.error);
        } else {
          setClasse(data);
        }
      })
      .catch(() => setErreur("Classe non trouvée"))
      .finally(() => setLoading(false));
  }, [params.classeSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classeSlug: params.classeSlug,
          nomEleve,
          nomParent,
          telephoneParent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Erreur lors de l'envoi");
        return;
      }

      setSuccess(true);
    } catch {
      setErreur("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <Check size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 mb-3">
            Dossier envoyé !
          </h1>
          <p className="text-ink-400 mb-2">
            Le dossier d&apos;inscription de{" "}
            <span className="text-ink-900 font-medium">{nomEleve}</span> a été
            envoyé à{" "}
            <span className="text-ink-900 font-medium">
              {classe?.ecole.nomPublic || classe?.ecole.nom}
            </span>
            .
          </p>
          <p className="text-ink-400 text-sm mb-8">
            Vous recevrez un SMS de confirmation sur le{" "}
            <span className="text-ink-900">{telephoneParent}</span> dès que
            l&apos;école aura validé le dossier.
          </p>
          <Link href="/" className="btn-secondary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4 text-ink-400"><SearchX size={40} strokeWidth={1.5} /></div>
          <p className="text-lg text-ink-600 mb-2">Classe non trouvée</p>
          <p className="text-sm text-ink-400 mb-6">
            {erreur || "Cette classe n'existe pas ou n'est plus active"}
          </p>
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const total =
    classe.fraisInscription + classe.montantMensualite * classe.nbMois;

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

      <div className="px-6 py-12 max-w-lg mx-auto">
        {/* Info classe */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm text-blue-600 font-medium mb-2">
            {classe.ecole.nomPublic || classe.ecole.nom}
          </p>
          <h1 className="text-2xl font-bold text-ink-900 mb-2">
            Inscription — {classe.nom}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-ink-400">
            <span>{formatMontant(classe.montantMensualite)}/mois</span>
            <span>·</span>
            <span>{classe.nbMois} mois</span>
            <span>·</span>
            <span className="text-blue-600 font-medium">
              Total {formatMontant(total)}
            </span>
          </div>
        </div>

        {/* Formulaire court */}
        <form
          onSubmit={handleSubmit}
          className="glass-card-static p-8 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="text-lg font-semibold text-ink-900 mb-6">
            Informations de l&apos;élève
          </h2>

          {erreur && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erreur}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nom-eleve"
                className="block text-sm font-medium text-ink-600 mb-2"
              >
                Nom complet de l&apos;élève *
              </label>
              <input
                id="nom-eleve"
                type="text"
                value={nomEleve}
                onChange={(e) => setNomEleve(e.target.value)}
                placeholder="Prénom et nom de l'élève"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nom-parent"
                className="block text-sm font-medium text-ink-600 mb-2"
              >
                Nom du parent / tuteur *
              </label>
              <input
                id="nom-parent"
                type="text"
                value={nomParent}
                onChange={(e) => setNomParent(e.target.value)}
                placeholder="Prénom et nom du responsable"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="telephone"
                className="block text-sm font-medium text-ink-600 mb-2"
              >
                Numéro de téléphone *
              </label>
              <input
                id="telephone"
                type="tel"
                value={telephoneParent}
                onChange={(e) => setTelephoneParent(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="glass-input"
                required
              />
              <p className="text-xs text-ink-400 mt-2">
                Ce numéro recevra les SMS de suivi et les liens de paiement
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-6 text-lg py-4"
            id="btn-submit-inscription"
          >
            {submitting ? (
              <span className="spinner" />
            ) : (
              "Envoyer le dossier"
            )}
          </button>

          <p className="text-xs text-ink-400 text-center mt-4">
            L&apos;école vérifiera votre dossier et vous recevrez un SMS de
            confirmation avec votre lien de paiement.
          </p>
        </form>
      </div>
    </div>
  );
}
