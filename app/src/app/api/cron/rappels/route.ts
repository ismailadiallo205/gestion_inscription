import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerRappelPaiement } from "@/lib/sms";

// GET /api/cron/rappels — Tâche planifiée quotidienne de rappels SMS
// En production : Vercel Cron qui appelle cette route chaque jour
export async function GET() {
  try {
    const maintenant = new Date();
    const aujourdhui = new Date(
      maintenant.getFullYear(),
      maintenant.getMonth(),
      maintenant.getDate()
    );

    // Trouver toutes les échéances non payées
    const echeances = await prisma.echeance.findMany({
      where: {
        statut: { in: ["a_venir", "du", "en_retard"] },
        inscription: { statut: "confirme" },
      },
      include: {
        inscription: {
          include: { classe: { include: { ecole: true } } },
        },
      },
    });

    let envois = 0;

    for (const echeance of echeances) {
      const dateLimite = new Date(echeance.dateLimite);
      const diffJours = Math.floor(
        (dateLimite.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Règles par défaut : 3 jours avant, le jour même, 3 jours après
      const regles = JSON.parse(
        echeance.inscription.classe.reglesRappel ||
          '{"avantJours":3,"jourMeme":true,"apresJours":3}'
      );

      let doitEnvoyer = false;

      if (diffJours === regles.avantJours) doitEnvoyer = true;
      if (diffJours === 0 && regles.jourMeme) doitEnvoyer = true;
      if (diffJours === -regles.apresJours) doitEnvoyer = true;

      if (doitEnvoyer) {
        // Vérifier si un rappel n'a pas déjà été envoyé aujourd'hui
        const rappelExistant = await prisma.rappelLog.findFirst({
          where: {
            echeanceId: echeance.id,
            dateEnvoi: { gte: aujourdhui },
          },
        });

        if (!rappelExistant) {
          const result = await envoyerRappelPaiement({
            telephone: echeance.inscription.telephoneParent,
            nomEleve: echeance.inscription.nomEleve,
            montant: echeance.montant,
            lienPaiement: echeance.lienPaiement || "#",
            joursRestants: diffJours,
          });

          await prisma.rappelLog.create({
            data: {
              echeanceId: echeance.id,
              canal: "sms",
              contenu: `Rappel paiement ${echeance.montant} FCFA`,
              statutEnvoi: result.success ? "envoye" : "echoue",
            },
          });

          envois++;
        }
      }

      // Mettre à jour le statut si en retard
      if (diffJours < 0 && echeance.statut !== "en_retard") {
        await prisma.echeance.update({
          where: { id: echeance.id },
          data: { statut: "en_retard" },
        });
      }
    }

    return NextResponse.json({
      message: `Rappels traités : ${envois} envoyés sur ${echeances.length} échéances vérifiées`,
      envois,
      total: echeances.length,
    });
  } catch (error) {
    console.error("Erreur cron rappels:", error);
    return NextResponse.json(
      { error: "Erreur traitement rappels" },
      { status: 500 }
    );
  }
}
