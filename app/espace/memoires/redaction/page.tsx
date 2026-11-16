"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NIVEAUX_REDACTION, fcfa } from "@/lib/pricing";

function Formulaire() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const initial = useSearchParams().get("niveau");
  const [prix, setPrix] = useState<Record<string, number>>({ licence: 100000, master_pro: 180000, master_recherche: 250000 });
  const [niveau, setNiveau] = useState(NIVEAUX_REDACTION.some((n) => n.code === initial) ? initial! : "licence");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    supabase.from("bd_settings").select("value").eq("key", "redaction").maybeSingle().then(({ data }) => data?.value && setPrix(data.value));
  }, [supabase]);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const champ = (k: string) => String(f.get(k) || "").trim();
    setEnvoi(true);
    setErreur("");
    const { data, error } = await supabase.rpc("bd_create_order", {
      p_service: "redaction",
      p_details: { niveau, sujet: champ("sujet"), filiere: champ("filiere"), etablissement: champ("etablissement"), echeance: champ("echeance"), precisions: champ("precisions") },
    });
    setEnvoi(false);
    if (error || !data) return setErreur("La demande n'a pas pu être créée. Réessayez.");
    router.push(`/espace/commandes/${data.id}`);
  }

  return (
    <form onSubmit={soumettre}>
      <fieldset className="card mt-6">
        <legend className="sr-only">Niveau</legend>
        <h2 className="text-lg font-bold">1. Votre niveau</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {NIVEAUX_REDACTION.map((n) => (
            <label key={n.code} className={`cursor-pointer rounded-xl border-2 p-4 ${niveau === n.code ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
              <input type="radio" name="niveau" value={n.code} checked={niveau === n.code} onChange={() => setNiveau(n.code)} className="sr-only" />
              <span className="block font-bold">{n.label}</span>
              <span className="block text-sm text-muted">{n.detail}</span>
              <span className="display mt-2 block text-xl font-bold tabular-nums">{fcfa(prix[n.code])}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="card mt-5 space-y-4">
        <h2 className="text-lg font-bold">2. Votre mémoire</h2>
        <label className="block">
          <span className="label">Sujet ou thème (même provisoire)</span>
          <input name="sujet" required maxLength={300} className="input" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Filière</span>
            <input name="filiere" required maxLength={150} className="input" placeholder="Ex. Finance comptabilité" />
          </label>
          <label className="block">
            <span className="label">Établissement</span>
            <input name="etablissement" maxLength={150} className="input" />
          </label>
        </div>
        <label className="block">
          <span className="label">Date de dépôt prévue</span>
          <input name="echeance" type="date" className="input" />
        </label>
        <label className="block">
          <span className="label">Où en êtes-vous ? (facultatif)</span>
          <textarea name="precisions" rows={4} maxLength={2000} className="input" placeholder="Sujet validé ou non, plan existant, données déjà collectées, consignes de votre directeur…" />
        </label>
        <p className="text-sm text-muted">
          L&apos;accompagnement couvre la problématique, le plan, la méthodologie, la recherche documentaire et la relecture
          de chaque chapitre. Vous restez l&apos;auteur de votre mémoire.
        </p>
      </section>

      <section className="card mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{NIVEAUX_REDACTION.find((n) => n.code === niveau)?.label}</p>
          <p className="display text-3xl font-bold tabular-nums">{fcfa(prix[niveau])}</p>
        </div>
        <button type="submit" disabled={envoi} className="btn-primary">{envoi ? "Création…" : "Valider et passer au paiement"}</button>
        {erreur && <p role="alert" className="alert-error w-full">{erreur}</p>}
      </section>
    </form>
  );
}

export default function Redaction() {
  return (
    <>
      <h1 className="text-3xl font-bold">Assistance à la rédaction de mémoire</h1>
      <p className="mt-1 text-muted">Un accompagnement du sujet à la soutenance, au tarif de votre niveau.</p>
      <Suspense>
        <Formulaire />
      </Suspense>
    </>
  );
}
