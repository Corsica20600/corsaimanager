# Module ventes - Phase 1

## Architecture retenue

Le projet n'utilise pas Prisma. Les fondations du module ventes suivent donc les conventions existantes :

- SQL brut PostgreSQL/Neon via `@neondatabase/serverless`.
- Tables en `snake_case`.
- Identifiants `BIGSERIAL`.
- Dates en `TIMESTAMPTZ`.
- Montants en centimes entiers.
- Données extensibles en `JSONB` lorsque nécessaire.
- Mutations internes futures via Server Actions.
- Webhooks et intégrations externes futures via Route Handlers.

## Client de facturation

Pendant cette phase, aucun modèle client séparé n'est créé.

Les documents de vente référencent `crm_prospects.id`, uniquement lorsque le prospect a le statut `client`. Le contrôle applicatif est préparé dans `assertProspectIsBillingClient`.

## Tables préparées

Le script `sql/create-billing-tables.sql` crée notamment :

- `billing_settings`
- `billing_number_sequences`
- `billing_products`
- `billing_quotes`
- `billing_quote_lines`
- `billing_invoices`
- `billing_invoice_lines`
- `billing_credit_notes`
- `billing_credit_note_lines`
- `billing_payments`
- `billing_subscription_plans`
- `billing_customer_subscriptions`
- `billing_events`
- `billing_stripe_events`

Aucun produit, client, devis ou abonnement fictif n'est inséré.

## Numérotation

La numérotation utilise `billing_number_sequences`.

Le code réserve un numéro avec un `INSERT ... ON CONFLICT DO UPDATE ... RETURNING`, dans une transaction Neon configurée en `Serializable`.

Le prochain numéro n'est jamais calculé avec un `COUNT`.

Exemples de format :

- `DEV-2026-0001`
- `FAC-2026-0001`
- `AV-2026-0001`

## PDF

La dépendance choisie est `@react-pdf/renderer`.

Raison : rendu PDF déclaratif côté serveur Node.js, compatible Vercel sans Chromium ni navigateur headless. La génération concrète des devis, factures et avoirs démarre en Phase 2.

## Stripe

La dépendance `stripe` est installée pour préparer la Phase 4.

Aucune intégration Stripe active n'est créée en Phase 1 :

- pas de Checkout Session ;
- pas de Customer Portal ;
- pas de webhook ;
- pas de produit ou prix Stripe créé.

## Cron

Le cron existant `/api/cron/lead-reminders` est maintenant protégé par `CRON_SECRET`.

Il accepte :

- `Authorization: Bearer <CRON_SECRET>`
- ou `x-cron-secret: <CRON_SECRET>`

Le comportement métier de relance n'est pas modifié après validation du secret.

## Application SQL sur Neon

Ne pas exécuter automatiquement le script en production.

Procédure recommandée :

1. Sauvegarder ou vérifier l'environnement Neon cible.
2. Ouvrir la console SQL Neon du projet CorsaiManager.
3. Coller le contenu complet de `sql/create-billing-tables.sql`.
4. Exécuter le script une fois.
5. Relancer le script si nécessaire : il est conçu pour être idempotent et non destructif.

Alternative CLI locale si `psql` est configuré :

```bash
psql "$DATABASE_URL" -f sql/create-billing-tables.sql
```

## Variables d'environnement ajoutées

- `CRON_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_CUSTOMER_PORTAL_RETURN_URL`
