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
      <section className="wrap pb-6 pt-16 text-center sm:pt-24">
        <p className="eyebrow">Mémoires</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold sm:text-6xl">Un mémoire sans fautes, rendu à temps.</h1>
        <p className="lead mx-auto mt-6 max-w-2xl">
          La relecture-correction d&apos;un mémoire déjà écrit, ou un accompagnement à la rédaction si vous êtes encore en
          chemin.
        </p>
      </section>

      <section className="wrap section grid items-start gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold">Relecture et correction</h2>
          <p className="lead mt-4">
            Le prix dépend du nombre de mots, avec un tarif dégressif : 200 F CFA au minimum, 10 000 F CFA pour 20 000
            mots en délai standard.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Orthographe, grammaire, conjugaison, ponctuation",
              "Clarté des phrases et cohérence du style",
              "Harmonisation des titres, citations et bibliographie",
              "Délai au choix : standard, moins de 7 jours, 3 jours ou 12 heures",
            ].map((x) => (
              <li key={x} className="flex gap-3"><span aria-hidden className="text-brand">✓</span>{x}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">Le calcul est libre. Un compte n&apos;est demandé qu&apos;au moment de déposer votre fichier, pour qu&apos;il reste privé.</p>
        </div>
        <RelectureCalculator settings={reglages.relecture} />
      </section>

      <section id="assistance" className="wrap scroll-mt-24 pb-24">
        <h2 className="text-4xl font-bold">Assistance à la rédaction</h2>
        <p className="lead mt-4 max-w-3xl">
          Un accompagnement du choix du sujet à la soutenance : problématique, plan, méthodologie, recherche documentaire,
          relecture de chaque chapitre. Vous restez l&apos;auteur de votre travail.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {NIVEAUX_REDACTION.map((n) => (
            <article key={n.code} className="tile flex flex-col !p-7">
              <h3 className="text-2xl font-semibold">{n.label}</h3>
              <p className="mt-1 flex-1 text-muted">{n.detail}</p>
              <p className="display mt-6 text-3xl font-bold tabular-nums">{fcfa(PRIX[n.code])}</p>
              <Link href={`/espace/memoires/redaction?niveau=${n.code}`} className="btn-primary mt-5">Demander cet accompagnement</Link>
            </article>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
