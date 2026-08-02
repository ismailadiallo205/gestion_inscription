/**
 * Génération automatique de l'échéancier complet
 * À partir des paramètres de classe : montant_mensualite, nb_mois, frais_inscription,
 * date_debut, jour_echeance_mensuel
 */

interface ParamsEcheancier {
  montantMensualite: number;
  nbMois: number;
  fraisInscription: number;
  dateDebut: Date;
  jourEcheanceMensuel: number;
}

export interface EcheanceGeneree {
  type: "inscription" | "mensualite";
  numeroMois: number | null;
  montant: number;
  dateLimite: Date;
  statut: "a_venir";
}

/**
 * Génère la liste complète des échéances pour une inscription
 */
export function genererEcheancier(params: ParamsEcheancier): EcheanceGeneree[] {
  const echeances: EcheanceGeneree[] = [];

  // 1. Frais d'inscription (si > 0)
  if (params.fraisInscription > 0) {
    echeances.push({
      type: "inscription",
      numeroMois: null,
      montant: params.fraisInscription,
      dateLimite: new Date(params.dateDebut),
      statut: "a_venir",
    });
  }

  // 2. Mensualités
  const debutDate = new Date(params.dateDebut);
  for (let i = 0; i < params.nbMois; i++) {
    const dateLimite = new Date(
      debutDate.getFullYear(),
      debutDate.getMonth() + i,
      params.jourEcheanceMensuel
    );

    // Si la date limite est avant la date de début, décaler au mois suivant
    if (dateLimite < debutDate && i === 0) {
      dateLimite.setMonth(dateLimite.getMonth() + 1);
    }

    echeances.push({
      type: "mensualite",
      numeroMois: i + 1,
      montant: params.montantMensualite,
      dateLimite,
      statut: "a_venir",
    });
  }

  return echeances;
}

/**
 * Calcule le montant total de l'année
 */
export function calculerMontantTotal(params: ParamsEcheancier): number {
  return (
    params.fraisInscription + params.montantMensualite * params.nbMois
  );
}
