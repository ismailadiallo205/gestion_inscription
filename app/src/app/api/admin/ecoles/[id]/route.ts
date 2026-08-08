import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifierSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin/ecoles/[id] â€” Fiche dÃ©taillÃ©e d'une Ã©cole (super-admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
    }

    const { id } = await params;

    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            _count: { select: { inscriptions: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ecole) {
      return NextResponse.json({ error: "Ã‰cole non trouvÃ©e" }, { status: 404 });
    }

    const echeancesPayees = await prisma.echeance.aggregate({
      where: {
        statut: "paye",
        inscription: { classe: { ecoleId: id } },
      },
      _sum: { montant: true },
    });

    const nombreEleves = await prisma.inscription.count({
      where: { classe: { ecoleId: id }, statut: "confirme" },
    });

    return NextResponse.json({
      ...ecole,
      nombreEleves,
      revenuTotal: echeancesPayees._sum.montant || 0,
    });
  } catch (error) {
    console.error("Erreur dÃ©tail Ã©cole admin:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/ecoles/[id] â€” Suspendre / rÃ©activer une Ã©cole
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { actif } = body;

    if (typeof actif !== "boolean") {
      return NextResponse.json(
        { error: "Le champ 'actif' est requis (true ou false)" },
        { status: 400 }
      );
    }

    const ecole = await prisma.ecole.update({
      where: { id },
      data: { actif },
    });

    return NextResponse.json(ecole);
  } catch (error) {
    console.error("Erreur PATCH admin/ecoles/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise Ã  jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ecoles/[id] â€” Supprimer dÃ©finitivement une Ã©cole
// RefusÃ© si l'Ã©cole a encore des classes, pour Ã©viter de perdre par erreur
// des inscriptions et des historiques de paiement rÃ©els. Il faut d'abord
// que l'Ã©cole n'ait plus aucune classe pour pouvoir la supprimer.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
    }

    const { id } = await params;

    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    });

    if (!ecole) {
      return NextResponse.json({ error: "Ã‰cole introuvable" }, { status: 404 });
    }

    if (ecole._count.classes > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : cette Ã©cole a encore ${ecole._count.classes} classe(s) avec des Ã©lÃ¨ves inscrits. Suspendez-la plutÃ´t, ou supprimez d'abord ses classes.`,
        },
        { status: 409 }
      );
    }

    await prisma.ecole.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE admin/ecoles/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
