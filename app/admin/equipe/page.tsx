"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Membre = { email: string; nom?: string | null; role: "admin" | "moderateur" };

const ROLES = { admin: "Administrateur", moderateur: "Modérateur" };

export default function AdminEquipe() {
  const supabase = useMemo(() => createClient(), []);
  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [invitations, setInvitations] = useState<Membre[]>([]);
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  const charger = useCallback(async () => {
    const { data } = await supabase.rpc("bd_list_staff");
    setMembres(data?.membres ?? []);
    setInvitations(data?.invitations ?? []);
  }, [supabase]);
  useEffect(() => {
    charger();
  }, [charger]);

  async function definir(email: string, role: "admin" | "moderateur" | "client") {
    setOccupe(true);
    setMessage("");
    const { data, error } = await supabase.rpc("bd_set_staff", { p_email: email, p_role: role });
    setOccupe(false);
    if (error) setMessage(error.message.includes("propres droits") ? "Vous ne pouvez pas retirer vos propres droits d'administration." : "La mise à jour a échoué. Vérifiez l'adresse e-mail.");
    else if (data === "invitation_creee") setMessage("Invitation enregistrée : le rôle sera attribué dès que cette personne créera son compte avec cette adresse.");
    else if (data === "invitation_retiree") setMessage("Invitation retirée.");
    else setMessage("Rôle mis à jour.");
    charger();
    return !error;
  }

  async function ajouter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (await definir(String(f.get("email") || ""), f.get("role") === "admin" ? "admin" : "moderateur")) form.reset();
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Équipe</h1>
      <p className="mt-1 text-muted">
        Les modérateurs traitent les commandes : ils voient les demandes, téléchargent les documents des clients, écrivent au
        client et livrent. Les tarifs, les sources d&apos;offres, le journal, l&apos;annulation d&apos;une commande et cette page restent
        réservés aux administrateurs.
      </p>
      {message && <p role="status" className="alert-info mt-4">{message}</p>}

      <form onSubmit={ajouter} className="card mt-6 space-y-4">
        <h2 className="text-lg font-bold">Ajouter un membre</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <label className="block">
            <span className="label">Adresse e-mail du compte</span>
            <input name="email" type="email" required autoComplete="off" className="input" />
          </label>
          <label className="block">
            <span className="label">Rôle</span>
            <select name="role" defaultValue="moderateur" className="input">
              <option value="moderateur">Modérateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={occupe} className="btn-primary">Ajouter</button>
        <p className="text-xs text-muted">Si la personne n&apos;a pas encore de compte, le rôle lui sera donné à sa première connexion.</p>
      </form>

      <h2 className="mt-8 text-xl font-bold">Membres</h2>
      {membres === null ? (
        <p className="mt-3 text-muted">Chargement…</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {membres.map((m) => (
            <li key={m.email} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
              <div className="min-w-0">
                <p className="truncate font-bold">{m.nom || m.email}</p>
                <p className="truncate text-sm text-muted">{m.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={m.role === "admin" ? "badge-green" : "badge-blue"}>{ROLES[m.role]}</span>
                <button disabled={occupe} onClick={() => definir(m.email, m.role === "admin" ? "moderateur" : "admin")} className="btn-ghost">
                  {m.role === "admin" ? "Passer modérateur" : "Passer administrateur"}
                </button>
                <button disabled={occupe} onClick={() => window.confirm(`Retirer ${m.email} de l'équipe ?`) && definir(m.email, "client")} className="btn-danger">Retirer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {invitations.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-bold">Invitations en attente</h2>
          <ul className="mt-3 space-y-2">
            {invitations.map((m) => (
              <li key={m.email} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                <p className="truncate text-sm">{m.email}</p>
                <div className="flex items-center gap-2">
                  <span className="badge-amber">{ROLES[m.role]} — compte pas encore créé</span>
                  <button disabled={occupe} onClick={() => definir(m.email, "client")} className="btn-danger">Annuler</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
