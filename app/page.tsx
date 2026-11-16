import Link from "next/link";
import { PublicPage } from "@/components/Site";
import RelectureCalculator from "@/components/RelectureCalculator";
import { lireReglages } from "@/lib/settings";

export const revalidate = 300;

const SERVICES = [
  {
    href: "/cv",
    tag: "Emploi",
    titre: "Un CV refait, et les offres qui vous correspondent",
    texte:
      "Déposez votre CV actuel : nous le remettons en forme sur un modèle soigné, puis nous surveillons les offres d'emploi pour vous prévenir quand l'une d'elles colle à votre profil.",
    prix: "Alertes emploi incluses",
    cta: "Refaire mon CV",
  },
  {
    href: "/memoires",
    tag: "Mémoires",
    titre: "Relecture, correction et accompagnement à la rédaction",
    texte:
      "Orthographe, grammaire, style et mise en page : votre mémoire corrigé dans le délai que vous choisissez. Et si vous démarrez, un accompagnement du plan à la soutenance.",
    prix: "Dès 200 F CFA",
    cta: "Voir les tarifs",
  },
  {
    href: "/business-plan",
    tag: "Entreprise",
    titre: "Votre business plan, composé à la carte",
    texte:
      "Cochez les parties dont vous avez besoin — étude de marché, plan de financement, prévisionnel — et ne payez que celles-là. Nous rédigeons le tout.",
    prix: "Prix par élément",
    cta: "Composer mon plan",
  },
];

const ETAPES = [
  ["Vous déposez", "Votre CV, votre mémoire ou la description de votre projet, depuis votre téléphone."],
  ["Le prix s'affiche", "Calculé tout de suite, avant de payer. Aucune surprise ensuite."],
  ["Vous validez et payez", "Mobile Money ou carte. Votre commande part aussitôt en production."],
  ["Vous recevez", "Le document fini arrive dans votre espace, avec une notification."],
];

export default async function Accueil() {
  const reglages = await lireReglages();
  return (
    <PublicPage>
      <section className="wrap grid items-center gap-10 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <p className="eyebrow">CV · Mémoires · Business plans</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Vos documents importants, <span className="text-brand">bien faits</span> et livrés à l&apos;heure.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Bravodocs refait votre CV et vous alerte sur les offres d&apos;emploi adaptées, corrige votre mémoire et
            rédige votre business plan. Vous voyez le prix avant de commander.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/inscription" className="btn-primary">Créer mon espace gratuit</Link>
            <Link href="/memoires" className="btn-ghost">Calculer un prix de relecture</Link>
          </div>
          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">Relecture dès</dt>
              <dd className="display text-xl font-bold">200 F</dd>
            </div>
            <div>
              <dt className="text-muted">20 000 mots</dt>
              <dd className="display text-xl font-bold">10 000 F</dd>
            </div>
            <div>
              <dt className="text-muted">Livraison express</dt>
              <dd className="display text-xl font-bold">12 h</dd>
            </div>
          </dl>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Combien coûte la correction de mon mémoire ?</p>
          <RelectureCalculator settings={reglages.relecture} />
        </div>
      </section>

      <section className="wrap py-10">
        <h2 className="text-3xl font-extrabold">Trois services, un seul espace</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.href} className="card flex flex-col">
              <span className="badge-amber self-start">{s.tag}</span>
              <h3 className="mt-3 text-xl font-bold">{s.titre}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{s.texte}</p>
              <p className="mt-4 text-sm font-semibold text-brand">{s.prix}</p>
              <Link href={s.href} className="btn-ghost mt-3">{s.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap py-10">
        <h2 className="text-3xl font-extrabold">Comment ça marche</h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map(([titre, texte], i) => (
            <li key={titre} className="rounded-2xl bg-brand-soft p-5">
              <span className="display text-3xl font-extrabold text-brand">{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{titre}</h3>
              <p className="mt-1 text-sm text-muted">{texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap py-10">
        <div className="rounded-3xl bg-brand px-6 py-10 text-white sm:px-10">
          <h2 className="text-3xl font-extrabold">Votre prochain emploi commence par un bon CV.</h2>
          <p className="mt-3 max-w-2xl text-white/85">
            Déposez-le une fois. Nous le remettons en forme, nous cherchons les offres, et vous adaptez votre CV à
            chaque annonce en un clic avant de postuler.
          </p>
          <Link href="/espace/cv" className="btn-sun mt-6">Déposer mon CV</Link>
        </div>
      </section>
    </PublicPage>
  );
}
