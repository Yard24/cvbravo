"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CvPreview, { MODELES } from "@/components/CvPreview";
import type { Cv, CvData } from "@/lib/types";

const lignes = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function Champ({ label, value, onChange, type = "text", area = false }: { label: string; value?: string; onChange: (v: string) => void; type?: string; area?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {area ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} className="input" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </label>
  );
}

export default function EditeurCv({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [cv, setCv] = useState<Cv | null>(null);
  const [texteSource, setTexteSource] = useState("");
  const [introuvable, setIntrouvable] = useState(false);
  const [etat, setEtat] = useState<"" | "enregistrement" | "enregistre" | "erreur">("");
  const [onglet, setOnglet] = useState<"edition" | "apercu">("edition");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bd_cvs").select("*").eq("id", id).maybeSingle();
      if (!data) return setIntrouvable(true);
      setCv(data as Cv);
      if (data.source_document_id) {
        const { data: doc } = await supabase.from("bd_documents").select("text_extract").eq("id", data.source_document_id).maybeSingle();
        setTexteSource(doc?.text_extract ?? "");
      }
    })();
  }, [supabase, id]);

  if (introuvable) return <p className="alert-error">CV introuvable. <Link href="/espace/cv" className="font-semibold underline">Retour à mes CV</Link></p>;
  if (!cv) return <p className="text-muted">Chargement…</p>;

  const d = cv.data ?? {};
  const maj = (patch: Partial<CvData>) => {
    setCv({ ...cv, data: { ...d, ...patch } });
    setEtat("");
  };
  const majListe = <K extends "experiences" | "formations">(cle: K, i: number, patch: object) => {
    const liste = [...((d[cle] as object[]) ?? [])];
    liste[i] = { ...liste[i], ...patch };
    maj({ [cle]: liste } as Partial<CvData>);
  };
  const retirer = (cle: "experiences" | "formations", i: number) => maj({ [cle]: (d[cle] ?? []).filter((_, j) => j !== i) } as Partial<CvData>);

  async function enregistrer() {
    if (!cv) return;
    setEtat("enregistrement");
    const { error } = await supabase
      .from("bd_cvs")
      .update({ title: cv.title, template: cv.template, data: cv.data, status: cv.status === "en_traitement" ? "en_traitement" : "pret" })
      .eq("id", cv.id);
    setEtat(error ? "erreur" : "enregistre");
    if (!error) supabase.rpc("bd_match_my_cvs").then(() => {});
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <Link href="/espace/cv" className="text-sm font-semibold text-brand">← Mes CV</Link>
          <input
            aria-label="Titre du CV"
            value={cv.title}
            onChange={(e) => { setCv({ ...cv, title: e.target.value }); setEtat(""); }}
            className="display mt-1 block w-full bg-transparent text-2xl font-extrabold focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span aria-live="polite" className="text-sm text-muted">
            {etat === "enregistrement" ? "Enregistrement…" : etat === "enregistre" ? "Enregistré ✓" : etat === "erreur" ? "Échec de l'enregistrement" : ""}
          </span>
          <button onClick={enregistrer} className="btn-primary">Enregistrer</button>
          <button onClick={() => { setOnglet("apercu"); setTimeout(() => window.print(), 150); }} className="btn-ghost">Télécharger en PDF</button>
        </div>
      </div>

      {cv.status === "en_traitement" && (
        <p className="alert-info mt-4 print:hidden">
          La mise en forme automatique de ce CV est dans la file d&apos;attente. Vous pouvez déjà compléter ou corriger les
          rubriques ci-dessous : ce que vous enregistrez est conservé.
        </p>
      )}

      <div className="mt-4 flex gap-1 lg:hidden print:hidden" role="tablist">
        {(["edition", "apercu"] as const).map((o) => (
          <button key={o} role="tab" aria-selected={onglet === o} onClick={() => setOnglet(o)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${onglet === o ? "bg-brand text-white" : "bg-white text-muted"}`}>
            {o === "edition" ? "Remplir" : "Aperçu"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className={`space-y-5 print:hidden ${onglet === "edition" ? "" : "hidden lg:block"}`}>
          <fieldset className="card">
            <legend className="sr-only">Modèle</legend>
            <p className="label">Modèle</p>
            <div className="flex flex-wrap gap-2">
              {MODELES.map((m) => (
                <button key={m.code} onClick={() => { setCv({ ...cv, template: m.code }); setEtat(""); }} aria-pressed={cv.template === m.code}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${cv.template === m.code ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          {texteSource && (
            <details className="card">
              <summary className="cursor-pointer font-bold">Texte de votre CV d&apos;origine (à copier-coller)</summary>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted">{texteSource}</pre>
            </details>
          )}

          <section className="card space-y-3">
            <h2 className="text-lg font-bold">Identité</h2>
            <Champ label="Nom et prénoms" value={d.nom} onChange={(v) => maj({ nom: v })} />
            <Champ label="Titre du CV (poste visé)" value={d.titre} onChange={(v) => maj({ titre: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Champ label="Téléphone" type="tel" value={d.telephone} onChange={(v) => maj({ telephone: v })} />
              <Champ label="E-mail" type="email" value={d.email} onChange={(v) => maj({ email: v })} />
            </div>
            <Champ label="Ville" value={d.ville} onChange={(v) => maj({ ville: v })} />
            <Champ label="Profil (3 à 4 lignes)" area value={d.profil} onChange={(v) => maj({ profil: v })} />
          </section>

          <section className="card space-y-4">
            <h2 className="text-lg font-bold">Expérience professionnelle</h2>
            {(d.experiences ?? []).map((e, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-line p-3">
                <Champ label="Poste" value={e.poste} onChange={(v) => majListe("experiences", i, { poste: v })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Champ label="Entreprise" value={e.entreprise} onChange={(v) => majListe("experiences", i, { entreprise: v })} />
                  <Champ label="Lieu" value={e.lieu} onChange={(v) => majListe("experiences", i, { lieu: v })} />
                  <Champ label="Début" value={e.debut} onChange={(v) => majListe("experiences", i, { debut: v })} />
                  <Champ label="Fin" value={e.fin} onChange={(v) => majListe("experiences", i, { fin: v })} />
                </div>
                <Champ label="Missions et résultats" area value={e.description} onChange={(v) => majListe("experiences", i, { description: v })} />
                <button onClick={() => retirer("experiences", i)} className="text-sm font-semibold text-red-700">Retirer cette expérience</button>
              </div>
            ))}
            <button onClick={() => maj({ experiences: [...(d.experiences ?? []), {}] })} className="btn-ghost">+ Ajouter une expérience</button>
          </section>

          <section className="card space-y-4">
            <h2 className="text-lg font-bold">Formation</h2>
            {(d.formations ?? []).map((f, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-line p-3">
                <Champ label="Diplôme" value={f.diplome} onChange={(v) => majListe("formations", i, { diplome: v })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Champ label="Établissement" value={f.etablissement} onChange={(v) => majListe("formations", i, { etablissement: v })} />
                  <Champ label="Année" value={f.annee} onChange={(v) => majListe("formations", i, { annee: v })} />
                </div>
                <button onClick={() => retirer("formations", i)} className="text-sm font-semibold text-red-700">Retirer cette formation</button>
              </div>
            ))}
            <button onClick={() => maj({ formations: [...(d.formations ?? []), {}] })} className="btn-ghost">+ Ajouter une formation</button>
          </section>

          <section className="card space-y-3">
            <h2 className="text-lg font-bold">Compétences, langues, centres d&apos;intérêt</h2>
            <p className="text-sm text-muted">Un élément par ligne.</p>
            <Champ label="Compétences" area value={(d.competences ?? []).join("\n")} onChange={(v) => maj({ competences: v.split("\n") })} />
            <Champ label="Langues" area value={(d.langues ?? []).join("\n")} onChange={(v) => maj({ langues: v.split("\n") })} />
            <Champ label="Centres d'intérêt" area value={(d.centres ?? []).join("\n")} onChange={(v) => maj({ centres: v.split("\n") })} />
          </section>

          <button onClick={enregistrer} className="btn-primary w-full">Enregistrer mon CV</button>
        </div>

        <div className={onglet === "apercu" ? "" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-32">
            <CvPreview
              template={cv.template}
              data={{ ...d, competences: lignes((d.competences ?? []).join("\n")), langues: lignes((d.langues ?? []).join("\n")), centres: lignes((d.centres ?? []).join("\n")) }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
