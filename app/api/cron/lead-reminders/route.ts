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

export async function GET() {
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

      await transport.sendMail({
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
        metadata: { step: targetStep },
      });

      remindersSent += 1;
    }

    return NextResponse.json({ ok: true, remindersSent });
  } catch (error) {
    console.error("[cron] lead-reminders failed", error);
    return NextResponse.json({ ok: false, error: "cron_failed" }, { status: 500 });
  }
}

