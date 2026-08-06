import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// POST /api/classes — Créer une classe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;
    const body = await request.json();

    const {
      nom,
      montantMensualite,
      nbMois,
      niveauStandard,
      fraisInscription,
      dateDebut,
      jourEcheanceMensuel,
      documentsRequis, // tableau de { nom: string, obligatoire: boolean }
    } = body;

    // Validation des 3 champs obligatoires
    if (!nom || !montantMensualite || !nbMois) {
      return NextResponse.json(
        { error: "Nom, mensualité et nombre de mois sont requis" },
        { status: 400 }
      );
    }

    // Générer un slug unique pour l'inscription
    const ecole = await prisma.ecole.findUnique({
      where: { id: ecoleId },
    });
    if (!ecole) {
      return NextResponse.json(
        { error: "École non trouvée" },
        { status: 404 }
      );
    }

    let slugInscription = slugify(`${ecole.slug}-${nom}`);
    const slugExists = await prisma.classe.findUnique({
      where: { slugInscription },
    });
    if (slugExists) {
      slugInscription = `${slugInscription}-${Date.now().toString(36)}`;
    }

    const classe = await prisma.classe.create({
      data: {
        ecoleId,
        nom,
        montantMensualite: parseInt(String(montantMensualite)),
        nbMois: parseInt(String(nbMois)),
        niveauStandard: niveauStandard || null,
        fraisInscription: fraisInscription
          ? parseInt(String(fraisInscription))
          : 0,
        dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
        jourEcheanceMensuel: jourEcheanceMensuel
          ? parseInt(String(jourEcheanceMensuel))
          : 5,
        slugInscription,
        ...(Array.isArray(documentsRequis) && documentsRequis.length > 0
          ? {
              documentsRequis: {
                create: documentsRequis
                  .filter((d: any) => d?.nom?.trim())
                  .map((d: any, index: number) => ({
                    nom: d.nom.trim(),
                    obligatoire: d.obligatoire !== false,
                    ordre: index,
                  })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json(classe, { status: 201 });
  } catch (error) {
    console.error("Erreur création classe:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET /api/classes — Lister les classes de l'école connectée
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = (session.user as Record<string, unknown>).ecoleId as string;

    const classes = await prisma.classe.findMany({
      where: { ecoleId },
      include: {
        _count: {
          select: {
            inscriptions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Erreur liste classes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
