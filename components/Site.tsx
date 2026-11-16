import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="display flex items-center gap-2 text-xl font-extrabold text-ink">
      <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">
        B
      </span>
      Bravodocs
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav aria-label="Services" className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link href="/cv" className="hover:text-brand">CV et offres d&apos;emploi</Link>
          <Link href="/memoires" className="hover:text-brand">Mémoires</Link>
          <Link href="/business-plan" className="hover:text-brand">Business plan</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/connexion" className="hidden text-sm font-semibold text-ink hover:text-brand sm:block">
            Se connecter
          </Link>
          <Link href="/espace" className="btn-primary">Mon espace</Link>
        </div>
      </div>
      <nav aria-label="Services (mobile)" className="wrap flex gap-5 overflow-x-auto pb-2.5 text-sm font-medium text-muted md:hidden">
        <Link href="/cv" className="shrink-0">CV et offres</Link>
        <Link href="/memoires" className="shrink-0">Mémoires</Link>
        <Link href="/business-plan" className="shrink-0">Business plan</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Vos documents importants, bien faits : CV, mémoires et business plans.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Services</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link href="/cv" className="hover:text-brand">Refonte de CV et alertes emploi</Link></li>
            <li><Link href="/memoires" className="hover:text-brand">Relecture et assistance mémoire</Link></li>
            <li><Link href="/business-plan" className="hover:text-brand">Business plan à la carte</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Votre compte</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link href="/inscription" className="hover:text-brand">Créer un compte</Link></li>
            <li><Link href="/connexion" className="hover:text-brand">Se connecter</Link></li>
            <li><Link href="/espace/commandes" className="hover:text-brand">Suivre mes commandes</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
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
