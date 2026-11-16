import type { CvData } from "./types";

/**
 * Lecture automatique d'un CV à partir de son texte brut.
 * Heuristique (pas d'IA) : repère les rubriques par leurs titres, les coordonnées par leur forme,
 * les expériences et formations par leurs dates. Le résultat est un point de départ que la personne corrige.
 */

type Rubrique = "profil" | "experiences" | "formations" | "competences" | "langues" | "centres" | "autre";

const TITRES: [Rubrique, RegExp][] = [
  ["experiences", /^(experiences?( professionnelles?)?|parcours professionnel|experience de travail|work experience|professional experience|employment( history)?|emplois?|stages?( et experiences?)?)$/],
  ["formations", /^(formations?( academiques?| et diplomes?)?|education|etudes|diplomes?( et formations?)?|cursus( academique)?|parcours (academique|scolaire|universitaire)|academic background)$/],
  ["competences", /^(competences?( cles| techniques| professionnelles| informatiques)?|skills|technical skills|aptitudes|savoir[- ]faire|connaissances( informatiques)?|outils( informatiques)?|informatique|logiciels|atouts)$/],
  ["langues", /^(langues?( parlees)?|languages?|competences linguistiques)$/],
  ["centres", /^(centres? d ?interets?|loisirs|hobbies|interets|interests|activites extra[- ]professionnelles|divers)$/],
  ["profil", /^(profil( professionnel)?|a propos( de moi)?|resume|objectif( professionnel)?|summary|profile|about me|presentation)$/],
  ["autre", /^(references?|certifications?|coordonnees|contact|informations personnelles|etat civil|distinctions|publications|projets?)$/],
];

const VILLES = /\b(Cotonou|Porto[- ]Novo|Abomey[- ]Calavi|Calavi|Parakou|Bohicon|Ouidah|Natitingou|Lokossa|Djougou|Lom[ée]|Abidjan|Dakar|Ouagadougou|Niamey|Bamako|Accra|Lagos|Douala|Yaound[ée]|Libreville|Kinshasa|Conakry|Paris)\b/i;
const MOIS = "janv(?:ier)?|f[ée]vr(?:ier)?|mars|avr(?:il)?|mai|juin|juil(?:let)?|ao[uû]t|sept(?:embre)?|oct(?:obre)?|nov(?:embre)?|d[ée]c(?:embre)?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|october|november|december";
const UNE_DATE = `(?:(?:${MOIS})\\.?\\s+)?(?:\\d{1,2}[/.-])?(?:19|20)\\d{2}`;
const FIN = `(?:${UNE_DATE}|pr[ée]sent|aujourd'?hui|[àa] ce jour|ce jour|en cours|actuel(?:lement)?|now|present|current)`;
const PERIODE = new RegExp(`(?:depuis\\s+)?(${UNE_DATE})(?:\\s*(?:-|–|—|à|au|to|jusqu'?(?:à|en))\\s*(${FIN}))?`, "i");

const normaliser = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 -]+/g, " ").replace(/\s+/g, " ").trim();

function rubriqueDe(ligne: string): Rubrique | null {
  if (ligne.length > 48) return null;
  const n = normaliser(ligne);
  if (!n) return null;
  for (const [r, re] of TITRES) if (re.test(n)) return r;
  return null;
}

const sansPuce = (s: string) => s.replace(/^[\s•·▪■●○◦\-–—*>✓✔➢➤]+/, "").trim();
const estPuce = (s: string) => /^[\s]*[•·▪■●○◦\-–—*>✓✔➢➤]/.test(s);

function liste(lignes: string[], max = 30): string[] {
  const vus = new Set<string>();
  const out: string[] = [];
  for (const l of lignes) {
    for (const morceau of l.split(/[,;•·|▪■●]|\s{3,}|\s[–—]\s/)) {
      const v = sansPuce(morceau).replace(/\.$/, "").trim();
      const cle = v.toLowerCase();
      if (v.length >= 2 && v.length <= 70 && !vus.has(cle)) {
        vus.add(cle);
        out.push(v);
      }
    }
  }
  return out.slice(0, max);
}

function couper(titre: string): [string, string] {
  const m = titre.match(/^(.{3,}?)\s+(?:chez|at|@)\s+(.{2,})$/i) || titre.match(/^(.{3,}?)\s*(?:\s[-–—|]\s|,\s)(.{2,})$/);
  return m ? [m[1].trim(), m[2].trim()] : [titre.trim(), ""];
}

type Bloc = { debut: string; fin: string; lignes: string[] };

/** Découpe une rubrique en blocs : chaque ligne portant une date ouvre un nouveau bloc. */
function blocs(lignes: string[]): Bloc[] {
  const out: Bloc[] = [];
  let avant: string[] = [];
  for (const brute of lignes) {
    const m = brute.match(PERIODE);
    const ressembleADate = m && (brute.length < 90 || brute.indexOf(m[0]) < 12 || brute.trimEnd().endsWith(m[0]));
    if (m && ressembleADate) {
      const reste = sansPuce(brute.replace(m[0], " ").replace(/[()[\]]/g, " ").replace(/^[\s:|,–—-]+|[\s:|,–—-]+$/g, "").replace(/\s+/g, " "));
      const bloc: Bloc = { debut: m[1].trim(), fin: (m[2] ?? "").trim(), lignes: [] };
      // un intitulé court placé juste au-dessus de la date appartient à ce bloc, pas au précédent
      const cible = out.length ? out[out.length - 1].lignes : avant;
      if (!reste && cible.length) {
        const derniere = cible[cible.length - 1];
        if (derniere.length < 80 && !estPuce(derniere) && !/[.;:]$/.test(derniere) && (out.length === 0 || cible.length > 2)) {
          bloc.lignes.push(cible.pop()!);
        }
      }
      if (!out.length && avant.length) bloc.lignes.unshift(...avant.splice(0));
      if (reste) bloc.lignes.push(reste);
      out.push(bloc);
    } else if (out.length) out[out.length - 1].lignes.push(brute);
    else avant.push(brute);
  }
  if (!out.length && avant.length) out.push({ debut: "", fin: "", lignes: avant });
  return out;
}

export function analyserCv(texte: string): CvData {
  const lignes = texte.replace(/\r/g, "").replace(/\t/g, "   ").split("\n").map((l) => l.replace(/\s+$/g, "")).filter((l) => l.trim().length > 0).slice(0, 600);
  if (lignes.length === 0) return {};

  const sections: Record<Rubrique | "tete", string[]> = { tete: [], profil: [], experiences: [], formations: [], competences: [], langues: [], centres: [], autre: [] };
  let courante: Rubrique | "tete" = "tete";
  for (const l of lignes) {
    const r = rubriqueDe(l.trim().replace(/[:：]\s*$/, ""));
    if (r) {
      courante = r;
      continue;
    }
    sections[courante].push(l.trim());
  }

  const tout = lignes.join("\n");
  const email = tout.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0] ?? "";
  const telephone = (tout.match(/(?:\+|00)?\d[\d\s().-]{7,17}\d/g) ?? []).map((t) => t.trim()).find((t) => t.replace(/\D/g, "").length >= 8 && !/^(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}$/.test(t)) ?? "";
  const ville = lignes.slice(0, 25).join(" ").match(VILLES)?.[0] ?? "";

  const estCoordonnee = (l: string) => /@|https?:|www\.|linkedin|\d{4,}/i.test(l) || (telephone !== "" && l.includes(telephone));
  const tete = sections.tete.filter((l) => !estCoordonnee(l));
  const nomIdx = tete.findIndex((l) => /^[A-Za-zÀ-ÿ'’.\- ]{4,60}$/.test(l) && l.trim().split(/\s+/).length >= 2 && l.trim().split(/\s+/).length <= 6 && !/curriculum|vitae|^cv$/i.test(l));
  const nom = nomIdx >= 0 ? tete[nomIdx].trim() : "";
  const titre = tete.slice(nomIdx + 1).find((l) => l.length >= 4 && l.length <= 90 && !/curriculum|vitae|n[ée]e? le|ans\b|nationalit|mari[ée]|c[ée]libataire/i.test(l) && !VILLES.test(l)) ?? "";
  const resteTete = tete.filter((l) => l !== nom && l !== titre && l.length > 60);

  const profil = (sections.profil.length ? sections.profil : resteTete).map(sansPuce).join(" ").replace(/\s+/g, " ").slice(0, 700);

  const experiences = blocs(sections.experiences).slice(0, 15).map((b) => {
    const ls = b.lignes.map((x) => x.trim()).filter(Boolean);
    const entetes: string[] = [];
    while (ls.length && entetes.length < 2 && !estPuce(ls[0]) && ls[0].length < 90 && !/[.;]$/.test(ls[0])) entetes.push(ls.shift()!);
    let [poste, entreprise] = couper(entetes[0] ?? "");
    let lieu = "";
    if (entetes[1]) {
      if (!entreprise) [entreprise, lieu] = couper(entetes[1]);
      else ls.unshift(entetes[1]);
    }
    const v = entreprise.match(VILLES);
    if (!lieu && v && entreprise.length > v[0].length + 3) {
      lieu = v[0];
      entreprise = entreprise.replace(v[0], "").replace(/[\s,()–—-]+$/g, "").trim();
    }
    return { poste, entreprise, lieu, debut: b.debut, fin: b.fin, description: ls.map((x) => (estPuce(x) ? `• ${sansPuce(x)}` : x)).join("\n").slice(0, 1200) };
  }).filter((e) => e.poste || e.entreprise || e.description);

  const formations = blocs(sections.formations).slice(0, 12).map((b) => {
    const ls = b.lignes.map(sansPuce).filter(Boolean);
    const [diplome, apres] = couper(ls[0] ?? "");
    const etablissement = apres || ls[1] || "";
    return { diplome, etablissement: etablissement.slice(0, 160), annee: [b.debut, b.fin].filter(Boolean).join(" – ") };
  }).filter((f) => f.diplome || f.etablissement);

  const data: CvData = {
    nom, titre, email, telephone, ville, profil, experiences, formations,
    competences: liste(sections.competences),
    langues: liste(sections.langues, 10),
    centres: liste(sections.centres, 12),
  };
  return data;
}

/** Vrai si la lecture automatique a trouvé assez d'éléments pour préremplir le CV. */
export function cvExploitable(d: CvData): boolean {
  return Boolean(d.nom || d.email || d.experiences?.length || d.formations?.length || d.competences?.length);
}
