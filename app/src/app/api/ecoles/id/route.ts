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

// PATCH /api/admin/ecoles/[id] — Suspendre / réactiver une école
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ecoles/[id] — Supprimer définitivement une école
// Refusé si l'école a encore des classes, pour éviter de perdre par erreur
// des inscriptions et des historiques de paiement réels. Il faut d'abord
// que l'école n'ait plus aucune classe pour pouvoir la supprimer.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifierSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    });

    if (!ecole) {
      return NextResponse.json({ error: "École introuvable" }, { status: 404 });
    }

    if (ecole._count.classes > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : cette école a encore ${ecole._count.classes} classe(s) avec des élèves inscrits. Suspendez-la plutôt, ou supprimez d'abord ses classes.`,
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
