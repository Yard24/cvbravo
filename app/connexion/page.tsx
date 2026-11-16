import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { Logo } from "@/components/Site";

export const metadata: Metadata = { title: "Se connecter" };

export default function Connexion() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <Logo />
      <h1 className="mt-6 text-3xl font-bold">Bon retour.</h1>
      <p className="mb-6 mt-2 text-muted">Connectez-vous pour retrouver vos CV, vos offres et vos commandes.</p>
      <Suspense>
        <AuthForm mode="connexion" />
      </Suspense>
    </main>
  );
}
