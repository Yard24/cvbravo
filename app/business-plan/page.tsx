import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "@/components/Site";

export const metadata: Metadata = {
  title: "Business plan à la carte",
  description:
    "Composez votre business plan : cochez les éléments voulus (étude de marché, plan de financement, prévisionnel...), le prix se calcule, nous rédigeons.",
};

export default function PageBusinessPlan() {
  return (
    <PublicPage>
      <section className="wrap py-12 md:py-16">
        <p className="eyebrow">Business plan</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">
          Cochez ce qu&apos;il vous faut. Nous rédigeons le reste.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Un dossier pour la banque n&apos;a pas besoin des mêmes parties qu&apos;un dossier pour un concours ou un
          investisseur. Vous composez votre plan d&apos;affaires élément par élément et vous ne payez que ce que vous
          avez coché.
        </p>
        <Link href="/espace/business-plan" className="btn-primary mt-7">Composer mon business plan</Link>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["1. Vous cochez", "Résumé exécutif, étude de marché, plan de financement, compte de résultat prévisionnel, plan de trésorerie… Le total se met à jour à chaque case."],
            ["2. Vous validez et payez", "Vous décrivez votre projet en quelques lignes, vous validez la liste, puis vous réglez."],
            ["3. Nous créons", "Notre équipe rédige votre plan d'affaires et le dépose dans votre espace. Vous êtes notifié à la livraison."],
          ].map(([t, d]) => (
            <div key={t} className="card">
              <h2 className="text-lg font-bold">{t}</h2>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}
