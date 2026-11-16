"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CvPreview from "@/components/CvPreview";
import CvForm, { ChoixModele, cvPropre } from "@/components/CvForm";
import type { Cv, CvData } from "@/lib/types";

export const CLE_BROUILLON = "bd_cv_brouillon";

/** Atelier CV sans compte : le brouillon reste dans le navigateur de la personne. */
export default function CvAtelier() {
  const [data, setData] = useState<CvData>({});
  const [template, setTemplate] = useState<Cv["template"]>("classique");
  const [onglet, setOnglet] = useState<"edition" | "apercu">("edition");
  const [pret, setPret] = useState(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_BROUILLON);
      if (brut) {
        const b = JSON.parse(brut);
        setData(b.data ?? {});
        if (["classique", "moderne", "compact"].includes(b.template)) setTemplate(b.template);
      }
    } catch {
      /* stockage indisponible : on repart d'un CV vide */
    }
    setPret(true);
  }, []);

  useEffect(() => {
    if (!pret) return;
    try {
      window.localStorage.setItem(CLE_BROUILLON, JSON.stringify({ data, template }));
    } catch {
      /* navigation privée : le brouillon ne sera pas conservé */
    }
  }, [data, template, pret]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">Votre brouillon est gardé sur cet appareil. Aucun compte n&apos;est nécessaire pour le télécharger.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setOnglet("apercu"); setTimeout(() => window.print(), 150); }} className="btn-ghost">Télécharger en PDF</button>
          <Link href="/espace/cv?importer=1" className="btn-primary">Enregistrer et recevoir des offres</Link>
        </div>
      </div>

      <div className="mt-4 flex gap-1 rounded-full bg-tile p-1 lg:hidden print:hidden" role="tablist">
        {(["edition", "apercu"] as const).map((o) => (
          <button key={o} role="tab" aria-selected={onglet === o} onClick={() => setOnglet(o)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${onglet === o ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
            {o === "edition" ? "Remplir" : "Aperçu"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className={`space-y-5 print:hidden ${onglet === "edition" ? "" : "hidden lg:block"}`}>
          <ChoixModele value={template} onChange={setTemplate} />
          <CvForm data={data} onChange={setData} />
        </div>
        <div className={onglet === "apercu" ? "" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-24">
            <CvPreview template={template} data={cvPropre(data)} />
          </div>
        </div>
      </div>
    </>
  );
}
