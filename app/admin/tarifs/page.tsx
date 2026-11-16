"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NIVEAUX_REDACTION, ORDRE_URGENCES, fcfa, prixRelecture, type RelectureSettings } from "@/lib/pricing";

type Element = { code: string; label: string; price: number; active: boolean; position: number };

function Nombre({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input type="number" min={0} step={step} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} className="input" />
    </label>
  );
}

export default function AdminTarifs() {
  const supabase = useMemo(() => createClient(), []);
  const [relecture, setRelecture] = useState<RelectureSettings | null>(null);
  const [redaction, setRedaction] = useState<Record<string, number>>({});
  const [cv, setCv] = useState<Record<string, number>>({ refonte: 0, adaptation: 0 });
  const [paiement, setPaiement] = useState<{ mode: string }>({ mode: "test" });
  const [elements, setElements] = useState<Element[]>([]);
  const [message, setMessage] = useState("");

  const charger = useCallback(async () => {
    const [{ data: s }, { data: e }] = await Promise.all([
      supabase.from("bd_settings").select("key,value"),
      supabase.from("bd_bp_items").select("code,label,price,active,position").order("position"),
    ]);
    const m = Object.fromEntries((s ?? []).map((r) => [r.key, r.value]));
    setRelecture(m.relecture);
    setRedaction(m.redaction ?? {});
    setCv(m.cv ?? { refonte: 0, adaptation: 0 });
    setPaiement(m.paiement ?? { mode: "test" });
    setElements((e as Element[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function enregistrer() {
    if (!relecture) return;
    if (relecture.prix_min <= 0 || relecture.prix_ref <= relecture.prix_min || relecture.mots_ref < 2 || relecture.arrondi < 1) {
      return setMessage("Tarif de relecture incohérent : le prix de référence doit dépasser le prix minimum.");
    }
    setMessage("Enregistrement…");
    const maintenant = new Date().toISOString();
    const r1 = await supabase.from("bd_settings").upsert([
      { key: "relecture", value: relecture, updated_at: maintenant },
      { key: "redaction", value: redaction, updated_at: maintenant },
      { key: "cv", value: cv, updated_at: maintenant },
      { key: "paiement", value: paiement, updated_at: maintenant },
    ]);
    const r2 = await Promise.all(elements.map((e) => supabase.from("bd_bp_items").update({ price: e.price, active: e.active }).eq("code", e.code)));
    setMessage(r1.error || r2.some((r) => r.error) ? "Une partie de l'enregistrement a échoué." : "Tarifs enregistrés. Les pages publiques se mettent à jour en quelques minutes.");
  }

  if (!relecture) return <p className="text-muted">Chargement…</p>;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">Tarifs</h1>
        <button onClick={enregistrer} className="btn-primary">Enregistrer les tarifs</button>
      </div>
      {message && <p role="status" className="alert-info mt-4">{message}</p>}

      <section className="card mt-6">
        <h2 className="text-lg font-bold">Relecture et correction (tarif dégressif)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <Nombre label="Prix minimum (1 mot)" value={relecture.prix_min} onChange={(n) => setRelecture({ ...relecture, prix_min: n })} />
          <Nombre label="Mots de référence" value={relecture.mots_ref} onChange={(n) => setRelecture({ ...relecture, mots_ref: n })} />
          <Nombre label="Prix à la référence" value={relecture.prix_ref} onChange={(n) => setRelecture({ ...relecture, prix_ref: n })} />
          <Nombre label="Arrondi" value={relecture.arrondi} onChange={(n) => setRelecture({ ...relecture, arrondi: n })} />
        </div>
        <h3 className="mt-5 font-bold">Coefficients de délai</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-4">
          {ORDRE_URGENCES.filter((u) => relecture.urgences[u]).map((u) => (
            <Nombre key={u} label={relecture.urgences[u].label} step={0.05} value={relecture.urgences[u].coef}
              onChange={(n) => setRelecture({ ...relecture, urgences: { ...relecture.urgences, [u]: { ...relecture.urgences[u], coef: n } } })} />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Aperçu en délai standard : 1 000 mots → {fcfa(prixRelecture(1000, "standard", relecture))} · 5 000 → {fcfa(prixRelecture(5000, "standard", relecture))} · 20 000 →{" "}
          {fcfa(prixRelecture(20000, "standard", relecture))} · 40 000 → {fcfa(prixRelecture(40000, "standard", relecture))}
        </p>
      </section>

      <section className="card mt-5">
        <h2 className="text-lg font-bold">Assistance à la rédaction</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {NIVEAUX_REDACTION.map((n) => (
            <Nombre key={n.code} label={n.label} value={redaction[n.code] ?? 0} onChange={(v) => setRedaction({ ...redaction, [n.code]: v })} />
          ))}
        </div>
      </section>

      <section className="card mt-5">
        <h2 className="text-lg font-bold">CV</h2>
        <p className="text-sm text-muted">À 0, le service est inclus et démarre sans paiement.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Nombre label="Refonte de CV" value={cv.refonte ?? 0} onChange={(v) => setCv({ ...cv, refonte: v })} />
          <Nombre label="Adaptation à une offre" value={cv.adaptation ?? 0} onChange={(v) => setCv({ ...cv, adaptation: v })} />
        </div>
      </section>

      <section className="card mt-5">
        <h2 className="text-lg font-bold">Business plan — prix par élément</h2>
        <ul className="mt-3 divide-y divide-line">
          {elements.map((e, i) => (
            <li key={e.code} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={e.active} onChange={(ev) => setElements(elements.map((x, j) => (j === i ? { ...x, active: ev.target.checked } : x)))} className="h-5 w-5 accent-[var(--color-brand)]" />
                {e.label}
              </label>
              <input aria-label={`Prix : ${e.label}`} type="number" min={0} step={500} value={e.price}
                onChange={(ev) => setElements(elements.map((x, j) => (j === i ? { ...x, price: Number(ev.target.value) } : x)))} className="input !w-36" />
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-5">
        <h2 className="text-lg font-bold">Paiement</h2>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paiement.mode === "test"} onChange={(e) => setPaiement({ mode: e.target.checked ? "test" : "attente" })} className="h-5 w-5 accent-[var(--color-brand)]" />
          Mode test actif (le bouton « Payer » simule un paiement réussi, sans débit)
        </label>
      </section>

      <button onClick={enregistrer} className="btn-primary mt-6 w-full">Enregistrer les tarifs</button>
    </>
  );
}
