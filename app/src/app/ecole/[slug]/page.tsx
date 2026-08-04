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
          <img src="/logo.png" alt="KlyroEdu" className="h-9 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--color-ink-900)" }}>
            Klyro<span style={{ color: "var(--color-blue-500)" }}>Edu</span>
          </span>
        </Link>
      </nav>

      {/* En-tête école */}
      <section className="px-6 pt-12 pb-8 max-w-5xl mx-auto text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl border flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: "var(--color-blue-50)", borderColor: "var(--color-blue-100)" }}>
          🏫
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-ink-900)" }}>
          {ecole.nomPublic || ecole.nom}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm" style={{ color: "var(--color-ink-600)" }}>
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
        <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-ink-900)" }}>
          Choisissez une classe pour inscrire votre enfant
        </h2>

        {ecole.classes.length === 0 ? (
          <div className="empty-state glass-card-static p-12">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-sm" style={{ color: "var(--color-ink-400)" }}>
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
                  <h3 className="text-lg font-semibold transition-colors" style={{ color: "var(--color-ink-900)" }}>
                    {classe.nom}
                  </h3>
                  {classe.niveauStandard && (
                    <span className="text-xs" style={{ color: "var(--color-ink-400)" }}>
                      Niveau {classe.niveauStandard}
                    </span>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: "var(--color-ink-600)" }}>
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
                  <div className="text-lg font-bold" style={{ color: "var(--color-blue-600)" }}>
                    {formatMontant(
                      classe.fraisInscription +
                        classe.montantMensualite * classe.nbMois
                    )}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-ink-400)" }}>total année</div>
                  <div className="text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-blue-500)" }}>
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
