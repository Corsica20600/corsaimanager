CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_payments_stripe_payment_intent_unique
ON billing_payments (stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_payments_stripe_charge_unique
ON billing_payments (stripe_charge_id)
WHERE stripe_charge_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_payments_stripe_reference_unique
ON billing_payments (reference)
WHERE method = 'stripe' AND reference IS NOT NULL;
