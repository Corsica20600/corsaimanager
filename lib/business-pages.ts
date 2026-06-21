export type BusinessPageConfig = {
  slug: string;
  title: string;
  metaDescription: string;
  badge: string;
  h1: string;
  intro: string[];
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solution: string[];
  benefitsTitle: string;
  benefits: string[];
  clientCaseTitle: string;
  clientCase: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
};

const commonFaq = [
  {
    question: "CorsaiManager accompagne-t-il les PME partout en France ?",
    answer:
      "Oui. CorsaiManager est basé en Corse, mais accompagne les PME partout en France avec des ateliers à distance, des audits structurés, des développements sur mesure et un suivi opérationnel.",
  },
  {
    question: "Faut-il déjà avoir une équipe technique pour lancer un projet IA ?",
    answer:
      "Non. L'objectif est justement de rendre l'IA exploitable par les équipes métier. CorsaiManager cadre le besoin, propose une solution réaliste et accompagne le déploiement avec des outils compréhensibles.",
  },
  {
    question: "Comment savoir si un projet IA sera rentable ?",
    answer:
      "Un projet rentable part d'un irritant mesurable: temps perdu, prospects non suivis, erreurs, délais de réponse ou tâches répétitives. CorsaiManager estime l'impact, l'effort et le ROI avant de lancer le déploiement.",
  },
  {
    question: "Peut-on commencer avec un petit périmètre ?",
    answer:
      "Oui. La meilleure approche consiste souvent à lancer un premier cas d'usage simple, mesurer le résultat, puis élargir vers le CRM IA, l'automatisation commerciale ou une application métier plus complète.",
  },
  {
    question: "Les solutions peuvent-elles être connectées à nos outils actuels ?",
    answer:
      "Oui, selon les API et les contraintes techniques. L'objectif est de connecter les formulaires, emails, CRM, tableurs, calendriers ou outils métier pour éviter les doubles saisies et fiabiliser le suivi.",
  },
];

export const businessPages: Record<string, BusinessPageConfig> = {
  auditIa: {
    slug: "/audit-ia",
    title: "Audit IA entreprise pour PME | CorsaiManager",
    metaDescription:
      "Audit IA pour PME en France : analyse des processus, tâches répétitives, outils, automatisations prioritaires, ROI et feuille de route IA concrète.",
    badge: "Audit IA",
    h1: "Audit IA pour PME : identifier les automatisations rentables",
    intro: [
      "Un audit IA permet à une PME de comprendre où l'intelligence artificielle peut réellement créer de la valeur. Beaucoup d'entreprises entendent parler d'automatisation, de CRM intelligent, d'assistant IA ou d'applications métier, mais ne savent pas par où commencer. Le risque est de tester des outils sans méthode, d'ajouter de la complexité et de ne jamais transformer ces essais en gains mesurables.",
      "CorsaiManager structure cette première étape avec une approche business. L'objectif n'est pas de faire une démonstration technologique, mais d'identifier les tâches répétitives, les irritants opérationnels, les pertes de temps, les données mal exploitées et les opportunités commerciales qui peuvent être améliorées par l'IA.",
      "L'audit s'adresse aux dirigeants de PME, responsables commerciaux, responsables administratifs, équipes support et entreprises de services qui veulent passer d'une intuition à un plan d'action clair. À la fin, vous savez quelles automatisations lancer, dans quel ordre, avec quel niveau d'effort et quel impact attendu.",
    ],
    problemTitle: "Pourquoi les PME ont besoin d'un diagnostic avant d'automatiser",
    problems: [
      "Les tâches répétitives sont souvent connues, mais rarement quantifiées. Une équipe sait qu'elle perd du temps sur les relances, les devis, les emails ou la saisie CRM, sans toujours mesurer le coût réel.",
      "Les outils existants ne communiquent pas toujours entre eux. Les informations passent d'un formulaire à un email, d'un email à un tableur, puis d'un tableur à un CRM avec des risques d'erreurs et d'oublis.",
      "Les projets IA échouent souvent lorsqu'ils commencent par l'outil plutôt que par le besoin. Une PME a besoin d'une feuille de route pragmatique, pas d'une pile d'abonnements logiciels.",
      "Les équipes peuvent craindre une solution trop complexe. L'audit permet de définir des automatisations contrôlables, validées par l'humain et adaptées aux habitudes de travail.",
    ],
    solutionTitle: "La méthode CorsaiManager pour prioriser l'IA",
    solution: [
      "L'audit commence par une analyse de votre activité, de vos processus et de vos objectifs commerciaux. Nous cherchons les zones où une action répétitive peut être simplifiée, accélérée ou fiabilisée par un assistant IA, un workflow ou une application métier.",
      "Ensuite, chaque opportunité est évaluée selon quatre critères : impact business, facilité de mise en place, qualité des données disponibles et risque opérationnel. Cette grille évite de choisir un cas d'usage séduisant mais peu rentable.",
      "La restitution prend la forme d'un plan priorisé. Vous obtenez des quick wins, des chantiers de fond, des recommandations de maillage entre outils et une vision claire des prochaines étapes : prototype, automatisation, CRM IA, assistant téléphonique ou application métier.",
    ],
    benefitsTitle: "Bénéfices attendus après un audit IA",
    benefits: [
      "Vous identifiez les tâches qui peuvent faire gagner du temps rapidement sans bouleverser l'organisation.",
      "Vous obtenez une feuille de route IA compréhensible par la direction et les équipes métier.",
      "Vous évitez les dépenses inutiles dans des outils mal adaptés ou mal connectés.",
      "Vous priorisez les projets qui ont le meilleur ratio impact, effort et ROI.",
      "Vous préparez une base saine pour automatiser les relances, le suivi commercial, les documents, les appels ou les workflows internes.",
    ],
    clientCaseTitle: "Cas client type : une PME de services qui veut mieux suivre ses prospects",
    clientCase: [
      "Une PME reçoit des demandes par formulaire, téléphone et email. Les informations sont dispersées, les relances dépendent de la disponibilité de l'équipe et certains prospects chauds ne sont jamais recontactés. L'audit met en évidence trois priorités : centraliser les leads, automatiser les relances et résumer les échanges dans un CRM.",
      "La première action recommandée consiste à créer un workflow simple : chaque demande entrante génère une fiche prospect, un email de réponse, une tâche de rappel et une notification interne. La deuxième consiste à connecter ce flux à un CRM IA pour prioriser les opportunités.",
      "Le résultat attendu n'est pas seulement du temps gagné. La PME obtient un suivi plus fiable, une meilleure réactivité commerciale et une vision plus claire de son pipeline.",
    ],
    faq: [
      {
        question: "Que contient un audit IA CorsaiManager ?",
        answer:
          "Il contient une analyse des tâches répétitives, des outils existants, des processus commerciaux ou administratifs, des opportunités d'automatisation, des quick wins et une feuille de route priorisée.",
      },
      {
        question: "Combien de temps faut-il pour obtenir un plan d'action IA ?",
        answer:
          "Un premier diagnostic peut être cadré rapidement après l'échange initial. La durée dépend du nombre d'outils, de processus et d'équipes à analyser.",
      },
      ...commonFaq,
    ],
    ctaTitle: "Vous voulez savoir quoi automatiser en priorité ?",
    ctaText:
      "Demandez un audit IA CorsaiManager pour obtenir une vision claire, pragmatique et actionnable de vos opportunités d'automatisation.",
  },
  crmIa: {
    slug: "/crm-ia-pme",
    title: "CRM IA pour PME en France | CorsaiManager",
    metaDescription:
      "CRM IA pour PME : pipeline commercial intelligent, relances automatiques, scoring prospects, suivi client et automatisation commerciale.",
    badge: "CRM IA PME",
    h1: "CRM IA pour PME : mieux suivre prospects, clients et relances",
    intro: [
      "Un CRM IA aide une PME à transformer son suivi commercial en système d'action. Là où un CRM classique stocke des contacts, un CRM intelligent aide à prioriser les prospects, déclencher des relances, résumer les échanges, détecter les opportunités et recommander les prochaines actions commerciales.",
      "Pour une PME, le problème n'est pas toujours le manque de prospects. Le vrai blocage vient souvent du suivi : informations dispersées, relances oubliées, devis sans réponse, opportunités mal qualifiées, pipeline peu lisible et données commerciales difficiles à exploiter.",
      "CorsaiManager conçoit des CRM IA adaptés aux PME françaises. La solution peut compléter un CRM existant ou devenir une application métier sur mesure. L'objectif est de donner aux équipes un outil simple, utile et orienté conversion.",
    ],
    problemTitle: "Les limites d'un suivi commercial manuel",
    problems: [
      "Les prospects arrivent par plusieurs canaux et ne sont pas toujours centralisés au bon endroit.",
      "Les relances sont faites manuellement, donc elles dépendent de la mémoire ou de la disponibilité des équipes.",
      "Le pipeline commercial manque de visibilité : il est difficile de savoir quelles opportunités traiter en priorité.",
      "Les échanges clients ne sont pas toujours résumés, classés ou exploitables pour la suite.",
      "Les dirigeants manquent d'indicateurs fiables sur les conversions, les devis, les relances et les opportunités perdues.",
    ],
    solutionTitle: "Un CRM intelligent pensé pour l'action commerciale",
    solution: [
      "Le CRM IA CorsaiManager centralise les prospects, clients, échanges et actions commerciales. Chaque fiche peut être enrichie automatiquement avec un résumé, un statut, une priorité, une prochaine action et un historique clair.",
      "L'IA peut proposer des relances contextualisées, classer les prospects selon leur potentiel, détecter les opportunités qui stagnent et signaler les actions urgentes. Le commercial garde la main, mais il perd moins de temps à chercher quoi faire.",
      "Le CRM peut aussi se connecter à vos formulaires, emails, appels, tableaux de bord ou outils métier. L'enjeu est de créer une continuité entre la demande entrante, la qualification, la relance, le devis et la conversion.",
    ],
    benefitsTitle: "Bénéfices d'un CRM IA pour PME",
    benefits: [
      "Moins de prospects oubliés grâce à des relances planifiées ou automatisées.",
      "Un pipeline commercial plus clair pour les équipes et la direction.",
      "Des emails commerciaux plus rapides à préparer grâce à l'assistance IA.",
      "Une meilleure priorisation des leads chauds et des opportunités à fort potentiel.",
      "Des données plus fiables pour mesurer le taux de conversion et la performance commerciale.",
    ],
    clientCaseTitle: "Cas client type : une PME B2B avec des devis non relancés",
    clientCase: [
      "Une PME B2B envoie régulièrement des devis, mais ne relance pas toujours au bon moment. Les commerciaux manquent de visibilité sur les prospects actifs et la direction ne sait pas quelles opportunités risquent d'être perdues.",
      "Le CRM IA centralise les devis, déclenche une relance après un délai défini, propose un message personnalisé et signale les dossiers à fort potentiel. Les échanges sont résumés dans la fiche client, ce qui permet à chaque membre de l'équipe de reprendre le contexte rapidement.",
      "La PME gagne en régularité commerciale, améliore son taux de suivi et réduit les pertes liées aux oublis.",
    ],
    faq: [
      {
        question: "Un CRM IA remplace-t-il un commercial ?",
        answer:
          "Non. Il aide le commercial à prioriser, relancer et suivre plus efficacement. Les décisions importantes restent humaines.",
      },
      {
        question: "Peut-on connecter un CRM IA à nos outils existants ?",
        answer:
          "Oui. Selon les outils, il peut être connecté à des formulaires, emails, tableurs, appels, dashboards ou applications métier.",
      },
      ...commonFaq,
    ],
    ctaTitle: "Votre suivi commercial mérite mieux qu'un tableur",
    ctaText:
      "Demandez un audit IA pour identifier comment structurer un CRM intelligent adapté à vos prospects, vos clients et votre cycle de vente.",
  },
  assistant: {
    slug: "/assistant-ia-telephone",
    title: "Assistant téléphonique IA pour PME | CorsaiManager",
    metaDescription:
      "Assistant téléphonique IA pour PME : réponse automatique, qualification d'appels, résumés, synchronisation CRM et suivi des leads entrants.",
    badge: "Assistant téléphonique IA",
    h1: "Assistant téléphonique IA pour PME : répondre, qualifier et suivre les appels",
    intro: [
      "Un assistant téléphonique IA permet à une PME de mieux gérer ses appels entrants, même lorsque l'équipe est occupée, en déplacement ou indisponible. Il peut répondre, poser les bonnes questions, qualifier la demande, transmettre un résumé et déclencher une action de suivi.",
      "Les appels restent un canal décisif pour les entreprises de services, artisans, centres de formation, commerces, agences, cabinets et PME B2B. Pourtant, beaucoup d'opportunités sont perdues parce qu'un appel n'est pas décroché ou parce que l'information n'est pas transmise correctement.",
      "CorsaiManager conçoit des assistants téléphoniques IA orientés business. Le but n'est pas de déshumaniser la relation client, mais de ne plus perdre les demandes importantes et de donner aux équipes un contexte clair pour rappeler rapidement.",
    ],
    problemTitle: "Pourquoi les appels entrants font perdre des opportunités",
    problems: [
      "Une équipe ne peut pas répondre à tous les appels pendant les pics d'activité.",
      "Les messages vocaux sont parfois incomplets, oubliés ou traités trop tard.",
      "La qualification d'un prospect dépend de la personne qui décroche et du temps disponible.",
      "Les informations importantes ne sont pas toujours ajoutées au CRM ou transmises au bon commercial.",
      "Les demandes simples consomment du temps alors qu'elles pourraient être traitées automatiquement.",
    ],
    solutionTitle: "Un assistant IA qui transforme l'appel en action",
    solution: [
      "L'assistant téléphonique IA répond selon un scénario défini, comprend le besoin, collecte les informations clés et classe la demande. Il peut distinguer un prospect chaud, une demande support, une urgence, une réservation ou une question récurrente.",
      "Après l'appel, un résumé structuré est envoyé à l'équipe ou synchronisé dans un CRM. Selon le cas, un workflow peut créer une tâche de rappel, envoyer un email, notifier un commercial ou enrichir une fiche client.",
      "La solution est conçue pour rester contrôlable : vous définissez les limites, les messages, les informations à collecter et les moments où l'humain doit reprendre la main.",
    ],
    benefitsTitle: "Bénéfices pour une PME",
    benefits: [
      "Moins d'appels manqués et meilleure réactivité commerciale.",
      "Qualification plus régulière des prospects entrants.",
      "Résumés d'appels exploitables sans saisie manuelle.",
      "Synchronisation possible avec CRM, email ou outil métier.",
      "Meilleure expérience client grâce à une réponse rapide et structurée.",
    ],
    clientCaseTitle: "Cas client type : une entreprise de services qui reçoit trop d'appels",
    clientCase: [
      "Une PME reçoit beaucoup d'appels pendant les horaires de production. Les équipes ne peuvent pas toujours répondre, les prospects laissent des messages incomplets et certaines demandes sont traitées avec retard.",
      "L'assistant IA prend le relais sur les appels non décrochés, qualifie la demande, récupère les coordonnées et transmet un résumé. Les leads importants sont signalés immédiatement et les demandes simples reçoivent une première réponse.",
      "La PME améliore sa réactivité, évite les pertes de prospects et centralise mieux les informations utiles.",
    ],
    faq: [
      {
        question: "L'assistant téléphonique IA peut-il répondre 24h/24 ?",
        answer:
          "Oui, il peut fonctionner en dehors des horaires d'ouverture ou en relais lorsque l'équipe ne peut pas répondre.",
      },
      {
        question: "Peut-il créer un lead dans le CRM ?",
        answer:
          "Oui, selon les outils utilisés, il peut envoyer un résumé, créer une fiche prospect ou déclencher une tâche de rappel.",
      },
      ...commonFaq,
    ],
    ctaTitle: "Vous perdez encore des appels entrants ?",
    ctaText:
      "Demandez un audit IA pour savoir comment un assistant téléphonique peut qualifier vos appels et améliorer votre suivi commercial.",
  },
  applications: {
    slug: "/applications-metier",
    title: "Applications métier sur mesure pour PME | CorsaiManager",
    metaDescription:
      "Applications métier sur mesure pour PME : CRM, dashboards, gestion interne, automatisation, outils web, IA intégrée et workflows métier.",
    badge: "Applications métier",
    h1: "Applications métier sur mesure pour PME : créer l'outil adapté à vos processus",
    intro: [
      "Une application métier sur mesure permet à une PME de remplacer les tableurs, emails, outils dispersés et processus manuels par une solution adaptée à son fonctionnement réel. Elle centralise les données, guide les équipes et automatise les étapes répétitives.",
      "Les logiciels standards sont utiles, mais ils ne correspondent pas toujours aux spécificités d'une entreprise. Lorsque les équipes multiplient les contournements, les exports, les copier-coller et les doubles saisies, il devient pertinent de créer un outil plus adapté.",
      "CorsaiManager conçoit des applications métier modernes pour les PME françaises : CRM, portail client, outil de devis, gestion de demandes, dashboard, suivi de formation, réservation, reporting ou application interne enrichie par l'IA.",
    ],
    problemTitle: "Quand une PME atteint les limites des outils standards",
    problems: [
      "Les équipes passent d'un tableur à un email puis à un outil métier sans continuité.",
      "Les données importantes ne sont pas centralisées ou ne sont pas fiables.",
      "Les logiciels du marché imposent un processus qui ne correspond pas à votre réalité terrain.",
      "Les responsables manquent de tableaux de bord simples pour piloter l'activité.",
      "Certaines tâches restent manuelles alors qu'elles pourraient être automatisées dans l'application.",
    ],
    solutionTitle: "Une application métier pensée autour de vos usages",
    solution: [
      "Le développement commence par un cadrage métier : utilisateurs, rôles, données, étapes du processus, règles de validation, automatisations utiles et indicateurs à suivre. Cette phase évite de créer un outil trop lourd ou déconnecté du terrain.",
      "L'application peut intégrer des fonctionnalités IA : génération de documents, synthèse de demandes, recherche intelligente, scoring, aide à la décision, classification automatique ou suggestions d'actions.",
      "La solution est pensée pour évoluer. On peut commencer par un périmètre simple, valider l'usage, puis ajouter des modules : CRM, reporting, portail client, automatisation, facturation ou intégrations API.",
    ],
    benefitsTitle: "Bénéfices d'une application métier sur mesure",
    benefits: [
      "Un outil aligné sur vos processus au lieu d'un logiciel générique mal adapté.",
      "Moins de saisie manuelle, moins d'erreurs et plus de cohérence dans les données.",
      "Une meilleure visibilité sur les tâches, demandes, clients et indicateurs clés.",
      "Une base évolutive pour intégrer progressivement l'IA et l'automatisation.",
      "Une expérience plus simple pour vos équipes, vos clients ou vos partenaires.",
    ],
    clientCaseTitle: "Cas client type : une PME qui pilote son activité avec des tableurs",
    clientCase: [
      "Une PME suit ses demandes clients dans plusieurs fichiers. Les statuts ne sont pas toujours à jour, les documents sont générés manuellement et la direction manque de visibilité sur les volumes et délais.",
      "Une application métier centralise les demandes, guide les étapes, génère certains documents, notifie les équipes et affiche un tableau de bord. L'IA peut résumer une demande ou proposer une prochaine action.",
      "L'entreprise gagne en fiabilité, en rapidité et en capacité de pilotage.",
    ],
    faq: [
      {
        question: "Combien de temps faut-il pour créer une application métier ?",
        answer:
          "Cela dépend du périmètre. Un premier module peut être développé rapidement si les besoins sont bien cadrés, puis enrichi progressivement.",
      },
      {
        question: "Une application métier peut-elle intégrer de l'IA ?",
        answer:
          "Oui. L'IA peut aider à générer, résumer, classer, rechercher ou recommander des actions selon les données disponibles.",
      },
      ...commonFaq,
    ],
    ctaTitle: "Vos outils actuels ralentissent votre équipe ?",
    ctaText:
      "Demandez un audit IA pour imaginer une application métier adaptée à vos processus et à vos priorités.",
  },
  automatisation: {
    slug: "/automatisation-entreprise",
    title: "Automatisation IA des processus pour PME | CorsaiManager",
    metaDescription:
      "Automatisation IA des processus pour PME : emails, relances, devis, reporting, documents, workflows métier et synchronisation d'outils.",
    badge: "Automatisation des processus",
    h1: "Automatisation des processus pour PME : réduire les tâches manuelles avec l'IA",
    intro: [
      "L'automatisation des processus aide une PME à gagner du temps sur les tâches répétitives qui ralentissent les équipes : relances, emails, devis, documents, reporting, saisie de données, notifications ou synchronisation entre outils.",
      "L'intelligence artificielle apporte une nouvelle capacité : comprendre un message, résumer une demande, classer une information, proposer une réponse ou déclencher une action selon un contexte. Elle rend l'automatisation plus souple et plus proche des usages métier.",
      "CorsaiManager conçoit des workflows IA pour les PME françaises. L'objectif est de connecter vos outils, fiabiliser vos processus et transformer les actions manuelles en systèmes simples, contrôlables et mesurables.",
    ],
    problemTitle: "Les tâches répétitives coûtent plus cher qu'on ne le pense",
    problems: [
      "Les équipes perdent du temps à copier des informations entre plusieurs outils.",
      "Les relances commerciales ou administratives sont faites irrégulièrement.",
      "Les documents sont recréés manuellement alors que leur structure est souvent répétitive.",
      "Les managers manquent d'indicateurs parce que le reporting dépend d'exports manuels.",
      "Les informations importantes ne déclenchent pas automatiquement les bonnes actions.",
    ],
    solutionTitle: "Des workflows IA connectés à vos outils",
    solution: [
      "Un workflow d'automatisation relie un déclencheur, une règle, une action et parfois une validation humaine. Par exemple : une demande arrive, l'IA la classe, un email est généré, une tâche est créée et le CRM est mis à jour.",
      "CorsaiManager commence par cartographier les tâches et les outils. Ensuite, nous définissons les automatisations prioritaires, les données nécessaires, les points de contrôle et les indicateurs de succès.",
      "Les automatisations peuvent être simples ou avancées : email automatique, génération de devis, résumé d'appel, reporting hebdomadaire, synchronisation CRM, notification WhatsApp, traitement documentaire ou assistant interne.",
    ],
    benefitsTitle: "Bénéfices de l'automatisation IA",
    benefits: [
      "Gain de temps hebdomadaire sur les actions répétitives.",
      "Réduction des oublis, erreurs de saisie et délais de traitement.",
      "Meilleure régularité commerciale grâce aux relances automatisées.",
      "Processus plus lisibles et plus faciles à piloter.",
      "Base solide pour intégrer un CRM IA, un assistant téléphonique ou une application métier.",
    ],
    clientCaseTitle: "Cas client type : automatiser les demandes entrantes et les relances",
    clientCase: [
      "Une PME reçoit des demandes depuis un formulaire et par email. Les réponses sont manuelles, les informations sont recopiées dans un tableur et les relances sont souvent oubliées.",
      "Le workflow proposé récupère la demande, classe le besoin, crée une fiche dans le CRM, génère un email de réponse, programme une relance et notifie l'équipe. Les cas sensibles restent soumis à validation humaine.",
      "L'entreprise gagne du temps, répond plus vite et améliore la continuité commerciale.",
    ],
    faq: [
      {
        question: "Quels outils peut-on automatiser ?",
        answer:
          "On peut connecter des formulaires, emails, CRM, tableurs, outils métier, bases de données, messageries, calendriers et API selon les besoins.",
      },
      {
        question: "Une automatisation IA est-elle contrôlable ?",
        answer:
          "Oui. Les règles, validations humaines, limites et notifications sont définies dès le départ pour éviter les actions non maîtrisées.",
      },
      ...commonFaq,
    ],
    ctaTitle: "Vos tâches répétitives peuvent devenir des workflows",
    ctaText:
      "Demandez un audit IA pour identifier les automatisations les plus rentables dans votre entreprise.",
  },
};

export function getBusinessPageConfig(key: keyof typeof businessPages) {
  return businessPages[key];
}

export type BusinessPageKey = keyof typeof businessPages;
