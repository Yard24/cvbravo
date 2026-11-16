import type { CvData } from "./types";

/** CV fictif utilisé pour montrer les modèles. Toute ressemblance avec une personne réelle serait fortuite. */
export const CV_EXEMPLE: CvData = {
  nom: "Aïcha Dossou",
  titre: "Chargée de projets",
  email: "aicha.dossou@exemple.org",
  telephone: "+229 01 00 00 00 00",
  ville: "Cotonou",
  profil:
    "Chargée de projets avec six ans d'expérience dans la conduite de programmes de développement local : planification, suivi budgétaire et coordination d'équipes de terrain.",
  experiences: [
    { poste: "Chargée de projets", entreprise: "Association Exemple", lieu: "Cotonou", debut: "2021", fin: "Présent", description: "• Pilotage de quatre projets financés par des bailleurs\n• Suivi budgétaire et rapports trimestriels\n• Encadrement de huit animateurs de terrain" },
    { poste: "Assistante de programme", entreprise: "Bureau d'études Exemple", lieu: "Parakou", debut: "2018", fin: "2021", description: "• Collecte et analyse de données d'enquête\n• Rédaction des comptes rendus de mission" },
  ],
  formations: [
    { diplome: "Master en gestion de projets", etablissement: "Université d'Abomey-Calavi", annee: "2018" },
    { diplome: "Licence en sociologie", etablissement: "Université de Parakou", annee: "2016" },
  ],
  competences: ["Gestion de projet", "Suivi-évaluation", "Budget", "Excel", "Rédaction de rapports"],
  langues: ["Français", "Anglais", "Fon"],
  centres: ["Lecture", "Bénévolat"],
};
