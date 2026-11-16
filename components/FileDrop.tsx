"use client";

import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CvData } from "@/lib/types";

export type DocumentAnalyse = { id: string; mots: number; nom: string; cv?: CvData };

const MAX = 20 * 1024 * 1024;
const IMAGE = /\.(jpe?g|png|webp)$/i;

/** Lecture du texte d'une photo de CV, dans le navigateur (aucune image n'est envoyée à un service tiers). */
async function lireImage(file: File, suivi: (p: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["fra", "eng"], 1, {
    logger: (m: { status: string; progress: number }) => m.status === "recognizing text" && suivi(Math.round(m.progress * 100)),
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text ?? "";
  } finally {
    await worker.terminate();
  }
}

export default function FileDrop({
  kind,
  userId,
  titre,
  onDone,
}: {
  kind: "cv" | "memoire" | "autre";
  userId: string;
  titre: string;
  onDone: (doc: DocumentAnalyse) => void;
}) {
  const id = useId();
  const accepteImages = kind === "cv";
  const [etat, setEtat] = useState<"repos" | "lecture" | "envoi" | "analyse">("repos");
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState<DocumentAnalyse | null>(null);

  async function traiter(file: File | undefined) {
    if (!file) return;
    setErreur("");
    setFait(null);
    const image = accepteImages && (IMAGE.test(file.name) || file.type.startsWith("image/"));
    if (!image && !/\.(pdf|docx|txt)$/i.test(file.name)) {
      return setErreur(accepteImages ? "Envoyez un fichier Word (.docx), PDF, texte ou une photo (JPG, PNG)." : "Envoyez un fichier Word (.docx), PDF ou texte (.txt).");
    }
    if (file.size > MAX) return setErreur("Fichier trop lourd : 20 Mo au maximum.");
    const supabase = createClient();
    const propre = file.name.normalize("NFD").replace(/[^\w.\-]+/g, "_").slice(-80);
    const path = `${userId}/${kind}/${Date.now()}-${propre}`;
    try {
      let texteImage: string | undefined;
      if (image) {
        setEtat("lecture");
        setProgression(0);
        try {
          texteImage = (await lireImage(file, setProgression)).trim();
        } catch {
          throw new Error("La lecture de la photo a échoué. Vérifiez votre connexion, ou envoyez le CV en PDF ou Word.");
        }
        if (texteImage.split(/\s+/).length < 15) throw new Error("Texte illisible sur cette photo. Reprenez-la bien à plat et bien éclairée, ou envoyez le CV en PDF ou Word.");
      }
      setEtat("envoi");
      const { error } = await supabase.storage.from("bd-documents").upload(path, file, { contentType: file.type || undefined });
      if (error) throw new Error("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
      setEtat("analyse");
      const res = await fetch("/api/documents/analyser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, name: file.name, mime: file.type, kind, text: texteImage }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.erreur || "Analyse impossible. Réessayez.");
      setFait(json);
      onDone(json);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setEtat("repos");
    }
  }

  const occupe = etat !== "repos";
  const aide = accepteImages ? "Word, PDF ou photo du CV — 20 Mo max. Touchez pour choisir un fichier." : "Word (.docx), PDF ou texte — 20 Mo max. Touchez pour choisir un fichier.";
  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!occupe) traiter(e.dataTransfer.files?.[0]);
        }}
        className={`block cursor-pointer rounded-3xl border-2 border-dashed px-5 py-9 text-center transition ${
          occupe ? "border-line bg-tile" : "border-brand/40 bg-brand-soft/50 hover:border-brand"
        }`}
      >
        <span className="display block text-lg font-bold">{titre}</span>
        <span className="mt-1 block text-sm text-muted">
          {etat === "lecture" ? `Lecture du texte de la photo… ${progression} %` : etat === "envoi" ? "Envoi du fichier…" : etat === "analyse" ? "Lecture du document…" : aide}
        </span>
        <input
          id={id}
          type="file"
          accept={accepteImages ? ".pdf,.docx,.txt,image/jpeg,image/png,image/webp" : ".pdf,.docx,.txt"}
          disabled={occupe}
          onChange={(e) => {
            traiter(e.target.files?.[0]);
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>
      <div aria-live="polite" className="mt-3 space-y-2">
        {erreur && <p role="alert" className="alert-error">{erreur}</p>}
        {fait && (
          <p className="alert-ok">
            <strong>{fait.nom}</strong> reçu — {new Intl.NumberFormat("fr-FR").format(fait.mots)} mots lus.
          </p>
        )}
      </div>
    </div>
  );
}
