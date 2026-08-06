import { NextRequest, NextResponse } from "next/server";
import { uploaderFichier } from "@/lib/stokage";

// POST /api/upload — Upload un fichier vers Supabase Storage
// Utilisé pour : le logo d'une école (dossier "logos") et les documents
// justificatifs soumis par les parents (dossier "justificatifs").
// Pas d'authentification requise ici volontairement : le formulaire public
// d'inscription doit pouvoir uploader des documents sans compte. La limite
// de taille/type dans lib/storage.ts protège contre les abus évidents.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dossier = (formData.get("dossier") as string) || "divers";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // On limite les noms de dossier possibles pour éviter l'écriture n'importe où
    const dossiersAutorises = ["logos", "justificatifs"];
    const dossierSecurise = dossiersAutorises.includes(dossier) ? dossier : "divers";

    const resultat = await uploaderFichier(file, dossierSecurise);

    return NextResponse.json(resultat, { status: 201 });
  } catch (error: any) {
    console.error("Erreur route upload:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l'upload" },
      { status: 400 }
    );
  }
}
