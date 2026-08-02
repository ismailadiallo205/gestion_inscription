import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EcolePubliquePage({ params }: PageProps) {
  const { slug } = await params;

  const ecole = await prisma.ecole.findUnique({
    where: { slug },
    include: {
      classes: {
        where: { statut: "actif" },
        orderBy: { nom: "asc" },
      },
    },
  });

  if (!ecole || !ecole.visibleRecherche) {
    notFound();
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/20">
            S
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Skoo<span className="text-amber-400">Pay</span>
          </span>
        </Link>
      </nav>

      {/* En-tête école */}
      <section className="px-6 pt-12 pb-8 max-w-5xl mx-auto text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
          🏫
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {ecole.nomPublic || ecole.nom}
        </h1>
        <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
          {ecole.ville && <span>📍 {ecole.ville}</span>}
          <span>
            {ecole.type === "en_ligne" ? "🌐 En ligne" : "🏛 Présentiel"}
          </span>
          <span>
            {ecole.classes.length} classe
            {ecole.classes.length > 1 ? "s" : ""} disponible
            {ecole.classes.length > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Classes */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold text-white mb-6">
          Choisissez une classe pour inscrire votre enfant
        </h2>

        {ecole.classes.length === 0 ? (
          <div className="empty-state glass-card-static p-12">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-sm text-slate-400">
              Aucune classe disponible pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {ecole.classes.map((classe) => (
              <Link
                key={classe.id}
                href={`/ecole/${slug}/${classe.slugInscription}`}
                className="glass-card p-6 flex items-center justify-between group block"
                id={`classe-${classe.slugInscription}`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {classe.nom}
                  </h3>
                  {classe.niveauStandard && (
                    <span className="text-xs text-slate-500">
                      Niveau {classe.niveauStandard}
                    </span>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>
                      {formatMontant(classe.montantMensualite)}/mois
                    </span>
                    <span>{classe.nbMois} mois</span>
                    {classe.fraisInscription > 0 && (
                      <span>
                        + {formatMontant(classe.fraisInscription)} inscription
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-lg font-bold text-amber-400">
                    {formatMontant(
                      classe.fraisInscription +
                        classe.montantMensualite * classe.nbMois
                    )}
                  </div>
                  <div className="text-xs text-slate-500">total année</div>
                  <div className="text-amber-400 text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Inscrire →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
