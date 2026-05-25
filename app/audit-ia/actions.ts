'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import { createAuditLead, enforceLeadSubmissionRateLimit, updateLeadAIAnalysis } from '@/lib/leads-repository'
import { calculateLeadScore } from '@/lib/lead-scoring'
import { createLeadActivity } from '@/lib/lead-activities-repository'
import { qualifyLeadWithAI } from '@/lib/ai/lead-qualification'

type FieldErrors = Partial<Record<'nom' | 'email' | 'entreprise' | 'secteur' | 'besoin' | 'telephone', string>>

type AuditFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: FieldErrors
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(?:\+|00)?[1-9][\d\s().-]{7,19}$/
const MIN_FIELD_LENGTHS = {
  nom: 2,
  entreprise: 2,
  secteur: 2,
  besoin: 3,
  message: 10,
} as const

function normalizePhone(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  return cleaned
}

function getClientIp(rawForwardedFor: string | null): string {
  if (!rawForwardedFor) return 'unknown'
  return rawForwardedFor.split(',')[0]?.trim() || 'unknown'
}

function countDictionaryWords(value: string): number {
  return (value.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? []).length
}

function isLikelyRandomString(value: string): boolean {
  if (!value) return false
  const lettersOnly = value.replace(/[^A-Za-z]/g, '').toLowerCase()
  if (lettersOnly.length < 8) return false
  const vowels = (lettersOnly.match(/[aeiouy]/g) ?? []).length
  const vowelRatio = vowels / lettersOnly.length
  const longConsonantSequence = /[bcdfghjklmnpqrstvwxz]{6,}/i.test(lettersOnly)
  return vowelRatio < 0.2 || longConsonantSequence
}

function hasSuspiciousContent(fields: string[]): { suspicious: boolean; reasons: string[] } {
  const combined = fields.filter(Boolean).join(' ').trim()
  if (!combined) return { suspicious: false, reasons: [] }

  const reasons: string[] = []
  const dictionaryWords = countDictionaryWords(combined)
  const tokens = combined.split(/\s+/).filter(Boolean)
  const wordDensity = tokens.length === 0 ? 0 : dictionaryWords / tokens.length

  if (wordDensity < 0.35) reasons.push('low_word_density')
  if (/[A-Za-z0-9]{14,}/.test(combined)) reasons.push('long_unbroken_token')
  if ((combined.match(/[!@#$%^&*_=+~]{6,}/g) ?? []).length > 0) reasons.push('symbol_burst')
  if (fields.some((field) => isLikelyRandomString(field))) reasons.push('random_pattern')

  return { suspicious: reasons.length > 0, reasons }
}

async function verifyRecaptchaV3(token: string, remoteIp: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.warn('[audit-ia][captcha] RECAPTCHA_SECRET_KEY missing; captcha check skipped')
    return { ok: true, score: 1, reason: 'missing_secret' as const }
  }

  if (!token) {
    return { ok: false, score: 0, reason: 'missing_token' as const }
  }

  const body = new URLSearchParams({ secret, response: token, remoteip: remoteIp })
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  const data = (await response.json()) as {
    success: boolean
    score?: number
    action?: string
  }
  const score = data.score ?? 0
  const action = data.action ?? ''
  const minScore = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? '0.3')
  const ok = Boolean(data.success) && action === 'audit_form_submit' && score >= minScore

  return { ok, score, action, reason: ok ? 'ok' : 'low_score_or_invalid_action' as const }
}

function hasManifestlyInvalidContent(value: string): { invalid: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (!value) return { invalid: false, reasons }

  if (/\S{60,}/.test(value)) reasons.push('long_unspaced_token')
  if ((value.match(/https?:\/\//g) ?? []).length >= 3) reasons.push('repeated_suspicious_links')
  if ((value.match(/[A-Za-z0-9]{30,}/g) ?? []).length > 0) reasons.push('long_random_alnum')
  if ((value.match(/[\u2600-\u27BF!@#$%^&*_=+~]{12,}/g) ?? []).length > 0) reasons.push('random_character_burst')

  return { invalid: reasons.length > 0, reasons }
}

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
  else if (data.nom.length < MIN_FIELD_LENGTHS.nom) errors.nom = 'Le nom est trop court.'
  if (!data.email) {
    errors.email = "L'email est requis."
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Adresse email invalide.'
  }
  if (!data.entreprise) errors.entreprise = "L'entreprise est requise."
  else if (data.entreprise.length < MIN_FIELD_LENGTHS.entreprise) errors.entreprise = "L'entreprise est trop courte."
  if (!data.secteur) errors.secteur = "Le secteur d'activité est requis."
  else if (data.secteur.length < MIN_FIELD_LENGTHS.secteur) errors.secteur = "Le secteur d'activité est trop court."
  if (!data.besoin) errors.besoin = 'Le besoin principal est requis.'
  else if (data.besoin.length < MIN_FIELD_LENGTHS.besoin) errors.besoin = 'Le besoin principal est trop court.'
  if (data.telephone && !PHONE_REGEX.test(normalizePhone(data.telephone))) {
    errors.telephone = 'Format de téléphone invalide.'
  }

  return errors
}

export async function submitAuditRequest(
  _prevState: AuditFormState,
  formData: FormData,
): Promise<AuditFormState> {
  const requestHeaders = await headers()
  const ipAddress = getClientIp(requestHeaders.get('x-forwarded-for'))
  const userAgent = requestHeaders.get('user-agent') ?? 'unknown'
  console.info('[audit-ia] Submission received', { ipAddress, hasUserAgent: userAgent !== 'unknown' })

  const payload = {
    nom: sanitizeInput(formData.get('nom'), 120),
    email: sanitizeInput(formData.get('email'), 160).toLowerCase(),
    telephone: sanitizeInput(formData.get('telephone'), 40),
    entreprise: sanitizeInput(formData.get('entreprise'), 160),
    secteur: sanitizeInput(formData.get('secteur'), 160),
    besoin: sanitizeInput(formData.get('besoin'), 220),
    message: sanitizeInput(formData.get('message'), 2000),
  }
  const honeypot = sanitizeInput(formData.get('website'), 120)
  const recaptchaToken = sanitizeInput(formData.get('recaptcha_token'), 1200)

  const maxPerHour = process.env.NODE_ENV === 'production' ? 10 : 1000
  const rateLimit = await enforceLeadSubmissionRateLimit(ipAddress, maxPerHour)
  if (!rateLimit.allowed) {
    console.warn('[audit-ia][block] rate_limited', { ipAddress, attempts: rateLimit.attempts, maxPerHour })
    return {
      status: 'error',
      message: 'Trop de tentatives. Merci de réessayer dans une heure.',
    }
  }

  const fieldErrors = getRequiredErrors(payload)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Merci de corriger les champs en erreur.',
      fieldErrors,
    }
  }
  if (payload.message && payload.message.length < MIN_FIELD_LENGTHS.message) {
    return {
      status: 'error',
      message: `Le message doit contenir au moins ${MIN_FIELD_LENGTHS.message} caractères.`,
    }
  }

  let recaptcha: Awaited<ReturnType<typeof verifyRecaptchaV3>>
  try {
    recaptcha = await verifyRecaptchaV3(recaptchaToken, ipAddress)
  } catch (error) {
    console.warn('[audit-ia][block] missing_token', { ipAddress, error })
    return {
      status: 'error',
      message: "Impossible de vérifier la protection anti-spam. Veuillez réessayer.",
    }
  }
  if (recaptcha.reason === 'missing_token') {
    console.warn('[audit-ia][block] missing_token', { ipAddress })
    return {
      status: 'error',
      message: "Impossible de vérifier la protection anti-spam. Veuillez réessayer.",
    }
  }

  const recaptchaHardBlock = recaptcha.score < 0.2
  const recaptchaReview = recaptcha.score >= 0.2 && recaptcha.score < 0.5
  const recaptchaInvalidAction = recaptcha.reason === 'low_score_or_invalid_action' && recaptcha.score >= 0.2
  const suspiciousCheck = hasSuspiciousContent([
    payload.nom,
    payload.entreprise,
    payload.secteur,
    payload.besoin,
    payload.message,
  ])
  const invalidContentCheck = hasManifestlyInvalidContent(payload.message)
  const strongIdentitySignal = Boolean(payload.email && payload.entreprise && (!payload.telephone || PHONE_REGEX.test(normalizePhone(payload.telephone))))

  const isHoneypotSpam = Boolean(honeypot)
  const isInvalidContentSpam = invalidContentCheck.invalid && !strongIdentitySignal
  // reCAPTCHA and honeypot are review signals only, not hard blocking, to avoid false positives.
  const isSpam = isInvalidContentSpam
  const reviewNeeded =
    !isSpam &&
    (isHoneypotSpam || recaptchaHardBlock || recaptchaReview || recaptchaInvalidAction || suspiciousCheck.suspicious)

  console.info('[audit-ia][anti-spam]', {
    ipAddress,
    honeypotFilled: Boolean(honeypot),
    recaptchaOk: recaptcha.ok,
    recaptchaReason: recaptcha.reason,
    recaptchaScore: recaptcha.score,
    recaptchaHardBlock,
    recaptchaReview,
    recaptchaInvalidAction,
    suspicious: suspiciousCheck.suspicious,
    suspiciousReasons: suspiciousCheck.reasons,
    invalidContent: invalidContentCheck.invalid,
    invalidContentReasons: invalidContentCheck.reasons,
    strongIdentitySignal,
    reviewNeeded,
    isSpam,
  })

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

  let aiAnalysis: Awaited<ReturnType<typeof qualifyLeadWithAI>> = null

  const aiBlockHtml = () => `
    <div style="margin-top:18px;padding:16px;border-radius:12px;background:rgba(15,23,42,0.7);border:1px solid rgba(34,211,238,0.25);">
      <p style="margin:0 0 8px 0;color:#67e8f9;font-weight:700;">Analyse IA du lead</p>
      <p style="margin:0 0 6px 0;color:#e2e8f0;"><strong>Résumé:</strong> ${toParagraph(aiAnalysis?.summary ?? "Analyse IA indisponible (fallback scoring classique).")}</p>
      <p style="margin:0 0 6px 0;color:#e2e8f0;"><strong>Qualification:</strong> ${toParagraph(aiAnalysis?.qualification ?? "N/A")}</p>
      <p style="margin:0 0 6px 0;color:#e2e8f0;"><strong>Urgence:</strong> ${toParagraph(aiAnalysis?.urgency ?? "N/A")}</p>
      <p style="margin:0 0 6px 0;color:#e2e8f0;"><strong>Besoins détectés:</strong> ${toParagraph(aiAnalysis?.detectedNeeds.join(", ") ?? "N/A")}</p>
      <p style="margin:0 0 6px 0;color:#e2e8f0;"><strong>Prochaine action:</strong> ${toParagraph(aiAnalysis?.nextAction ?? "Revenir vers le prospect sous 24h.")}</p>
      <p style="margin:0;color:#e2e8f0;"><strong>Réponse suggérée:</strong> ${toParagraph(aiAnalysis?.suggestedReply ?? "Bonjour, merci pour votre demande. Nous revenons vers vous rapidement.")}</p>
    </div>
  `

  const buildInternalHtml = () => `
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
        <div style="margin-top:12px;padding:12px;border-radius:12px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.2);">
          <p style="margin:0;color:#e2e8f0;">Score classique: <strong>${scoring.score}</strong> · Priorité: <strong>${scoring.priority}</strong></p>
        </div>
        ${aiBlockHtml()}
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
        isSpam,
        reviewNeeded,
      })
      if (leadId) {
        await createLeadActivity({
          leadId,
          type: "lead_created",
          description: "Lead créé depuis le formulaire audit IA",
          userAction: "system",
          metadata: {
            source: "audit-form",
            score: scoring.score,
            priority: scoring.priority,
            isSpam,
            recaptchaReason: recaptcha.reason,
            reviewNeeded,
          },
        })
      }
      console.info('[audit-ia] Lead stored in Neon')

      if (!isSpam) {
        try {
        aiAnalysis = await qualifyLeadWithAI({
          nom: payload.nom,
          email: payload.email,
          telephone: payload.telephone,
          entreprise: payload.entreprise,
          activite: payload.secteur,
          besoin: payload.besoin,
          message: payload.message,
          classicScore: scoring.score,
        })

        if (leadId && aiAnalysis) {
          await updateLeadAIAnalysis(leadId, aiAnalysis)
          await createLeadActivity({
            leadId,
            type: "note_added",
            description: "Qualification IA générée",
            userAction: "system",
            metadata: {
              aiQualification: aiAnalysis.qualification,
              aiUrgency: aiAnalysis.urgency,
              aiConfidence: aiAnalysis.confidence,
            },
          })
        }
        } catch (error) {
          console.error("[audit-ia] AI qualification failed, fallback classique", error)
        }
        if (reviewNeeded && leadId) {
          await createLeadActivity({
            leadId,
            type: "note_added",
            description: "Soumission à revoir",
            userAction: "system",
            metadata: {
              reviewReason: recaptchaReview ? 'recaptcha_mid_score' : 'suspicious_content',
              recaptchaScore: recaptcha.score,
              suspiciousReasons: suspiciousCheck.reasons,
            },
          })
        }
      } else if (leadId) {
        const spamReason = isInvalidContentSpam ? 'invalid_content' : 'unknown'
        console.warn('[audit-ia][block]', { spamReason, ipAddress, email: payload.email })
        await createLeadActivity({
          leadId,
          type: "note_added",
          description: "Soumission marquée spam",
          userAction: "system",
          metadata: {
            ipAddress,
            honeypotFilled: Boolean(honeypot),
            recaptchaScore: recaptcha.score,
            recaptchaReason: recaptcha.reason,
            suspiciousReasons: suspiciousCheck.reasons,
            invalidContentReasons: invalidContentCheck.reasons,
            spamReason,
          },
        })
      }
    } catch (error: unknown) {
      console.error('[audit-ia] Neon insert failed', {
        error,
      })
      throw error
    }

    if (isSpam) {
      console.warn('[audit-ia] Spam detected; emails are skipped', { ipAddress, email: payload.email })
      return {
        status: 'error',
        message: 'Spam détecté.',
      }
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
        html: buildInternalHtml(),
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
