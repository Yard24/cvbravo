"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function messageErreur(msg: string): string {
  if (/invalid login/i.test(msg)) return "Adresse e-mail ou mot de passe incorrect.";
  if (/already registered|already been registered/i.test(msg)) return "Un compte existe déjà avec cette adresse. Connectez-vous.";
  if (/not confirmed/i.test(msg)) return "Votre adresse n'est pas encore confirmée. Ouvrez le lien reçu par e-mail.";
  if (/password/i.test(msg) && /6|short|weak/i.test(msg)) return "Choisissez un mot de passe d'au moins 8 caractères.";
  if (/rate limit/i.test(msg)) return "Trop de tentatives. Réessayez dans quelques minutes.";
  return "Une erreur est survenue. Vérifiez votre connexion et réessayez.";
}

export default function AuthForm({ mode }: { mode: "connexion" | "inscription" }) {
  const router = useRouter();
  const params = useSearchParams();
  const suite = params.get("suite");
  const destination = suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : "/espace";
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState(params.get("erreur") ? "Le lien de confirmation est invalide ou expiré." : "");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setInfo("");
    setEnvoi(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const supabase = createClient();
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setErreur(messageErreur(error.message));
        router.replace(destination);
        router.refresh();
      } else {
        if (password.length < 8) return setErreur("Choisissez un mot de passe d'au moins 8 caractères.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(f.get("nom") || "").trim(), phone: String(f.get("telephone") || "").trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?suite=${encodeURIComponent(destination)}`,
          },
        });
        if (error) return setErreur(messageErreur(error.message));
        if (data.session) {
          router.replace(destination);
          router.refresh();
        } else {
          setInfo("Compte créé. Ouvrez le lien de confirmation que nous venons d'envoyer à votre adresse e-mail, puis connectez-vous.");
        }
      }
    } finally {
      setEnvoi(false);
    }
  }

  const lienSuite = suite ? `?suite=${encodeURIComponent(suite)}` : "";

  return (
    <form onSubmit={soumettre} className="card space-y-4" noValidate={false}>
      {erreur && <p role="alert" className="alert-error">{erreur}</p>}
      {info && <p role="status" className="alert-ok">{info}</p>}
      {mode === "inscription" && (
        <>
          <div>
            <label htmlFor="nom" className="label">Nom et prénoms</label>
            <input id="nom" name="nom" required autoComplete="name" className="input" />
          </div>
          <div>
            <label htmlFor="telephone" className="label">Téléphone (WhatsApp de préférence)</label>
            <input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+229 01 00 00 00 00" className="input" />
          </div>
        </>
      )}
      <div>
        <label htmlFor="email" className="label">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "inscription" ? 8 : undefined}
          autoComplete={mode === "connexion" ? "current-password" : "new-password"}
          className="input"
        />
        {mode === "inscription" && <p className="mt-1 text-xs text-muted">8 caractères au minimum.</p>}
      </div>
      <button type="submit" disabled={envoi} className="btn-primary w-full">
        {envoi ? "Un instant…" : mode === "connexion" ? "Se connecter" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "connexion" ? (
          <>Pas encore de compte ? <Link href={`/inscription${lienSuite}`} className="font-semibold text-brand">Créer un compte</Link></>
        ) : (
          <>Déjà inscrit ? <Link href={`/connexion${lienSuite}`} className="font-semibold text-brand">Se connecter</Link></>
        )}
      </p>
    </form>
  );
}
