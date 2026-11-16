export type CvData = {
  nom?: string;
  titre?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  profil?: string;
  experiences?: { poste?: string; entreprise?: string; lieu?: string; debut?: string; fin?: string; description?: string }[];
  formations?: { diplome?: string; etablissement?: string; annee?: string }[];
  competences?: string[];
  langues?: string[];
  centres?: string[];
};

export type Cv = {
  id: string;
  user_id: string;
  title: string;
  template: "classique" | "moderne" | "compact";
  data: CvData;
  source_document_id: string | null;
  parent_cv_id: string | null;
  offer_id: string | null;
  status: "brouillon" | "en_traitement" | "pret";
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  service: "cv_refonte" | "cv_adaptation" | "relecture" | "redaction" | "business_plan";
  title: string;
  details: Record<string, any>;
  document_id: string | null;
  amount: number;
  status: "en_attente_paiement" | "payee" | "en_cours" | "livree" | "annulee";
  deliverable_path: string | null;
  admin_note: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
};

export type Offer = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  description: string | null;
  published_at: string | null;
  created_at: string;
};

export const STATUTS_COMMANDE: Record<Order["status"], { label: string; ton: string }> = {
  en_attente_paiement: { label: "En attente de paiement", ton: "badge-amber" },
  payee: { label: "Payée — à traiter", ton: "badge-green" },
  en_cours: { label: "En cours", ton: "badge-blue" },
  livree: { label: "Livrée", ton: "badge-green" },
  annulee: { label: "Annulée", ton: "badge-gray" },
};

export const SERVICES: Record<Order["service"], string> = {
  cv_refonte: "Refonte de CV",
  cv_adaptation: "Adaptation de CV",
  relecture: "Relecture et correction",
  redaction: "Assistance à la rédaction",
  business_plan: "Business plan",
};

export function dateFr(d: string | null | undefined, avecHeure = false): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(avecHeure ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(d));
}
