export type AILeadQualification = {
  summary: string;
  qualification: "low" | "medium" | "high" | "hot";
  detectedNeeds: string[];
  urgency: "low" | "medium" | "high";
  nextAction: string;
  suggestedReply: string;
  confidence: number;
};

type LeadQualificationInput = {
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  activite: string;
  besoin: string;
  message: string;
  classicScore: number;
};

function parseQualification(value: unknown): AILeadQualification["qualification"] {
  if (value === "low" || value === "medium" || value === "high" || value === "hot") return value;
  return "medium";
}

function parseUrgency(value: unknown): AILeadQualification["urgency"] {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

function clampConfidence(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function safeString(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim();
  return cleaned || fallback;
}

function safeNeeds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

export async function qualifyLeadWithAI(input: LeadQualificationInput): Promise<AILeadQualification | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[lead-ai] OPENAI_API_KEY manquant, fallback scoring classique");
    return null;
  }

  const prompt = `
Tu es un assistant de qualification commerciale B2B pour PME.
Analyse ce lead et renvoie STRICTEMENT un JSON valide sans markdown, sans texte additionnel.

Objectif:
- évaluer le sérieux du prospect
- clarifier son besoin
- estimer l'urgence
- recommander la prochaine action commerciale
- proposer une réponse email professionnelle, concrète, non agressive.

Format JSON attendu:
{
  "summary": "string",
  "qualification": "low|medium|high|hot",
  "detectedNeeds": ["string"],
  "urgency": "low|medium|high",
  "nextAction": "string",
  "suggestedReply": "string",
  "confidence": 0
}

Données lead:
${JSON.stringify(input)}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu qualifies des leads PME de façon professionnelle, claire et orientée action commerciale concrète.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[lead-ai] OpenAI HTTP error", response.status, errText);
      return null;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[lead-ai] Réponse OpenAI vide");
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("[lead-ai] JSON parse failed", error, content);
      return null;
    }

    const obj = parsed as Record<string, unknown>;
    return {
      summary: safeString(obj.summary, "Analyse IA indisponible."),
      qualification: parseQualification(obj.qualification),
      detectedNeeds: safeNeeds(obj.detectedNeeds),
      urgency: parseUrgency(obj.urgency),
      nextAction: safeString(obj.nextAction, "Revenir vers le prospect sous 24h."),
      suggestedReply: safeString(
        obj.suggestedReply,
        "Bonjour, merci pour votre demande. Nous revenons vers vous rapidement pour cadrer votre besoin.",
      ),
      confidence: clampConfidence(obj.confidence),
    };
  } catch (error) {
    console.error("[lead-ai] Erreur qualification IA", error);
    return null;
  }
}

