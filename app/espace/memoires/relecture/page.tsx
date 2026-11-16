"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEspace } from "@/components/EspaceShell";
import FileDrop, { type DocumentAnalyse } from "@/components/FileDrop";
import { ORDRE_URGENCES, RELECTURE_DEFAUT, fcfa, prixRelecture, type RelectureSettings } from "@/lib/pricing";

export default function Relecture() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { userId } = useEspace();
  const [settings, setSettings] = useState<RelectureSettings>(RELECTURE_DEFAUT);
  const [doc, setDoc] = useState<DocumentAnalyse | null>(null);
  const [urgence, setUrgence] = useState("standard");
  const [precisions, setPrecisions] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    supabase.from("bd_settings").select("value").eq("key", "relecture").maybeSingle().then(({ data }) => data?.value && setSettings(data.value));
  }, [supabase]);

  async function valider() {
    if (!doc) return;
    setEnvoi(true);
    setErreur("");
    const { data, error } = await supabase.rpc("bd_create_order", { p_service: "relecture", p_details: { urgence, precisions: precisions.trim() }, p_document_id: doc.id });
    setEnvoi(false);
    if (error || !data) return setErreur("La commande n'a pas pu être créée. Réessayez.");
    router.push(`/espace/commandes/${data.id}`);
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Relecture et correction</h1>
      <p className="mt-1 text-muted">Déposez votre document : nous comptons les mots et le prix s&apos;affiche avant tout paiement.</p>

      <section className="card mt-6">
        <h2 className="text-lg font-bold">1. Votre document</h2>
        <div className="mt-3">
          <FileDrop kind="memoire" userId={userId} titre="Choisir mon mémoire" onDone={setDoc} />
        </div>
      </section>

      {doc && (
        <>
          <fieldset className="card mt-5">
            <legend className="sr-only">Délai de livraison</legend>
            <h2 className="text-lg font-bold">2. Votre délai</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ORDRE_URGENCES.filter((u) => settings.urgences[u]).map((u) => (
                <label key={u} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 ${urgence === u ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                  <span>
                    <input type="radio" name="urgence" value={u} checked={urgence === u} onChange={() => setUrgence(u)} className="sr-only" />
                    <span className="block font-semibold">{settings.urgences[u].label}</span>
                  </span>
                  <span className="display font-bold tabular-nums">{fcfa(prixRelecture(doc.mots, u, settings))}</span>
                </label>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="label">Précisions pour le correcteur (facultatif)</span>
              <textarea value={precisions} onChange={(e) => setPrecisions(e.target.value)} rows={3} maxLength={1500} className="input"
                placeholder="Normes de votre établissement, parties à relire en priorité…" />
            </label>
          </fieldset>

          <section className="card mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{new Intl.NumberFormat("fr-FR").format(doc.mots)} mots · {settings.urgences[urgence]?.label}</p>
              <p className="display text-3xl font-bold tabular-nums">{fcfa(prixRelecture(doc.mots, urgence, settings))}</p>
            </div>
            <button onClick={valider} disabled={envoi} className="btn-primary">{envoi ? "Création…" : "Valider et passer au paiement"}</button>
            {erreur && <p role="alert" className="alert-error w-full">{erreur}</p>}
          </section>
        </>
      )}
    </>
  );
}
