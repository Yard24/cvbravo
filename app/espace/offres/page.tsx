"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { dateFr, type Offer } from "@/lib/types";

type Match = { id: string; cv_id: string | null; offer_id: string; score: number; matched_keywords: string[]; status: string; created_at: string; offer: Offer };

export default function Offres() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [postulees, setPostulees] = useState<Set<string>>(new Set());
  const [cvs, setCvs] = useState<{ id: string; title: string; use_for_matching?: boolean }[]>([]);
  const cvPrincipal = (cvs.find((c) => c.use_for_matching !== false) ?? cvs[0])?.id ?? null;
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState("");

  const charger = useCallback(async () => {
    const [m, a, c] = await Promise.all([
      supabase.from("bd_job_matches").select("*, offer:bd_job_offers(*)").neq("status", "ignore").order("score", { ascending: false }).limit(100),
      supabase.from("bd_applications").select("offer_id"),
      supabase.from("bd_cvs").select("*").is("parent_cv_id", null).order("updated_at", { ascending: false }).limit(20),
    ]);
    setMatches(((m.data as Match[]) ?? []).filter((x) => x.offer));
    setPostulees(new Set((a.data ?? []).map((x) => x.offer_id)));
    setCvs(c.data ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function rechercher() {
    setOccupe("recherche");
    setMessage("");
    const { data, error } = await supabase.rpc("bd_match_my_cvs");
    setOccupe("");
    setMessage(error ? "La recherche a échoué. Réessayez." : data > 0 ? `${data} nouvelle(s) offre(s) trouvée(s).` : "Pas de nouvelle offre pour l'instant. Nous continuons à chercher chaque jour.");
    charger();
  }

  async function basculerCv(id: string, actuel: boolean) {
    const { error } = await supabase.from("bd_cvs").update({ use_for_matching: !actuel }).eq("id", id);
    if (error) return setMessage("La mise à jour a échoué. Réessayez.");
    setCvs((xs) => xs.map((c) => (c.id === id ? { ...c, use_for_matching: !actuel } : c)));
  }

  async function adapter(m: Match) {
    const cv = m.cv_id ?? cvPrincipal;
    if (!cv) return setMessage("Déposez d'abord un CV.");
    setOccupe(m.id);
    const { error } = await supabase.rpc("bd_prepare_application", { p_offer_id: m.offer_id, p_cv_id: cv });
    setOccupe("");
    if (error) return setMessage("La préparation de la candidature a échoué. Réessayez.");
    router.push("/espace/candidatures");
  }

  async function marquer(m: Match, status: "vu" | "ignore") {
    await supabase.from("bd_job_matches").update({ status }).eq("id", m.id);
    if (status === "ignore") setMatches((xs) => (xs ?? []).filter((x) => x.id !== m.id));
    else setMatches((xs) => (xs ?? []).map((x) => (x.id === m.id ? { ...x, status } : x)));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Offres pour vous</h1>
          <p className="mt-1 text-muted">Les offres publiées sont comparées à votre CV chaque jour.</p>
        </div>
        <button onClick={rechercher} disabled={occupe === "recherche" || !cvPrincipal} className="btn-ghost">
          {occupe === "recherche" ? "Recherche…" : "Rechercher maintenant"}
        </button>
      </div>
      {message && <p role="status" className="alert-info mt-4">{message}</p>}

      {cvs.length > 0 && cvs[0].use_for_matching !== undefined && (
        <fieldset className="card mt-5">
          <legend className="sr-only">CV utilisés pour la recherche</legend>
          <p className="font-bold">CV utilisés pour chercher des offres</p>
          <p className="text-sm text-muted">Cochez les CV de votre espace à comparer aux offres, ou déposez-en un nouveau.</p>
          <div className="mt-3 space-y-2">
            {cvs.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-2xl bg-tile px-4 py-3 text-sm">
                <input type="checkbox" checked={c.use_for_matching !== false} onChange={() => basculerCv(c.id, c.use_for_matching !== false)} className="h-5 w-5 accent-[var(--color-brand)]" />
                <span className="min-w-0 flex-1 truncate font-medium">{c.title}</span>
              </label>
            ))}
          </div>
          <Link href="/espace/cv" className="mt-3 inline-block text-sm font-semibold text-brand">Déposer un autre CV →</Link>
        </fieldset>
      )}

      {matches === null ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : !cvPrincipal ? (
        <div className="card mt-6">
          <h2 className="text-lg font-bold">Commencez par déposer votre CV</h2>
          <p className="mt-1 text-sm text-muted">C&apos;est lui que nous comparons aux offres d&apos;emploi.</p>
          <Link href="/espace/cv" className="btn-primary mt-4">Déposer mon CV</Link>
        </div>
      ) : matches.length === 0 ? (
        <p className="card mt-6 text-sm text-muted">
          Aucune offre ne correspond encore à votre CV. Vous recevrez une notification dès qu&apos;une offre adaptée est
          publiée. Astuce : un CV avec un titre précis et des compétences détaillées trouve plus d&apos;offres.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {matches.map((m) => {
            const deja = postulees.has(m.offer_id);
            return (
              <li key={m.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-bold">{m.offer.title}</h2>
                  <div className="flex gap-1.5">
                    {m.status === "nouveau" && <span className="badge-amber">Nouveau</span>}
                    {deja && <span className="badge-green">Candidature en cours</span>}
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {[m.offer.company, m.offer.location, m.offer.published_at ? `publiée le ${dateFr(m.offer.published_at)}` : null].filter(Boolean).join(" · ")}
                </p>
                {m.offer.description && <p className="mt-2 line-clamp-3 text-sm">{m.offer.description}</p>}
                {m.matched_keywords?.length > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    Points communs avec votre CV : <span className="font-medium text-ink">{m.matched_keywords.slice(0, 8).join(", ")}</span>
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={m.offer.url} target="_blank" rel="noopener noreferrer" onClick={() => m.status === "nouveau" && marquer(m, "vu")} className="btn-ghost">
                    Voir l&apos;offre
                  </a>
                  {deja ? (
                    <Link href="/espace/candidatures" className="btn-primary">Suivre ma candidature</Link>
                  ) : (
                    <button onClick={() => adapter(m)} disabled={occupe === m.id} className="btn-primary">
                      {occupe === m.id ? "Préparation…" : "Adapter mon CV et postuler"}
                    </button>
                  )}
                  {!deja && <button onClick={() => marquer(m, "ignore")} className="btn-ghost">Ignorer</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
