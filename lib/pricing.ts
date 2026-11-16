export type RelectureSettings = {
  prix_min: number;
  mots_ref: number;
  prix_ref: number;
  arrondi: number;
  urgences: Record<string, { label: string; coef: number }>;
};

export const RELECTURE_DEFAUT: RelectureSettings = {
  prix_min: 200,
  mots_ref: 20000,
  prix_ref: 10000,
  arrondi: 50,
  urgences: {
    standard: { label: "Standard (plus de 7 jours)", coef: 1 },
    "7j": { label: "En moins de 7 jours", coef: 1.25 },
    "3j": { label: "En moins de 3 jours", coef: 1.5 },
    "12h": { label: "En moins de 12 heures", coef: 2 },
  },
};

export const ORDRE_URGENCES = ["standard", "7j", "3j", "12h"];

/**
 * Tarif dégressif « par élasticité » : prix = prix_min × mots^e,
 * avec e calculé pour que mots_ref coûte exactement prix_ref.
 * La même formule existe côté base (bd_price_relecture), qui fait foi.
 */
export function prixRelecture(mots: number, urgence: string, s: RelectureSettings = RELECTURE_DEFAUT): number {
  if (!mots || mots < 1) return 0;
  const e = Math.log(s.prix_ref / s.prix_min) / Math.log(s.mots_ref);
  const coef = s.urgences[urgence]?.coef ?? 1;
  const brut = Math.round(s.prix_min * Math.pow(mots, e) * coef * 100) / 100;
  return Math.ceil(brut / s.arrondi) * s.arrondi;
}

export function compterMots(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}

export function fcfa(n: number | null | undefined): string {
  return `${new Intl.NumberFormat("fr-FR").format(n ?? 0)} F CFA`;
}

export const NIVEAUX_REDACTION: { code: string; label: string; detail: string }[] = [
  { code: "licence", label: "Licence", detail: "Mémoire ou rapport de fin de cycle" },
  { code: "master_pro", label: "Master professionnel", detail: "Mémoire professionnel, étude de cas" },
  { code: "master_recherche", label: "Master de recherche", detail: "Mémoire de recherche, revue de littérature" },
];
