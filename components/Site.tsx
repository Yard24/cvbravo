import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="display flex items-center gap-2 text-lg font-bold text-ink">
      <span aria-hidden className="grid h-7 w-7 place-items-center rounded-[9px] bg-ink text-xs text-white">B</span>
      Bravodocs
    </Link>
  );
}

const SERVICES = [
  { href: "/cv", label: "CV et emploi" },
  { href: "/memoires", label: "Mémoires" },
  { href: "/business-plan", label: "Business plan" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-xl">
      <div className="wrap flex h-14 items-center justify-between gap-3">
        <Logo />
        <nav aria-label="Services" className="hidden items-center gap-8 text-sm text-ink/80 md:flex">
          {SERVICES.map((s) => <Link key={s.href} href={s.href} className="hover:text-ink">{s.label}</Link>)}
          <Link href="/#tarifs" className="hover:text-ink">Tarifs</Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/connexion" className="hidden text-ink/80 hover:text-ink sm:block">Se connecter</Link>
          <Link href="/espace" className="btn-primary !min-h-9 !px-4 !py-1.5">Mon espace</Link>
        </div>
      </div>
      <nav aria-label="Services (mobile)" className="wrap flex gap-6 overflow-x-auto pb-2.5 text-sm text-ink/80 md:hidden">
        {SERVICES.map((s) => <Link key={s.href} href={s.href} className="shrink-0">{s.label}</Link>)}
        <Link href="/#tarifs" className="shrink-0">Tarifs</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-tile text-sm">
      <div className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-muted">CV, mémoires et business plans, faits avec soin et livrés à l&apos;heure.</p>
        </div>
        <div>
          <p className="font-semibold">CV et emploi</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/cv/creer" className="hover:text-ink">Créer un CV sans compte</Link></li>
            <li><Link href="/espace/cv" className="hover:text-ink">Déposer mon CV</Link></li>
            <li><Link href="/espace/offres" className="hover:text-ink">Offres pour mon profil</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Documents</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/memoires" className="hover:text-ink">Relecture et correction</Link></li>
            <li><Link href="/memoires#assistance" className="hover:text-ink">Assistance à la rédaction</Link></li>
            <li><Link href="/business-plan" className="hover:text-ink">Business plan à la carte</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Compte</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/inscription" className="hover:text-ink">Créer un compte</Link></li>
            <li><Link href="/connexion" className="hover:text-ink">Se connecter</Link></li>
            <li><Link href="/espace/commandes" className="hover:text-ink">Suivre mes commandes</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} Bravodocs. Prix affichés en francs CFA.
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
