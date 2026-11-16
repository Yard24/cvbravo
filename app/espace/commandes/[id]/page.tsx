"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import { fcfa } from "@/lib/pricing";
import { SERVICES, STATUTS_COMMANDE, dateFr, type Order } from "@/lib/types";

const LIBELLES: Record<string, string> = {
  urgence: "Délai", mots: "Nombre de mots", fichier: "Fichier", niveau: "Niveau", sujet: "Sujet", filiere: "Filière",
  etablissement: "Établissement", echeance: "Date de dépôt prévue", precisions: "Précisions", projet: "Projet", secteur: "Secteur", modele: "Modèle",
};
const VALEURS: Record<string, string> = {
  standard: "Standard (plus de 7 jours)", "7j": "Moins de 7 jours", "3j": "Moins de 3 jours", "12h": "Moins de 12 heures",
  licence: "Licence", master_pro: "Master professionnel", master_recherche: "Master de recherche",
};

export default function Commande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const { rafraichirNotifs } = useEspace();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [modeTest, setModeTest] = useState(false);
  const [paiement, setPaiement] = useState(false);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async () => {
    const [{ data }, { data: s }] = await Promise.all([
      supabase.from("bd_orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("bd_settings").select("value").eq("key", "paiement").maybeSingle(),
    ]);
    setOrder((data as Order) ?? null);
    setModeTest(s?.value?.mode === "test");
  }, [supabase, id]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function payer() {
    setPaiement(true);
    setErreur("");
    const { error } = await supabase.rpc("bd_pay_test", { p_order: id });
    setPaiement(false);
    if (error) return setErreur("Le paiement n'a pas abouti. Réessayez.");
    await charger();
    rafraichirNotifs();
  }

  async function telecharger() {
    if (!order?.deliverable_path) return;
    const { data, error } = await supabase.storage.from("bd-documents").createSignedUrl(order.deliverable_path, 300);
    if (error || !data) return setErreur("Téléchargement impossible pour le moment. Réessayez.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (order === undefined) return <p className="text-muted">Chargement…</p>;
  if (order === null) return <p className="alert-error">Commande introuvable. <Link href="/espace/commandes" className="font-semibold underline">Retour</Link></p>;

  const details = Object.entries(order.details ?? {}).filter(([k, v]) => LIBELLES[k] && v);
  const elements: { code: string; label: string; prix: number }[] = order.details?.elements_detail ?? [];

  return (
    <>
      <Link href="/espace/commandes" className="text-sm font-semibold text-brand">← Mes commandes</Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{SERVICES[order.service]}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{order.title}</h1>
          <p className="mt-1 text-sm text-muted">Commande du {dateFr(order.created_at, true)}</p>
        </div>
        <span className={STATUTS_COMMANDE[order.status].ton}>{STATUTS_COMMANDE[order.status].label}</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="card">
          <h2 className="text-lg font-bold">Détail</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            {details.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 py-2">
                <dt className="text-muted">{LIBELLES[k]}</dt>
                <dd className="whitespace-pre-line break-words">{VALEURS[String(v)] ?? (k === "mots" ? new Intl.NumberFormat("fr-FR").format(Number(v)) : String(v))}</dd>
              </div>
            ))}
          </dl>
          {elements.length > 0 && (
            <>
              <h3 className="mt-4 font-bold">Éléments commandés</h3>
              <ul className="mt-2 divide-y divide-line text-sm">
                {elements.map((e) => (
                  <li key={e.code} className="flex justify-between gap-3 py-2">
                    <span>{e.label}</span>
                    <span className="tabular-nums text-muted">{fcfa(e.prix)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {order.admin_note && (
            <div className="alert-info mt-4">
              <p className="font-semibold">Message de l&apos;équipe</p>
              <p className="whitespace-pre-line">{order.admin_note}</p>
            </div>
          )}
        </section>

        <aside className="card h-fit">
          <p className="text-sm text-muted">Total</p>
          <p className="display text-3xl font-bold tabular-nums">{order.amount > 0 ? fcfa(order.amount) : "Inclus"}</p>
          {erreur && <p role="alert" className="alert-error mt-3">{erreur}</p>}

          {order.status === "en_attente_paiement" && (
            <div className="mt-4">
              {modeTest ? (
                <>
                  <p className="alert-info">Mode test : aucun argent n&apos;est débité. Ce bouton simule un paiement réussi.</p>
                  <button onClick={payer} disabled={paiement} className="btn-primary mt-3 w-full">
                    {paiement ? "Paiement…" : `Payer ${fcfa(order.amount)} (test)`}
                  </button>
                </>
              ) : (
                <p className="alert-info">Le paiement en ligne est en cours d&apos;activation. Notre équipe vous contacte pour le règlement.</p>
              )}
            </div>
          )}
          {order.status === "payee" && <p className="alert-ok mt-4">Paiement reçu le {dateFr(order.paid_at, true)}. Votre commande est dans la file de production.</p>}
          {order.status === "en_cours" && <p className="alert-ok mt-4">Notre équipe travaille sur votre document.</p>}
          {order.status === "livree" && (
            <div className="mt-4">
              <p className="alert-ok">Livrée le {dateFr(order.delivered_at, true)}.</p>
              {order.deliverable_path && <button onClick={telecharger} className="btn-primary mt-3 w-full">Télécharger mon document</button>}
            </div>
          )}
          {(order.service === "cv_refonte" || order.service === "cv_adaptation") && order.details?.cv_id && (
            <Link href={`/espace/cv/${order.details.cv_id}`} className="btn-ghost mt-3 w-full">Ouvrir le CV</Link>
          )}
        </aside>
      </div>
    </>
  );
}
