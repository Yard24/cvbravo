"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import { dateFr } from "@/lib/types";

const ACTIONS = [
  { href: "/espace/cv", titre: "Refaire mon CV", texte: "Déposez votre CV, choisissez un modèle, recevez les offres adaptées." },
  { href: "/espace/memoires/relecture", titre: "Faire corriger un mémoire", texte: "Déposez le document : le prix s'affiche selon le nombre de mots." },
  { href: "/espace/memoires/redaction", titre: "Être accompagné pour rédiger", texte: "Licence, master professionnel ou master de recherche." },
  { href: "/espace/business-plan", titre: "Commander un business plan", texte: "Cochez les éléments voulus, nous rédigeons." },
];

export default function TableauDeBord() {
  const supabase = useMemo(() => createClient(), []);
  const { profil } = useEspace();
  const [stats, setStats] = useState<{ offres: number; cvs: number; commandes: number; candidatures: number } | null>(null);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const compter = (table: string, f?: (q: any) => any) => {
        let q = supabase.from(table).select("id", { count: "exact", head: true });
        if (f) q = f(q);
        return q.then((r: any) => r.count ?? 0);
      };
      const [offres, cvs, commandes, candidatures, n] = await Promise.all([
        compter("bd_job_matches", (q) => q.eq("status", "nouveau")),
        compter("bd_cvs", (q) => q.is("parent_cv_id", null)),
        compter("bd_orders", (q) => q.in("status", ["en_attente_paiement", "payee", "en_cours"])),
        compter("bd_applications"),
        supabase.from("bd_notifications").select("*").order("created_at", { ascending: false }).limit(4),
      ]);
      setStats({ offres, cvs, commandes, candidatures });
      setNotifs(n.data ?? []);
    })();
  }, [supabase]);

  const prenom = profil.full_name?.trim().split(/\s+/)[0];
  const tuiles = [
    { href: "/espace/offres", label: "Nouvelles offres pour vous", n: stats?.offres },
    { href: "/espace/candidatures", label: "Candidatures suivies", n: stats?.candidatures },
    { href: "/espace/commandes", label: "Commandes en cours", n: stats?.commandes },
    { href: "/espace/cv", label: "CV enregistrés", n: stats?.cvs },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold">Bonjour{prenom ? ` ${prenom}` : ""}.</h1>
      <p className="mt-1 text-muted">Voici où en sont vos documents et vos candidatures.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tuiles.map((t) => (
          <Link key={t.href} href={t.href} className="card !p-4 hover:border-brand">
            <p className="display text-3xl font-bold tabular-nums text-brand">{t.n ?? "–"}</p>
            <p className="mt-1 text-sm text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-9 text-xl font-bold">Que voulez-vous faire ?</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="card flex items-center justify-between gap-4 hover:border-brand">
            <span>
              <span className="block font-bold">{a.titre}</span>
              <span className="mt-0.5 block text-sm text-muted">{a.texte}</span>
            </span>
            <span aria-hidden className="text-xl text-brand">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-9 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">Dernières notifications</h2>
        <Link href="/espace/notifications" className="text-sm font-semibold text-brand">Tout voir</Link>
      </div>
      {notifs.length === 0 ? (
        <p className="card mt-3 text-sm text-muted">
          Rien pour l&apos;instant. Déposez votre CV pour recevoir ici les offres qui vous correspondent.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {notifs.map((n) => (
            <li key={n.id}>
              <Link href={n.link || "/espace/notifications"} className="card flex items-start justify-between gap-3 !p-4 hover:border-brand">
                <span>
                  <span className="block font-semibold">{n.title}</span>
                  {n.body && <span className="block text-sm text-muted">{n.body}</span>}
                </span>
                <span className="shrink-0 text-xs text-muted">{dateFr(n.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
