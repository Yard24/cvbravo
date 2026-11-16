"use client";

import { useState } from "react";
import Link from "next/link";
import { ORDRE_URGENCES, RELECTURE_DEFAUT, fcfa, prixRelecture, type RelectureSettings } from "@/lib/pricing";

export default function RelectureCalculator({ settings = RELECTURE_DEFAUT }: { settings?: RelectureSettings }) {
  const [mots, setMots] = useState(20000);
  const propre = Math.max(0, Math.min(500000, Math.floor(mots || 0)));

  return (
    <div className="card">
      <label htmlFor="calc-mots" className="label">Nombre de mots de votre document</label>
      <input
        id="calc-mots"
        type="number"
        inputMode="numeric"
        min={1}
        max={500000}
        value={mots || ""}
        onChange={(e) => setMots(Number(e.target.value))}
        className="input text-lg font-semibold"
      />
      <input
        aria-label="Ajuster le nombre de mots"
        type="range"
        min={500}
        max={60000}
        step={500}
        value={Math.min(60000, Math.max(500, propre))}
        onChange={(e) => setMots(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--color-brand)]"
      />
      <ul className="mt-4 divide-y divide-line">
        {ORDRE_URGENCES.filter((u) => settings.urgences[u]).map((u) => (
          <li key={u} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="text-sm text-muted">{settings.urgences[u].label}</span>
            <span className="display text-lg font-bold tabular-nums">{fcfa(prixRelecture(propre, u, settings))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Plus le document est long, plus le prix au mot baisse. À la commande, nous comptons les mots de votre fichier
        automatiquement.
      </p>
      <Link href="/espace/memoires/relecture" className="btn-primary mt-4 w-full">
        Déposer mon document
      </Link>
    </div>
  );
}
