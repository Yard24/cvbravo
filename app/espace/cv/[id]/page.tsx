"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CvPreview from "@/components/CvPreview";
import CvForm, { ChoixModele, cvPropre } from "@/components/CvForm";
import type { Cv } from "@/lib/types";

export default function EditeurCv({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [cv, setCv] = useState<(Cv & { auto_filled?: boolean }) | null>(null);
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

  async function enregistrer() {
    if (!cv) return;
    setEtat("enregistrement");
    const { error } = await supabase
      .from("bd_cvs")
      .update({ title: cv.title, template: cv.template, data: cvPropre(cv.data ?? {}), status: "pret" })
      .eq("id", cv.id);
    setEtat(error ? "erreur" : "enregistre");
    if (!error) {
      setCv({ ...cv, status: "pret", auto_filled: false });
      supabase.rpc("bd_match_my_cvs").then(() => {});
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="min-w-0 flex-1">
          <Link href="/espace/cv" className="text-sm font-semibold text-brand">← Mes CV</Link>
          <input
            aria-label="Titre du CV"
            value={cv.title}
            onChange={(e) => { setCv({ ...cv, title: e.target.value }); setEtat(""); }}
            className="display mt-1 block w-full bg-transparent text-2xl font-bold focus:outline-none"
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

      {cv.auto_filled ? (
        <p className="alert-info mt-4 print:hidden">
          Les rubriques ont été remplies automatiquement à partir de votre fichier. Relisez-les : corrigez ce qui est mal
          placé, puis enregistrez.
        </p>
      ) : cv.status === "en_traitement" ? (
        <p className="alert-info mt-4 print:hidden">
          Nous n&apos;avons pas pu lire ce fichier automatiquement. Remplissez les rubriques ci-dessous (le texte d&apos;origine
          est disponible pour copier-coller), puis enregistrez.
        </p>
      ) : null}

      <div className="mt-4 flex gap-1 rounded-full bg-tile p-1 lg:hidden print:hidden" role="tablist">
        {(["edition", "apercu"] as const).map((o) => (
          <button key={o} role="tab" aria-selected={onglet === o} onClick={() => setOnglet(o)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${onglet === o ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
            {o === "edition" ? "Modifier" : "Aperçu"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className={`space-y-5 print:hidden ${onglet === "edition" ? "" : "hidden lg:block"}`}>
          <ChoixModele value={cv.template} onChange={(t) => { setCv({ ...cv, template: t }); setEtat(""); }} />
          {texteSource && (
            <details className="card">
              <summary className="cursor-pointer font-bold">Texte de votre CV d&apos;origine</summary>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted">{texteSource}</pre>
            </details>
          )}
          <CvForm data={cv.data ?? {}} onChange={(d) => { setCv({ ...cv, data: d }); setEtat(""); }} />
          <button onClick={enregistrer} className="btn-primary w-full">Enregistrer mon CV</button>
        </div>

        <div className={onglet === "apercu" ? "" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-32">
            <CvPreview template={cv.template} data={cvPropre(cv.data ?? {})} />
          </div>
        </div>
      </div>
    </>
  );
}
