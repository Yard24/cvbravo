import type { Metadata } from "next";
import EspaceShell from "@/components/EspaceShell";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return <EspaceShell>{children}</EspaceShell>;
}
