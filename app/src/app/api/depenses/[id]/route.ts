import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/depenses/[id] — Modifier une dépense (ou l'activer/désactiver)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = session.user.ecoleId as string;
    const existante = await prisma.depense.findUnique({ where: { id } });
    if (!existante || existante.ecoleId !== ecoleId) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { libelle, categorie, montant, recurrence, mois, annee, active } = body;

    const depense = await prisma.depense.update({
      where: { id },
      data: {
        ...(libelle !== undefined && { libelle }),
        ...(categorie !== undefined && { categorie }),
        ...(montant !== undefined && { montant: Math.round(montant) }),
        ...(recurrence !== undefined && { recurrence }),
        ...(mois !== undefined && { mois }),
        ...(annee !== undefined && { annee }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(depense);
  } catch (error) {
    console.error("Erreur modification dépense:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/depenses/[id] — Supprimer une dépense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ecoleId = session.user.ecoleId as string;
    const existante = await prisma.depense.findUnique({ where: { id } });
    if (!existante || existante.ecoleId !== ecoleId) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    await prisma.depense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression dépense:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
