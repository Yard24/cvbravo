import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compterMots } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 60;

const KINDS = ["cv", "memoire", "autre"];

async function extraireTexte(buffer: Buffer, nom: string): Promise<string> {
  const ext = nom.toLowerCase().split(".").pop();
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (ext === "pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (ext === "txt" || ext === "md") return buffer.toString("utf8");
  throw new Error("FORMAT");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Connexion requise." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const path = String(body?.path || "");
  const name = String(body?.name || "").slice(0, 200);
  const kind = String(body?.kind || "autre");
  if (!path.startsWith(`${user.id}/`) || path.includes("..") || !name || !KINDS.includes(kind)) {
    return NextResponse.json({ erreur: "Demande invalide." }, { status: 400 });
  }

  const { data: blob, error: dlError } = await supabase.storage.from("bd-documents").download(path);
  if (dlError || !blob) return NextResponse.json({ erreur: "Fichier introuvable. Réessayez l'envoi." }, { status: 404 });

  let texte = "";
  try {
    texte = await extraireTexte(Buffer.from(await blob.arrayBuffer()), name);
  } catch (e) {
    const format = e instanceof Error && e.message === "FORMAT";
    return NextResponse.json(
      {
        erreur: format
          ? "Format non pris en charge. Envoyez un fichier Word (.docx), PDF ou texte (.txt)."
          : "Impossible de lire ce fichier. S'il est protégé ou scanné, envoyez une version Word (.docx).",
      },
      { status: 422 }
    );
  }
  texte = texte.replace(/\u0000/g, "").trim();
  const mots = compterMots(texte);
  if (mots < 1) {
    return NextResponse.json(
      { erreur: "Aucun texte trouvé dans ce fichier (PDF scanné ?). Envoyez une version Word (.docx)." },
      { status: 422 }
    );
  }

  const { data: id, error } = await supabase.rpc("bd_register_document", {
    p_secret: process.env.BD_SERVER_SECRET,
    p_user: user.id,
    p_kind: kind,
    p_path: path,
    p_name: name,
    p_mime: String(body?.mime || "").slice(0, 120),
    p_words: mots,
    p_text: texte,
  });
  if (error) return NextResponse.json({ erreur: "Enregistrement impossible. Réessayez." }, { status: 500 });
  return NextResponse.json({ id, mots, nom: name });
}
