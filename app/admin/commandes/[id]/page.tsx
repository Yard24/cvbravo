"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import { fcfa } from "@/lib/pricing";
import { SERVICES, STATUTS_COMMANDE, dateFr, type Order } from "@/lib/types";

export default function AdminCommande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const { profil } = useEspace();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [client, setClient] = useState<{ full_name: string | null; phone: string | null } | null>(null);
  const [docPath, setDocPath] = useState<{ storage_path: string; file_name: string } | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  const charger = useCallback(async () => {
    const { data } = await supabase.from("bd_orders").select("*").eq("id", id).maybeSingle();
    const o = (data as Order) ?? null;
    setOrder(o);
    if (!o) return;
    setNote(o.admin_note ?? "");
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("bd_profiles").select("full_name,phone").eq("id", o.user_id).maybeSingle(),
      o.document_id ? supabase.from("bd_documents").select("storage_path,file_name").eq("id", o.document_id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setClient(p);
    setDocPath(d);
  }, [supabase, id]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function ouvrir(path: string) {
    const { data, error } = await supabase.storage.from("bd-documents").createSignedUrl(path, 300);
    if (error || !data) return setMessage("Téléchargement impossible.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function maj(patch: Partial<Order>, texte: string) {
    setOccupe(true);
    const { error } = await supabase.from("bd_orders").update(patch).eq("id", id);
    setOccupe(false);
    setMessage(error ? "La mise à jour a échoué." : texte);
    charger();
  }

  async function livrer(file: File | undefined) {
    if (!file || !order) return;
    setOccupe(true);
    setMessage("");
    const propre = file.name.normalize("NFD").replace(/[^\w.\-]+/g, "_").slice(-80);
    const path = `${order.user_id}/livrables/${order.id}/${Date.now()}-${propre}`;
    const { error } = await supabase.storage.from("bd-documents").upload(path, file, { contentType: file.type || undefined });
    if (error) {
      setOccupe(false);
      return setMessage("L'envoi du livrable a échoué.");
    }
    await supabase.from("bd_orders").update({ status: "livree", deliverable_path: path, delivered_at: new Date().toISOString(), admin_note: note || null }).eq("id", id);
    await supabase.from("bd_notifications").insert({
      user_id: order.user_id, type: "commande", title: "Votre document est prêt",
      body: `${order.title} — téléchargez-le depuis votre commande.`, link: `/espace/commandes/${order.id}`,
    });
    setOccupe(false);
    setMessage("Commande livrée, client notifié.");
    charger();
  }

  if (order === undefined) return <p className="text-muted">Chargement…</p>;
  if (order === null) return <p className="alert-error">Commande introuvable.</p>;

  return (
    <>
      <Link href="/admin" className="text-sm font-semibold text-brand">← Commandes</Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{SERVICES[order.service]}</p>
          <h1 className="mt-1 text-2xl font-bold">{order.title}</h1>
          <p className="mt-1 text-sm text-muted">{dateFr(order.created_at, true)} · {fcfa(order.amount)}</p>
        </div>
        <span className={STATUTS_COMMANDE[order.status].ton}>{STATUTS_COMMANDE[order.status].label}</span>
      </div>
      {message && <p role="status" className="alert-info mt-4">{message}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold">Client</h2>
          <p className="mt-2">{client?.full_name || "Nom non renseigné"}</p>
          <p className="text-sm text-muted">{client?.phone || "Téléphone non renseigné"}</p>
          <h2 className="mt-5 text-lg font-bold">Demande</h2>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-stone-50 p-3 text-xs">{JSON.stringify(order.details, null, 2)}</pre>
          {docPath && <button onClick={() => ouvrir(docPath.storage_path)} className="btn-ghost mt-3">Télécharger le document du client ({docPath.file_name})</button>}
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-bold">Traitement</h2>
          <label className="block">
            <span className="label">Message au client (visible sur sa commande)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button disabled={occupe} onClick={() => maj({ admin_note: note || null }, "Message enregistré.")} className="btn-ghost">Enregistrer le message</button>
            {order.status === "payee" && <button disabled={occupe} onClick={() => maj({ status: "en_cours", admin_note: note || null }, "Commande passée en cours.")} className="btn-primary">Démarrer le travail</button>}
            {profil.is_admin && order.status !== "annulee" && order.status !== "livree" && (
              <button disabled={occupe} onClick={() => window.confirm("Annuler cette commande ?") && maj({ status: "annulee" }, "Commande annulée.")} className="btn-danger">Annuler</button>
            )}
          </div>
          {["payee", "en_cours", "livree"].includes(order.status) && (
            <div className="border-t border-line pt-4">
              <label className="label" htmlFor="livrable">{order.status === "livree" ? "Remplacer le livrable" : "Déposer le livrable et livrer"}</label>
              <input id="livrable" type="file" disabled={occupe} onChange={(e) => livrer(e.target.files?.[0])} className="input" />
              {order.deliverable_path && <button onClick={() => ouvrir(order.deliverable_path!)} className="btn-ghost mt-3">Voir le livrable actuel</button>}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
