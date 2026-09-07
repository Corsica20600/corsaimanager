# Modernisation CRM — 7 septembre 2026

## Périmètre et audit lecture seule

Aucune donnée Production modifiée, aucune relance exécutée. AI-Team reste l'orchestrateur et ExternalAction sa frontière ; le CRM conserve les preuves commerciales. Les deux nouveaux outils de décision sont purs : `classifyHistoricalProspect` et `proposeAddress`. Ils ne constituent pas un second scheduler.

157 fiches actives/non archivées : A=12, B=2, C=0, D=0, E=28, F=115, G=0, H=0, I=0, J=0. Classification exclusive à la date de l'audit, pas une preuve que tout historique absent n'a jamais existé. 19 fiches reliées par sourceEntityId/remoteId tenant-scopé ; aucune identité devinée. Aucun besoin de recréation établi. Les 138 autres restent sans rattachement prouvé à AI-Team.

|Catégorie|Critère / exemples|Action cible|
|---|---|---|
|A : 12|Email fiable et fiche active : Cetec, LOXAM, Arobase|Garder active ; policy fraîche avant effet|
|B : 2|Statut client : O2G, SAS FKV Conseil et formation|Hors prospection|
|C : 0|Réponse durable CRM ou AI-Team|Arrêter relances, suivi utile|
|D : 0|Refus, bounce ou opt-out prouvé|Suppression de contact durable|
|E : 28|Absent/invalide : L'ART DU BOIS, TANAGYM-ONE|Enrichissement existant borné, puis dormant si infructueux|
|F : 115|Aucune preuve fiable : Bistrot Cocagne, Le Schnockeloch|Réutiliser les preuves ; aucun envoi sans fiabilité|
|G : 0|Email/SIRET identique, ou nom+site|Pas de fusion ambiguë ; 0 signifie aucun trouvé par ces critères|
|H : 0|Dormant/fermé ou plus de 90 jours depuis contact/création|Conserver intégralement l'historique|
|I : 0|Marqueur de test explicite en metadata|Proposer archivage logique, jamais suppression|
|J : 0|Identité ou dates contradictoires|Exception humaine ciblée|

Une fiche nommée `__OPENCLAW_KEY_TEST_DO_NOT_IMPORT__` est suspecte, mais sans metadata de test prouvée : pas d'archivage automatique fondé sur le nom. Elle figure dans E. Ces comptes ne remplacent pas l'audit des 55 FollowUpEmail, dont les critères et le périmètre diffèrent.

## Corrections locales

- Import atomique : un domaine seul, plusieurs correspondances, ou un email avec société différente renvoient 409 avant tout rattachement. Source stable ou nom+email unique : même fiche. Aucune fusion physique.
- Le chemin manuel CRM interdit client/réponse/bounce/dormant et les imports OpenClaw/AI-Team ; ceux-ci relèvent du cycle AI-Team, pas d'une seconde file.
- Compteurs CRM : contactés repose sur une date effective ; nouveaux/relances excluent les états terminaux. Les échéances héritées ne demandent plus de relance manuelle pour les imports orchestrés.
- Réponse positive explicite : l'ingestion CRM crée un lead existant ou le rattache (nom+email unique). La référence `leads.crm_prospect_id` est unique. Ambiguïté : ne créer ni fusionner, conserver `opportunity_suggested`.
- Aucun body supplémentaire copié. L'événement CRM existant reste le journal idempotent. Les leads liés sont exclus de l'ancien cron de relances ; aucune réponse automatique.

## Cycle commercial conservé

Email initial → relance 1 → relance 2, maximum deux. Délais = max(cooldown tenant, 7 puis 14 jours) : actuellement 30 jours chacun. Après seconde relance +14 jours sans réponse : DORMANT. Plafond partagé 2 emails/jour, 60 minutes. Lookup indisponible : report, jamais envoi aveugle. Réponse/client/refus/bounce/dormant : arrêt avant provider. La collecte continue.

La réactivation future doit être explicite et journalisée ; aucun reset automatique d'opt-out, de compteur ni d'historique n'est introduit. Le tri historique n'est pas appliqué massivement dans ce lot ; aucun archivage Production n'est effectué.

Recontrôle des 55 relances : zéro éligible ; 54 sans email éligible (6 invalides, 48 UNVERIFIED), une sans contrat/historique CRM exploitable. Aucun envoi. La lettre E du classificateur de relance regroupe ces 54, alors que l'audit CRM distingue E invalide et F non vérifié.

## Adresse

3/157 adresses complètes (ligne, code postal, ville, pays). `proposeAddress` prépare uniquement des champs absents issus de preuves officielles HTTPS datées ; conserve sources, refuse choix arbitraire en cas de conflit et n'écrase rien. Aucun crawl supplémentaire ni backfill inventé. Le transport de nouvelles preuves d'adresse dans CRM_SYNC reste un lot de contrat séparé.

## Agent review et UX future

ADAPT maintenant, DEPRECATE comme pipeline manuel : route conservée pour l'historique/diagnostic. La présentation actuelle reste ancienne ; elle mérite ensuite un libellé diagnostic et le retrait des boutons d'envoi devenus interdits pour AI-Team. Pas de refonte dans ce lot.

Cible future : Prospects actifs / À suivre / Réponses / Dormants / Clients / Historique. À suivre = décision commerciale ou exception, pas une liste d'emails ordinaires non vérifiés. Le Dashboard AI-Team est inchangé.

## Migration et risques

`sql/20260907-crm-lead-link.sql` : une colonne FK nullable sur leads et un index unique, sans backfill, suppression ni modification d'IDs. Déployer le schéma avant le code ; le schéma leads existant doit être présent. Tests uniquement sur la base PostgreSQL locale dédiée. Risques : historique ancien incomplet ; rapprochement volontairement conservateur ; invalidité ne prouve pas une entreprise fictive. Les adresses et la réactivation future ne sont pas automatisées davantage ici.

Le schéma Production a été vérifié en lecture seule : les colonnes canoniques sont `nom`, `entreprise`, `activite`, `besoin`, obligatoires ; `name`/`company` n'y existent pas. Le nouvel insert utilise les colonnes françaises, garde un champ inconnu vide et n'invente ni nom ni besoin. Un test PostgreSQL reproduit ces contraintes.
