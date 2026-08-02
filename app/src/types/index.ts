export type StatutInscription =
  | "en_attente_confirmation"
  | "confirme"
  | "refuse";

export type StatutEcheance = "a_venir" | "du" | "paye" | "en_retard";

export type TypeEcheance = "inscription" | "mensualite";

export type TypeEcole = "presentiel" | "en_ligne";

export type StatutWave = "en_attente" | "actif";

export interface StatsEcole {
  totalEleves: number;
  totalClasses: number;
  montantRecu: number;
  montantEnAttente: number;
  dossiersEnAttente: number;
  elevesEnRetard: number;
}
