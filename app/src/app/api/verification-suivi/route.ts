import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/verification-suivi — L'élève/parent retrouve son dossier avec
// son identifiant court (ex: KE-4821) + sa date de naissance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifiantCourt, dateNaissance } = body;

    if (!identifiantCourt || !dateNaissance) {
      return NextResponse.json(
        { error: "L'identifiant et la date de naissance sont requis" },
        { status: 400 }
      );
    }

    const inscription = await prisma.inscription.findFirst({
      where: {
        identifiantCourt: identifiantCourt.trim().toUpperCase(),
        statut: "confirme",
      },
    });

    // Comparaison par jour uniquement (ignore l'heure) pour éviter les
    // écarts de fuseau horaire entre le input date du navigateur et la DB
    const dateNaissanceValide =
      inscription?.dateNaissance &&
      new Date(inscription.dateNaissance).toISOString().slice(0, 10) === dateNaissance;

    if (!inscription || !dateNaissanceValide || !inscription.lienSuiviUnique) {
      return NextResponse.json(
        { error: "Aucun dossier ne correspond à ces informations" },
        { status: 404 }
      );
    }

    return NextResponse.json({ token: inscription.lienSuiviUnique });
  } catch (error) {
    console.error("Erreur vérification suivi:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
