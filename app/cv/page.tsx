import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/Site";

export const metadata: Metadata = {
  title: "Refonte de CV et alertes emploi",
  description:
    "Déposez votre CV : Bravodocs le remet en forme sur un nouveau modèle, cherche les offres adaptées et vous aide à postuler avec un CV ajusté à chaque annonce.",
};

const ETAPES = [
  ["Déposez votre CV actuel", "En PDF ou Word. Nous en extrayons le contenu, vous n'avez rien à ressaisir."],
  ["Choisissez un modèle", "Classique, moderne ou compact. Votre CV est remis en forme et reste modifiable."],
  ["Recevez les offres adaptées", "Nous lisons chaque jour les offres publiées et les comparons à votre profil. Vous êtes notifié dès qu'une offre correspond."],
  ["Adaptez et postulez", "Un clic sur « Adapter mon CV » crée une version ajustée à l'annonce. Vous postulez, votre suivi se met à jour."],
];

export default function PageCv() {
  return (
    <PublicPage>
      <section className="wrap py-12 md:py-16">
        <p className="eyebrow">CV et offres d&apos;emploi</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">
          Un CV refait une fois, adapté à chaque offre ensuite.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Vous déposez le CV que vous avez déjà. Nous le reproduisons sur un nouveau modèle, puis nous surveillons les
          offres d&apos;emploi à votre place.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/espace/cv" className="btn-primary">Déposer mon CV</Link>
          <Link href="/espace/offres" className="btn-ghost">Voir mes offres</Link>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {ETAPES.map(([titre, texte], i) => (
            <li key={titre} className="card flex gap-4">
              <span className="display grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="text-lg font-bold">{titre}</h2>
                <p className="mt-1 text-sm text-muted">{texte}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Tableau de bord", "CV, offres, candidatures et commandes au même endroit."],
            ["Notifications", "Un message dans votre espace à chaque nouvelle offre qui vous correspond."],
            ["Suivi des candidatures", "Chaque offre passe de « à préparer » à « postulé », sans tableur."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-sun-soft p-5">
              <h3 className="text-lg font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
