import type { LeadRow } from "@/lib/leads-repository";

export type LeadProposalAIOutput = {
  title: string;
  summary: string;
  diagnosis: string;
  proposedSolution: string;
  scope: string;
  deliverables: string[];
  estimatedTimeline: string;
  estimatedBudget: string;
  nextSteps: string;
};

const FALLBACK_PROPOSAL: LeadProposalAIOutput = {
  title: "Proposition commerciale IA personnalisée",
  summary:
    "Suite à votre demande d'audit IA, nous proposons un accompagnement ciblé pour automatiser les tâches à faible valeur et améliorer le suivi commercial.",
  diagnosis:
    "Le besoin exprimé indique des gains rapides possibles sur la qualification, le suivi client et la réduction des tâches manuelles.",
  proposedSolution:
    "Mise en place d'un socle d'automatisation avec intégration progressive de l'IA sur les flux prioritaires.",
  scope: "Cadrage, implémentation initiale, tests, ajustements et transfert opérationnel.",
  deliverables: [
    "Audit des processus prioritaires",
    "Workflow automatisé prêt à l'emploi",
    "Documentation de prise en main",
    "Plan d'optimisation continue",
  ],
  estimatedTimeline: "2 à 6 semaines selon le périmètre validé.",
  estimatedBudget: "Budget indicatif: sur devis après cadrage.",
  nextSteps:
    "Planifier un échange de 30 minutes pour valider le périmètre, les outils existants et les objectifs business.",
};

function safeString(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
}

function safeArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return list.length > 0 ? list : fallback;
}

export async function generateLeadProposal(lead: LeadRow): Promise<{
  proposal: LeadProposalAIOutput;
  aiModel: string;
  rawResponse: unknown;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[proposal-ai] OPENAI_API_KEY manquant, fallback proposition.");
    return {
      proposal: FALLBACK_PROPOSAL,
      aiModel: "fallback",
      rawResponse: { reason: "OPENAI_API_KEY missing" },
    };
  }

  const model = "gpt-4o-mini";
  const prompt = `
Tu es un expert commercial B2B pour PME françaises.
Génère une première proposition commerciale courte, professionnelle et concrète.

Contraintes:
- Pas de jargon inutile.
- Ton humain et crédible.
- Pas de promesse irréaliste.
- Budget toujours indicatif.
- Si informations insuffisantes: rester prudent.

Format JSON strict:
{
  "title": "string",
  "summary": "string",
  "diagnosis": "string",
  "proposedSolution": "string",
  "scope": "string",
  "deliverables": ["string"],
  "estimatedTimeline": "string",
  "estimatedBudget": "string",
  "nextSteps": "string"
}

Règle budget:
- Besoin simple: "à partir de 990 €"
- Besoin intermédiaire: "entre 1 500 € et 3 500 €"
- Besoin avancé: "sur devis après cadrage"
Toujours indiquer que c'est un budget indicatif.

Données lead:
${JSON.stringify({
  nom: lead.nom,
  email: lead.email,
  telephone: lead.telephone,
  entreprise: lead.entreprise,
  activite: lead.activite,
  besoin: lead.besoin,
  message: lead.message,
  score: lead.score,
  priority: lead.priority,
  ai_summary: lead.ai_summary,
  ai_qualification: lead.ai_qualification,
  ai_detected_needs: lead.ai_detected_needs,
  ai_urgency: lead.ai_urgency,
  ai_next_action: lead.ai_next_action,
})}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu rédiges des propositions commerciales IA pour PME, orientées résultats business concrets.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[proposal-ai] OpenAI HTTP error", response.status, errText);
      return {
        proposal: FALLBACK_PROPOSAL,
        aiModel: "fallback",
        rawResponse: { reason: "http_error", status: response.status, body: errText },
      };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[proposal-ai] Empty response content");
      return {
        proposal: FALLBACK_PROPOSAL,
        aiModel: "fallback",
        rawResponse: { reason: "empty_content", response: json },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("[proposal-ai] JSON parse failed", error, content);
      return {
        proposal: FALLBACK_PROPOSAL,
        aiModel: "fallback",
        rawResponse: { reason: "invalid_json", content },
      };
    }

    const obj = parsed as Record<string, unknown>;
    return {
      proposal: {
        title: safeString(obj.title, FALLBACK_PROPOSAL.title),
        summary: safeString(obj.summary, FALLBACK_PROPOSAL.summary),
        diagnosis: safeString(obj.diagnosis, FALLBACK_PROPOSAL.diagnosis),
        proposedSolution: safeString(obj.proposedSolution, FALLBACK_PROPOSAL.proposedSolution),
        scope: safeString(obj.scope, FALLBACK_PROPOSAL.scope),
        deliverables: safeArray(obj.deliverables, FALLBACK_PROPOSAL.deliverables),
        estimatedTimeline: safeString(obj.estimatedTimeline, FALLBACK_PROPOSAL.estimatedTimeline),
        estimatedBudget: safeString(obj.estimatedBudget, FALLBACK_PROPOSAL.estimatedBudget),
        nextSteps: safeString(obj.nextSteps, FALLBACK_PROPOSAL.nextSteps),
      },
      aiModel: model,
      rawResponse: parsed,
    };
  } catch (error) {
    console.error("[proposal-ai] Unhandled error", error);
    return {
      proposal: FALLBACK_PROPOSAL,
      aiModel: "fallback",
      rawResponse: { reason: "exception", error: String(error) },
    };
  }
}
