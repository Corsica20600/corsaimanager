export type LeadPriority = "low" | "medium" | "high" | "hot";

export type LeadScoringInput = {
  activite: string;
  besoin: string;
  message: string;
  telephone: string;
  email: string;
  entreprise: string;
};

export type LeadScoringResult = {
  score: number;
  priority: LeadPriority;
  reasons: string[];
};

const ACTIVITY_KEYWORDS = ["restaurant", "hôtel", "hotel", "immobilier", "commerce", "clinique", "pme", "artisan"];
const NEED_KEYWORDS = ["crm", "automatisation", "ia", "assistant", "chatbot", "appels", "réservation", "relance", "productivité"];
const URGENCY_KEYWORDS = ["urgent", "rapidement", "asap", "besoin immédiat", "cette semaine"];

function includesAny(text: string, keywords: string[]) {
  const value = text.toLowerCase();
  return keywords.some((keyword) => value.includes(keyword));
}

function toPriority(score: number): LeadPriority {
  if (score >= 120) return "hot";
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function calculateLeadScore(input: LeadScoringInput): LeadScoringResult {
  let score = 0;
  const reasons: string[] = [];
  const normalizedMessage = input.message.trim();

  if (input.email.trim()) {
    score += 10;
    reasons.push("+10 email présent");
  }

  if (input.telephone.trim()) {
    score += 20;
    reasons.push("+20 téléphone renseigné");
  }

  if (input.entreprise.trim()) {
    score += 15;
    reasons.push("+15 entreprise renseignée");
  }

  if (includesAny(input.activite, ACTIVITY_KEYWORDS)) {
    score += 30;
    reasons.push("+30 activité prioritaire");
  }

  if (includesAny(input.besoin, NEED_KEYWORDS)) {
    score += 40;
    reasons.push("+40 besoin à forte valeur");
  }

  if (normalizedMessage.length > 200) {
    score += 20;
    reasons.push("+20 message détaillé (>200 caractères)");
  } else if (normalizedMessage.length > 80) {
    score += 10;
    reasons.push("+10 message détaillé (>80 caractères)");
  }

  if (includesAny(normalizedMessage, URGENCY_KEYWORDS)) {
    score += 50;
    reasons.push("+50 urgence détectée");
  }

  return {
    score,
    priority: toPriority(score),
    reasons,
  };
}

