"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";

interface Classe {
  id: string;
  nom: string;
  niveauStandard: string | null;
  montantMensualite: number;
  nbMois: number;
  fraisInscription: number;
  slugInscription: string;
  statut: string;
  _count: { inscriptions: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes classes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {classes.length} classe{classes.length > 1 ? "s" : ""} créée
            {classes.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/classes/nouvelle" className="btn-primary">
          + Nouvelle classe
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state glass-card-static p-12">
          <div className="empty-state-icon">📚</div>
          <p className="text-lg font-medium text-slate-300 mb-2">
            Aucune classe créée
          </p>
          <p className="text-slate-500 mb-6">
            Créez votre première classe en 3 informations seulement
          </p>
          <Link href="/dashboard/classes/nouvelle" className="btn-primary">
            Créer ma première classe
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {classes.map((classe) => (
            <Link
              key={classe.id}
              href={`/dashboard/classes/${classe.id}`}
              className="glass-card p-6 group"
              id={`classe-${classe.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {classe.nom}
                  </h3>
                  {classe.niveauStandard && (
                    <span className="text-xs text-slate-500">
                      Niveau {classe.niveauStandard}
                    </span>
                  )}
                </div>
                <span
                  className={`badge text-xs ${
                    classe.statut === "actif"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  <span
                    className={`badge-dot ${
                      classe.statut === "actif"
                        ? "bg-emerald-400"
                        : "bg-slate-500"
                    }`}
                  />
                  {classe.statut === "actif" ? "Actif" : "Archivé"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mensualité</span>
                  <span className="text-white font-medium">
                    {formatMontant(classe.montantMensualite)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Durée</span>
                  <span className="text-white">
                    {classe.nbMois} mois
                  </span>
                </div>
                {classe.fraisInscription > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inscription</span>
                    <span className="text-white">
                      {formatMontant(classe.fraisInscription)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Total/élève</span>
                  <span className="text-amber-400 font-semibold">
                    {formatMontant(
                      classe.fraisInscription +
                        classe.montantMensualite * classe.nbMois
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  👩‍🎓 {classe._count.inscriptions} élève
                  {classe._count.inscriptions > 1 ? "s" : ""}
                </span>
                <span className="text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
