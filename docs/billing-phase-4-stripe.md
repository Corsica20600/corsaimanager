# Billing Phase 4 - Stripe Billing

Phase 4 active Stripe Checkout, Stripe Billing, Customer Portal et les webhooks Stripe.

## Variables

```env
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CUSTOMER_PORTAL_RETURN_URL=
NEXT_PUBLIC_SITE_URL=
```

En développement, utiliser les clés de test Stripe.

## Webhook

Endpoint :

```text
POST /api/stripe/webhook
```

Le handler lit le corps brut, vérifie `stripe-signature`, stocke l'événement dans `billing_stripe_events`, ignore les doublons, puis synchronise.

Evénements pris en charge :

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.created`
- `invoice.finalized`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.paid`
- `invoice.voided`
- `invoice.marked_uncollectible`

Les webhooks sont la source de vérité des statuts.

## Checkout

Depuis `/ventes/abonnements`, l'admin choisit un prospect CRM et un plan local lié à un `stripe_price_id`. La session Checkout est créée en mode `subscription`.

Le retour navigateur affiche seulement un état informatif. La création réelle de l'abonnement dépend du webhook.

## Customer Portal

Le bouton `Portal` ouvre une session Stripe Customer Portal pour le `stripe_customer_id` synchronisé. Le retour utilise `STRIPE_CUSTOMER_PORTAL_RETURN_URL`, ou `/ventes/abonnements` par défaut.

## Synchronisation locale

Tables utilisées sans SQL complémentaire :

- `billing_subscription_plans`
- `billing_customer_subscriptions`
- `billing_invoices`
- `billing_invoice_lines`
- `billing_payments`
- `billing_stripe_events`

Les factures récurrentes Stripe sont enregistrées avec `origin = SUBSCRIPTION`, `stripe_invoice_id`, URLs Stripe, montants, lignes et paiement Stripe si payé.

## Limites volontaires

Pas de dashboard financier complet, pas de relances avancées, pas d'acomptes complexes, pas de facturation électronique française, pas de Stripe Connect, pas de paiements en personne, pas de Stripe Elements personnalisé.

## Test manuel

1. Créer un produit/prix récurrent dans Stripe test.
2. Créer un plan local dans `/ventes/abonnements` avec le `price_...`.
3. Choisir un prospect CRM avec email et lancer Checkout.
4. Payer avec une carte test Stripe.
5. Vérifier la réception du webhook dans `billing_stripe_events`.
6. Vérifier l'abonnement local et la facture récurrente dans `/ventes/abonnements` et `/ventes/factures`.
