"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fcfa } from "@/lib/pricing";

type Element = { code: string; label: string; description: string | null; price: number };

export default function BusinessPlan() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [elements, setElements] = useState<Element[] | null>(null);
  const [choix, setChoix] = useState<Set<string>>(new Set());
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    supabase.from("bd_bp_items").select("code,label,description,price").eq("active", true).order("position").then(({ data }) => setElements(data ?? []));
  }, [supabase]);

  const total = (elements ?? []).filter((e) => choix.has(e.code)).reduce((s, e) => s + e.price, 0);
  const basculer = (code: string) =>
    setChoix((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (choix.size === 0) return setErreur("Cochez au moins un élément.");
    const f = new FormData(e.currentTarget);
    setEnvoi(true);
    setErreur("");
    const { data, error } = await supabase.rpc("bd_create_order", {
      p_service: "business_plan",
      p_details: { elements: [...choix], projet: String(f.get("projet") || "").trim(), secteur: String(f.get("secteur") || "").trim(), precisions: String(f.get("precisions") || "").trim() },
    });
    setEnvoi(false);
    if (error || !data) return setErreur("La commande n'a pas pu être créée. Réessayez.");
    router.push(`/espace/commandes/${data.id}`);
  }

  return (
    <form onSubmit={soumettre} className="pb-28">
      <h1 className="text-3xl font-extrabold">Composer mon business plan</h1>
      <p className="mt-1 text-muted">Cochez les éléments à inclure. Le total se met à jour à chaque case.</p>

      <fieldset className="mt-6">
        <legend className="text-lg font-bold">1. Les éléments de votre plan</legend>
        {elements === null ? (
          <p className="mt-3 text-muted">Chargement…</p>
        ) : (
          <>
            <div className="mt-2 flex gap-4 text-sm font-semibold text-brand">
              <button type="button" onClick={() => setChoix(new Set(elements.map((e) => e.code)))}>Tout cocher</button>
              <button type="button" onClick={() => setChoix(new Set())}>Tout décocher</button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {elements.map((e) => (
                <label key={e.code} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${choix.has(e.code) ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                  <input type="checkbox" checked={choix.has(e.code)} onChange={() => basculer(e.code)} className="mt-1 h-5 w-5 accent-[var(--color-brand)]" />
                  <span className="flex-1">
                    <span className="block font-semibold">{e.label}</span>
                    {e.description && <span className="block text-sm text-muted">{e.description}</span>}
                  </span>
                  <span className="display shrink-0 font-bold tabular-nums">{fcfa(e.price)}</span>
                </label>
              ))}
            </div>
          </>
        )}
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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <div aria-live="polite">
            <p className="text-sm text-muted">{choix.size} élément(s) coché(s)</p>
            <p className="display text-2xl font-extrabold tabular-nums">{fcfa(total)}</p>
          </div>
          <button type="submit" disabled={envoi || choix.size === 0} className="btn-primary">{envoi ? "Création…" : "Valider et passer au paiement"}</button>
          {erreur && <p role="alert" className="alert-error w-full">{erreur}</p>}
        </div>
      </div>
    </form>
  );
}
