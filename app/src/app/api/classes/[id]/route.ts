import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes/[id] — Détail d'une classe avec ses inscriptions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;

    const classe = await prisma.classe.findFirst({
      where: { id, ecoleId },
      include: {
        ecole: { select: { slug: true, nom: true } },
        inscriptions: {
          include: {
            echeances: {
              orderBy: { dateLimite: "asc" },
            },
            documentsSoumis: {
              include: { documentRequis: { select: { nom: true } } },
            },
          },
          orderBy: { dateInscription: "desc" },
        },
      },
    });

    if (!classe) {
      return NextResponse.json(
        { error: "Classe non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(classe);
  } catch (error) {
    console.error("Erreur détail classe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
