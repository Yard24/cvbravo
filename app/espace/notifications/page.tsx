"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import { dateFr } from "@/lib/types";

type Notif = { id: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

export default function Notifications() {
  const supabase = useMemo(() => createClient(), []);
  const { rafraichirNotifs } = useEspace();
  const [items, setItems] = useState<Notif[] | null>(null);

  const charger = useCallback(async () => {
    const { data } = await supabase.from("bd_notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setItems((data as Notif[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function lire(ids: string[]) {
    if (!ids.length) return;
    await supabase.from("bd_notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    charger();
    rafraichirNotifs();
  }

  const nonLues = (items ?? []).filter((n) => !n.read_at);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {nonLues.length > 0 && <button onClick={() => lire(nonLues.map((n) => n.id))} className="btn-ghost">Tout marquer comme lu</button>}
      </div>
      {items === null ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="card mt-6 text-sm text-muted">Aucune notification. Les nouvelles offres et l&apos;avancement de vos commandes apparaîtront ici.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={n.link || "/espace"} onClick={() => !n.read_at && lire([n.id])}
                className={`card flex items-start justify-between gap-3 !p-4 hover:border-brand ${n.read_at ? "" : "border-brand/50 bg-brand-soft/40"}`}>
                <span>
                  <span className="block font-semibold">{!n.read_at && <span className="sr-only">Non lue : </span>}{n.title}</span>
                  {n.body && <span className="block text-sm text-muted">{n.body}</span>}
                </span>
                <span className="shrink-0 text-xs text-muted">{dateFr(n.created_at, true)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
