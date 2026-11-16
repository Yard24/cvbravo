"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dateFr } from "@/lib/types";

type Ligne = { id: number; created_at: string; source: string; action: string; level: string; details: Record<string, unknown> };

export default function AdminJournal() {
  const supabase = useMemo(() => createClient(), []);
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [file, setFile] = useState<{ attente: number; termine: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [j, a, t] = await Promise.all([
        supabase.from("bd_journal").select("*").order("id", { ascending: false }).limit(200),
        supabase.from("bd_ai_jobs").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
        supabase.from("bd_ai_jobs").select("id", { count: "exact", head: true }).eq("status", "termine"),
      ]);
      setLignes((j.data as Ligne[]) ?? []);
      setFile({ attente: a.count ?? 0, termine: t.count ?? 0 });
    })();
  }, [supabase]);

  return (
    <>
      <h1 className="text-3xl font-extrabold">Journal</h1>
      <p className="mt-1 text-muted">
        Collectes de flux, rapprochements, paiements et traitements IA.
        {file && ` File IA : ${file.attente} en attente, ${file.termine} terminé(s).`}
      </p>
      {lignes === null ? (
        <p className="mt-6 text-muted">Chargement…</p>
      ) : (
        <div className="card mt-6 overflow-x-auto !p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Source</th>
                <th scope="col" className="px-4 py-3">Action</th>
                <th scope="col" className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lignes.map((l) => (
                <tr key={l.id} className={l.level === "erreur" ? "bg-red-50" : ""}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted">{dateFr(l.created_at, true)}</td>
                  <td className="px-4 py-2.5"><span className={l.level === "erreur" ? "badge bg-red-100 text-red-800" : "badge-gray"}>{l.source}</span></td>
                  <td className="px-4 py-2.5 font-medium">{l.action}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">{JSON.stringify(l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
