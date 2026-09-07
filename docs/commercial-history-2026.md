# Historique commercial partagé — v1

Le contrat runtime `lib/crm/contact-event-contract.ts` correspond à celui d'AI-Team. `POST /api/internal/crm/contact-events` reste authentifié par les clés serveur existantes ; la forme v0 reste acceptée pendant la transition.

Kinds v1 : EMAIL_SENT, EMAIL_REPLIED, EMAIL_BOUNCED, EMAIL_REJECTED, DO_NOT_CONTACT, FOLLOW_UP_SENT (sequence 1/2 obligatoire), FOLLOW_UP_SKIPPED, PROSPECT_DORMANT. Identité source et idempotencyKey stables, remoteId vérifié. Aucun body complet.

La transaction insère un événement unique, puis projette l'état commercial. Un replay ne modifie rien ; la même clé avec un autre contenu est refusée. Les événements anciens arrivés après une réponse/refus/bounce/dormance ne rouvrent pas le contact. Un signal positif explicite prépare `opportunity_suggested`, sans réponse automatique.

Le lookup retourne `commercialContractVersion=1`, doNotContact, hasReplied, hasBounced, closed (inclut archivage), dormant, commercialStatus, nextActionAt et followUpCount. Le statut rendez-vous signale une opportunité active. Plusieurs correspondances possibles donnent 409 plutôt qu'un choix arbitraire. Le statut perdu n'est toujours pas converti automatiquement en opt-out.

Migration locale proposée : `sql/20260907-commercial-history.sql`, après les fondations `20260905-crm-foundations.sql`. Champs commerciaux additifs, élargissement de la contrainte des événements ; aucune suppression de fiche, de données ou d'ID. Pas de modification de la facturation ni de refonte UX.

Valider avec la base jetable locale `crm_foundations_test` : typecheck, lint, tests, build, puis `npm run test:critical-postgres` (CRM_TEST_DATABASE_URL obligatoire ; aucun fallback Production).

Déploiement ultérieur : base CRM puis application CRM, vérifier le contrat v1, puis migrations/application AI-Team. Aucun déploiement ou migration Production effectué pendant ce lot. Le détail des séquences, reprise et audit historique est documenté côté AI-Team dans `docs/commercial-contract-2026.md`.
