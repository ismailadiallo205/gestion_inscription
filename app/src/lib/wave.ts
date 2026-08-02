/**
 * Service Wave Business API — Mock pour développement
 * En production, remplacer par les vrais appels à l'API Wave
 */

interface WavePaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
}

/**
 * Génère un lien de paiement Wave (MOCK)
 * En production : POST https://api.wave.com/v1/checkout/sessions
 */
export async function creerLienPaiement(params: {
  montant: number;
  description: string;
  ecoleApiKey: string;
  callbackUrl?: string;
}): Promise<WavePaymentLink> {
  // MOCK — Simule la création d'un lien Wave
  console.log("[WAVE MOCK] Création lien de paiement:", params);

  return {
    id: `wave_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    url: `https://pay.wave.com/mock/${Math.random().toString(36).slice(2, 10)}`,
    amount: params.montant,
    currency: "XOF",
    status: "pending",
  };
}

/**
 * Vérifie la signature d'un webhook Wave (MOCK)
 * En production : vérifier HMAC-SHA256 avec la clé secrète
 */
export function verifierWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // MOCK — Toujours valide en développement
  console.log("[WAVE MOCK] Vérification signature webhook");
  return true;
}

/**
 * Vérifie le statut d'un paiement Wave (MOCK)
 */
export async function verifierStatutPaiement(
  waveEventId: string,
  ecoleApiKey: string
): Promise<{ status: "completed" | "pending" | "failed" }> {
  console.log("[WAVE MOCK] Vérification statut:", waveEventId);
  return { status: "completed" };
}
