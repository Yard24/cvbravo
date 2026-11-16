"use client";

import { MODELES } from "@/components/CvPreview";
import type { Cv, CvData } from "@/lib/types";

function Champ({ label, value, onChange, type = "text", area = false }: { label: string; value?: string; onChange: (v: string) => void; type?: string; area?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {area ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} className="input" />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </label>
  );
}

/** Nettoie les listes (une ligne = un élément) avant affichage ou enregistrement. */
export function cvPropre(d: CvData): CvData {
  const net = (xs?: string[]) => (xs ?? []).map((x) => x.trim()).filter(Boolean);
  return { ...d, competences: net(d.competences), langues: net(d.langues), centres: net(d.centres) };
}

export function ChoixModele({ value, onChange }: { value: Cv["template"]; onChange: (t: Cv["template"]) => void }) {
  return (
    <fieldset className="card">
      <legend className="sr-only">Modèle</legend>
      <p className="label">Modèle</p>
      <div className="flex flex-wrap gap-2">
        {MODELES.map((m) => (
          <button key={m.code} type="button" onClick={() => onChange(m.code)} aria-pressed={value === m.code}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${value === m.code ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
            {m.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function CvForm({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const d = data ?? {};
  const maj = (patch: Partial<CvData>) => onChange({ ...d, ...patch });
  const majListe = (cle: "experiences" | "formations", i: number, patch: object) => {
    const liste = [...((d[cle] as object[]) ?? [])];
    liste[i] = { ...liste[i], ...patch };
    maj({ [cle]: liste } as Partial<CvData>);
  };
  const retirer = (cle: "experiences" | "formations", i: number) => maj({ [cle]: (d[cle] ?? []).filter((_, j) => j !== i) } as Partial<CvData>);

  return (
    <div className="space-y-5">
      <section className="card space-y-3">
        <h2 className="text-lg font-bold">Identité</h2>
        <Champ label="Nom et prénoms" value={d.nom} onChange={(v) => maj({ nom: v })} />
        <Champ label="Titre du CV (poste visé)" value={d.titre} onChange={(v) => maj({ titre: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Champ label="Téléphone" type="tel" value={d.telephone} onChange={(v) => maj({ telephone: v })} />
          <Champ label="E-mail" type="email" value={d.email} onChange={(v) => maj({ email: v })} />
        </div>
        <Champ label="Ville" value={d.ville} onChange={(v) => maj({ ville: v })} />
        <Champ label="Profil (3 à 4 lignes)" area value={d.profil} onChange={(v) => maj({ profil: v })} />
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold">Expérience professionnelle</h2>
        {(d.experiences ?? []).map((e, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-tile p-3">
            <Champ label="Poste" value={e.poste} onChange={(v) => majListe("experiences", i, { poste: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Champ label="Entreprise" value={e.entreprise} onChange={(v) => majListe("experiences", i, { entreprise: v })} />
              <Champ label="Lieu" value={e.lieu} onChange={(v) => majListe("experiences", i, { lieu: v })} />
              <Champ label="Début" value={e.debut} onChange={(v) => majListe("experiences", i, { debut: v })} />
              <Champ label="Fin" value={e.fin} onChange={(v) => majListe("experiences", i, { fin: v })} />
            </div>
            <Champ label="Missions et résultats" area value={e.description} onChange={(v) => majListe("experiences", i, { description: v })} />
            <button type="button" onClick={() => retirer("experiences", i)} className="text-sm font-semibold text-red-700">Retirer cette expérience</button>
          </div>
        ))}
        <button type="button" onClick={() => maj({ experiences: [...(d.experiences ?? []), {}] })} className="btn-ghost">+ Ajouter une expérience</button>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-bold">Formation</h2>
        {(d.formations ?? []).map((f, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-tile p-3">
            <Champ label="Diplôme" value={f.diplome} onChange={(v) => majListe("formations", i, { diplome: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Champ label="Établissement" value={f.etablissement} onChange={(v) => majListe("formations", i, { etablissement: v })} />
              <Champ label="Année" value={f.annee} onChange={(v) => majListe("formations", i, { annee: v })} />
            </div>
            <button type="button" onClick={() => retirer("formations", i)} className="text-sm font-semibold text-red-700">Retirer cette formation</button>
          </div>
        ))}
        <button type="button" onClick={() => maj({ formations: [...(d.formations ?? []), {}] })} className="btn-ghost">+ Ajouter une formation</button>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-bold">Compétences, langues, centres d&apos;intérêt</h2>
        <p className="text-sm text-muted">Un élément par ligne.</p>
        <Champ label="Compétences" area value={(d.competences ?? []).join("\n")} onChange={(v) => maj({ competences: v.split("\n") })} />
        <Champ label="Langues" area value={(d.langues ?? []).join("\n")} onChange={(v) => maj({ langues: v.split("\n") })} />
        <Champ label="Centres d'intérêt" area value={(d.centres ?? []).join("\n")} onChange={(v) => maj({ centres: v.split("\n") })} />
      </section>
    </div>
  );
}
