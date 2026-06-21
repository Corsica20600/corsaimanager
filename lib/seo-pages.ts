export type SeoPageType = "local" | "national";

export type SeoPageData = {
  slug: string;
  type: SeoPageType;
  canonicalSlug?: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  problemTitle: string;
  problemText: string;
  solutionTitle: string;
  solutionText: string;
  useCases: string[];
  benefits: string[];
  methodSteps: string[];
  why: string[];
  faqs: Array<{ q: string; a: string }>;
};

export const seoPages: SeoPageData[] = [
  {
    slug: "ia-corse",
    type: "local",
    title: "Consultant IA en Corse pour PME",
    description:
      "Consultant IA basé en Corse : audit IA, automatisation, CRM IA et applications métier pour PME corses, avec accompagnement partout en France.",
    h1: "Consultant IA en Corse pour PME locales et françaises",
    subtitle:
      "CorsaiManager est basé en Corse et accompagne également les PME partout en France avec une approche pragmatique de l’automatisation IA.",
    problemTitle: "Le problème métier",
    problemText:
      "Beaucoup de dirigeants voient l’IA comme complexe ou trop théorique. Résultat : des tâches répétitives restent manuelles et freinent la croissance.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Nous déployons des solutions IA concrètes : qualification des demandes, relances automatiques, centralisation des données et suivi commercial propre.",
    useCases: ["PME multi-sites", "Entreprises de services", "Commerciaux terrain"],
    benefits: ["Moins d’oubli", "Process plus fluide", "Décisions plus rapides"],
    methodSteps: ["Audit IA", "Priorisation des quick wins", "Mise en place", "Mesure des résultats"],
    why: ["Approche business", "Déploiement progressif", "Accompagnement humain"],
    faqs: [
      { q: "L’IA est-elle adaptée à une petite PME ?", a: "Oui, si l’on cible les tâches répétitives à fort impact dès le départ." },
      { q: "Intervenez-vous seulement en Corse ?", a: "Non. CorsaiManager est basé en Corse et accompagne les PME partout en France, à distance ou sur site selon les besoins." },
    ],
  },
  {
    slug: "consultant-ia-pme",
    type: "national",
    title: "Consultant IA pour PME en France",
    description:
      "Consultant IA pour PME françaises : audit IA, automatisation, CRM intelligent, assistants IA et applications métier sur mesure.",
    h1: "Consultant IA pour PME françaises",
    subtitle:
      "Identifiez les meilleurs cas d'usage IA, automatisez vos tâches répétitives et structurez vos outils avec un accompagnement humain à distance partout en France.",
    problemTitle: "Le problème métier",
    problemText:
      "Beaucoup de PME veulent utiliser l'IA mais ne savent pas par où commencer, quels outils connecter ni comment mesurer le retour sur investissement.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Nous auditons vos processus, priorisons les quick wins et déployons des solutions IA utiles : automatisation, CRM IA, assistant téléphonique et applications métier.",
    useCases: ["TPE et PME françaises", "Dirigeants non techniques", "Équipes commerciales et administratives"],
    benefits: ["Plan IA clair", "Gains de temps mesurables", "Déploiement progressif"],
    methodSteps: ["Audit IA", "Roadmap priorisée", "Prototype", "Mise en production"],
    why: ["Basé en Corse, intervention France entière", "Approche ROI", "Accompagnement humain"],
    faqs: [
      { q: "Un consultant IA est-il utile pour une petite PME ?", a: "Oui, si l'accompagnement cible d'abord les tâches répétitives, les outils existants et les gains mesurables." },
      { q: "L'accompagnement peut-il se faire à distance ?", a: "Oui. CorsaiManager intervient à distance dans toute la France, avec des ateliers structurés et des démonstrations concrètes." },
    ],
  },
  {
    slug: "automatisation-ia-corse",
    type: "local",
    title: "Automatisation IA en Corse pour PME",
    description:
      "Automatisation IA en Corse pour PME : emails, relances, devis, reporting et workflows métier, avec accompagnement France entière.",
    h1: "Automatisation IA en Corse pour PME",
    subtitle:
      "CorsaiManager est basé en Corse et accompagne également les PME partout en France pour automatiser les tâches répétitives sans complexifier l’organisation.",
    problemTitle: "Le problème métier",
    problemText:
      "Les équipes passent trop de temps sur des tâches manuelles : relances, saisies, documents et reporting.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Nous connectons vos outils et créons des workflows IA utiles pour réduire les frictions opérationnelles.",
    useCases: ["Restaurants et CHR", "PME B2B", "Centres de formation"],
    benefits: ["Temps libéré", "Exécution régulière", "Qualité de suivi"],
    methodSteps: ["Cartographie des flux", "Conception workflow", "Tests", "Déploiement"],
    why: ["Solutions sur mesure", "Stack moderne", "Vision ROI"],
    faqs: [
      { q: "Faut-il changer tous nos outils ?", a: "Non. Nous privilégions l’intégration avec l’existant." },
      { q: "Combien de temps pour voir des résultats ?", a: "Les premiers gains apparaissent souvent dès les premières automatisations." },
    ],
  },
  {
    slug: "assistant-ia-bastia",
    type: "local",
    title: "Assistant IA téléphonique à Bastia",
    description:
      "Assistant IA téléphonique à Bastia et en Corse : réponse 24/7, qualification d’appels, synchronisation CRM et accompagnement France entière.",
    h1: "Assistant IA téléphonique à Bastia pour PME",
    subtitle:
      "CorsaiManager est basé en Corse et accompagne également les PME partout en France avec des assistants IA qui répondent, qualifient et transmettent les demandes.",
    problemTitle: "Le problème métier",
    problemText:
      "Appels manqués, informations perdues et manque de continuité dans le suivi des prospects.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Un standard IA qui améliore la réactivité, la qualification et la transmission des informations critiques.",
    useCases: ["Cabinets de services", "Commerces", "Entreprises de terrain"],
    benefits: ["Réponse continue", "Prospects mieux qualifiés", "Suivi structuré"],
    methodSteps: ["Script métier", "Routage", "Intégration CRM", "Optimisation"],
    why: ["Qualité conversationnelle", "Déploiement rapide", "Pilotage business"],
    faqs: [
      { q: "L’assistant IA remplace-t-il l’équipe ?", a: "Non, il la complète sur les tâches répétitives et les appels simples." },
      { q: "Peut-on garder une intervention humaine ?", a: "Oui, le transfert vers un humain est prévu selon vos règles." },
    ],
  },
  {
    slug: "crm-ia-corse",
    type: "local",
    title: "CRM IA en Corse pour PME",
    description:
      "CRM IA en Corse pour PME : relances automatiques, scoring prospects, suivi client structuré et accompagnement partout en France.",
    h1: "CRM IA en Corse pour PME",
    subtitle:
      "CorsaiManager est basé en Corse et accompagne également les PME partout en France pour centraliser les prospects et fiabiliser le suivi commercial grâce à l’IA.",
    problemTitle: "Le problème métier",
    problemText:
      "Pipeline peu lisible, relances oubliées et manque de priorisation des opportunités.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Un CRM augmenté par l’IA pour automatiser les relances et concentrer l’effort commercial au bon endroit.",
    useCases: ["PME B2B", "Agents commerciaux", "Prestataires"],
    benefits: ["Pipeline clair", "Relances systématiques", "Meilleure conversion"],
    methodSteps: ["Audit process", "Configuration CRM", "Automatisation", "Suivi KPI"],
    why: ["Approche opérationnelle", "Alignement équipe", "Résultats mesurables"],
    faqs: [
      { q: "Le CRM IA est-il utile sans grosse équipe ?", a: "Oui, il est particulièrement utile quand les ressources sont limitées." },
      { q: "Peut-on garder notre CRM actuel ?", a: "Souvent oui, selon vos besoins et contraintes." },
    ],
  },
  {
    slug: "application-metier-corse",
    type: "local",
    title: "Application métier sur mesure en Corse",
    description:
      "Développement d’application métier sur mesure en Corse : outils internes, dashboards, automatisation, API et accompagnement PME France entière.",
    h1: "Application métier sur mesure en Corse pour PME",
    subtitle:
      "CorsaiManager est basé en Corse et accompagne également les PME partout en France lorsque les logiciels standards ne suffisent plus.",
    problemTitle: "Le problème métier",
    problemText:
      "Multiplication des outils, procédures contournées, manque de visibilité et perte de temps.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Applications métier modernes, évolutives et connectées à vos processus réels.",
    useCases: ["Formation", "Gestion commerciale", "Opérations internes"],
    benefits: ["Adoption plus simple", "Productivité renforcée", "Données unifiées"],
    methodSteps: ["Cadrage", "Prototype", "Développement", "Mise en production"],
    why: ["Design orienté usage", "Architecture robuste", "Maintenance continue"],
    faqs: [
      { q: "Combien de temps pour une application métier ?", a: "Cela dépend du périmètre, mais un MVP peut être livré rapidement." },
      { q: "Peut-on faire évoluer la solution ?", a: "Oui, c’est conçu pour évoluer avec vos besoins." },
    ],
  },
  {
    slug: "intelligence-artificielle-pme",
    type: "national",
    title: "Intelligence artificielle pour PME",
    description:
      "Intelligence artificielle pour PME françaises : audit IA, automatisation, CRM intelligent, assistants IA et applications métier sur mesure.",
    h1: "Intelligence artificielle pour PME : passer de l’idée aux usages concrets",
    subtitle:
      "CorsaiManager aide les PME partout en France à intégrer l’IA dans leurs processus avec une approche concrète, mesurable et orientée ROI.",
    problemTitle: "Le problème métier",
    problemText:
      "Beaucoup de PME savent que l’intelligence artificielle peut les aider, mais ne savent pas quels cas d’usage prioriser, quels outils connecter ni comment mesurer les gains.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Nous transformons les intentions IA en projets utiles : audit des processus, automatisation, assistant téléphonique, CRM IA, application métier et suivi des résultats.",
    useCases: ["PME de services", "Équipes commerciales", "Directions opérationnelles"],
    benefits: ["Vision claire", "Déploiement progressif", "ROI mesurable"],
    methodSteps: ["Diagnostic", "Roadmap IA", "Prototype", "Déploiement", "Optimisation"],
    why: ["Approche nationale", "Expertise PME", "Accompagnement humain"],
    faqs: [
      { q: "Par où commencer avec l’intelligence artificielle en PME ?", a: "Le plus fiable est de commencer par un audit des tâches répétitives, des outils existants et des opportunités commerciales ou opérationnelles." },
      { q: "L’IA est-elle adaptée aux petites structures ?", a: "Oui, si le premier périmètre est simple, contrôlable et lié à un gain concret : temps gagné, relances, qualification ou reporting." },
      { q: "CorsaiManager intervient-il partout en France ?", a: "Oui. Basé en Corse, CorsaiManager accompagne les PME partout en France avec des ateliers à distance et un suivi opérationnel." },
    ],
  },
  {
    slug: "automatisation-commerciale",
    type: "national",
    title: "Automatisation commerciale pour PME",
    description:
      "Automatisation commerciale pour PME : relances, suivi prospects, emails et workflows de vente.",
    h1: "Automatisation commerciale pour PME orientées résultats",
    subtitle:
      "Réduisez les tâches manuelles, améliorez la régularité commerciale et augmentez votre taux de conversion.",
    problemTitle: "Le problème métier",
    problemText:
      "Sans système clair, les relances se perdent et les équipes vendent en réaction plutôt qu’avec méthode.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Workflows commerciaux automatisés, priorisation des actions et pilotage précis des opportunités.",
    useCases: ["Équipes commerciales", "Dirigeants PME", "Business developers"],
    benefits: ["Cadence commerciale", "Moins d’oubli", "Meilleur focus"],
    methodSteps: ["Audit des flux", "Mise en place", "Accompagnement", "Optimisation continue"],
    why: ["Approche concrète", "Intégration rapide", "Pilotage KPI"],
    faqs: [
      { q: "L’automatisation remplace-t-elle le commercial ?", a: "Non, elle libère du temps pour les tâches à forte valeur." },
      { q: "Faut-il une grosse base de leads ?", a: "Non, même un volume modéré peut générer des gains forts." },
    ],
  },
  {
    slug: "crm-commercial-ia",
    type: "national",
    title: "CRM commercial IA pour PME",
    description:
      "CRM commercial IA : scoring des leads, relances automatiques et suivi client centralisé pour PME.",
    h1: "CRM commercial IA pour mieux prioriser vos opportunités",
    subtitle:
      "Un CRM pensé pour l’action commerciale réelle : plus de clarté, plus de régularité, plus de résultats.",
    problemTitle: "Le problème métier",
    problemText:
      "Les équipes naviguent entre tableurs, emails et outils non synchronisés.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Centralisation, scoring IA, relances automatiques et historique client complet.",
    useCases: ["PME B2B", "Réseaux commerciaux", "Entreprises de services"],
    benefits: ["Priorisation intelligente", "Pipeline maîtrisé", "Suivi homogène"],
    methodSteps: ["Structure pipeline", "Automatisation", "Reporting", "Itérations"],
    why: ["Vision business", "Simplicité d’usage", "Performance durable"],
    faqs: [
      { q: "Le scoring IA est-il fiable ?", a: "Il s’améliore avec vos données et vos retours terrain." },
      { q: "Peut-on commencer progressivement ?", a: "Oui, nous priorisons les fonctionnalités les plus rentables." },
    ],
  },
  {
    slug: "assistant-vocal-ia",
    type: "national",
    title: "Assistant vocal IA pour entreprise",
    description:
      "Assistant vocal IA pour entreprise : qualification des appels, réponses automatiques et transfert intelligent.",
    h1: "Assistant vocal IA pour fluidifier l’accueil client",
    subtitle:
      "Réactivité 24/7, qualification structurée et transmission utile des informations.",
    problemTitle: "Le problème métier",
    problemText:
      "Les appels entrants perturbent l’organisation et les demandes ne sont pas toujours bien qualifiées.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Assistant vocal IA connecté à vos process métiers pour capter et orienter chaque demande.",
    useCases: ["Support client", "Pré-vente", "Qualification de leads"],
    benefits: ["Réponse immédiate", "Moins de perte d’info", "Continuité de service"],
    methodSteps: ["Design conversationnel", "Routage", "Connexion outils", "Suivi qualité"],
    why: ["Pragmatique", "Mesurable", "Orienté expérience client"],
    faqs: [
      { q: "L’IA peut-elle gérer des demandes complexes ?", a: "Elle traite le premier niveau et transfère intelligemment si besoin." },
      { q: "Les scripts sont-ils personnalisables ?", a: "Oui, selon votre activité et vos contraintes." },
    ],
  },
  {
    slug: "standard-telephonique-ia",
    type: "national",
    title: "Standard téléphonique IA",
    description:
      "Standard téléphonique IA pour PME : accueil intelligent, qualification automatique et suivi CRM.",
    h1: "Standard téléphonique IA pour PME en croissance",
    subtitle:
      "Transformez votre accueil téléphonique en levier commercial et opérationnel.",
    problemTitle: "Le problème métier",
    problemText:
      "Un standard manuel génère des retards, des oublis et des interruptions coûteuses.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Standard IA avec logique métier, qualification et transmission automatique des informations.",
    useCases: ["PME multisites", "Activités de services", "Équipes commerciales"],
    benefits: ["Moins d’appels perdus", "Suivi structuré", "Meilleure qualité de service"],
    methodSteps: ["Audit appels", "Paramétrage standard", "Tests", "Optimisation"],
    why: ["Focus résultat", "Déploiement concret", "Accompagnement continu"],
    faqs: [
      { q: "Le standard IA fonctionne-t-il hors horaires ?", a: "Oui, c’est justement un de ses avantages majeurs." },
      { q: "Peut-on tracer les performances ?", a: "Oui, avec des indicateurs clairs de qualité et de conversion." },
    ],
  },
  {
    slug: "logiciel-metier-sur-mesure",
    type: "national",
    title: "Logiciel métier sur mesure pour PME",
    description:
      "Logiciel métier sur mesure : développez une solution adaptée à vos processus, connectée à vos outils.",
    h1: "Logiciel métier sur mesure pour structurer votre activité",
    subtitle:
      "Concevez un outil qui épouse votre réalité terrain, pas l’inverse.",
    problemTitle: "Le problème métier",
    problemText:
      "Les solutions génériques imposent des compromis et des contournements permanents.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Applications métier robustes, sobres et évolutives, intégrées à vos workflows clés.",
    useCases: ["Gestion opérationnelle", "Suivi client", "Pilotage commercial"],
    benefits: ["Adoption plus rapide", "Process alignés", "Productivité durable"],
    methodSteps: ["Cadrage métier", "Prototype", "Développement", "Évolutions"],
    why: ["Design utile", "Architecture maîtrisée", "Vision long terme"],
    faqs: [
      { q: "Un logiciel sur mesure coûte-t-il forcément cher ?", a: "Le coût dépend du périmètre. Nous priorisons les modules à ROI rapide." },
      { q: "Peut-on connecter des APIs existantes ?", a: "Oui, c’est souvent central dans notre approche." },
    ],
  },
  {
    slug: "automatisation-pme",
    type: "national",
    title: "Automatisation PME avec IA",
    description:
      "Automatisation PME avec IA : workflows, relances, documents, CRM et pilotage opérationnel.",
    h1: "Automatisation PME : passez d’un mode manuel à un mode piloté",
    subtitle:
      "Mettez l’IA au service de vos opérations quotidiennes avec des cas d’usage concrets.",
    problemTitle: "Le problème métier",
    problemText:
      "Les équipes sont saturées par des tâches répétitives qui ralentissent exécution et croissance.",
    solutionTitle: "La solution CorsaiManager",
    solutionText:
      "Automatisations ciblées, connectées à vos outils, avec un suivi continu des gains.",
    useCases: ["PME de services", "Équipes commerciales", "Structures multi-process"],
    benefits: ["Exécution plus stable", "Moins d’erreur", "Meilleure visibilité"],
    methodSteps: ["Diagnostic", "Priorisation", "Implémentation", "Amélioration continue"],
    why: ["Approche PME", "Déploiement progressif", "Résultats actionnables"],
    faqs: [
      { q: "Par où commencer l’automatisation ?", a: "Par les tâches répétitives qui coûtent du temps chaque semaine." },
      { q: "Faut-il une équipe technique interne ?", a: "Non, nous cadrons et opérons le déploiement avec vos équipes métier." },
    ],
  },
];

export function getSeoPage(slug: string): SeoPageData | undefined {
  return seoPages.find((p) => p.slug === slug);
}
