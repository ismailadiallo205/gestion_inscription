import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/depenses — Toutes les dépenses de l'école connectée
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = session.user.ecoleId as string;

    const depenses = await prisma.depense.findMany({
      where: { ecoleId },
      orderBy: [{ annee: "desc" }, { mois: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(depenses);
  } catch (error) {
    console.error("Erreur liste dépenses:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/depenses — Créer une dépense (mensuelle récurrente ou ponctuelle)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = session.user.ecoleId as string;
    const body = await request.json();
    const { libelle, categorie, montant, recurrence, mois, annee } = body;

    if (!libelle || !montant || montant <= 0) {
      return NextResponse.json(
        { error: "Le libellé et un montant positif sont requis" },
        { status: 400 }
      );
    }

    if (recurrence === "ponctuelle" && (!mois || !annee)) {
      return NextResponse.json(
        { error: "Le mois et l'année sont requis pour une dépense ponctuelle" },
        { status: 400 }
      );
    }

    const depense = await prisma.depense.create({
      data: {
        ecoleId,
        libelle,
        categorie: categorie || "autre",
        montant: Math.round(montant),
        recurrence: recurrence === "ponctuelle" ? "ponctuelle" : "mensuelle",
        mois: recurrence === "ponctuelle" ? mois : null,
        annee: recurrence === "ponctuelle" ? annee : null,
      },
    });

    return NextResponse.json(depense, { status: 201 });
  } catch (error) {
    console.error("Erreur création dépense:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
