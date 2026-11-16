# Bravodocs

Site de production de documents : refonte de CV avec alertes emploi, relecture et assistance mémoire, business plan à la carte.

## Pile technique

- **Next.js 15** (App Router, TypeScript, Tailwind CSS 4) — déployé sur **Vercel**
- **Supabase** (projet ENTREPRYZ) — authentification, base Postgres, stockage des fichiers.
  Toutes les tables du site sont dans le schéma `public` avec le préfixe `bd_` ; le fichier
  Le schéma est créé par la migration Supabase `bd_bravodocs_site_init`.

## Ce que fait le site

| Zone | Pages |
| --- | --- |
| Vitrine | `/`, `/cv`, `/memoires`, `/business-plan` |
| Compte | `/inscription`, `/connexion` |
| Espace client | `/espace` (tableau de bord), CV, offres, candidatures, commandes, notifications |
| Commandes | `/espace/memoires/relecture`, `/espace/memoires/redaction`, `/espace/business-plan` |
| Administration | `/admin` (commandes, sources d'offres, tarifs, journal) |

### Tarifs

- **Relecture** : tarif dégressif `prix = 200 × mots^e`, avec `e` calculé pour que 20 000 mots coûtent 10 000 F CFA
  (1 mot = 200 F). Coefficients de délai : standard ×1, moins de 7 jours ×1,25, moins de 3 jours ×1,5, moins de 12 h ×2.
  Le calcul qui fait foi est la fonction SQL `bd_price_relecture`.
- **Assistance à la rédaction** : licence 100 000, master professionnel 180 000, master de recherche 250 000.
- **Business plan** : somme des éléments cochés (table `bd_bp_items`).
- Tout est modifiable dans `/admin/tarifs`.

### Offres d'emploi

1. `/api/cron/offres` (Vercel Cron, tous les jours) lit les flux RSS de `bd_job_sources`.
2. Chaque offre est standardisée dans `bd_job_offers` (titre, lien, description, date, mots-clés).
3. `bd_run_matching` compare les mots-clés des CV à ceux des offres, crée `bd_job_matches` et une notification.
4. « Adapter mon CV et postuler » crée une copie du CV pour l'offre, une candidature et une tâche IA.

### Traitements IA

Les tâches (`bd_ai_jobs` : structuration d'un CV déposé, adaptation à une offre) sont traitées par une tâche
planifiée Claude quotidienne, qui écrit le résultat dans `bd_cvs` et une ligne dans `bd_journal`.

### Paiement

Mode test : `bd_pay_test` simule un paiement réussi. Pour un vrai prestataire, appeler `bd__mark_paid`
depuis le webhook du prestataire et passer `bd_settings.paiement.mode` à une autre valeur que `test`.

## Variables d'environnement

Voir `.env.example`. `BD_SERVER_SECRET` doit correspondre à l'empreinte SHA-256 stockée dans `bd_server_secrets`.

## Rôles

- **Administrateur** : tout le back-office (tarifs, sources d'offres, journal, équipe, annulation de commande).
- **Modérateur** : traite les commandes (lecture des demandes et documents, message au client, livraison).

Les rôles se gèrent dans `/admin/equipe` (fonction `bd_set_staff`). Une adresse sans compte reçoit une invitation
(`bd_staff_invites`) : le rôle est attribué à la première connexion, une fois l'adresse confirmée.

## Développement

```bash
npm install
npm run dev
```
