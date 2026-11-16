import type { Metadata } from "next";
import { PublicPage } from "@/components/Site";
import CvAtelier from "@/components/CvAtelier";

export const metadata: Metadata = {
  title: "Créer un CV sans inscription",
  description: "Remplissez vos rubriques, choisissez un modèle et téléchargez votre CV en PDF. Sans compte.",
};

export default function CreerCv() {
  return (
    <PublicPage>
      <section className="wrap py-10 sm:py-14">
        <div className="print:hidden">
          <p className="eyebrow">Atelier CV</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Créez votre CV.</h1>
          <p className="lead mt-3 max-w-2xl">Remplissez, choisissez un modèle, téléchargez. Vous avez déjà un CV ? Déposez-le dans votre espace : il sera repris automatiquement.</p>
        </div>
        <div className="mt-8">
          <CvAtelier />
        </div>
      </section>
    </PublicPage>
  );
}
