import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — Stats + dossiers en attente + élèves en retard
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;

    // Stats
    const classes = await prisma.classe.findMany({
      where: { ecoleId },
      include: {
        inscriptions: {
          where: { statut: "confirme" },
          include: {
            echeances: true,
          },
        },
      },
    });

    let totalEleves = 0;
    let montantRecu = 0;
    let montantEnAttente = 0;
    let elevesEnRetardSet = new Set<string>();

    for (const classe of classes) {
      totalEleves += classe.inscriptions.length;
      for (const inscription of classe.inscriptions) {
        for (const echeance of inscription.echeances) {
          if (echeance.statut === "paye") {
            montantRecu += echeance.montant;
          } else {
            montantEnAttente += echeance.montant;
          }
          if (echeance.statut === "en_retard") {
            elevesEnRetardSet.add(inscription.id);
          }
        }
      }
    }

    // Dossiers en attente
    const dossiersEnAttente = await prisma.inscription.findMany({
      where: {
        statut: "en_attente_confirmation",
        classe: { ecoleId },
      },
      include: {
        classe: { select: { nom: true } },
        documentsSoumis: {
          include: { documentRequis: { select: { nom: true } } },
        },
      },
      orderBy: { dateInscription: "desc" },
      take: 10,
    });

    // Élèves en retard (avec montant total en retard)
    const inscriptionsEnRetard = await prisma.inscription.findMany({
      where: {
        statut: "confirme",
        classe: { ecoleId },
        echeances: {
          some: { statut: "en_retard" },
        },
      },
      include: {
        classe: { select: { nom: true } },
        echeances: {
          where: { statut: "en_retard" },
        },
      },
      take: 10,
    });

    const elevesEnRetard = inscriptionsEnRetard.map((insc) => ({
      id: insc.id,
      nomEleve: insc.nomEleve,
      identifiantCourt: insc.identifiantCourt || "",
      telephoneParent: insc.telephoneParent,
      classe: insc.classe,
      montantRetard: insc.echeances.reduce((sum, e) => sum + e.montant, 0),
      nbEcheancesRetard: insc.echeances.length,
    }));

    return NextResponse.json({
      stats: {
        totalClasses: classes.length,
        totalEleves,
        montantRecu,
        montantEnAttente,
        dossiersEnAttente: dossiersEnAttente.length,
        elevesEnRetard: elevesEnRetardSet.size,
      },
      dossiersEnAttente,
      elevesEnRetard,
    });
  } catch (error) {
    console.error("Erreur dashboard:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
