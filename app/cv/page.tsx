import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/Site";
import ModelesVitrine from "@/components/ModelesVitrine";

export const metadata: Metadata = {
  title: "CV repris automatiquement et alertes emploi",
  description:
    "Déposez votre CV en Word, PDF ou photo : ses informations sont reprises automatiquement sur un nouveau modèle. Bravodocs cherche ensuite les offres adaptées à votre profil.",
};

const ETAPES = [
  ["Déposez votre CV", "Word, PDF ou photo. Vous pouvez aussi cocher un CV déjà présent dans votre espace."],
  ["Tout est repris automatiquement", "Coordonnées, expériences, formations, compétences : chaque information est placée dans le modèle choisi. Rien à ressaisir."],
  ["Vous retouchez si besoin", "Chaque rubrique reste modifiable à la main. Vous changez de modèle sans perdre votre contenu."],
  ["Les offres arrivent", "Votre CV est comparé chaque jour aux offres publiées. Vous êtes notifié, vous adaptez votre CV à l'annonce, vous postulez."],
];

export default function PageCv() {
  return (
    <PublicPage>
      <section className="wrap pb-6 pt-16 text-center sm:pt-24">
        <p className="eyebrow">CV et emploi</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold sm:text-6xl">Votre CV, refait sans rien ressaisir.</h1>
        <p className="lead mx-auto mt-6 max-w-2xl">
          Déposez le CV que vous avez déjà. Ses informations sont lues et replacées dans un nouveau modèle, que vous
          ajustez ensuite librement.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/espace/cv" className="btn-primary">Déposer mon CV</Link>
          <Link href="/cv/creer" className="btn-ghost">Créer un CV sans inscription</Link>
        </div>
      </section>

      <section className="wrap section">
        <h2 className="text-4xl font-bold sm:text-5xl">Les modèles.</h2>
        <p className="lead mt-4 max-w-2xl">Trois modèles pour commencer, d&apos;autres arrivent. Aperçus réalisés avec un CV fictif.</p>
        <div className="mt-10"><ModelesVitrine /></div>
      </section>

      <section className="wrap pb-8">
        <h2 className="text-4xl font-bold sm:text-5xl">Du dépôt à la candidature.</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {ETAPES.map(([titre, texte], i) => (
            <li key={titre} className="tile">
              <span className="text-sm font-semibold text-muted">Étape {i + 1}</span>
              <h3 className="mt-1 text-2xl font-semibold">{titre}</h3>
              <p className="mt-2 text-muted">{texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap section text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">Un espace pour suivre vos candidatures.</h2>
        <p className="lead mx-auto mt-4 max-w-2xl">CV, offres reçues, candidatures envoyées et commandes au même endroit. Chaque offre passe de « à préparer » à « postulé ».</p>
        <Link href="/espace/offres" className="btn-primary mt-8">Voir les offres pour mon profil</Link>
      </section>
    </PublicPage>
  );
}
