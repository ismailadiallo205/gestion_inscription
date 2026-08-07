import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/classes/[id]/documents — Ajouter un document requis à une classe existante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const ecoleId = session.user.ecoleId as string;
    const { id } = await params;

    // Vérifier que la classe appartient bien à l'école connectée
    const classe = await prisma.classe.findFirst({ where: { id, ecoleId } });
    if (!classe) {
      return NextResponse.json({ error: "Classe non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const { nom, obligatoire } = body;

    if (!nom || !nom.trim()) {
      return NextResponse.json({ error: "Le nom du document est requis" }, { status: 400 });
    }

    const dernier = await prisma.documentRequis.findFirst({
      where: { classeId: id },
      orderBy: { ordre: "desc" },
    });

    const document = await prisma.documentRequis.create({
      data: {
        classeId: id,
        nom: nom.trim(),
        obligatoire: obligatoire !== false,
        ordre: (dernier?.ordre ?? -1) + 1,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Erreur ajout document requis:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
