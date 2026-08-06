import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ecole/moi — Récupérer le profil de l'école connectée
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecole = await prisma.ecole.findUnique({
      where: { id: session.user.ecoleId },
      select: {
        id: true,
        nom: true,
        nomPublic: true,
        logoUrl: true,
        ville: true,
        type: true,
        slug: true,
      },
    });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("Erreur récupération profil école:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// PATCH /api/ecole/moi — Mettre à jour le logo / nom public de l'école connectée
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { nomPublic, logoUrl, ville } = body;

    const ecole = await prisma.ecole.update({
      where: { id: session.user.ecoleId },
      data: {
        ...(nomPublic !== undefined && { nomPublic }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(ville !== undefined && { ville }),
      },
      select: { id: true, nom: true, nomPublic: true, logoUrl: true, ville: true },
    });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("Erreur mise à jour profil école:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
