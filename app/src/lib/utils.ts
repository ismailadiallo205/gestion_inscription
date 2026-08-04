/**
 * Génère un slug URL-safe à partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Génère un identifiant court pour un élève (ex: EA-4821)
 */
export function generateIdentifiantCourt(): string {
  const prefix = "KE";
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

/**
 * Génère un token unique pour le lien de suivi parent
 */
export function generateSuiviToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formate un montant en FCFA
 */
export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date courte
 */
export function formatDateCourte(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Calcule le statut d'une échéance en fonction de la date
 */
export function calculerStatutEcheance(
  dateLimite: Date,
  estPaye: boolean
): "a_venir" | "du" | "paye" | "en_retard" {
  if (estPaye) return "paye";

  const maintenant = new Date();
  const limite = new Date(dateLimite);

  if (maintenant > limite) return "en_retard";
  
  // Si on est dans les 7 jours avant l'échéance
  const septJoursAvant = new Date(limite);
  septJoursAvant.setDate(septJoursAvant.getDate() - 7);
  if (maintenant >= septJoursAvant) return "du";

  return "a_venir";
}

/**
 * Classe les niveaux scolaires
 */
export const NIVEAUX_STANDARD = [
  "CI",
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
  "6e",
  "5e",
  "4e",
  "3e",
  "2nde",
  "1ere",
  "Tle",
  "Autre",
] as const;

/**
 * Couleur du statut de paiement
 */
export function couleurStatut(statut: string): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (statut) {
    case "paye":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
      };
    case "en_retard":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        dot: "bg-red-400",
      };
    case "du":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        dot: "bg-amber-400",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        dot: "bg-slate-500",
      };
  }
}

/**
 * Label français du statut
 */
export function labelStatut(statut: string): string {
  const labels: Record<string, string> = {
    a_venir: "À venir",
    du: "Dû",
    paye: "Payé",
    en_retard: "En retard",
    en_attente_confirmation: "En attente",
    confirme: "Confirmé",
    refuse: "Refusé",
    actif: "Actif",
    archive: "Archivé",
    en_attente: "En attente",
  };
  return labels[statut] || statut;
}
