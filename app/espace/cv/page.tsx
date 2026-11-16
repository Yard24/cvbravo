"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import FileDrop, { type DocumentAnalyse } from "@/components/FileDrop";
import { MODELES } from "@/components/CvPreview";
import { dateFr, type Cv } from "@/lib/types";

export default function MesCv() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { userId, profil, email } = useEspace();
  const [cvs, setCvs] = useState<Cv[] | null>(null);
  const [modele, setModele] = useState<Cv["template"]>("classique");
  const [doc, setDoc] = useState<DocumentAnalyse | null>(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    const { data } = await supabase.from("bd_cvs").select("*").order("updated_at", { ascending: false });
    setCvs((data as Cv[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function lancerRefonte() {
    if (!doc) return;
    setEnvoi(true);
    setErreur("");
    const { data, error } = await supabase.rpc("bd_create_cv_from_document", { p_document_id: doc.id, p_template: modele });
    setEnvoi(false);
    if (error || !data) return setErreur("La création du CV a échoué. Réessayez.");
    router.push(`/espace/cv/${data}`);
  }

  async function cvVide() {
    setErreur("");
    const { data, error } = await supabase
      .from("bd_cvs")
      .insert({ user_id: userId, title: "Mon CV", template: modele, data: { nom: profil.full_name ?? "", email, telephone: profil.phone ?? "" } })
      .select("id")
      .single();
    if (error || !data) return setErreur("La création du CV a échoué. Réessayez.");
    router.push(`/espace/cv/${data.id}`);
  }

  async function supprimer(cv: Cv) {
    if (!window.confirm(`Supprimer « ${cv.title} » ? Cette action est définitive.`)) return;
    await supabase.from("bd_cvs").delete().eq("id", cv.id);
    charger();
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold">Mes CV</h1>
      <p className="mt-1 text-muted">Déposez votre CV actuel pour le reproduire sur un nouveau modèle et activer la recherche d&apos;offres.</p>

      <section className="card mt-6">
        <h2 className="text-lg font-bold">1. Déposez votre CV</h2>
        <div className="mt-3">
          <FileDrop kind="cv" userId={userId} titre="Choisir mon CV" onDone={setDoc} />
        </div>

        <fieldset className="mt-5">
          <legend className="text-lg font-bold">2. Choisissez un modèle</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MODELES.map((m) => (
              <label key={m.code} className={`cursor-pointer rounded-xl border-2 p-4 ${modele === m.code ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                <input type="radio" name="modele" value={m.code} checked={modele === m.code} onChange={() => setModele(m.code)} className="sr-only" />
                <span className="block font-bold">{m.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{m.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {erreur && <p role="alert" className="alert-error mt-4">{erreur}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={lancerRefonte} disabled={!doc || envoi} className="btn-primary">
            {envoi ? "Création…" : "Refaire mon CV sur ce modèle"}
          </button>
          <button onClick={cvVide} className="btn-ghost">Partir d&apos;un CV vide</button>
        </div>
        {!doc && <p className="mt-2 text-xs text-muted">Déposez d&apos;abord un fichier pour activer la refonte.</p>}
      </section>

      <h2 className="mt-9 text-xl font-bold">CV enregistrés</h2>
      {cvs === null ? (
        <p className="mt-3 text-muted">Chargement…</p>
      ) : cvs.length === 0 ? (
        <p className="card mt-3 text-sm text-muted">Aucun CV pour le moment.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {cvs.map((cv) => (
            <li key={cv.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
              <div className="min-w-0">
                <Link href={`/espace/cv/${cv.id}`} className="block truncate font-bold hover:text-brand">{cv.title}</Link>
                <p className="text-sm text-muted">
                  Modèle {cv.template} · modifié le {dateFr(cv.updated_at)}{" "}
                  {cv.parent_cv_id && <span className="badge-blue ml-1">Adapté à une offre</span>}
                  {cv.status === "en_traitement" && <span className="badge-amber ml-1">Mise en forme en attente</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/espace/cv/${cv.id}`} className="btn-ghost">Ouvrir</Link>
                <button onClick={() => supprimer(cv)} className="btn-danger">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
