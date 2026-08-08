import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/eleves/connexion — Connexion élève/parent avec identifiant + date de naissance
// Alternative au lien de suivi par SMS, pour un élève qui l'a perdu ou qui préfère
// se souvenir de son identifiant plutôt que garder un lien.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifiantCourt, dateNaissance } = body;

    if (!identifiantCourt || !dateNaissance) {
      return NextResponse.json(
        { error: "Identifiant et date de naissance sont requis" },
        { status: 400 }
      );
    }

    const inscription = await prisma.inscription.findUnique({
      where: { identifiantCourt: identifiantCourt.trim().toUpperCase() },
      select: { id: true, dateNaissance: true, lienSuiviUnique: true, nomEleve: true },
    });

    // Message volontairement générique (ne précise pas si c'est l'identifiant
    // ou la date qui est fausse) pour ne pas faciliter la découverte d'un
    // identifiant valide par essais successifs
    const erreurGenerique = { error: "Identifiant ou date de naissance incorrect" };

    if (!inscription || !inscription.dateNaissance) {
      return NextResponse.json(erreurGenerique, { status: 401 });
    }

    const dateFournie = new Date(dateNaissance).toISOString().slice(0, 10);
    const dateEnregistree = inscription.dateNaissance.toISOString().slice(0, 10);

    if (dateFournie !== dateEnregistree) {
      return NextResponse.json(erreurGenerique, { status: 401 });
    }

    if (!inscription.lienSuiviUnique) {
      return NextResponse.json(
        { error: "Aucun lien de suivi disponible pour ce dossier" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lienSuiviUnique: inscription.lienSuiviUnique,
      nomEleve: inscription.nomEleve,
    });
  } catch (error) {
    console.error("Erreur connexion élève:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
