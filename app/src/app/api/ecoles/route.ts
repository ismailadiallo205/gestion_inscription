import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// POST /api/ecoles — Inscription école
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, email, motDePasse, ville, type } = body;

    if (!nom || !email || !motDePasse) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà pris
    const existing = await prisma.ecole.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Générer un slug unique
    let slug = slugify(nom);
    const slugExists = await prisma.ecole.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const motDePasseHash = await hash(motDePasse, 12);

    const ecole = await prisma.ecole.create({
      data: {
        nom,
        nomPublic: nom,
        email,
        motDePasseHash,
        slug,
        ville: ville || null,
        type: type || "presentiel",
      },
    });

    return NextResponse.json(
      {
        id: ecole.id,
        nom: ecole.nom,
        slug: ecole.slug,
        email: ecole.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création école:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET /api/ecoles — Recherche écoles (pour la page d'accueil et l'annuaire public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const ville = searchParams.get("ville") || "";
    const type = searchParams.get("type") || "";
    const niveau = searchParams.get("niveau") || "";

    const ecoles = await prisma.ecole.findMany({
      where: {
        visibleRecherche: true,
        actif: true,
        ...(q && {
          OR: [
            { nom: { contains: q } },
            { nomPublic: { contains: q } },
          ],
        }),
        ...(ville && { ville: { contains: ville } }),
        ...(type && { type }),
        // Si un niveau est demandé, ne garder que les écoles qui ont
        // au moins une classe active à ce niveau précis
        ...(niveau && {
          classes: {
            some: { statut: "actif", niveauStandard: niveau },
          },
        }),
      },
      select: {
        id: true,
        nom: true,
        nomPublic: true,
        logoUrl: true,
        slug: true,
        ville: true,
        type: true,
        classes: {
          where: {
            statut: "actif",
            ...(niveau && { niveauStandard: niveau }),
          },
          select: {
            id: true,
            nom: true,
            niveauStandard: true,
            slugInscription: true,
            montantMensualite: true,
          },
          orderBy: { nom: "asc" },
        },
        _count: {
          select: { classes: { where: { statut: "actif" } } },
        },
      },
      take: 30,
    });

    return NextResponse.json(ecoles);
  } catch (error) {
    console.error("Erreur recherche écoles:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
