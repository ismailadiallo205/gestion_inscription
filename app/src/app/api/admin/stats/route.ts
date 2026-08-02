import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Statistiques globales
    const ecolesCount = await prisma.ecole.count();
    const elevesCount = await prisma.inscription.count({
      where: { statut: "confirme" }
    });
    
    // CA généré (échéances payées)
    const echeancesPayees = await prisma.echeance.aggregate({
      where: { statut: "paye" },
      _sum: { montant: true }
    });

    // CA en attente (échéances à venir, dues, en retard)
    const echeancesEnAttente = await prisma.echeance.aggregate({
      where: { statut: { in: ["a_venir", "du", "en_retard"] } },
      _sum: { montant: true }
    });

    return NextResponse.json({
      ecoles: ecolesCount,
      eleves: elevesCount,
      revenuePaye: echeancesPayees._sum.montant || 0,
      revenueAttente: echeancesEnAttente._sum.montant || 0
    });
  } catch (error) {
    console.error("Erreur stats admin:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
