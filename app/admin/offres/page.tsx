"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dateFr } from "@/lib/types";

type Source = { id: string; name: string; url: string; country: string | null; active: boolean; last_fetched_at: string | null; last_status: string | null };

export default function AdminOffres() {
  const supabase = useMemo(() => createClient(), []);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [nbOffres, setNbOffres] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  const charger = useCallback(async () => {
    const [s, o] = await Promise.all([
      supabase.from("bd_job_sources").select("*").order("name"),
      supabase.from("bd_job_offers").select("id", { count: "exact", head: true }),
    ]);
    setSources((s.data as Source[]) ?? []);
    setNbOffres(o.count ?? 0);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function ajouter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const url = String(f.get("url") || "").trim();
    if (!/^https:\/\//.test(url)) return setMessage("L'adresse du flux doit commencer par https://");
    const { error } = await supabase.from("bd_job_sources").insert({ name: String(f.get("name") || "").trim(), url, country: String(f.get("country") || "").trim() || null });
    setMessage(error ? "Ajout impossible (flux déjà présent ?)." : "Source ajoutée.");
    if (!error) form.reset();
    charger();
  }

  async function collecter() {
    setOccupe(true);
    setMessage("");
    try {
      const res = await fetch("/api/cron/offres", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error();
      const nouvelles = (json.sources ?? []).reduce((s: number, x: { nouvelles: number }) => s + x.nouvelles, 0);
      setMessage(`Collecte terminée : ${nouvelles} nouvelle(s) offre(s), ${json.correspondances} correspondance(s) avec des CV.`);
    } catch {
      setMessage("La collecte a échoué.");
    }
    setOccupe(false);
    charger();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sources d&apos;offres</h1>
          <p className="mt-1 text-muted">
            Flux RSS lus chaque jour, standardisés dans un tableau unique puis comparés aux CV. {nbOffres !== null && `${nbOffres} offre(s) en base.`}
          </p>
        </div>
        <button onClick={collecter} disabled={occupe} className="btn-primary">{occupe ? "Collecte en cours…" : "Lancer la collecte maintenant"}</button>
      </div>
      {message && <p role="status" className="alert-info mt-4">{message}</p>}

      <ul className="mt-6 space-y-2">
        {(sources ?? []).map((s) => (
          <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div className="min-w-0">
              <p className="font-bold">{s.name} {!s.active && <span className="badge-gray ml-1">En pause</span>}</p>
              <p className="truncate text-sm text-muted">{s.url}</p>
              <p className="text-xs text-muted">
                {s.last_fetched_at ? `Dernière lecture : ${dateFr(s.last_fetched_at, true)} — ${s.last_status}` : "Jamais lue"}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={async () => { await supabase.from("bd_job_sources").update({ active: !s.active }).eq("id", s.id); charger(); }} className="btn-ghost">
                {s.active ? "Mettre en pause" : "Réactiver"}
              </button>
              <button onClick={async () => { if (window.confirm(`Supprimer la source « ${s.name} » ?`)) { await supabase.from("bd_job_sources").delete().eq("id", s.id); charger(); } }} className="btn-danger">
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={ajouter} className="card mt-6 space-y-4">
        <h2 className="text-lg font-bold">Ajouter un flux RSS</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="label">Nom de la source</span><input name="name" required className="input" /></label>
          <label className="block"><span className="label">Pays ou zone</span><input name="country" className="input" placeholder="Bénin" /></label>
        </div>
        <label className="block"><span className="label">Adresse du flux</span><input name="url" type="url" required className="input" placeholder="https://exemple.com/feed/" /></label>
        <button type="submit" className="btn-primary">Ajouter la source</button>
      </form>
    </>
  );
}
