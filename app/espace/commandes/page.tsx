"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fcfa } from "@/lib/pricing";
import { STATUTS_COMMANDE, dateFr, type Order } from "@/lib/types";

export default function Commandes() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    supabase.from("bd_orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [supabase]);

  return (
    <>
      <h1 className="text-3xl font-extrabold">Mes commandes</h1>
      <p className="mt-1 text-muted">Paiement, avancement et documents livrés.</p>
      {orders === null ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : orders.length === 0 ? (
        <div className="card mt-6">
          <p className="text-sm text-muted">Vous n&apos;avez pas encore passé de commande.</p>
          <Link href="/espace" className="btn-primary mt-4">Choisir un service</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/espace/commandes/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 !p-4 hover:border-brand">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{o.title}</span>
                  <span className="text-sm text-muted">Passée le {dateFr(o.created_at)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={STATUTS_COMMANDE[o.status].ton}>{STATUTS_COMMANDE[o.status].label}</span>
                  <span className="display font-bold tabular-nums">{o.amount > 0 ? fcfa(o.amount) : "Inclus"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
