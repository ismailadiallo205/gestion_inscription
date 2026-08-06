import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMontant } from "@/lib/utils";
import { Building2, MapPin, Globe2, Landmark, BookOpen, ArrowRight } from "lucide-react";

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-lg font-bold text-ink-900 tracking-tight">
            Skoo<span className="text-blue-600">Pay</span>
          </span>
        </Link>
      </nav>

      {/* En-tête école */}
      <section className="px-6 pt-12 pb-8 max-w-5xl mx-auto text-center animate-fade-in">
        {ecole.logoUrl ? (
          <div className="w-20 h-20 rounded-2xl border border-border overflow-hidden mx-auto mb-6 shadow-sm">
            <img src={ecole.logoUrl} alt={ecole.nomPublic || ecole.nom} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-blue-100 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Building2 size={32} strokeWidth={1.75} />
          </div>
        )}
        <h1 className="text-3xl font-bold text-ink-900 mb-2">
          {ecole.nomPublic || ecole.nom}
        </h1>
        <div className="flex items-center justify-center gap-4 text-ink-400 text-sm">
          {ecole.ville && <span className="flex items-center gap-1"><MapPin size={13} strokeWidth={2} /> {ecole.ville}</span>}
          <span className="flex items-center gap-1">
            {ecole.type === "en_ligne" ? (
              <><Globe2 size={13} strokeWidth={2} /> En ligne</>
            ) : (
              <><Landmark size={13} strokeWidth={2} /> Présentiel</>
            )}
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
        <h2 className="text-lg font-semibold text-ink-900 mb-6">
          Choisissez une classe pour inscrire votre enfant
        </h2>

        {ecole.classes.length === 0 ? (
          <div className="empty-state glass-card-static p-12">
            <div className="empty-state-icon"><BookOpen size={24} strokeWidth={1.75} /></div>
            <p className="text-sm text-ink-400">
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
                  <h3 className="text-lg font-semibold text-ink-900 group-hover:text-blue-600 transition-colors">
                    {classe.nom}
                  </h3>
                  {classe.niveauStandard && (
                    <span className="text-xs text-ink-400">
                      Niveau {classe.niveauStandard}
                    </span>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-ink-400">
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
                  <div className="text-lg font-bold text-blue-600">
                    {formatMontant(
                      classe.fraisInscription +
                        classe.montantMensualite * classe.nbMois
                    )}
                  </div>
                  <div className="text-xs text-ink-400">total année</div>
                  <div className="text-blue-600 text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Inscrire <ArrowRight size={14} strokeWidth={2} />
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
