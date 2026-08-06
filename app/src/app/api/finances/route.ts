import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/finances?mois=1-12&annee=2026
// Calcule : revenus encaissés (échéances payées ce mois-là), dépenses
// applicables (mensuelles actives + ponctuelles de ce mois précis), et le
// bénéfice net = revenus - dépenses.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const ecoleId = session.user.ecoleId as string;

    const { searchParams } = new URL(request.url);
    const maintenant = new Date();
    const mois = parseInt(searchParams.get("mois") || String(maintenant.getMonth() + 1));
    const annee = parseInt(searchParams.get("annee") || String(maintenant.getFullYear()));

    const debutMois = new Date(annee, mois - 1, 1);
    const finMois = new Date(annee, mois, 1);

    // Revenus : échéances payées ce mois-là, pour les élèves de cette école
    const echeancesPayees = await prisma.echeance.findMany({
      where: {
        statut: "paye",
        datePaiement: { gte: debutMois, lt: finMois },
        inscription: { classe: { ecoleId } },
      },
      select: { montant: true, type: true },
    });
    const revenus = echeancesPayees.reduce((sum, e) => sum + e.montant, 0);

    // Dépenses applicables à ce mois : mensuelles actives (comptées chaque
    // mois) + ponctuelles définies précisément pour ce mois/année
    const depenses = await prisma.depense.findMany({
      where: {
        ecoleId,
        OR: [
          { recurrence: "mensuelle", active: true },
          { recurrence: "ponctuelle", mois, annee },
        ],
      },
      orderBy: { montant: "desc" },
    });
    const totalDepenses = depenses.reduce((sum: number, d) => sum + d.montant, 0);

    const beneficeNet = revenus - totalDepenses;

    // Répartition des dépenses par catégorie (pour un graphique éventuel)
    const parCategorie: Record<string, number> = {};
    for (const d of depenses as { categorie: string; montant: number }[]) {
      parCategorie[d.categorie] = (parCategorie[d.categorie] || 0) + d.montant;
    }

    return NextResponse.json({
      mois,
      annee,
      revenus,
      nombrePaiements: echeancesPayees.length,
      totalDepenses,
      beneficeNet,
      depenses,
      parCategorie,
    });
  } catch (error) {
    console.error("Erreur calcul finances:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
