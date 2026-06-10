export type SeoInternalLink = {
  href: string;
  label: string;
  text: string;
};

export type SeoPageEnhancement = {
  auditFocus: string;
  deepDive: string[];
  corsicaExamples: string[];
  internalLinks: SeoInternalLink[];
  specificFaqs: Array<{ q: string; a: string }>;
};

const defaultLinks: SeoInternalLink[] = [
  {
    href: "/intelligence-artificielle-corse",
    label: "Intelligence artificielle en Corse",
    text: "Comprendre l'approche locale de CorsaiManager pour les entreprises corses.",
  },
  {
    href: "/services",
    label: "Services IA",
    text: "Voir les solutions principales : assistant IA, CRM, automatisation et applications métier.",
  },
  {
    href: "/contact",
    label: "Contact",
    text: "Échanger sur un besoin précis et cadrer les prochaines étapes.",
  },
];

export const seoPageEnhancements: Record<string, SeoPageEnhancement> = {
  "ia-corse": {
    auditFocus:
      "Cette page cible l'intention large autour de l'intelligence artificielle en Corse. Le contenu doit donc rester pédagogique, local et orienté décision dirigeant.",
    deepDive: [
      "Pour une PME installée en Corse, l'intelligence artificielle devient utile lorsqu'elle répond à une contrainte très concrète : peu de temps disponible, équipes réduites, saisonnalité forte, demandes clients dispersées et besoin de réactivité. La page explique comment passer d'une curiosité générale pour l'IA à une première application mesurable, sans imposer une transformation lourde.",
      "L'enjeu n'est pas seulement technique. Une entreprise à Bastia, Biguglia, Ajaccio ou Porto-Vecchio doit pouvoir comprendre ce que l'IA change dans son quotidien : qualifier une demande, préparer une réponse, déclencher une relance, classer un document, produire un tableau de bord ou aider un collaborateur à suivre une procédure.",
      "CorsaiManager privilégie une méthode progressive. L'audit repère les tâches répétitives, mesure leur coût réel, puis sélectionne les cas d'usage capables de produire un gain visible. Cette approche évite de lancer un projet IA abstrait et permet de sécuriser les premières automatisations avant d'élargir le périmètre.",
      "Le contenu de cette page reste distinct des pages dédiées au CRM, aux assistants vocaux et aux logiciels métier. Ici, l'objectif est de donner une vision d'ensemble : comprendre où l'intelligence artificielle peut créer de la valeur, comment l'intégrer et pourquoi un accompagnement local facilite l'adoption.",
      "La valeur SEO vient de cette combinaison : une intention locale claire, des exemples insulaires, des liens vers les services spécialisés et une réponse complète aux objections fréquentes des dirigeants. La page devient une porte d'entrée vers tout l'écosystème IA de CorsaiManager.",
    ],
    corsicaExamples: [
      "Un prestataire de services à Bastia peut utiliser l'IA pour trier les demandes entrantes, préparer une réponse commerciale et créer automatiquement une tâche de suivi.",
      "Une PME à Ajaccio peut centraliser les prospects issus du site, du téléphone et de WhatsApp, puis automatiser les relances selon le niveau d'intérêt.",
      "Une entreprise en Haute-Corse peut créer un assistant interne qui explique les procédures, retrouve les informations et réduit les interruptions entre équipes.",
      "Une structure saisonnière peut anticiper les pics d'activité en automatisant les réponses fréquentes, les confirmations et les rappels clients.",
    ],
    internalLinks: [
      {
        href: "/automatisation-ia-corse",
        label: "Automatisation IA en Corse",
        text: "Approfondir les workflows et les tâches répétitives à automatiser.",
      },
      {
        href: "/crm-ia-corse",
        label: "CRM IA en Corse",
        text: "Découvrir comment l'IA améliore le suivi commercial local.",
      },
      {
        href: "/assistant-ia-bastia",
        label: "Assistant IA à Bastia",
        text: "Voir un cas d'usage orienté accueil, appels et qualification.",
      },
    ],
    specificFaqs: [
      {
        q: "Par quoi commencer avec l'intelligence artificielle en Corse ?",
        a: "Le plus efficace est de commencer par un audit court des tâches répétitives, des points de friction commerciaux et des outils déjà utilisés. Cela permet d'identifier un premier cas d'usage utile sans mobiliser toute l'entreprise.",
      },
      {
        q: "Une petite entreprise corse peut-elle vraiment rentabiliser l'IA ?",
        a: "Oui, surtout si l'on cible les gains de temps récurrents : relances, réponses, classement, reporting ou qualification. Un petit volume traité régulièrement peut déjà produire un retour concret.",
      },
      {
        q: "Faut-il remplacer les logiciels existants ?",
        a: "Pas forcément. CorsaiManager privilégie d'abord l'intégration avec les outils déjà en place, puis propose une application métier uniquement si les limites des logiciels actuels bloquent l'activité.",
      },
      {
        q: "L'accompagnement peut-il se faire à distance ?",
        a: "Oui. Les ateliers, démonstrations et suivis peuvent être organisés à distance, avec une logique locale pour les entreprises de Bastia, Ajaccio, Biguglia et toute la Corse.",
      },
    ],
  },
  "automatisation-ia-corse": {
    auditFocus:
      "Cette page cible les dirigeants qui cherchent à automatiser des tâches précises en Corse, avec une attente de gains rapides et mesurables.",
    deepDive: [
      "L'automatisation IA en Corse répond à un problème fréquent : les équipes passent trop de temps à répéter les mêmes actions alors que la relation client, la vente et la qualité de service demandent de l'attention humaine. La page doit donc montrer comment l'IA soulage l'exécution sans déshumaniser le contact.",
      "Un workflow utile commence souvent par une action simple : récupérer une demande, la classer, générer une réponse, prévenir la bonne personne ou mettre à jour un CRM. En reliant ces petites étapes, une PME gagne en régularité et limite les oublis qui coûtent des opportunités.",
      "La spécificité corse compte dans la priorisation. Les entreprises locales peuvent avoir des pics saisonniers, des équipes polyvalentes, plusieurs canaux de contact et des déplacements fréquents. L'automatisation doit donc rester robuste, compréhensible et facile à ajuster.",
      "Cette page ne duplique pas la page générale sur l'IA : elle se concentre sur les processus, les déclencheurs, les intégrations et les résultats opérationnels. Le vocabulaire met l'accent sur le temps gagné, la fiabilité et la réduction des tâches manuelles.",
      "Pour renforcer l'indexation, la page relie les automatisations aux autres briques du site : CRM IA, assistant téléphonique, applications métier et contact. Chaque lien interne aide Google à comprendre que cette page est un pilier de productivité, pas un simple doublon local.",
    ],
    corsicaExamples: [
      "Un restaurant près d'Ajaccio peut automatiser les demandes de réservation, les confirmations et les rappels avant le service.",
      "Une entreprise de bâtiment à Bastia peut générer une fiche prospect après un appel, puis déclencher une relance si le devis reste sans réponse.",
      "Un centre de formation en Haute-Corse peut automatiser l'envoi des documents, les convocations et les rappels administratifs.",
      "Un commerce local peut consolider les messages reçus par formulaire, email et WhatsApp dans une seule file de traitement.",
    ],
    internalLinks: [
      {
        href: "/ia-corse",
        label: "IA en Corse",
        text: "Revenir à la vision globale de l'intelligence artificielle pour PME corses.",
      },
      {
        href: "/automatisation-entreprise",
        label: "Automatisation entreprise",
        text: "Découvrir la page service dédiée aux workflows d'entreprise.",
      },
      {
        href: "/crm-ia-corse",
        label: "CRM IA en Corse",
        text: "Relier l'automatisation au suivi commercial et aux relances.",
      },
    ],
    specificFaqs: [
      {
        q: "Quelles tâches automatiser en premier ?",
        a: "Les meilleures candidates sont les tâches répétitives, fréquentes et déjà cadrées : relances, confirmations, synthèses, classement de demandes, reporting ou création de fiches prospects.",
      },
      {
        q: "Une automatisation IA fonctionne-t-elle avec WhatsApp ou les emails ?",
        a: "Selon les outils et les accès disponibles, il est possible de connecter plusieurs canaux pour centraliser l'information et déclencher des actions structurées.",
      },
      {
        q: "Comment éviter une automatisation trop rigide ?",
        a: "CorsaiManager prévoit des règles de validation, des exceptions et des points de contrôle humain pour garder la maîtrise des décisions importantes.",
      },
      {
        q: "Combien de temps faut-il pour déployer un premier workflow ?",
        a: "Un premier workflow ciblé peut souvent être cadré rapidement, puis testé avec un périmètre limité avant d'être étendu à l'équipe.",
      },
    ],
  },
  "assistant-ia-bastia": {
    auditFocus:
      "Cette page cible un besoin local précis : gérer les appels et demandes entrantes à Bastia avec un assistant IA.",
    deepDive: [
      "À Bastia, de nombreuses entreprises reçoivent des appels pendant des rendez-vous, des interventions ou des périodes de forte activité. Un assistant IA permet de capter l'information au moment où elle arrive, de qualifier la demande et de transmettre un résumé exploitable à l'équipe.",
      "La page se distingue des contenus généraux sur l'IA en se concentrant sur la voix, l'accueil et la continuité de service. Elle doit rassurer : l'assistant ne remplace pas l'humain, il filtre les demandes simples, prépare le suivi et évite les pertes d'information.",
      "Un bon assistant IA local comprend les scénarios métier : horaires, zones d'intervention, types de demandes, urgence, transfert vers un humain, création de tâche ou envoi d'un compte rendu. Le script est donc conçu avec l'entreprise, puis ajusté après les premiers retours terrain.",
      "La valeur pour le SEO repose sur l'ancrage Bastia et sur les exemples précis d'usage. La page parle aux commerces, cabinets, prestataires et PME qui veulent améliorer leur réactivité sans recruter une permanence téléphonique complète.",
      "Les liens internes orientent ensuite vers le standard téléphonique IA, le CRM IA et la page contact. Cette structure montre que l'assistant vocal peut être une première brique d'un système plus large de suivi client.",
    ],
    corsicaExamples: [
      "Un cabinet de services à Bastia peut qualifier les appels entrants et envoyer un résumé au bon collaborateur.",
      "Une entreprise d'intervention en Haute-Corse peut distinguer les urgences des demandes de devis et prioriser les rappels.",
      "Un commerce bastiais peut répondre aux questions fréquentes sur les horaires, disponibilités ou prises de rendez-vous.",
      "Un prestataire B2B peut créer automatiquement une fiche prospect après chaque appel qualifié.",
    ],
    internalLinks: [
      {
        href: "/assistant-ia-telephone",
        label: "Assistant IA téléphonique",
        text: "Voir la page service complète dédiée aux appels entrants.",
      },
      {
        href: "/standard-telephonique-ia",
        label: "Standard téléphonique IA",
        text: "Comparer l'assistant à un standard IA pour PME.",
      },
      {
        href: "/crm-ia-corse",
        label: "CRM IA en Corse",
        text: "Connecter les appels qualifiés au suivi commercial.",
      },
    ],
    specificFaqs: [
      {
        q: "Un assistant IA peut-il répondre hors horaires à Bastia ?",
        a: "Oui, il peut prendre le relais en dehors des heures d'ouverture, qualifier la demande et préparer un rappel priorisé pour l'équipe.",
      },
      {
        q: "Peut-on transférer certains appels à un humain ?",
        a: "Oui. Les règles de transfert sont définies selon l'urgence, le type de client, la disponibilité ou le niveau de complexité.",
      },
      {
        q: "L'assistant peut-il alimenter un CRM ?",
        a: "Oui, les informations recueillies peuvent être structurées puis envoyées vers un CRM ou un outil de suivi commercial.",
      },
      {
        q: "Comment l'assistant apprend-il le métier ?",
        a: "Il est configuré à partir de vos scripts, questions fréquentes, règles de qualification et retours après les premiers appels test.",
      },
    ],
  },
  "crm-ia-corse": {
    auditFocus:
      "Cette page traite du suivi commercial et de la centralisation des prospects pour les PME corses.",
    deepDive: [
      "Un CRM IA en Corse doit résoudre une difficulté très concrète : les prospects arrivent par plusieurs canaux et le suivi dépend souvent de la mémoire de chacun. L'IA aide à classer, prioriser, relancer et documenter chaque opportunité avec plus de régularité.",
      "La page se concentre sur la vente, contrairement aux pages d'automatisation plus générales. Elle décrit le pipeline, le scoring, les relances, les synthèses client et les indicateurs qui permettent à une PME de savoir où concentrer son effort commercial.",
      "Dans un contexte local, la proximité commerciale reste essentielle. Le CRM IA ne doit pas rendre la relation froide ; il doit au contraire donner plus de contexte avant un appel, rappeler les engagements pris et éviter les oublis après un rendez-vous.",
      "La page apporte un contenu unique grâce aux exemples d'entreprises corses : prestataires, agents commerciaux, centres de formation, fournisseurs CHR ou services B2B. Chaque cas illustre une étape du cycle de vente et un bénéfice mesurable.",
      "Le maillage interne renvoie vers l'automatisation commerciale, le CRM IA pour PME et la page contact. Cela renforce la cohérence sémantique autour du pilotage commercial, tout en gardant cette URL dédiée à l'intention locale.",
    ],
    corsicaExamples: [
      "Un fournisseur CHR à Ajaccio peut prioriser les comptes à relancer avant la saison et suivre les devis ouverts.",
      "Une PME de services à Bastia peut centraliser les demandes web, appels et emails dans un pipeline unique.",
      "Un agent commercial itinérant peut recevoir des rappels de suivi après chaque rendez-vous client en Haute-Corse.",
      "Un centre de formation peut suivre les candidats, relancer les dossiers incomplets et mesurer les conversions.",
    ],
    internalLinks: [
      {
        href: "/crm-ia-pme",
        label: "CRM IA pour PME",
        text: "Voir la page service dédiée au CRM intelligent.",
      },
      {
        href: "/automatisation-commerciale",
        label: "Automatisation commerciale",
        text: "Comprendre les relances et séquences de vente automatisées.",
      },
      {
        href: "/ia-corse",
        label: "IA en Corse",
        text: "Replacer le CRM dans une stratégie IA locale plus large.",
      },
    ],
    specificFaqs: [
      {
        q: "Un CRM IA est-il utile avec peu de commerciaux ?",
        a: "Oui, il est souvent plus utile lorsque l'équipe est réduite, car il évite les oublis et aide à prioriser les opportunités à traiter.",
      },
      {
        q: "Peut-on garder un CRM existant ?",
        a: "Selon l'outil, CorsaiManager peut connecter des automatisations ou proposer une interface complémentaire plutôt que remplacer tout le système.",
      },
      {
        q: "Comment fonctionne le scoring IA ?",
        a: "Le scoring s'appuie sur des critères métier : source du lead, niveau d'intérêt, historique, urgence, potentiel et prochaine action recommandée.",
      },
      {
        q: "Le CRM peut-il automatiser les relances ?",
        a: "Oui, les relances peuvent être préparées ou envoyées selon vos règles, avec validation humaine si le contexte l'exige.",
      },
    ],
  },
  "application-metier-corse": {
    auditFocus:
      "Cette page cible les entreprises corses qui ne trouvent pas d'outil standard adapté à leur fonctionnement.",
    deepDive: [
      "Une application métier en Corse devient pertinente lorsque les équipes multiplient les tableurs, contournent les logiciels existants ou perdent du temps à recopier les mêmes informations. Le contenu doit montrer qu'un outil sur mesure peut rester simple, ciblé et évolutif.",
      "La page se différencie des contenus sur l'automatisation en parlant d'interface, de parcours utilisateur, de données centralisées et de logique métier. L'IA peut être intégrée, mais elle n'est pas toujours le point de départ : le premier enjeu est souvent de structurer l'information.",
      "Pour une PME locale, une application métier peut gérer des réservations, des dossiers de formation, un suivi client, des documents, des interventions ou des indicateurs. L'objectif est d'épouser le fonctionnement réel de l'entreprise plutôt que forcer les équipes à s'adapter à un logiciel générique.",
      "La page apporte des exemples concrets en Corse afin d'éviter le contenu abstrait : saisonnalité, multi-sites, interventions terrain, relation client locale et coordination administrative. Ces angles rendent la page unique par rapport à la version nationale sur le logiciel métier.",
      "Les liens internes orientent vers les applications métier, le logiciel sur mesure et l'automatisation IA. Cette architecture montre que l'application peut être une brique centrale, connectée à des workflows, un CRM ou un assistant IA.",
    ],
    corsicaExamples: [
      "Un organisme de formation en Haute-Corse peut gérer sessions, stagiaires, convocations et documents depuis une seule interface.",
      "Une entreprise de maintenance à Bastia peut suivre les demandes, interventions, photos et comptes rendus terrain.",
      "Une activité de réservation à Ajaccio peut synchroniser disponibilités, confirmations et rappels clients.",
      "Une PME multi-sites peut consolider ses indicateurs dans un tableau de bord adapté à ses priorités.",
    ],
    internalLinks: [
      {
        href: "/applications-metier",
        label: "Applications métier",
        text: "Voir la page service consacrée aux outils métier modernes.",
      },
      {
        href: "/logiciel-metier-sur-mesure",
        label: "Logiciel métier sur mesure",
        text: "Explorer l'approche nationale du logiciel adapté aux processus.",
      },
      {
        href: "/automatisation-ia-corse",
        label: "Automatisation IA en Corse",
        text: "Connecter l'application aux workflows et tâches répétitives.",
      },
    ],
    specificFaqs: [
      {
        q: "Quand choisir une application métier plutôt qu'un logiciel standard ?",
        a: "Quand les solutions existantes imposent trop de contournements, que les données sont dispersées ou que les équipes perdent du temps à recopier les mêmes informations.",
      },
      {
        q: "Une application métier peut-elle intégrer de l'IA ?",
        a: "Oui, l'IA peut aider à résumer, classer, générer des documents, assister les utilisateurs ou automatiser certaines décisions simples.",
      },
      {
        q: "Peut-on commencer par un MVP ?",
        a: "Oui, CorsaiManager privilégie souvent un premier périmètre utile, testé avec les utilisateurs, avant d'ajouter des modules.",
      },
      {
        q: "L'application sera-t-elle accessible sur mobile ?",
        a: "Les interfaces peuvent être conçues pour un usage mobile lorsque les équipes travaillent sur le terrain ou en déplacement.",
      },
    ],
  },
  "automatisation-commerciale": {
    auditFocus:
      "Cette page cible les requêtes nationales autour des relances, du suivi de vente et de la productivité commerciale.",
    deepDive: [
      "L'automatisation commerciale aide les PME à passer d'un suivi irrégulier à une méthode fiable. La page doit parler aux dirigeants qui savent que leurs prospects ne sont pas toujours relancés au bon moment et que leur pipeline manque de cadence.",
      "Le contenu est unique par rapport aux pages locales car il se concentre sur les séquences de vente, les emails, les devis, les relances et les indicateurs commerciaux. L'objectif est d'expliquer comment automatiser sans perdre la personnalisation nécessaire à une relation B2B de qualité.",
      "CorsaiManager construit les automatisations autour du cycle réel de l'entreprise : source du lead, qualification, proposition, relance, décision, onboarding et fidélisation. Chaque étape peut déclencher une action, une alerte ou une recommandation.",
      "Même si la page est nationale, des exemples corses renforcent la crédibilité terrain. Ils montrent que la méthode fonctionne pour des entreprises locales avec des contraintes concrètes, et pas seulement pour des équipes commerciales très structurées.",
      "Le maillage interne relie cette page au CRM IA, à l'automatisation PME et au contact. Cela crée une continuité naturelle entre la stratégie commerciale, l'outil de suivi et la mise en place opérationnelle.",
    ],
    corsicaExamples: [
      "Une PME de services à Ajaccio peut automatiser les relances après devis tout en gardant un ton personnalisé.",
      "Un fournisseur professionnel à Bastia peut déclencher des rappels saisonniers pour ses clients récurrents.",
      "Un centre de formation peut relancer automatiquement les candidats qui n'ont pas finalisé leur inscription.",
      "Une entreprise locale peut prioriser les prospects chauds chaque matin avant la tournée commerciale.",
    ],
    internalLinks: [
      {
        href: "/crm-commercial-ia",
        label: "CRM commercial IA",
        text: "Structurer les opportunités et le scoring des leads.",
      },
      {
        href: "/automatisation-pme",
        label: "Automatisation PME",
        text: "Élargir l'automatisation aux opérations et documents.",
      },
      {
        href: "/crm-ia-corse",
        label: "CRM IA en Corse",
        text: "Voir l'application locale du suivi commercial intelligent.",
      },
    ],
    specificFaqs: [
      {
        q: "L'automatisation commerciale risque-t-elle de rendre les messages impersonnels ?",
        a: "Non si les règles sont bien conçues. L'IA peut préparer une base contextualisée, puis laisser la validation humaine sur les contacts stratégiques.",
      },
      {
        q: "Quels indicateurs suivre ?",
        a: "Les indicateurs utiles sont le délai de première réponse, le taux de relance, le taux de conversion, les devis en attente et les opportunités prioritaires.",
      },
      {
        q: "Peut-on automatiser sans CRM complet ?",
        a: "Oui, mais un minimum de centralisation est recommandé pour éviter les doublons et conserver l'historique des échanges.",
      },
      {
        q: "Quels canaux peuvent être concernés ?",
        a: "Email, formulaires, CRM, outils de planning et notifications internes peuvent être connectés selon les besoins.",
      },
    ],
  },
  "crm-commercial-ia": {
    auditFocus:
      "Cette page nationale se concentre sur le CRM commercial augmenté par l'IA, sans ciblage géographique principal.",
    deepDive: [
      "Un CRM commercial IA ne sert pas seulement à stocker des contacts. Il doit aider l'équipe à décider quoi faire ensuite, avec quel message, à quel moment et pour quel potentiel. La page explique cette différence entre base de données commerciale et outil d'action.",
      "Le contenu se différencie de la page CRM IA Corse en retirant l'ancrage local du coeur de la promesse. Il parle à toute PME qui veut structurer son pipeline, améliorer son suivi et donner une meilleure visibilité aux dirigeants.",
      "L'IA intervient sur plusieurs niveaux : scoring des leads, résumé d'historique, suggestions de relance, détection des opportunités bloquées, génération de messages et reporting. Ces usages sont présentés comme des aides opérationnelles, pas comme une boîte noire.",
      "Les exemples corses gardent une valeur de preuve, mais la page reste orientée marché national. Elle montre que les mêmes principes s'appliquent à une équipe commerciale sédentaire, terrain ou hybride.",
      "Le maillage interne relie cette page à l'automatisation commerciale, au CRM IA local et à la page service CRM IA PME. Cette structure évite la cannibalisation en séparant l'intention outil, l'intention locale et l'intention service.",
    ],
    corsicaExamples: [
      "Une équipe commerciale à Bastia peut visualiser chaque matin les opportunités à fort potentiel et les relances en retard.",
      "Un prestataire à Ajaccio peut générer un résumé client avant un rendez-vous de suivi.",
      "Une PME multi-sites peut harmoniser les étapes de vente entre plusieurs collaborateurs.",
      "Un dirigeant peut suivre les conversions par source de prospect et ajuster les efforts marketing.",
    ],
    internalLinks: [
      {
        href: "/crm-ia-pme",
        label: "CRM IA pour PME",
        text: "Voir l'offre service de CorsaiManager pour les PME.",
      },
      {
        href: "/automatisation-commerciale",
        label: "Automatisation commerciale",
        text: "Compléter le CRM avec des relances et séquences de vente.",
      },
      {
        href: "/crm-ia-corse",
        label: "CRM IA en Corse",
        text: "Consulter la déclinaison locale pour entreprises corses.",
      },
    ],
    specificFaqs: [
      {
        q: "Quelle différence entre CRM classique et CRM IA ?",
        a: "Un CRM classique centralise les données. Un CRM IA ajoute des recommandations, des synthèses, du scoring et des automatisations qui aident l'équipe à agir.",
      },
      {
        q: "Le scoring remplace-t-il l'avis commercial ?",
        a: "Non, il fournit un signal d'aide à la décision. L'équipe garde la main sur les priorités et les arbitrages importants.",
      },
      {
        q: "Peut-on connecter un CRM existant ?",
        a: "Dans beaucoup de cas, oui. L'accompagnement commence par un audit technique et métier pour identifier les options fiables.",
      },
      {
        q: "Le CRM IA convient-il aux cycles de vente longs ?",
        a: "Oui, il est même utile pour suivre les étapes, les relances espacées et les informations accumulées au fil des échanges.",
      },
    ],
  },
  "assistant-vocal-ia": {
    auditFocus:
      "Cette page nationale cible les assistants vocaux IA pour entreprise, avec un angle accueil et qualification.",
    deepDive: [
      "Un assistant vocal IA pour entreprise permet de traiter les appels simples, de qualifier les demandes et de transmettre les informations importantes sans interrompre inutilement les équipes. La page explique comment l'accueil vocal devient un outil de productivité et de qualité de service.",
      "Le contenu est distinct de la page Bastia car il s'adresse à une intention plus large. Il décrit les règles de routage, les scripts conversationnels, les transferts, les résumés d'appels et les intégrations avec les outils de suivi.",
      "La réussite d'un assistant vocal dépend de la préparation métier. Il faut connaître les questions fréquentes, les exceptions, les niveaux d'urgence, les informations à collecter et les moments où un humain doit reprendre la conversation.",
      "Les exemples corses illustrent des situations réelles, mais la page conserve une portée nationale. Elle montre comment un assistant vocal peut s'adapter à des entreprises de services, commerces, cabinets ou équipes support.",
      "Le maillage interne renforce les liens avec le standard téléphonique IA, l'assistant IA téléphone et le CRM. Cela clarifie les usages : répondre, qualifier, router, puis suivre commercialement.",
    ],
    corsicaExamples: [
      "Un cabinet à Bastia peut laisser l'assistant collecter les informations de premier niveau avant un rappel humain.",
      "Une activité touristique à Ajaccio peut répondre aux questions fréquentes pendant les pics saisonniers.",
      "Une entreprise d'intervention en Haute-Corse peut qualifier l'urgence d'une demande avant de prévenir l'équipe.",
      "Un prestataire B2B peut créer un résumé d'appel exploitable dans son CRM après chaque contact.",
    ],
    internalLinks: [
      {
        href: "/assistant-ia-telephone",
        label: "Assistant IA téléphonique",
        text: "Découvrir l'offre dédiée aux appels entrants.",
      },
      {
        href: "/standard-telephonique-ia",
        label: "Standard téléphonique IA",
        text: "Comparer l'assistant vocal à un standard complet.",
      },
      {
        href: "/crm-commercial-ia",
        label: "CRM commercial IA",
        text: "Transformer les appels qualifiés en opportunités suivies.",
      },
    ],
    specificFaqs: [
      {
        q: "Un assistant vocal IA peut-il comprendre toutes les demandes ?",
        a: "Il doit être conçu pour les demandes fréquentes et transférer les cas complexes. La qualité vient du cadrage des scénarios, pas d'une promesse universelle.",
      },
      {
        q: "Peut-on contrôler les réponses données ?",
        a: "Oui, les scripts, règles, informations autorisées et conditions de transfert sont définis avec l'entreprise.",
      },
      {
        q: "L'assistant vocal peut-il envoyer un compte rendu ?",
        a: "Oui, il peut structurer les informations recueillies et envoyer un résumé à l'équipe ou à un outil connecté.",
      },
      {
        q: "Est-ce adapté à une petite équipe ?",
        a: "Oui, surtout lorsqu'une petite équipe reçoit des appels pendant qu'elle produit, vend ou intervient chez des clients.",
      },
    ],
  },
  "standard-telephonique-ia": {
    auditFocus:
      "Cette page vise l'intention standard téléphonique automatisé, avec une promesse de continuité et qualification.",
    deepDive: [
      "Un standard téléphonique IA structure l'accueil des appels entrants et garantit une réponse plus régulière. La page doit expliquer la différence entre un simple répondeur, un assistant vocal et un standard capable de qualifier, router et documenter les demandes.",
      "Le contenu se distingue de l'assistant vocal IA en mettant l'accent sur l'organisation globale : horaires, files d'attente, transfert, règles par type d'appel, suivi qualité et indicateurs. Il s'agit d'une logique de standard, pas seulement d'une conversation ponctuelle.",
      "Pour une PME, le standard IA peut réduire les appels perdus, améliorer la perception client et limiter les interruptions. Il devient particulièrement utile lorsque les équipes sont souvent en rendez-vous, sur le terrain ou concentrées sur la production.",
      "Les exemples corses apportent un contexte concret : pics saisonniers, appels de devis, demandes urgentes, zones d'intervention et relation client locale. Cette granularité évite que la page ressemble à une présentation générique.",
      "Les liens internes connectent cette page à l'assistant IA téléphone, à l'assistant vocal IA et au CRM commercial IA. L'utilisateur comprend ainsi comment l'appel traité peut alimenter un système complet de suivi.",
    ],
    corsicaExamples: [
      "Une entreprise artisanale à Bastia peut filtrer les demandes urgentes des demandes de devis classiques.",
      "Un établissement à Ajaccio peut répondre aux questions récurrentes pendant les périodes de forte affluence.",
      "Une PME en Haute-Corse peut router les appels selon la zone d'intervention ou le type de prestation.",
      "Un cabinet de services peut conserver une trace structurée de chaque appel pour faciliter le rappel.",
    ],
    internalLinks: [
      {
        href: "/assistant-ia-telephone",
        label: "Assistant IA téléphonique",
        text: "Voir la solution d'accueil et qualification des appels.",
      },
      {
        href: "/assistant-vocal-ia",
        label: "Assistant vocal IA",
        text: "Approfondir les scénarios conversationnels.",
      },
      {
        href: "/crm-commercial-ia",
        label: "CRM commercial IA",
        text: "Relier les appels aux opportunités commerciales.",
      },
    ],
    specificFaqs: [
      {
        q: "Un standard IA peut-il remplacer un standard humain ?",
        a: "Il peut prendre en charge le premier niveau, les questions fréquentes et la qualification. Les cas sensibles ou complexes peuvent rester transférés à un humain.",
      },
      {
        q: "Peut-on définir des horaires différents ?",
        a: "Oui, les règles peuvent varier selon les horaires, les jours, les équipes disponibles ou le type de demande.",
      },
      {
        q: "Comment mesurer l'efficacité du standard ?",
        a: "On suit les appels traités, les transferts, les demandes qualifiées, les rappels à effectuer et les pertes évitées.",
      },
      {
        q: "Le standard peut-il gérer plusieurs activités ?",
        a: "Oui, à condition de structurer les scénarios et les règles de routage pour chaque type de demande.",
      },
    ],
  },
  "logiciel-metier-sur-mesure": {
    auditFocus:
      "Cette page nationale cible les entreprises qui cherchent un logiciel métier adapté à leurs processus.",
    deepDive: [
      "Un logiciel métier sur mesure devient nécessaire lorsque l'entreprise ne veut plus empiler des outils génériques. La page explique comment un logiciel peut structurer les données, simplifier les opérations et accompagner la croissance sans imposer de contournements permanents.",
      "Le contenu se différencie de la page application métier Corse par une portée nationale et une réflexion plus large sur l'architecture, l'évolutivité, les droits utilisateurs, les intégrations et la maintenance. Il s'adresse aux dirigeants qui veulent investir dans un outil durable.",
      "La conception commence par les processus, pas par l'écran. CorsaiManager identifie les rôles, les flux d'information, les règles métier, les données critiques et les indicateurs attendus. Le développement vient ensuite traduire cette logique dans une interface claire.",
      "Les exemples corses servent de cas concrets, mais la page ne dépend pas d'un territoire. Elle montre comment les besoins de terrain peuvent guider un logiciel utile pour la gestion commerciale, les opérations, la formation ou le suivi client.",
      "Le maillage interne relie cette page aux applications métier, à l'application métier Corse et à l'automatisation PME. Cela aide à distinguer l'intention développement logiciel de l'intention automatisation ou locale.",
    ],
    corsicaExamples: [
      "Une PME de Bastia peut remplacer plusieurs tableurs par un logiciel de suivi client et documents.",
      "Un organisme de formation à Ajaccio peut gérer inscriptions, sessions, présences et documents réglementaires.",
      "Une entreprise terrain en Haute-Corse peut suivre les interventions depuis mobile et générer des comptes rendus.",
      "Un réseau local peut consolider les données de plusieurs sites dans un seul tableau de bord.",
    ],
    internalLinks: [
      {
        href: "/applications-metier",
        label: "Applications métier",
        text: "Voir les types d'applications développées par CorsaiManager.",
      },
      {
        href: "/application-metier-corse",
        label: "Application métier en Corse",
        text: "Consulter la déclinaison locale pour entreprises corses.",
      },
      {
        href: "/automatisation-pme",
        label: "Automatisation PME",
        text: "Connecter le logiciel aux workflows et tâches récurrentes.",
      },
    ],
    specificFaqs: [
      {
        q: "Un logiciel métier sur mesure est-il toujours plus cher ?",
        a: "Pas nécessairement. Un périmètre bien cadré peut éviter des abonnements multiples, des pertes de temps et des erreurs coûteuses.",
      },
      {
        q: "Peut-on faire évoluer le logiciel après livraison ?",
        a: "Oui, l'objectif est de construire une base évolutive qui peut accueillir de nouveaux modules selon les priorités.",
      },
      {
        q: "Comment éviter un outil trop complexe ?",
        a: "Le périmètre est priorisé avec les utilisateurs, puis testé sur les usages essentiels avant d'ajouter des fonctionnalités secondaires.",
      },
      {
        q: "Le logiciel peut-il intégrer un CRM ou une IA ?",
        a: "Oui, il peut intégrer des données commerciales, des automatisations, des assistants IA ou des API externes selon les besoins.",
      },
    ],
  },
  "automatisation-pme": {
    auditFocus:
      "Cette page nationale cible les PME qui veulent automatiser leurs opérations sans forcément commencer par un outil commercial.",
    deepDive: [
      "L'automatisation PME couvre un périmètre plus large que la vente : documents, emails, reporting, tâches administratives, suivi client, coordination interne et alertes opérationnelles. La page doit montrer comment une PME peut gagner du temps sans créer une usine à gaz.",
      "Le contenu se distingue de la page automatisation commerciale en parlant de l'entreprise dans son ensemble. Une automatisation peut concerner la gestion d'un dossier, la génération d'un document, le classement d'une demande ou la production d'un indicateur hebdomadaire.",
      "CorsaiManager aborde l'automatisation par la cartographie des irritants. On repère les tâches fréquentes, les erreurs récurrentes, les délais d'attente et les informations recopiées. Ensuite seulement, on choisit les outils, les connexions et les règles IA.",
      "Les exemples corses donnent une épaisseur terrain : petites équipes, polyvalence, saisonnalité, documents administratifs et coordination à distance. Cette dimension concrète aide la page à éviter les généralités sur la productivité.",
      "Les liens internes dirigent vers l'automatisation entreprise, l'automatisation IA Corse et le logiciel métier. Cela crée une lecture progressive : comprendre les gains, voir les cas locaux, puis envisager une solution outillée.",
    ],
    corsicaExamples: [
      "Une PME à Bastia peut automatiser l'envoi de documents après validation d'un dossier client.",
      "Un prestataire à Ajaccio peut générer un reporting hebdomadaire à partir des données commerciales.",
      "Une entreprise de services en Haute-Corse peut créer des alertes internes lorsque certaines demandes restent sans réponse.",
      "Une équipe administrative peut classer automatiquement les pièces reçues et préparer les prochaines actions.",
    ],
    internalLinks: [
      {
        href: "/automatisation-entreprise",
        label: "Automatisation entreprise",
        text: "Voir la page service dédiée aux workflows opérationnels.",
      },
      {
        href: "/automatisation-ia-corse",
        label: "Automatisation IA en Corse",
        text: "Consulter l'approche locale des automatisations IA.",
      },
      {
        href: "/logiciel-metier-sur-mesure",
        label: "Logiciel métier sur mesure",
        text: "Transformer les workflows en outil métier durable.",
      },
    ],
    specificFaqs: [
      {
        q: "Quelle différence entre automatisation PME et automatisation commerciale ?",
        a: "L'automatisation commerciale cible surtout la vente. L'automatisation PME couvre aussi l'administratif, les documents, les opérations et la coordination interne.",
      },
      {
        q: "Faut-il tout automatiser ?",
        a: "Non. Les meilleures automatisations ciblent les tâches répétitives, à faible valeur humaine, avec des règles suffisamment claires.",
      },
      {
        q: "Peut-on garder une validation humaine ?",
        a: "Oui, c'est souvent recommandé pour les emails sensibles, documents importants ou décisions qui engagent l'entreprise.",
      },
      {
        q: "Comment mesurer le retour sur investissement ?",
        a: "On mesure le temps économisé, les erreurs évitées, la réduction des délais et la régularité du suivi.",
      },
    ],
  },
};

export function getSeoPageEnhancement(slug: string): SeoPageEnhancement {
  const enhancement = seoPageEnhancements[slug];

  if (!enhancement) {
    return {
      auditFocus:
        "Cette page est contrôlée pour limiter le contenu dupliqué, renforcer l'intention SEO et améliorer le maillage interne.",
      deepDive: [],
      corsicaExamples: [],
      internalLinks: defaultLinks,
      specificFaqs: [],
    };
  }

  return {
    ...enhancement,
    internalLinks: [...enhancement.internalLinks, ...defaultLinks]
      .filter((link, index, links) => links.findIndex((item) => item.href === link.href) === index)
      .slice(0, 6),
  };
}
