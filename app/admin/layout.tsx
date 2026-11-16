import type { Metadata } from "next";
import EspaceShell from "@/components/EspaceShell";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <EspaceShell zone="admin">{children}</EspaceShell>;
}
