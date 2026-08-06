import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/eleves/[id] — Supprimer un élève (l'école ne peut supprimer que ses propres élèves)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que cet élève appartient bien à une classe de l'école connectée
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: { classe: true },
    });

    if (!inscription || inscription.classe.ecoleId !== session.user.ecoleId) {
      return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
    }

    // La suppression de l'inscription supprime automatiquement ses échéances
    // et les rappels associés (onDelete: Cascade défini dans le schéma)
    await prisma.inscription.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression élève:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
