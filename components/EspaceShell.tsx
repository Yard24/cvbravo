"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Site";

type Profil = { id: string; full_name: string | null; phone: string | null; is_admin: boolean; is_moderator: boolean };
type Ctx = { userId: string; email: string; profil: Profil; rafraichirNotifs: () => void };

const EspaceContext = createContext<Ctx | null>(null);

export function useEspace(): Ctx {
  const c = useContext(EspaceContext);
  if (!c) throw new Error("useEspace hors de EspaceShell");
  return c;
}

const LIENS = [
  { href: "/espace", label: "Accueil" },
  { href: "/espace/cv", label: "Mes CV" },
  { href: "/espace/offres", label: "Offres" },
  { href: "/espace/candidatures", label: "Candidatures" },
  { href: "/espace/commandes", label: "Commandes" },
  { href: "/espace/notifications", label: "Notifications" },
];

const LIENS_ADMIN = [
  { href: "/admin", label: "Commandes", adminSeul: false },
  { href: "/admin/offres", label: "Sources d'offres", adminSeul: true },
  { href: "/admin/tarifs", label: "Tarifs", adminSeul: true },
  { href: "/admin/equipe", label: "Équipe", adminSeul: true },
  { href: "/admin/journal", label: "Journal", adminSeul: true },
];

export default function EspaceShell({ children, zone = "espace" }: { children: React.ReactNode; zone?: "espace" | "admin" }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const router = useRouter();
  const [ctx, setCtx] = useState<Omit<Ctx, "rafraichirNotifs"> | null>(null);
  const [nonLues, setNonLues] = useState(0);
  const [erreur, setErreur] = useState("");

  const rafraichirNotifs = useCallback(async () => {
    const { count } = await supabase.from("bd_notifications").select("id", { count: "exact", head: true }).is("read_at", null);
    setNonLues(count ?? 0);
  }, [supabase]);

  useEffect(() => {
    let actif = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");
      const { data: profil, error } = await supabase.rpc("bd_ensure_profile", {
        p_full_name: user.user_metadata?.full_name ?? null,
        p_phone: user.user_metadata?.phone ?? null,
      });
      if (!actif) return;
      if (error || !profil) return setErreur("Impossible de charger votre espace. Vérifiez votre connexion puis rechargez la page.");
      setCtx({ userId: user.id, email: user.email ?? "", profil });
      rafraichirNotifs();
    })();
    return () => {
      actif = false;
    };
  }, [supabase, router, rafraichirNotifs]);

  async function deconnexion() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (erreur) return <main className="wrap py-16"><p role="alert" className="alert-error">{erreur}</p></main>;
  if (!ctx) return <main className="wrap py-16 text-muted" aria-busy="true">Chargement de votre espace…</main>;
  const equipe = ctx.profil.is_admin || ctx.profil.is_moderator;
  const pageAdminSeul = zone === "admin" && LIENS_ADMIN.some((l) => l.adminSeul && pathname.startsWith(l.href));
  if (zone === "admin" && (!equipe || (pageAdminSeul && !ctx.profil.is_admin))) {
    return (
      <main className="wrap py-16">
        <h1 className="text-2xl font-bold">Accès réservé à l&apos;équipe</h1>
        <p className="mt-2 text-muted">
          {equipe ? "Cette page est réservée aux administrateurs." : "Ce compte ne fait pas partie de l'équipe."}
        </p>
        <Link href={equipe ? "/admin" : "/espace"} className="btn-primary mt-5">{equipe ? "Retour aux commandes" : "Retour à mon espace"}</Link>
      </main>
    );
  }

  const liens = zone === "admin" ? LIENS_ADMIN.filter((l) => ctx.profil.is_admin || !l.adminSeul) : LIENS;
  const actif = (href: string) => (href === "/espace" || href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <EspaceContext.Provider value={{ ...ctx, rafraichirNotifs }}>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-xl print:hidden">
        <div className="wrap flex h-14 items-center justify-between gap-3">
          <Logo href="/espace" />
          <div className="flex items-center gap-2 text-sm">
            {equipe && (
              <Link href={zone === "admin" ? "/espace" : "/admin"} className="btn-ghost !min-h-9 !px-3 !py-1.5">
                {zone === "admin" ? "Espace client" : ctx.profil.is_admin ? "Administration" : "Commandes à traiter"}
              </Link>
            )}
            <button onClick={deconnexion} className="btn-ghost !min-h-9 !px-3 !py-1.5">Déconnexion</button>
          </div>
        </div>
        <nav aria-label={zone === "admin" ? "Administration" : "Mon espace"} className="wrap flex gap-1 overflow-x-auto pb-2">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={actif(l.href) ? "page" : undefined}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${
                actif(l.href) ? "bg-ink text-white" : "text-muted hover:bg-tile hover:text-ink"
              }`}
            >
              {l.label}
              {l.href === "/espace/notifications" && nonLues > 0 && (
                <span className="ml-1.5 rounded-full bg-sun px-1.5 py-0.5 text-xs text-ink">{nonLues}</span>
              )}
            </Link>
          ))}
        </nav>
      </header>
      <main className="wrap py-6 sm:py-8">{children}</main>
    </EspaceContext.Provider>
  );
}
