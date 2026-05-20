'use server'

import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import { createAuditLead } from '@/lib/leads-repository'
import { calculateLeadScore } from '@/lib/lead-scoring'
import { createLeadActivity } from '@/lib/lead-activities-repository'

type FieldErrors = Partial<Record<'nom' | 'email' | 'entreprise' | 'secteur' | 'besoin' | 'telephone', string>>

type AuditFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: FieldErrors
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+\d\s().-]{6,20}$/

function sanitizeInput(value: FormDataEntryValue | null, maxLength = 500): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toParagraph(value: string): string {
  if (!value) {
    return 'Non renseigné'
  }
  return escapeHtml(value).replaceAll('\n', '<br />')
}

function getRequiredErrors(data: {
  nom: string
  email: string
  entreprise: string
  secteur: string
  besoin: string
  telephone: string
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!data.nom) errors.nom = 'Le nom est requis.'
  if (!data.email) {
    errors.email = "L'email est requis."
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Adresse email invalide.'
  }
  if (!data.entreprise) errors.entreprise = "L'entreprise est requise."
  if (!data.secteur) errors.secteur = "Le secteur d'activité est requis."
  if (!data.besoin) errors.besoin = 'Le besoin principal est requis.'
  if (data.telephone && !PHONE_REGEX.test(data.telephone)) {
    errors.telephone = 'Format de téléphone invalide.'
  }

  return errors
}

export async function submitAuditRequest(
  _prevState: AuditFormState,
  formData: FormData,
): Promise<AuditFormState> {
  console.log('Audit form submitted')
  console.info('[audit-ia] Submission received')

  const payload = {
    nom: sanitizeInput(formData.get('nom'), 120),
    email: sanitizeInput(formData.get('email'), 160).toLowerCase(),
    telephone: sanitizeInput(formData.get('telephone'), 40),
    entreprise: sanitizeInput(formData.get('entreprise'), 160),
    secteur: sanitizeInput(formData.get('secteur'), 160),
    besoin: sanitizeInput(formData.get('besoin'), 220),
    message: sanitizeInput(formData.get('message'), 2000),
  }

  const fieldErrors = getRequiredErrors(payload)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Merci de corriger les champs en erreur.',
      fieldErrors,
    }
  }
  const scoring = calculateLeadScore({
    activite: payload.secteur,
    besoin: payload.besoin,
    message: payload.message,
    telephone: payload.telephone,
    email: payload.email,
    entreprise: payload.entreprise,
  })

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || '', 10)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const contactEmail = process.env.CONTACT_EMAIL || 'contact@corsaimanager.fr'
  const hasSmtpPass = Boolean(smtpPass)
  const databaseUrl = process.env.DATABASE_URL

  console.log(`[audit-ia] SMTP_HOST detected: ${Boolean(smtpHost)}`)
  console.log(`[audit-ia] SMTP_USER detected: ${Boolean(smtpUser)}`)
  console.log(`[audit-ia] SMTP_PASS detected: ${hasSmtpPass}`)
  console.log(`[audit-ia] CONTACT_EMAIL: ${contactEmail}`)
  console.log(`[audit-ia] DATABASE_URL detected: ${Boolean(databaseUrl)}`)

  try {
    if (!smtpHost) {
      throw new Error('SMTP_HOST manquant')
    }
    if (!smtpPort || Number.isNaN(smtpPort)) {
      throw new Error(`SMTP_PORT invalide: "${process.env.SMTP_PORT ?? ''}"`)
    }
    if (!smtpUser) {
      throw new Error('SMTP_USER manquant')
    }
    if (!smtpPass) {
      throw new Error('SMTP_PASS manquant')
    }
    if (!databaseUrl) {
      throw new Error('DATABASE_URL manquant')
    }
  } catch (error: unknown) {
    console.error('[audit-ia] Invalid SMTP environment configuration', {
      error,
      hasSmtpHost: Boolean(smtpHost),
      smtpPortRaw: process.env.SMTP_PORT,
      smtpPortParsed: smtpPort,
      hasSmtpUser: Boolean(smtpUser),
      hasSmtpPass,
      contactEmail,
    })
    return {
      status: 'error',
      message: "Une erreur est survenue lors de l'envoi. Merci de réessayer.",
    }
  }

  const useSecure = smtpPort === 465
  if (!useSecure) {
    console.warn('[audit-ia] SMTP port is not 465; secure is disabled', {
      smtpHost,
      smtpPort,
      secure: useSecure,
    })
  } else {
    console.info('[audit-ia] SMTP secure mode enabled', {
      smtpHost,
      smtpPort,
      secure: useSecure,
      smtpUser,
      hasSmtpPass,
      contactEmail,
    })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: useSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  const from = `CorsaiManager <${smtpUser}>`

  const internalHtml = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#0a0f1a;padding:24px;color:#e5e7eb;">
      <div style="max-width:700px;margin:0 auto;background:linear-gradient(135deg,#0f172a 0%,#111827 100%);border:1px solid rgba(125,211,252,0.25);border-radius:16px;padding:28px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#67e8f9;">Nouveau lead Audit IA</p>
        <h1 style="margin:0 0 18px 0;font-size:24px;line-height:1.3;color:#f8fafc;">Demande reçue depuis le formulaire /audit-ia</h1>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tbody>
            ${[
              ['Nom', payload.nom],
              ['Email', payload.email],
              ['Téléphone', payload.telephone || 'Non renseigné'],
              ['Entreprise', payload.entreprise],
              ['Secteur activité', payload.secteur],
              ['Besoin principal', payload.besoin],
            ]
              .map(
                ([label, value]) =>
                  `<tr><td style="padding:10px 0;border-top:1px solid rgba(148,163,184,0.2);width:180px;color:#93c5fd;font-weight:600;">${label}</td><td style="padding:10px 0;border-top:1px solid rgba(148,163,184,0.2);color:#e2e8f0;">${toParagraph(
                    value,
                  )}</td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top:18px;padding:16px;border-radius:12px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.2);">
          <p style="margin:0 0 8px 0;color:#93c5fd;font-weight:600;">Message</p>
          <p style="margin:0;color:#e2e8f0;line-height:1.6;">${toParagraph(payload.message)}</p>
        </div>
      </div>
    </div>
  `

  const customerHtml = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#0a0f1a;padding:24px;color:#e5e7eb;">
      <div style="max-width:700px;margin:0 auto;background:linear-gradient(135deg,#0f172a 0%,#111827 100%);border:1px solid rgba(125,211,252,0.25);border-radius:16px;padding:28px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#67e8f9;">CorsaiManager</p>
        <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;color:#f8fafc;">Votre demande d’audit IA a bien été reçue</h1>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">
          Bonjour ${escapeHtml(payload.nom)},
        </p>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">
          Merci pour votre demande. Notre équipe va analyser votre contexte et revenir vers vous rapidement avec une première qualification.
        </p>
        <p style="margin:0 0 12px 0;line-height:1.7;color:#e2e8f0;">
          Délai de réponse habituel: <strong style="color:#f8fafc;">sous 24 heures ouvrées</strong>.
        </p>
        <p style="margin:0 0 18px 0;line-height:1.7;color:#e2e8f0;">
          Si vous souhaitez échanger plus vite, vous pouvez nous écrire sur WhatsApp:
          <a href="https://wa.me/33665018730" style="color:#67e8f9;text-decoration:none;"> +33 6 65 01 87 30</a>
        </p>
        <p style="margin:0;color:#94a3b8;font-size:14px;">CorsaiManager</p>
      </div>
    </div>
  `

  try {
    let leadId: number | null = null
    try {
      leadId = await createAuditLead({
        nom: payload.nom,
        email: payload.email,
        telephone: payload.telephone,
        entreprise: payload.entreprise,
        secteur: payload.secteur,
        besoin: payload.besoin,
        message: payload.message,
        status: 'new',
        source: 'audit-form',
        score: scoring.score,
        priority: scoring.priority,
        scoreReasons: scoring.reasons,
      })
      if (leadId) {
        await createLeadActivity({
          leadId,
          type: "lead_created",
          description: "Lead créé depuis le formulaire audit IA",
          userAction: "system",
          metadata: { source: "audit-form", score: scoring.score, priority: scoring.priority },
        })
      }
      console.info('[audit-ia] Lead stored in Neon')
    } catch (error: unknown) {
      console.error('[audit-ia] Neon insert failed', {
        error,
      })
      throw error
    }

    try {
      await transporter.verify()
      console.info('[audit-ia] SMTP transporter verification succeeded')
    } catch (error: unknown) {
      console.error('[audit-ia] SMTP verify failed', {
        error,
        smtpHost,
        smtpPort,
        secure: useSecure,
        smtpUser,
        hasSmtpPass,
        contactEmail,
      })
      throw error
    }

    try {
      await transporter.sendMail({
        from,
        to: contactEmail,
        replyTo: payload.email,
        subject: `Nouveau lead Audit IA - ${payload.entreprise}`,
        html: internalHtml,
      })
      console.info('[audit-ia] nodemailer success: internal email sent', { to: contactEmail })
      if (leadId) {
        await createLeadActivity({
          leadId,
          type: "email_sent",
          description: "Email admin envoyé",
          userAction: "system",
          metadata: { to: contactEmail, template: "admin-audit" },
        })
      }
    } catch (error: unknown) {
      console.error('[audit-ia] Internal email send failed', {
        error,
        to: contactEmail,
        smtpHost,
        smtpPort,
        secure: useSecure,
        smtpUser,
      })
      throw error
    }

    try {
      await transporter.sendMail({
        from,
        to: payload.email,
        subject: 'Votre demande d’audit IA a bien été reçue',
        html: customerHtml,
      })
      console.info('[audit-ia] nodemailer success: confirmation email sent', { to: payload.email })
      if (leadId) {
        await createLeadActivity({
          leadId,
          type: "email_sent",
          description: "Email confirmation prospect envoyé",
          userAction: "system",
          metadata: { to: payload.email, template: "customer-confirmation" },
        })
      }
    } catch (error: unknown) {
      console.error('[audit-ia] Confirmation email send failed', {
        error,
        to: payload.email,
        smtpHost,
        smtpPort,
        secure: useSecure,
        smtpUser,
      })
      throw error
    }

  } catch (error: unknown) {
    const typedError = error as {
      name?: string
      message?: string
      code?: string
      command?: string
      response?: string
      responseCode?: number
      stack?: string
    }

    console.error('[audit-ia] SMTP failure (final catch)', {
      error,
      name: typedError?.name,
      message: typedError?.message,
      code: typedError?.code,
      command: typedError?.command,
      responseCode: typedError?.responseCode,
      response: typedError?.response,
      stack: typedError?.stack,
      smtpHost,
      smtpPort,
      secure: useSecure,
      smtpUser,
      hasSmtpPass,
      contactEmail,
    })

    return {
      status: 'error',
      message: "Une erreur est survenue lors de l'envoi. Merci de réessayer.",
    }
  }

  redirect('/audit-ia/success')
}
