"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fcfa } from "@/lib/pricing";

export type ElementBp = { code: string; label: string; description: string | null; price: number };
export const CLE_BP = "bd_bp_choix";

export function lireChoixBp(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLE_BP) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Liste à cocher des éléments d'un business plan, avec total. Utilisable sans compte. */
export default function BpComposer({ onChange, pied }: { onChange?: (codes: string[], total: number) => void; pied?: (codes: string[], total: number) => React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [elements, setElements] = useState<ElementBp[] | null>(null);
  const [choix, setChoix] = useState<Set<string>>(new Set());
  const [pret, setPret] = useState(false);

  useEffect(() => {
    supabase.from("bd_bp_items").select("code,label,description,price").eq("active", true).order("position").then(({ data }) => setElements(data ?? []));
    setChoix(new Set(lireChoixBp()));
    setPret(true);
  }, [supabase]);

  const codes = (elements ?? []).filter((e) => choix.has(e.code)).map((e) => e.code);
  const total = (elements ?? []).filter((e) => choix.has(e.code)).reduce((s, e) => s + e.price, 0);

  useEffect(() => {
    if (!pret || elements === null) return;
    try {
      window.localStorage.setItem(CLE_BP, JSON.stringify(codes));
    } catch {
      /* stockage indisponible */
    }
    onChange?.(codes, total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choix, elements, pret]);

  const basculer = (code: string) =>
    setChoix((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code);
      else n.add(code);
      return n;
    });

  if (elements === null) return <p className="text-muted">Chargement des éléments…</p>;
  if (elements.length === 0) return <p className="alert-error">Impossible de charger la liste. Vérifiez votre connexion et rechargez la page.</p>;

  return (
    <>
      <div className="flex gap-5 text-sm font-semibold text-brand">
        <button type="button" onClick={() => setChoix(new Set(elements.map((e) => e.code)))}>Tout cocher</button>
        <button type="button" onClick={() => setChoix(new Set())}>Tout décocher</button>
      </div>
      <div className="mt-3 grid gap-2.5 md:grid-cols-2">
        {elements.map((e) => (
          <label key={e.code} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${choix.has(e.code) ? "border-ink bg-tile" : "border-line bg-white"}`}>
            <input type="checkbox" checked={choix.has(e.code)} onChange={() => basculer(e.code)} className="mt-1 h-5 w-5 accent-[var(--color-brand)]" />
            <span className="flex-1">
              <span className="block font-semibold">{e.label}</span>
              {e.description && <span className="block text-sm text-muted">{e.description}</span>}
            </span>
            <span className="display shrink-0 font-semibold tabular-nums">{fcfa(e.price)}</span>
          </label>
        ))}
      </div>
      {pied?.(codes, total)}
    </>
  );
}
