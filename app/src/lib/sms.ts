/**
 * Service SMS — Mock pour développement
 * En production, remplacer par Africa's Talking ou Orange SMS API
 */

interface SMSResult {
  success: boolean;
  messageId: string;
  to: string;
}

/**
 * Envoie un SMS (MOCK)
 * En production : Africa's Talking API ou Orange SMS API
 */
export async function envoyerSMS(params: {
  telephone: string;
  message: string;
}): Promise<SMSResult> {
  // MOCK — Log le SMS dans la console
  console.log("═══════════════════════════════════════");
  console.log("📱 SMS MOCK envoyé");
  console.log(`   À: ${params.telephone}`);
  console.log(`   Message: ${params.message}`);
  console.log("═══════════════════════════════════════");

  return {
    success: true,
    messageId: `sms_${Date.now()}`,
    to: params.telephone,
  };
}

/**
 * Envoie le SMS de confirmation d'inscription (réception du dossier)
 */
export async function envoyerSMSReceptionDossier(params: {
  telephone: string;
  nomEleve: string;
  nomEcole: string;
  nomClasse: string;
}): Promise<SMSResult> {
  const message = `Bonjour ! Le dossier d'inscription de ${params.nomEleve} pour la classe ${params.nomClasse} à ${params.nomEcole} a bien été reçu. Vous serez informé(e) dès sa confirmation. — KlyroEdu`;

  return envoyerSMS({ telephone: params.telephone, message });
}

/**
 * Envoie le SMS de confirmation avec lien de suivi + paiement
 */
export async function envoyerSMSConfirmation(params: {
  telephone: string;
  nomEleve: string;
  identifiantCourt: string;
  lienSuivi: string;
  lienPaiement: string;
  montantPremierPaiement: number;
}): Promise<SMSResult> {
  const montantFormate = new Intl.NumberFormat("fr-FR").format(
    params.montantPremierPaiement
  );
  const message = `✅ Inscription confirmée pour ${params.nomEleve} (${params.identifiantCourt}). Suivez vos paiements ici : ${params.lienSuivi}. Premier paiement : ${montantFormate} FCFA → ${params.lienPaiement} — KlyroEdu`;

  return envoyerSMS({ telephone: params.telephone, message });
}

/**
 * Envoie un rappel de paiement
 */
export async function envoyerRappelPaiement(params: {
  telephone: string;
  nomEleve: string;
  montant: number;
  lienPaiement: string;
  joursRestants: number;
}): Promise<SMSResult> {
  const montantFormate = new Intl.NumberFormat("fr-FR").format(params.montant);
  let message: string;

  if (params.joursRestants > 0) {
    message = `Rappel : paiement de ${montantFormate} FCFA pour ${params.nomEleve} dans ${params.joursRestants} jour(s). Payez ici : ${params.lienPaiement} — KlyroEdu`;
  } else if (params.joursRestants === 0) {
    message = `⚠️ Échéance aujourd'hui : ${montantFormate} FCFA pour ${params.nomEleve}. Payez maintenant : ${params.lienPaiement} — KlyroEdu`;
  } else {
    message = `🔴 Retard de paiement : ${montantFormate} FCFA pour ${params.nomEleve} (${Math.abs(params.joursRestants)} jour(s) de retard). Régularisez ici : ${params.lienPaiement} — KlyroEdu`;
  }

  return envoyerSMS({ telephone: params.telephone, message });
}
