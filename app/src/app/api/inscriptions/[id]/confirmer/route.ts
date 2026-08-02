import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateIdentifiantCourt } from "@/lib/utils";
import { genererEcheancier } from "@/lib/echeancier";
import { creerLienPaiement } from "@/lib/wave";
import { envoyerSMSConfirmation } from "@/lib/sms";

// POST /api/inscriptions/[id]/confirmer — L'école confirme ou refuse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // "confirmer" ou "refuser"

    if (!action || !["confirmer", "refuser"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'confirmer' ou 'refuser'" },
        { status: 400 }
      );
    }

    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        classe: {
          include: { ecole: true },
        },
      },
    });

    if (!inscription) {
      return NextResponse.json(
        { error: "Inscription non trouvée" },
        { status: 404 }
      );
    }

    if (inscription.statut !== "en_attente_confirmation") {
      return NextResponse.json(
        { error: "Ce dossier a déjà été traité" },
        { status: 400 }
      );
    }

    if (action === "refuser") {
      await prisma.inscription.update({
        where: { id },
        data: { statut: "refuse" },
      });

      return NextResponse.json({ message: "Dossier refusé" });
    }

    // === CONFIRMATION ===
    // 1. Générer identifiant court unique
    let identifiantCourt = generateIdentifiantCourt();
    while (
      await prisma.inscription.findUnique({ where: { identifiantCourt } })
    ) {
      identifiantCourt = generateIdentifiantCourt();
    }

    // 2. Générer l'échéancier
    const classe = inscription.classe;
    const echeancesGenerees = genererEcheancier({
      montantMensualite: classe.montantMensualite,
      nbMois: classe.nbMois,
      fraisInscription: classe.fraisInscription,
      dateDebut: classe.dateDebut,
      jourEcheanceMensuel: classe.jourEcheanceMensuel,
    });

    // 3. Créer les échéances en base
    const echeances = await Promise.all(
      echeancesGenerees.map((e) =>
        prisma.echeance.create({
          data: {
            inscriptionId: id,
            type: e.type,
            numeroMois: e.numeroMois,
            montant: e.montant,
            dateLimite: e.dateLimite,
            statut: e.statut,
          },
        })
      )
    );

    // 4. Créer le lien de paiement pour la première échéance
    const premiereEcheance = echeances[0];
    const lienPaiement = await creerLienPaiement({
      montant: premiereEcheance.montant,
      description: `${classe.ecole.nom} — ${classe.nom} — ${inscription.nomEleve}`,
      ecoleApiKey: classe.ecole.waveBusinessApiKey || "mock-key",
    });

    await prisma.echeance.update({
      where: { id: premiereEcheance.id },
      data: { lienPaiement: lienPaiement.url },
    });

    // 5. Mettre à jour l'inscription
    await prisma.inscription.update({
      where: { id },
      data: {
        statut: "confirme",
        identifiantCourt,
      },
    });

    // 6. Envoyer SMS de confirmation au parent
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const lienSuivi = `${appUrl}/suivi/${inscription.lienSuiviUnique}`;

    await envoyerSMSConfirmation({
      telephone: inscription.telephoneParent,
      nomEleve: inscription.nomEleve,
      identifiantCourt,
      lienSuivi,
      lienPaiement: lienPaiement.url,
      montantPremierPaiement: premiereEcheance.montant,
    });

    return NextResponse.json({
      message: "Inscription confirmée",
      identifiantCourt,
      lienSuivi,
      nbEcheances: echeances.length,
    });
  } catch (error) {
    console.error("Erreur confirmation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
