"use client";

import { useState } from "react";
import Link from "next/link";
import { ORDRE_URGENCES, RELECTURE_DEFAUT, compterMots, fcfa, prixRelecture, type RelectureSettings } from "@/lib/pricing";

export default function RelectureCalculator({ settings = RELECTURE_DEFAUT }: { settings?: RelectureSettings }) {
  const [mots, setMots] = useState(20000);
  const [coller, setColler] = useState(false);
  const propre = Math.max(0, Math.min(500000, Math.floor(mots || 0)));

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:p-8">
      <label htmlFor="calc-mots" className="label">Nombre de mots de votre document</label>
      <input
        id="calc-mots"
        type="number"
        inputMode="numeric"
        min={1}
        max={500000}
        value={mots || ""}
        onChange={(e) => setMots(Number(e.target.value))}
        className="input text-xl font-semibold"
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
      <button type="button" onClick={() => setColler(!coller)} aria-expanded={coller} className="mt-2 text-sm font-semibold text-brand">
        {coller ? "Masquer la zone de texte" : "Je ne connais pas le nombre de mots : coller mon texte"}
      </button>
      {coller && (
        <textarea
          aria-label="Collez votre texte pour compter les mots"
          rows={4}
          placeholder="Collez votre texte ici : les mots sont comptés sur votre appareil, rien n'est envoyé."
          onChange={(e) => setMots(compterMots(e.target.value))}
          className="input mt-2 text-sm"
        />
      )}
      <ul className="mt-5 divide-y divide-line">
        {ORDRE_URGENCES.filter((u) => settings.urgences[u]).map((u) => (
          <li key={u} className="flex items-baseline justify-between gap-3 py-3">
            <span className="text-sm text-muted">{settings.urgences[u].label}</span>
            <span className="display text-xl font-semibold tabular-nums">{fcfa(prixRelecture(propre, u, settings))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Plus le document est long, plus le prix au mot baisse. À la commande, les mots de votre fichier sont comptés automatiquement.</p>
      <Link href="/espace/memoires/relecture" className="btn-primary mt-5 w-full">Déposer mon document</Link>
    </div>
  );
}
