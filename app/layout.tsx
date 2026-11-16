import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bravodocs — CV, mémoires et business plans", template: "%s — Bravodocs" },
  description:
    "Bravodocs refait votre CV, vous alerte sur les offres d'emploi qui vous correspondent, corrige votre mémoire et rédige votre business plan. Tarifs clairs en francs CFA.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e5a47" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
