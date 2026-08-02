import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { envoyerSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ECOLE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { nom, prenom, matricule, classeId, telephone, email } = await req.json();

    if (!nom || !prenom || !classeId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Vérifier que la classe appartient bien à l'école connectée
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: { ecole: true }
    });

    if (!classe || classe.ecoleId !== session.user.ecoleId) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
    }

    // Créer l'élève
    const eleve = await prisma.eleve.create({
      data: {
        nom,
        prenom,
        matricule,
        telephone,
        email,
        classeId,
        ecoleId: session.user.ecoleId,
        statut: 'ACTIF',
      },
    });

    // Créer l'échéancier (10 mois par défaut pour l'exemple, ou utiliser la logique existante)
    // Ici on crée un échéancier mensuel sur 10 mois divisant la scolarité totale
    const montantMensuel = classe.scolarite / 10;
    const dateDebut = new Date();
    
    // Générer un token unique pour le suivi
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const echeancier = await prisma.echeancier.create({
      data: {
        eleveId: eleve.id,
        montantTotal: classe.scolarite,
        resteAPayer: classe.scolarite,
        token,
      },
    });

    // Créer les 10 échéances
    const echeances = [];
    for (let i = 1; i <= 10; i++) {
      const dateLimite = new Date(dateDebut);
      dateLimite.setMonth(dateLimite.getMonth() + i);
      
      echeances.push({
        echeancierId: echeancier.id,
        montant: montantMensuel,
        dateLimite: dateLimite,
        statut: 'EN_ATTENTE',
        mois: `Mois ${i}`,
      });
    }

    await prisma.echeance.createMany({
      data: echeances,
    });

    // Envoi du SMS si le téléphone est fourni
    if (telephone) {
       await envoyerSMS(telephone, `Bonjour, l'inscription de ${prenom} ${nom} a été enregistrée à ${classe.ecole.nom}. Suivez l'échéancier ici: https://edupay.app/suivi/${token}`);
    }

    return NextResponse.json({ success: true, eleve, token });
  } catch (error) {
    console.error('Erreur inscription manuelle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
