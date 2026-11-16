"use client";

import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type DocumentAnalyse = { id: string; mots: number; nom: string };

const MAX = 20 * 1024 * 1024;

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
  const [etat, setEtat] = useState<"repos" | "envoi" | "analyse">("repos");
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState<DocumentAnalyse | null>(null);

  async function traiter(file: File | undefined) {
    if (!file) return;
    setErreur("");
    setFait(null);
    if (!/\.(pdf|docx|txt)$/i.test(file.name)) return setErreur("Envoyez un fichier Word (.docx), PDF ou texte (.txt).");
    if (file.size > MAX) return setErreur("Fichier trop lourd : 20 Mo au maximum.");
    const supabase = createClient();
    const propre = file.name.normalize("NFD").replace(/[^\w.\-]+/g, "_").slice(-80);
    const path = `${userId}/${kind}/${Date.now()}-${propre}`;
    try {
      setEtat("envoi");
      const { error } = await supabase.storage.from("bd-documents").upload(path, file, { contentType: file.type || undefined });
      if (error) throw new Error("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
      setEtat("analyse");
      const res = await fetch("/api/documents/analyser", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, name: file.name, mime: file.type, kind }),
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
  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!occupe) traiter(e.dataTransfer.files?.[0]);
        }}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
          occupe ? "border-line bg-stone-50" : "border-brand/40 bg-brand-soft/50 hover:border-brand"
        }`}
      >
        <span className="display block text-lg font-bold">{titre}</span>
        <span className="mt-1 block text-sm text-muted">
          {etat === "envoi" ? "Envoi du fichier…" : etat === "analyse" ? "Lecture du document et comptage des mots…" : "Word (.docx), PDF ou texte — 20 Mo max. Touchez pour choisir un fichier."}
        </span>
        <input
          id={id}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
            <strong>{fait.nom}</strong> reçu — {new Intl.NumberFormat("fr-FR").format(fait.mots)} mots comptés.
          </p>
        )}
      </div>
    </div>
  );
}
