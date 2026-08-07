import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/ecoles/moi/mot-de-passe — Changer son propre mot de passe
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ECOLE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const ecoleId = session.user.ecoleId as string;

    const body = await request.json();
    const { motDePasseActuel, nouveauMotDePasse } = body;

    if (!motDePasseActuel || !nouveauMotDePasse) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (nouveauMotDePasse.length < 6) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    const ecole = await prisma.ecole.findUnique({ where: { id: ecoleId } });
    if (!ecole) {
      return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    const motDePasseValide = await compare(motDePasseActuel, ecole.motDePasseHash);
    if (!motDePasseValide) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const nouveauHash = await hash(nouveauMotDePasse, 12);
    await prisma.ecole.update({
      where: { id: ecoleId },
      data: { motDePasseHash: nouveauHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
