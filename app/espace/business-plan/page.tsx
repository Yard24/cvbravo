"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BpComposer, { CLE_BP } from "@/components/BpComposer";
import { fcfa } from "@/lib/pricing";

export default function BusinessPlan() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [codes, setCodes] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (codes.length === 0) return setErreur("Cochez au moins un élément.");
    const f = new FormData(e.currentTarget);
    setEnvoi(true);
    setErreur("");
    const { data, error } = await supabase.rpc("bd_create_order", {
      p_service: "business_plan",
      p_details: { elements: codes, projet: String(f.get("projet") || "").trim(), secteur: String(f.get("secteur") || "").trim(), precisions: String(f.get("precisions") || "").trim() },
    });
    setEnvoi(false);
    if (error || !data) return setErreur("La commande n'a pas pu être créée. Réessayez.");
    try {
      window.localStorage.removeItem(CLE_BP);
    } catch {
      /* rien à nettoyer */
    }
    router.push(`/espace/commandes/${data.id}`);
  }

  return (
    <form onSubmit={soumettre} className="pb-28">
      <h1 className="text-3xl font-bold">Composer mon business plan</h1>
      <p className="mt-1 text-muted">Cochez les éléments à inclure. Le total se met à jour à chaque case.</p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-lg font-bold">1. Les éléments de votre plan</legend>
        <BpComposer onChange={(c, t) => { setCodes(c); setTotal(t); }} />
      </fieldset>

      <section className="card mt-6 space-y-4">
        <h2 className="text-lg font-bold">2. Votre projet</h2>
        <label className="block">
          <span className="label">Nom du projet ou de l&apos;entreprise</span>
          <input name="projet" required maxLength={200} className="input" />
        </label>
        <label className="block">
          <span className="label">Secteur d&apos;activité</span>
          <input name="secteur" required maxLength={150} className="input" placeholder="Ex. Transformation agroalimentaire" />
        </label>
        <label className="block">
          <span className="label">Décrivez votre projet</span>
          <textarea name="precisions" required rows={5} maxLength={3000} className="input" placeholder="Activité, clients visés, ville, montant recherché, à qui est destiné le dossier (banque, investisseur, concours)…" />
        </label>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/90 backdrop-blur-xl">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <div aria-live="polite">
            <p className="text-sm text-muted">{codes.length} élément(s) coché(s)</p>
            <p className="display text-2xl font-semibold tabular-nums">{fcfa(total)}</p>
          </div>
          <button type="submit" disabled={envoi || codes.length === 0} className="btn-primary">{envoi ? "Création…" : "Valider et passer au paiement"}</button>
          {erreur && <p role="alert" className="alert-error w-full">{erreur}</p>}
        </div>
      </div>
    </form>
  );
}
