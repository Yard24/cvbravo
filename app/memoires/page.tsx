import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/Site";
import RelectureCalculator from "@/components/RelectureCalculator";
import { NIVEAUX_REDACTION, fcfa } from "@/lib/pricing";
import { lireReglages } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Relecture, correction et assistance mémoire",
  description:
    "Relecture et correction de mémoire à partir de 200 F CFA, 10 000 F CFA pour 20 000 mots. Assistance à la rédaction : licence, master professionnel, master de recherche.",
};

export default async function PageMemoires() {
  const reglages = await lireReglages();
  const PRIX = reglages.redaction;
  return (
    <PublicPage>
      <section className="wrap py-12 md:py-16">
        <p className="eyebrow">Mémoires</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">
          Un mémoire sans fautes, rendu dans les temps.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Deux services : la relecture-correction d&apos;un mémoire déjà écrit, et l&apos;accompagnement à la rédaction
          si vous êtes encore en chemin.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold">Relecture et correction</h2>
            <p className="mt-2 text-muted">
              Vous déposez votre document, nous comptons les mots et le prix s&apos;affiche. Le tarif est dégressif :
              200 F CFA au minimum, 10 000 F CFA pour 20 000 mots en délai standard.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Orthographe, grammaire, conjugaison, ponctuation",
                "Clarté des phrases et cohérence du style",
                "Harmonisation des titres, citations et bibliographie",
                "Options de délai : moins de 7 jours, 3 jours ou 12 heures",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <span aria-hidden className="mt-0.5 text-brand">✓</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <RelectureCalculator settings={reglages.relecture} />
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-extrabold">Assistance à la rédaction</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Un accompagnement du choix du sujet à la soutenance : problématique, plan, méthodologie, recherche
            documentaire, relectures de chaque chapitre. Vous restez l&apos;auteur de votre travail.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {NIVEAUX_REDACTION.map((n) => (
              <article key={n.code} className="card flex flex-col">
                <h3 className="text-xl font-bold">{n.label}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{n.detail}</p>
                <p className="display mt-4 text-2xl font-extrabold">{fcfa(PRIX[n.code])}</p>
                <Link href={`/espace/memoires/redaction?niveau=${n.code}`} className="btn-ghost mt-4">
                  Demander cet accompagnement
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
