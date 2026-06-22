# Intégration OpenClaw CRM

OpenClaw ne doit jamais accéder directement à Neon. L'agent externe alimente le CRM uniquement via les API serveur CorsaiManager.

## Variable d'environnement

```env
OPENCLAW_AGENT_API_KEY=
```

La clé reste côté serveur et doit être envoyée par OpenClaw avec :

```http
Authorization: Bearer YOUR_OPENCLAW_AGENT_API_KEY
```

## Importer un prospect

```bash
curl -X POST https://corsaimanager.com/api/crm/prospects/import-agent \
  -H "Authorization: Bearer YOUR_OPENCLAW_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Restaurant Test Lyon",
    "email": "contact@example.com",
    "website": "https://example.com",
    "country": "France",
    "region": "Auvergne-Rhône-Alpes",
    "department": "Rhône",
    "city": "Lyon",
    "sector": "Restaurant",
    "source": "openclaw",
    "ai_score": 82,
    "audit_summary": "Site présent mais peu optimisé pour le référencement local.",
    "audit_recommendations": ["Améliorer les titres SEO", "Ajouter des données structurées", "Optimiser la page contact"],
    "suggested_email_subject": "Audit gratuit de votre visibilité locale",
    "suggested_email_body": "Bonjour, j'ai remarqué quelques pistes simples pour améliorer la visibilité de votre établissement sur Google et les moteurs IA."
  }'
```

Réponse en cas de création :

```json
{
  "duplicate": false,
  "status": "created",
  "prospect_id": 123,
  "action_id": 456,
  "draft_id": 789,
  "audit_id": 321
}
```

Réponse si un doublon existe déjà par email ou website :

```json
{
  "duplicate": true,
  "status": "existing",
  "prospect_id": 123
}
```

## Consulter les derniers imports

```bash
curl https://corsaimanager.com/api/crm/prospects/openclaw/recent \
  -H "Authorization: Bearer YOUR_OPENCLAW_AGENT_API_KEY"
```

## Revue humaine

Les prospects importés sont visibles dans `/crm/agent-review`.

Flux :
1. Valider ou rejeter le prospect.
2. Lire et modifier le brouillon email dans `/crm/agent-review`.
3. Valider ou rejeter le brouillon email.
4. Cliquer sur `Envoyer le mail` uniquement après validation humaine de l'action et du brouillon.
5. L'email est envoyé via le transport SMTP existant de `lib/mailer.ts` avec `CorsaiManager <contact@corsaimanager.com>` comme expéditeur.
6. Après envoi, le brouillon et l'action reçoivent une date `sent_at`, l'action passe en `envoyée`, le prospect passe en `contacté` et une relance J+3 est créée dans `follow_ups`.
