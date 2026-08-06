import { createClient } from "@supabase/supabase-js";

// Client Supabase avec la clé service_role — utilisé uniquement côté serveur
// (jamais exposé au navigateur), pour pouvoir écrire dans le bucket de stockage.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

const BUCKET = "documents";
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const TYPES_AUTORISES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export interface ResultatUpload {
  url: string;
  nomFichier: string;
}

/**
 * Upload un fichier (venant d'un FormData côté route API) vers Supabase Storage
 * et retourne son URL publique.
 */
export async function uploaderFichier(
  file: File,
  dossier: string
): Promise<ResultatUpload> {
  if (file.size > TAILLE_MAX) {
    throw new Error("Fichier trop volumineux (5 Mo maximum)");
  }
  if (!TYPES_AUTORISES.includes(file.type)) {
    throw new Error("Format non autorisé (PNG, JPEG ou PDF uniquement)");
  }

  const extension = file.name.split(".").pop();
  const nomUnique = `${dossier}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(nomUnique, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Erreur upload Supabase Storage:", error);
    throw new Error("Échec de l'upload du fichier");
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(nomUnique);

  return { url: data.publicUrl, nomFichier: file.name };
}
