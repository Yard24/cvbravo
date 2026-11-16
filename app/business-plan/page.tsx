import type { Metadata } from "next";
import { PublicPage } from "@/components/Site";
import BpPublic from "@/components/BpPublic";

export const metadata: Metadata = {
  title: "Business plan à la carte",
  description:
    "Composez votre business plan : cochez les éléments voulus (étude de marché, plan de financement, prévisionnel...), le prix se calcule, nous rédigeons.",
};

export default function PageBusinessPlan() {
  return (
    <PublicPage>
      <section className="wrap pb-6 pt-16 text-center sm:pt-24">
        <p className="eyebrow">Business plan</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold sm:text-6xl">Cochez ce qu&apos;il vous faut. Nous rédigeons.</h1>
        <p className="lead mx-auto mt-6 max-w-2xl">
          Un dossier pour la banque n&apos;a pas besoin des mêmes parties qu&apos;un dossier pour un concours ou un
          investisseur. Vous ne payez que ce que vous cochez.
        </p>
      </section>

      <section className="wrap pb-36 pt-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Composez votre plan.</h2>
        <p className="mt-2 text-muted">Sans inscription. Votre sélection est conservée sur cet appareil.</p>
        <div className="mt-6"><BpPublic /></div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            ["1. Vous cochez", "Résumé exécutif, étude de marché, plan de financement, prévisionnel… Le total se met à jour à chaque case."],
            ["2. Vous validez", "Vous décrivez votre projet en quelques lignes et confirmez la commande depuis votre espace."],
            ["3. Nous créons", "Notre équipe rédige votre plan d'affaires et le dépose dans votre espace. Vous êtes notifié à la livraison."],
          ].map(([t, d]) => (
            <div key={t} className="tile !p-7">
              <h3 className="text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
