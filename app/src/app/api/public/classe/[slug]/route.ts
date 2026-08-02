import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/classe/[slug] — Info publique d'une classe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const classe = await prisma.classe.findUnique({
      where: { slugInscription: slug },
      select: {
        nom: true,
        niveauStandard: true,
        montantMensualite: true,
        nbMois: true,
        fraisInscription: true,
        slugInscription: true,
        statut: true,
        ecole: {
          select: { nom: true, nomPublic: true, slug: true },
        },
      },
    });

    if (!classe || classe.statut !== "actif") {
      return NextResponse.json(
        { error: "Classe non trouvée ou inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json(classe);
  } catch (error) {
    console.error("Erreur info classe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
