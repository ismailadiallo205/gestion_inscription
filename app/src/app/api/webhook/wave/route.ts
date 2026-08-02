import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierWebhookSignature } from "@/lib/wave";

// POST /api/webhook/wave — Webhook de confirmation de paiement Wave
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("wave-signature") || "";

    // Vérifier la signature (mock en dev)
    if (!verifierWebhookSignature(payload, signature, "webhook-secret")) {
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);
    const { event_id, checkout_session_id, payment_status } = data;

    if (payment_status !== "succeeded") {
      return NextResponse.json({ received: true });
    }

    // Trouver l'échéance par le lien de paiement
    // En production, utiliser checkout_session_id pour mapper
    const echeance = await prisma.echeance.findFirst({
      where: {
        waveEventId: null,
        statut: { in: ["a_venir", "du", "en_retard"] },
      },
      include: {
        inscription: true,
      },
    });

    if (!echeance) {
      return NextResponse.json({ received: true, matched: false });
    }

    // Mettre à jour le statut
    await prisma.echeance.update({
      where: { id: echeance.id },
      data: {
        statut: "paye",
        waveEventId: event_id,
        datePaiement: new Date(),
      },
    });

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error("Erreur webhook Wave:", error);
    return NextResponse.json(
      { error: "Erreur traitement webhook" },
      { status: 500 }
    );
  }
}
