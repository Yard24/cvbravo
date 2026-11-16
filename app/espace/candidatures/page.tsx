"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { dateFr, type Offer } from "@/lib/types";

type Candidature = { id: string; offer_id: string; adapted_cv_id: string | null; status: "cv_en_adaptation" | "pret" | "postule"; applied_at: string | null; created_at: string; offer: Offer };

const STATUTS = {
  cv_en_adaptation: { label: "CV en cours d'adaptation", ton: "badge-amber" },
  pret: { label: "CV adapté prêt", ton: "badge-blue" },
  postule: { label: "Postulé", ton: "badge-green" },
};

export default function Candidatures() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Candidature[] | null>(null);

  const charger = useCallback(async () => {
    const { data } = await supabase.from("bd_applications").select("*, offer:bd_job_offers(*)").order("created_at", { ascending: false });
    setItems(((data as Candidature[]) ?? []).filter((x) => x.offer));
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function postuler(c: Candidature) {
    window.open(c.offer.url, "_blank", "noopener,noreferrer");
    await supabase.from("bd_applications").update({ status: "postule", applied_at: new Date().toISOString() }).eq("id", c.id);
    charger();
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Mes candidatures</h1>
      <p className="mt-1 text-muted">Pour chaque offre : un CV adapté, puis le suivi de votre candidature.</p>

      {items === null ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="card mt-6">
          <p className="text-sm text-muted">Aucune candidature pour l&apos;instant. Ouvrez vos offres et cliquez sur « Adapter mon CV et postuler ».</p>
          <Link href="/espace/offres" className="btn-primary mt-4">Voir mes offres</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((c) => (
            <li key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-bold">{c.offer.title}</h2>
                <span className={STATUTS[c.status].ton}>{STATUTS[c.status].label}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {c.status === "postule" ? `Candidature envoyée le ${dateFr(c.applied_at)}` : `Préparée le ${dateFr(c.created_at)}`}
              </p>
              {c.status === "cv_en_adaptation" && (
                <p className="mt-2 text-sm text-muted">
                  Une copie de votre CV a été créée pour cette offre. Son ajustement automatique est en file d&apos;attente ;
                  vous pouvez déjà la retoucher vous-même et postuler sans attendre.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.adapted_cv_id && <Link href={`/espace/cv/${c.adapted_cv_id}`} className="btn-ghost">Ouvrir le CV adapté</Link>}
                <a href={c.offer.url} target="_blank" rel="noopener noreferrer" className="btn-ghost">Revoir l&apos;offre</a>
                {c.status !== "postule" && <button onClick={() => postuler(c)} className="btn-primary">Postuler et marquer comme envoyé</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
