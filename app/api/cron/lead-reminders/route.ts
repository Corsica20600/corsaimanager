import { NextResponse } from "next/server";
import { createLeadActivity } from "@/lib/lead-activities-repository";
import { getLeadsForReminders, markLeadReminderSent } from "@/lib/leads-repository";
import { getMailerTransport } from "@/lib/mailer";
import { buildReminderEmail } from "@/lib/reminder-emails";

export const dynamic = "force-dynamic";

function getReminderStep(days: number): 1 | 2 | 3 | null {
  if (days >= 7) return 3;
  if (days >= 3) return 2;
  if (days >= 1) return 1;
  return null;
}

export async function GET(request: Request) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    const leads = await getLeadsForReminders();
    const { transport, from } = getMailerTransport();

    let remindersSent = 0;
    for (const lead of leads) {
      const createdAt = new Date(lead.created_at).getTime();
      const daysSince = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
      const targetStep = getReminderStep(daysSince);
      if (!targetStep) continue;
      if (lead.reminder_step >= targetStep) continue;
      if (!lead.email) continue;

      const reminder = buildReminderEmail(lead, targetStep);
      const sentAt = new Date().toISOString();

      try {
        const info = await transport.sendMail({
          from,
          to: lead.email,
          subject: reminder.subject,
          html: reminder.html,
        });

        await markLeadReminderSent(lead.id, targetStep);
        await createLeadActivity({
          leadId: lead.id,
          type: "reminder_sent",
          description: `Relance automatique envoyée (J+${targetStep === 1 ? "1" : targetStep === 2 ? "3" : "7"})`,
          userAction: "system",
          metadata: {
            step: targetStep,
            smtp_status: "envoyée",
            sent_at: sentAt,
            message_id: getMessageId(info),
            error: null,
          },
        });

        remindersSent += 1;
      } catch (error) {
        await createLeadActivity({
          leadId: lead.id,
          type: "note_added",
          description: `Relance automatique non envoyée (J+${targetStep === 1 ? "1" : targetStep === 2 ? "3" : "7"})`,
          userAction: "system",
          metadata: {
            step: targetStep,
            smtp_status: "erreur",
            error_at: new Date().toISOString(),
            message_id: null,
            error: formatSmtpError(error),
          },
        });
      }
    }

    return NextResponse.json({ ok: true, remindersSent });
  } catch (error) {
    console.error("[cron] lead-reminders failed", error);
    return NextResponse.json({ ok: false, error: "cron_failed" }, { status: 500 });
  }
}

function validateCronRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET manquant côté serveur." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";

  if (constantTimeEqual(bearer, expectedSecret) || constantTimeEqual(headerSecret.trim(), expectedSecret)) {
    return null;
  }

  return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
}

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return result === 0;
}

function getMessageId(info: unknown) {
  const messageId = (info as { messageId?: unknown })?.messageId;
  return typeof messageId === "string" && messageId.trim() ? messageId.trim() : null;
}

function formatSmtpError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Erreur SMTP inconnue.";
}
