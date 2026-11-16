import type { Cv, CvData } from "@/lib/types";

export const MODELES: { code: Cv["template"]; label: string; detail: string }[] = [
  { code: "classique", label: "Classique", detail: "Sobre, une colonne. Banques, administration, ONG." },
  { code: "moderne", label: "Moderne", detail: "Bandeau latéral coloré. Commerce, communication, numérique." },
  { code: "compact", label: "Compact", detail: "Dense, tient sur une page. Profils expérimentés." },
];

function Liste({ items }: { items?: string[] }) {
  const propres = (items ?? []).filter((x) => x && x.trim());
  if (!propres.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {propres.map((x, i) => (
        <li key={i} className="rounded bg-black/5 px-2 py-0.5 text-[0.8em]">{x}</li>
      ))}
    </ul>
  );
}

function Contact({ d, className = "" }: { d: CvData; className?: string }) {
  const parts = [d.telephone, d.email, d.ville].filter(Boolean);
  return <p className={className}>{parts.join("  ·  ")}</p>;
}

function Experiences({ d, accent }: { d: CvData; accent: string }) {
  const xs = (d.experiences ?? []).filter((e) => e.poste || e.entreprise || e.description);
  if (!xs.length) return null;
  return (
    <div className="space-y-3">
      {xs.map((e, i) => (
        <div key={i} className="break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="font-bold">{e.poste}</p>
            <p className="text-[0.82em] opacity-70">{[e.debut, e.fin].filter(Boolean).join(" – ")}</p>
          </div>
          <p className="text-[0.9em] font-semibold" style={{ color: accent }}>
            {[e.entreprise, e.lieu].filter(Boolean).join(", ")}
          </p>
          {e.description && <p className="mt-1 whitespace-pre-line text-[0.9em]">{e.description}</p>}
        </div>
      ))}
    </div>
  );
}

function Formations({ d }: { d: CvData }) {
  const xs = (d.formations ?? []).filter((f) => f.diplome || f.etablissement);
  if (!xs.length) return null;
  return (
    <div className="space-y-2">
      {xs.map((f, i) => (
        <div key={i} className="break-inside-avoid">
          <p className="font-bold">{f.diplome}</p>
          <p className="text-[0.9em] opacity-80">{[f.etablissement, f.annee].filter(Boolean).join(" — ")}</p>
        </div>
      ))}
    </div>
  );
}

function Bloc({ titre, accent, children }: { titre: string; accent: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <section className="mt-5">
      <h3 className="mb-2 border-b pb-1 text-[0.8em] font-bold uppercase tracking-[0.12em]" style={{ color: accent, borderColor: accent }}>
        {titre}
      </h3>
      {children}
    </section>
  );
}

const a = (items?: unknown[]) => (items ?? []).some((x) => (typeof x === "string" ? x.trim() : x && Object.values(x as object).some(Boolean)));

export default function CvPreview({ data, template }: { data: CvData; template: Cv["template"] }) {
  const d = data ?? {};
  const vide = !d.nom && !d.titre && !a(d.experiences) && !a(d.formations);
  const base = "cv-sheet mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border border-line bg-white text-[13px] leading-snug text-neutral-900 shadow-sm";

  if (vide) {
    return (
      <div className={`${base} grid min-h-64 place-items-center p-8 text-center text-muted`}>
        Votre CV apparaîtra ici au fur et à mesure que vous remplissez les rubriques.
      </div>
    );
  }

  if (template === "moderne") {
    const accent = "#0e5a47";
    return (
      <div className={`${base} grid grid-cols-[34%_1fr]`}>
        <aside className="p-6 text-white" style={{ background: accent }}>
          <h2 className="text-2xl font-bold leading-tight">{d.nom}</h2>
          <p className="mt-1 text-[1.05em] opacity-90">{d.titre}</p>
          <div className="mt-5 space-y-1 text-[0.9em] opacity-95">
            {[d.telephone, d.email, d.ville].filter(Boolean).map((x, i) => <p key={i} className="break-words">{x}</p>)}
          </div>
          {a(d.competences) && (
            <div className="mt-6">
              <h3 className="mb-2 text-[0.8em] font-bold uppercase tracking-[0.12em] opacity-80">Compétences</h3>
              <ul className="space-y-1 text-[0.92em]">{(d.competences ?? []).filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {a(d.langues) && (
            <div className="mt-6">
              <h3 className="mb-2 text-[0.8em] font-bold uppercase tracking-[0.12em] opacity-80">Langues</h3>
              <ul className="space-y-1 text-[0.92em]">{(d.langues ?? []).filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
          {a(d.centres) && (
            <div className="mt-6">
              <h3 className="mb-2 text-[0.8em] font-bold uppercase tracking-[0.12em] opacity-80">Centres d&apos;intérêt</h3>
              <ul className="space-y-1 text-[0.92em]">{(d.centres ?? []).filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
        </aside>
        <div className="p-6">
          {d.profil && <p className="whitespace-pre-line text-[0.95em]">{d.profil}</p>}
          {a(d.experiences) && <Bloc titre="Expérience professionnelle" accent={accent}><Experiences d={d} accent={accent} /></Bloc>}
          {a(d.formations) && <Bloc titre="Formation" accent={accent}><Formations d={d} /></Bloc>}
        </div>
      </div>
    );
  }

  const compact = template === "compact";
  const accent = compact ? "#1f2937" : "#8a4b08";
  return (
    <div className={`${base} ${compact ? "p-6 text-[12px]" : "p-8"}`}>
      <header className={compact ? "flex flex-wrap items-end justify-between gap-2 border-b-2 pb-2" : "border-b-2 pb-3 text-center"} style={{ borderColor: accent }}>
        <div>
          <h2 className={`${compact ? "text-2xl" : "text-3xl"} font-bold`}>{d.nom}</h2>
          <p className="text-[1.05em] font-semibold" style={{ color: accent }}>{d.titre}</p>
        </div>
        <Contact d={d} className={`text-[0.9em] opacity-80 ${compact ? "" : "mt-1"}`} />
      </header>
      {d.profil && <Bloc titre="Profil" accent={accent}><p className="whitespace-pre-line">{d.profil}</p></Bloc>}
      {a(d.experiences) && <Bloc titre="Expérience professionnelle" accent={accent}><Experiences d={d} accent={accent} /></Bloc>}
      {a(d.formations) && <Bloc titre="Formation" accent={accent}><Formations d={d} /></Bloc>}
      <div className={compact ? "grid grid-cols-2 gap-x-6" : ""}>
        {a(d.competences) && <Bloc titre="Compétences" accent={accent}><Liste items={d.competences} /></Bloc>}
        {a(d.langues) && <Bloc titre="Langues" accent={accent}><Liste items={d.langues} /></Bloc>}
      </div>
      {a(d.centres) && <Bloc titre="Centres d'intérêt" accent={accent}><Liste items={d.centres} /></Bloc>}
    </div>
  );
}
