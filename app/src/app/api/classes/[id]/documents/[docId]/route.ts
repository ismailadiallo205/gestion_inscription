import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/classes/[id]/documents/[docId] — Retirer un document requis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const ecoleId = session.user.ecoleId as string;
    const { id, docId } = await params;

    // Vérifier que la classe appartient bien à l'école connectée
    const classe = await prisma.classe.findFirst({ where: { id, ecoleId } });
    if (!classe) {
      return NextResponse.json({ error: "Classe non trouvée" }, { status: 404 });
    }

    const document = await prisma.documentRequis.findUnique({ where: { id: docId } });
    if (!document || document.classeId !== id) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // Supprimer d'abord les documents déjà soumis par des parents pour cette
    // exigence (la relation DocumentSoumis -> DocumentRequis est en mode
    // Restrict par défaut, donc on nettoie explicitement avant de supprimer
    // le document requis lui-même).
    await prisma.documentSoumis.deleteMany({ where: { documentRequisId: docId } });
    await prisma.documentRequis.delete({ where: { id: docId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression document requis:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
