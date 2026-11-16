import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { Logo } from "@/components/Site";

export const metadata: Metadata = { title: "Créer un compte" };

export default function Inscription() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <Logo />
      <h1 className="mt-6 text-3xl font-bold">Créez votre espace.</h1>
      <p className="mb-6 mt-2 text-muted">Gratuit. Vous ne payez que les documents que vous commandez.</p>
      <Suspense>
        <AuthForm mode="inscription" />
      </Suspense>
    </main>
  );
}
