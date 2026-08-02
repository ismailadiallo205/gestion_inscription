import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateIdentifiantCourt, generateSuiviToken } from '@/lib/utils';
import { genererEcheancier } from '@/lib/echeancier';
import { creerLienPaiement } from '@/lib/wave';
import { envoyerSMSConfirmation } from '@/lib/sms';

// POST /api/eleves/manuel — L'école ajoute directement un élève (sans passer par le formulaire public)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ECOLE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { nomEleve, nomParent, telephoneParent, classeId } = await req.json();

    if (!nomEleve || !nomParent || !telephoneParent || !classeId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Vérifier que la classe appartient bien à l'école connectée
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: { ecole: true },
    });

    if (!classe || classe.ecoleId !== session.user.ecoleId) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
    }

    // Réutiliser le lien de suivi existant si ce numéro a déjà un enfant inscrit
    const inscriptionExistante = await prisma.inscription.findFirst({
      where: { telephoneParent, lienSuiviUnique: { not: null } },
    });
    const lienSuiviUnique = inscriptionExistante?.lienSuiviUnique || generateSuiviToken();

    // Générer un identifiant court unique
    let identifiantCourt = generateIdentifiantCourt();
    while (await prisma.inscription.findUnique({ where: { identifiantCourt } })) {
      identifiantCourt = generateIdentifiantCourt();
    }

    // Une inscription créée directement par l'école est déjà confirmée
    const inscription = await prisma.inscription.create({
      data: {
        classeId,
        nomEleve,
        nomParent,
        telephoneParent,
        lienSuiviUnique,
        identifiantCourt,
        statut: 'confirme',
      },
    });

    // Générer l'échéancier à partir des paramètres réels de la classe
    const echeancesGenerees = genererEcheancier({
      montantMensualite: classe.montantMensualite,
      nbMois: classe.nbMois,
      fraisInscription: classe.fraisInscription,
      dateDebut: classe.dateDebut,
      jourEcheanceMensuel: classe.jourEcheanceMensuel,
    });

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

    // Lien de paiement pour la première échéance
    const premiereEcheance = echeances[0];
    const lienPaiement = await creerLienPaiement({
      montant: premiereEcheance.montant,
      description: `${classe.ecole.nom} — ${classe.nom} — ${inscription.nomEleve}`,
      ecoleApiKey: classe.ecole.waveBusinessApiKey || 'mock-key',
    });

    await prisma.echeance.update({
      where: { id: premiereEcheance.id },
      data: { lienPaiement: lienPaiement.url },
    });

    // SMS de confirmation au parent
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const lienSuivi = `${appUrl}/suivi/${lienSuiviUnique}`;

    if (telephoneParent) {
      await envoyerSMSConfirmation({
        telephone: telephoneParent,
        nomEleve,
        identifiantCourt,
        lienSuivi,
        lienPaiement: lienPaiement.url,
        montantPremierPaiement: premiereEcheance.montant,
      });
    }

    return NextResponse.json(
      {
        success: true,
        inscription,
        identifiantCourt,
        lienSuivi,
        nbEcheances: echeances.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur inscription manuelle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
