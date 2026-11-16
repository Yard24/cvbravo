"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import FileDrop, { type DocumentAnalyse } from "@/components/FileDrop";
import { MODELES } from "@/components/CvPreview";
import { CLE_BROUILLON } from "@/components/CvAtelier";
import { cvPropre } from "@/components/CvForm";
import { cvExploitable } from "@/lib/cvparse";
import { dateFr, type Cv } from "@/lib/types";

type CvLigne = Cv & { use_for_matching?: boolean };

export default function MesCv() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { userId, profil, email } = useEspace();
  const [cvs, setCvs] = useState<CvLigne[] | null>(null);
  const [modele, setModele] = useState<Cv["template"]>("classique");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    const { data } = await supabase.from("bd_cvs").select("*").order("updated_at", { ascending: false });
    setCvs((data as CvLigne[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  // Brouillon préparé sans compte dans l'atelier public : on l'enregistre dans l'espace
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("importer")) return;
    (async () => {
      try {
        const brut = window.localStorage.getItem(CLE_BROUILLON);
        if (!brut) return;
        const b = JSON.parse(brut);
        const data = cvPropre(b.data ?? {});
        if (!cvExploitable(data)) return;
        const { data: cree } = await supabase.from("bd_cvs")
          .insert({ user_id: userId, title: data.titre ? `CV — ${data.titre}` : "Mon CV", template: b.template ?? "classique", data, status: "pret" })
          .select("id").single();
        if (cree) {
          window.localStorage.removeItem(CLE_BROUILLON);
          supabase.rpc("bd_match_my_cvs").then(() => {});
          router.replace(`/espace/cv/${cree.id}`);
        }
      } catch {
        /* brouillon illisible : on reste sur la liste */
      }
    })();
  }, [supabase, userId, router]);

  /** Dès que le fichier est lu, le CV est créé sur le modèle choisi avec ses rubriques préremplies. */
  async function creerDepuis(doc: DocumentAnalyse) {
    setEnvoi(true);
    setErreur("");
    const data = doc.cv && cvExploitable(doc.cv) ? doc.cv : {};
    let { data: id, error } = await supabase.rpc("bd_create_cv", { p_document_id: doc.id, p_template: modele, p_data: data });
    if (error) {
      // ancienne version de la base : création puis préremplissage en deux temps
      const ancien = await supabase.rpc("bd_create_cv_from_document", { p_document_id: doc.id, p_template: modele });
      id = ancien.data;
      error = ancien.error;
      if (id && Object.keys(data).length) await supabase.from("bd_cvs").update({ data, status: "pret" }).eq("id", id);
    }
    setEnvoi(false);
    if (error || !id) return setErreur("La création du CV a échoué. Réessayez.");
    router.push(`/espace/cv/${id}`);
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

  async function basculerRecherche(cv: CvLigne) {
    const { error } = await supabase.from("bd_cvs").update({ use_for_matching: !cv.use_for_matching }).eq("id", cv.id);
    if (!error) charger();
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Mes CV</h1>
      <p className="mt-1 text-muted">Déposez votre CV : ses informations sont reprises automatiquement sur le modèle choisi. Vous n&apos;avez plus qu&apos;à relire.</p>

      <section className="card mt-6">
        <fieldset>
          <legend className="text-lg font-bold">1. Choisissez un modèle</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MODELES.map((m) => (
              <label key={m.code} className={`cursor-pointer rounded-2xl border-2 p-4 ${modele === m.code ? "border-ink bg-tile" : "border-line bg-white"}`}>
                <input type="radio" name="modele" value={m.code} checked={modele === m.code} onChange={() => setModele(m.code)} className="sr-only" />
                <span className="block font-bold">{m.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{m.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className="mt-6 text-lg font-bold">2. Déposez votre CV</h2>
        <div className="mt-3">
          <FileDrop kind="cv" userId={userId} titre={envoi ? "Création de votre CV…" : "Choisir mon CV"} onDone={creerDepuis} />
        </div>
        {erreur && <p role="alert" className="alert-error mt-4">{erreur}</p>}
        <button onClick={cvVide} className="mt-4 text-sm font-semibold text-brand">Je n&apos;ai pas de CV : partir d&apos;un modèle vide →</button>
      </section>

      <h2 className="mt-9 text-xl font-bold">CV enregistrés</h2>
      {cvs === null ? (
        <p className="mt-3 text-muted">Chargement…</p>
      ) : cvs.length === 0 ? (
        <p className="card mt-3 text-sm text-muted">Aucun CV pour le moment.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {cvs.map((cv) => (
            <li key={cv.id} className="card !p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/espace/cv/${cv.id}`} className="block truncate font-bold hover:text-brand">{cv.title}</Link>
                  <p className="text-sm text-muted">
                    Modèle {cv.template} · modifié le {dateFr(cv.updated_at)}{" "}
                    {cv.parent_cv_id && <span className="badge-blue ml-1">Adapté à une offre</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/espace/cv/${cv.id}`} className="btn-ghost">Ouvrir</Link>
                  <button onClick={() => supprimer(cv)} className="btn-danger">Supprimer</button>
                </div>
              </div>
              {!cv.parent_cv_id && cv.use_for_matching !== undefined && (
                <label className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm">
                  <input type="checkbox" checked={cv.use_for_matching} onChange={() => basculerRecherche(cv)} className="h-5 w-5 accent-[var(--color-brand)]" />
                  Utiliser ce CV pour la recherche d&apos;offres
                </label>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
