import { NextResponse, NextRequest} from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { generateIdentifiantCourt, generateSuiviToken } from "@/lib/utils";
import { genererEcheancier } from "@/lib/echeancier";
import { creerLienPaiement } from "@/lib/wave";
import { envoyerSMSConfirmation } from "@/lib/sms";

// GET /api/eleves — Tous les élèves de l'école connectée
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;

    const inscriptions = await prisma.inscription.findMany({
      where: {
        classe: { ecoleId },
      },
      include: {
        classe: { select: { nom: true } },
        echeances: {
          select: { statut: true, montant: true },
        },
      },
      orderBy: { dateInscription: "desc" },
    });

    return NextResponse.json(inscriptions);
  } catch (error) {
    console.error("Erreur liste élèves:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/eleves — Ajouter un élève manuellement par l'école
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;
    const body = await request.json();
    const { classeId, nomEleve, nomParent, telephoneParent } = body;

    if (!classeId || !nomEleve || !nomParent || !telephoneParent) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la classe appartient bien à l'école
    const classe = await prisma.classe.findFirst({
      where: { id: classeId, ecoleId },
      include: { ecole: true },
    });

    if (!classe) {
      return NextResponse.json(
        { error: "Classe non trouvée" },
        { status: 404 }
      );
    }

    // 1. Générer identifiant court unique
    let identifiantCourt = generateIdentifiantCourt();
    while (
      await prisma.inscription.findUnique({ where: { identifiantCourt } })
    ) {
      identifiantCourt = generateIdentifiantCourt();
    }

    // 2. Générer lien de suivi unique
    const existingInscription = await prisma.inscription.findFirst({
      where: { telephoneParent, lienSuiviUnique: { not: null } },
    });
    const lienSuiviUnique =
      existingInscription?.lienSuiviUnique || generateSuiviToken();

    // 3. Créer l'inscription confirmée
    const inscription = await prisma.inscription.create({
      data: {
        classeId,
        nomEleve,
        nomParent,
        telephoneParent,
        lienSuiviUnique,
        statut: "confirme",
        identifiantCourt,
      },
    });

    // 4. Générer l'échéancier
    const echeancesGenerees = genererEcheancier({
      montantMensualite: classe.montantMensualite,
      nbMois: classe.nbMois,
      fraisInscription: classe.fraisInscription,
      dateDebut: classe.dateDebut,
      jourEcheanceMensuel: classe.jourEcheanceMensuel,
    });

    // 5. Créer les échéances en base
    const echeances = await Promise.all(
      echeancesGenerees.map((e) =>
        prisma.echeance.create({
          data: {
            inscriptionId: inscription.id,
            type: e.type,
            numeroMois: e.numeroMois,
            montant: e.montant,
            dateLimite: e.dateLimite,
            statut: e.statut,
          },
        })
      )
    );

    // 6. Créer le lien de paiement pour la première échéance
    const premiereEcheance = echeances[0];
    const lienPaiement = await creerLienPaiement({
      montant: premiereEcheance.montant,
      description: `${classe.ecole.nom} — ${classe.nom} — ${nomEleve}`,
      ecoleApiKey: classe.ecole.waveBusinessApiKey || "mock-key",
    });

    await prisma.echeance.update({
      where: { id: premiereEcheance.id },
      data: { lienPaiement: lienPaiement.url },
    });

    // 7. Envoyer SMS de confirmation au parent
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const lienSuivi = `${appUrl}/suivi/${lienSuiviUnique}`;

    await envoyerSMSConfirmation({
      telephone: telephoneParent,
      nomEleve,
      identifiantCourt,
      lienSuivi,
      lienPaiement: lienPaiement.url,
      montantPremierPaiement: premiereEcheance.montant,
    });

    return NextResponse.json(
      {
        message: "Élève ajouté et confirmé",
        inscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur ajout élève manuel:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
