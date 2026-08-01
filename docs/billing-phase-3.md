# Billing Phase 3

Phase 3 rend opérationnels les documents ponctuels : factures, paiements manuels et avoirs.

## Cycle facture

Une facture peut être créée manuellement depuis le CRM ou depuis un devis accepté. Le brouillon n'a pas de numéro commercial et reste modifiable. La finalisation attribue un numéro transactionnel `FAC-YYYY-0001`, fige les snapshots client/émetteur, renseigne `issued_at`, `finalized_at`, `due_at` et passe le statut à `FINALIZED`.

Une facture finalisée est immuable. Toute correction passe par un avoir ou une nouvelle facture.

## Depuis un devis

La création depuis devis accepté recopie les snapshots, les lignes et les montants du devis. Le catalogue n'est pas relu. Une facture principale non annulée par devis est autorisée pour cette phase. Les acomptes/solde sont reportés à une phase dédiée si le schéma doit évoluer.

## Paiements

Les paiements manuels supportent virement, chèque, espèces, carte externe, prélèvement externe et autre. Les montants sont en centimes, strictement positifs, et ne peuvent pas dépasser le reste à payer. La création du paiement et la mise à jour de la facture sont transactionnelles.

Statuts calculés :

- `PARTIALLY_PAID` si payé > 0 et reste > 0.
- `PAID` si reste = 0.
- `OVERDUE` si échéance dépassée et reste > 0.

## Avoirs

Un avoir est lié à une facture finalisée ou envoyée. Le brouillon peut dupliquer les lignes de facture, puis l'émission attribue un numéro transactionnel `AV-YYYY-0001`. Le total des avoirs non nuls ne peut pas dépasser le total de la facture. La facture d'origine n'est jamais supprimée.

## PDF et SMTP

Les PDF facture et avoir sont générés à la demande avec `@react-pdf/renderer`. Les factures envoyées par SMTP utilisent `lib/mailer.ts`, joignent le PDF, journalisent le `messageId` et ne passent pas en envoyée si SMTP échoue.

`BILLING_EMAIL_FROM` permet de configurer l'expéditeur. À défaut : `CorsaiManager <contact@corsaimanager.com>`.

## SQL

Aucun SQL complémentaire Phase 3 n'est requis. Les tables de `sql/create-billing-tables.sql` suffisent.

## Test manuel

1. Ouvrir un prospect CRM et cliquer `Créer une facture`.
2. Enregistrer un brouillon sans numéro.
3. Finaliser et vérifier le numéro `FAC-YYYY-000N`.
4. Télécharger le PDF.
5. Envoyer la facture à un contact avec email.
6. Enregistrer un paiement partiel puis total.
7. Créer un avoir depuis la facture, puis l'émettre.
8. Vérifier le journal de facture et les listes `/ventes/factures`, `/ventes/paiements`, `/ventes/avoirs`.
