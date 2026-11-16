"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fcfa } from "@/lib/pricing";
import { SERVICES, STATUTS_COMMANDE, dateFr, type Order } from "@/lib/types";

const FILTRES: { code: string; label: string }[] = [
  { code: "a_traiter", label: "À traiter" },
  { code: "en_attente_paiement", label: "Non payées" },
  { code: "livree", label: "Livrées" },
  { code: "toutes", label: "Toutes" },
];

export default function AdminCommandes() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filtre, setFiltre] = useState("a_traiter");

  useEffect(() => {
    supabase.from("bd_orders").select("*").order("created_at", { ascending: false }).limit(500).then(({ data }) => setOrders((data as Order[]) ?? []));
  }, [supabase]);

  const visibles = (orders ?? []).filter((o) =>
    filtre === "toutes" ? true : filtre === "a_traiter" ? ["payee", "en_cours"].includes(o.status) && !o.service.startsWith("cv_") : o.status === filtre
  );
  const encaisse = (orders ?? []).filter((o) => ["payee", "en_cours", "livree"].includes(o.status)).reduce((s, o) => s + o.amount, 0);

  return (
    <>
      <h1 className="text-3xl font-bold">Commandes</h1>
      <p className="mt-1 text-muted">
        {orders ? `${orders.length} commande(s) · ${fcfa(encaisse)} encaissés (paiements de test compris)` : "Chargement…"}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button key={f.code} onClick={() => setFiltre(f.code)} aria-pressed={filtre === f.code}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${filtre === f.code ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
            {f.label}
          </button>
        ))}
      </div>
      {orders && visibles.length === 0 ? (
        <p className="card mt-5 text-sm text-muted">Aucune commande dans cette vue.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {visibles.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/commandes/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 !p-4 hover:border-brand">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{o.title}</span>
                  <span className="text-sm text-muted">{SERVICES[o.service]} · {dateFr(o.created_at, true)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={STATUTS_COMMANDE[o.status].ton}>{STATUTS_COMMANDE[o.status].label}</span>
                  <span className="display font-bold tabular-nums">{fcfa(o.amount)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
