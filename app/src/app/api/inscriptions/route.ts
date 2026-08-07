import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSuiviToken } from "@/lib/utils";
import { envoyerSMSReceptionDossier } from "@/lib/sms";

// POST /api/inscriptions — Le parent soumet son dossier d'inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classeSlug, nomEleve, nomParent, telephoneParent, genre, dateNaissance, documents } = body;

    if (!classeSlug || !nomEleve || !nomParent || !telephoneParent) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Trouver la classe via le slug
    const classe = await prisma.classe.findUnique({
      where: { slugInscription: classeSlug },
      include: { ecole: true },
    });

    if (!classe || classe.statut !== "actif" || !classe.ecole.actif) {
      return NextResponse.json(
        { error: "Classe non trouvée ou inactive" },
        { status: 404 }
      );
    }

    // Vérifier si un lien de suivi existe déjà pour ce numéro
    const existingInscription = await prisma.inscription.findFirst({
      where: { telephoneParent, lienSuiviUnique: { not: null } },
    });

    const lienSuiviUnique =
      existingInscription?.lienSuiviUnique || generateSuiviToken();

    const inscription = await prisma.inscription.create({
      data: {
        classeId: classe.id,
        nomEleve,
        nomParent,
        telephoneParent,
        genre: genre || null,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        lienSuiviUnique,
        statut: "en_attente_confirmation",
        ...(Array.isArray(documents) && documents.length > 0
          ? {
              documentsSoumis: {
                create: documents
                  .filter((d: any) => d?.documentRequisId && d?.fileUrl)
                  .map((d: any) => ({
                    documentRequisId: d.documentRequisId,
                    fileUrl: d.fileUrl,
                    nomFichier: d.nomFichier || "document",
                  })),
              },
            }
          : {}),
      },
    });

    // Envoyer SMS de réception du dossier
    await envoyerSMSReceptionDossier({
      telephone: telephoneParent,
      nomEleve,
      nomEcole: classe.ecole.nom,
      nomClasse: classe.nom,
    });

    return NextResponse.json(
      {
        id: inscription.id,
        message:
          "Dossier envoyé avec succès. Vous recevrez un SMS de confirmation.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
