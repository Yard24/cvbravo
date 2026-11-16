import Link from "next/link";
import { PublicPage } from "@/components/Site";
import RelectureCalculator from "@/components/RelectureCalculator";
import ModelesVitrine from "@/components/ModelesVitrine";
import { lireReglages } from "@/lib/settings";
import { NIVEAUX_REDACTION, fcfa } from "@/lib/pricing";

export const revalidate = 300;

const SANS_COMPTE = [
  "Calculer le prix d'une relecture",
  "Créer un CV sur un modèle et le télécharger en PDF",
  "Composer un business plan et voir son prix",
  "Consulter tous les tarifs",
];
const AVEC_COMPTE = [
  "Déposer un CV pour le faire reprendre automatiquement",
  "Recevoir les offres d'emploi qui correspondent à votre profil",
  "Commander une relecture, un accompagnement ou un business plan",
  "Suivre vos commandes et télécharger vos documents",
];

const ETAPES = [
  ["Vous déposez", "Votre CV, votre mémoire ou la description de votre projet, depuis votre téléphone."],
  ["Le prix s'affiche", "Il est calculé tout de suite, avant toute commande. Pas de surprise ensuite."],
  ["Vous validez", "Votre commande part en production et vous suivez son avancement dans votre espace."],
  ["Vous recevez", "Le document fini arrive dans votre espace, avec une notification."],
];

const FAQ: [string, string][] = [
  ["Faut-il créer un compte ?", "Pas pour découvrir ni pour essayer : le calcul d'un prix, la création d'un CV avec téléchargement en PDF et la composition d'un business plan se font sans inscription. Un compte devient nécessaire quand vous déposez un fichier, quand vous voulez recevoir des offres d'emploi ou quand vous passez commande, pour que vos documents restent privés et que vous puissiez les retrouver."],
  ["Que devient mon CV quand je le dépose ?", "Ses informations — coordonnées, expériences, formations, compétences — sont lues automatiquement et placées dans le modèle que vous avez choisi. Vous relisez, vous corrigez ce qui doit l'être, vous téléchargez. Vous n'avez rien à ressaisir."],
  ["Quels fichiers puis-je envoyer ?", "Word (.docx), PDF et texte. Pour un CV, une photo nette (JPG ou PNG) fonctionne aussi : le texte est lu sur votre appareil."],
  ["Comment est calculé le prix d'une relecture ?", "Selon le nombre de mots, avec un tarif dégressif : 200 F CFA au minimum, 10 000 F CFA pour 20 000 mots en délai standard. Un délai plus court ajoute un supplément, affiché avant la commande."],
  ["En quoi consiste l'assistance à la rédaction ?", "C'est un accompagnement : aide au choix de la problématique, construction du plan, méthodologie, recherche documentaire et relecture de chaque chapitre. Vous restez l'auteur de votre mémoire."],
  ["Mes documents sont-ils confidentiels ?", "Oui. Vos fichiers sont rangés dans un espace privé. Seuls vous et l'équipe qui traite votre commande pouvez les ouvrir."],
  ["Comment se passe le paiement ?", "Le prix est toujours affiché avant la commande. Le paiement en ligne est en cours d'activation ; d'ici là, notre équipe vous indique comment régler."],
];

export default async function Accueil() {
  const reglages = await lireReglages();

  return (
    <PublicPage>
      {/* Ouverture */}
      <section className="wrap pb-10 pt-16 text-center sm:pt-24">
        <p className="eyebrow">CV · Mémoires · Business plans</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-bold sm:text-6xl lg:text-7xl">Vos documents importants. Bien faits.</h1>
        <p className="lead mx-auto mt-6 max-w-2xl">
          Un CV repris automatiquement sur un modèle soigné, les offres d&apos;emploi qui vous correspondent, un mémoire
          corrigé à temps, un business plan sur mesure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cv/creer" className="btn-primary">Créer mon CV, sans inscription</Link>
          <Link href="#tarifs" className="btn-ghost">Voir les tarifs</Link>
        </div>
      </section>

      {/* Les trois services */}
      <section className="wrap grid gap-5 pb-8 md:grid-cols-2">
        <article className="tile md:col-span-2 md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-xl">
            <p className="eyebrow">CV et emploi</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Déposez votre CV. Il est refait tout seul.</h2>
            <p className="mt-3 text-muted">Word, PDF ou simple photo : vos informations sont reprises sur un nouveau modèle, puis comparées chaque jour aux offres d&apos;emploi publiées.</p>
          </div>
          <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0">
            <Link href="/espace/cv" className="btn-primary">Déposer mon CV</Link>
            <Link href="/cv" className="btn-ghost !bg-white">En savoir plus</Link>
          </div>
        </article>
        <article className="tile flex flex-col">
          <p className="eyebrow">Mémoires</p>
          <h2 className="mt-2 text-3xl font-bold">Un mémoire sans fautes, rendu à temps.</h2>
          <p className="mt-3 flex-1 text-muted">Relecture et correction dès 200 F CFA, livrée jusqu&apos;en moins de 12 heures. Ou un accompagnement du plan à la soutenance.</p>
          <Link href="/memoires" className="mt-6 font-semibold text-brand">Calculer mon prix →</Link>
        </article>
        <article className="tile flex flex-col">
          <p className="eyebrow">Business plan</p>
          <h2 className="mt-2 text-3xl font-bold">Cochez. Nous rédigeons.</h2>
          <p className="mt-3 flex-1 text-muted">Étude de marché, plan de financement, prévisionnel : vous ne payez que les parties dont votre dossier a besoin.</p>
          <Link href="/business-plan" className="mt-6 font-semibold text-brand">Composer mon plan →</Link>
        </article>
      </section>

      {/* Modèles de CV */}
      <section className="wrap section">
        <div className="max-w-2xl">
          <p className="eyebrow">Modèles de CV</p>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Un modèle pour chaque parcours.</h2>
          <p className="lead mt-4">Changez de modèle en un geste : votre contenu suit. Le CV se télécharge en PDF, prêt à envoyer.</p>
        </div>
        <div className="mt-10">
          <ModelesVitrine />
        </div>
        <p className="mt-2 text-xs text-muted">Aperçus réalisés avec un CV fictif.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/cv/creer" className="btn-primary">Essayer un modèle</Link>
          <Link href="/espace/cv" className="btn-ghost">Déposer mon CV existant</Link>
        </div>
      </section>

      {/* Offres d'emploi */}
      <section className="wrap">
        <div className="rounded-[2rem] bg-ink px-7 py-12 text-white sm:px-12 sm:py-16">
          <p className="text-sm font-semibold text-white/60">Offres d&apos;emploi</p>
          <h2 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">Les offres viennent à vous.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["Nous cherchons chaque jour", "Les offres publiées sont rassemblées et comparées à votre CV, ou aux CV de votre espace que vous avez cochés."],
              ["Vous êtes prévenu", "Une notification arrive dans votre espace dès qu'une offre correspond à votre profil."],
              ["Vous adaptez et postulez", "Un clic crée une version de votre CV ajustée à l'annonce. Vous postulez, votre suivi se met à jour."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-white/70">{d}</p>
              </div>
            ))}
          </div>
          <Link href="/espace/offres" className="btn mt-10 bg-white text-ink hover:bg-white/90">Voir les offres pour mon profil</Link>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="wrap section scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Tarifs</p>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Le prix, avant de commander.</h2>
          <p className="lead mt-4">Tout est affiché. Vous décidez en connaissance de cause.</p>
        </div>
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">Relecture et correction</h3>
            <p className="mt-2 text-muted">Indiquez le nombre de mots, ou collez votre texte : le prix s&apos;ajuste selon le délai voulu.</p>
            <div className="mt-5"><RelectureCalculator settings={reglages.relecture} /></div>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold">Assistance à la rédaction</h3>
              <ul className="mt-4 divide-y divide-line rounded-3xl border border-line">
                {NIVEAUX_REDACTION.map((n) => (
                  <li key={n.code} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span><span className="block font-semibold">{n.label}</span><span className="block text-sm text-muted">{n.detail}</span></span>
                    <span className="display shrink-0 text-lg font-semibold tabular-nums">{fcfa(reglages.redaction[n.code])}</span>
                  </li>
                ))}
              </ul>
              <Link href="/memoires#assistance" className="mt-3 inline-block font-semibold text-brand">Demander un accompagnement →</Link>
            </div>
            <div className="tile !p-7">
              <h3 className="text-2xl font-bold">Business plan</h3>
              <p className="mt-2 text-muted">Prix par élément coché. Composez votre plan : le total se calcule sous vos yeux, sans inscription.</p>
              <Link href="/business-plan" className="mt-4 inline-block font-semibold text-brand">Composer mon business plan →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Avec ou sans compte */}
      <section className="wrap">
        <h2 className="max-w-3xl text-4xl font-bold sm:text-5xl">Essayez d&apos;abord. Inscrivez-vous seulement si besoin.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="tile">
            <h3 className="text-xl font-semibold">Sans inscription</h3>
            <ul className="mt-4 space-y-3">
              {SANS_COMPTE.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="text-brand">✓</span>{x}</li>)}
            </ul>
          </div>
          <div className="tile">
            <h3 className="text-xl font-semibold">Avec votre espace gratuit</h3>
            <ul className="mt-4 space-y-3">
              {AVEC_COMPTE.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="text-brand">✓</span>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Déroulé */}
      <section className="wrap section">
        <h2 className="text-4xl font-bold sm:text-5xl">Comment ça se passe.</h2>
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map(([titre, texte], i) => (
            <li key={titre} className="border-t border-ink pt-4">
              <span className="text-sm font-semibold text-muted">Étape {i + 1}</span>
              <h3 className="mt-1 text-xl font-semibold">{titre}</h3>
              <p className="mt-2 text-muted">{texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Questions */}
      <section className="wrap pb-8">
        <h2 className="text-4xl font-bold sm:text-5xl">Questions fréquentes.</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map(([q, r]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {q}
                <span aria-hidden className="text-2xl font-normal text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-muted">{r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Clôture */}
      <section className="wrap section text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-bold sm:text-6xl">Commencez par votre CV.</h2>
        <p className="lead mx-auto mt-4 max-w-xl">Quelques minutes, sans inscription. Vous déciderez ensuite de la suite.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cv/creer" className="btn-primary">Créer mon CV</Link>
          <Link href="/espace/cv" className="btn-ghost">Déposer mon CV existant</Link>
        </div>
      </section>
    </PublicPage>
  );
}
