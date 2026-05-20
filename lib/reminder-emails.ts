import type { LeadRow } from "@/lib/leads-repository";

export function buildReminderEmail(lead: LeadRow, step: 1 | 2 | 3) {
  const subjectMap = {
    1: "Suite à votre demande d’audit IA",
    2: "Exemple concret d’automatisation pour votre activité",
    3: "Dernier rappel - échange rapide sur votre audit IA",
  } as const;

  const introMap = {
    1: "Nous revenons vers vous pour faire avancer votre demande d’audit IA.",
    2: "Nous vous partageons un angle concret lié à votre besoin pour faciliter votre projection.",
    3: "Sans retour de votre part, nous clôturerons le suivi pour l’instant.",
  } as const;

  const html = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#0a0f1a;padding:24px;color:#e5e7eb;">
      <div style="max-width:700px;margin:0 auto;background:linear-gradient(135deg,#0f172a 0%,#111827 100%);border:1px solid rgba(125,211,252,0.25);border-radius:16px;padding:28px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#67e8f9;">CorsaiManager</p>
        <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#f8fafc;">${subjectMap[step]}</h1>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">Bonjour ${lead.nom},</p>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">${introMap[step]}</p>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">
          Contexte détecté: <strong>${lead.entreprise}</strong> · ${lead.besoin}.
        </p>
        <p style="margin:0 0 16px 0;line-height:1.7;color:#e2e8f0;">
          Si vous le souhaitez, nous pouvons vous proposer un échange court pour cadrer les priorités.
        </p>
        <a href="https://corsaimanager.com/audit-ia" style="display:inline-block;border-radius:999px;background:linear-gradient(90deg,#67e8f9,#60a5fa);padding:10px 18px;color:#0b1220;text-decoration:none;font-weight:600;">
          Réserver un audit IA
        </a>
      </div>
    </div>
  `;

  return {
    subject: subjectMap[step],
    html,
  };
}

