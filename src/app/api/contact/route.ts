import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { checkBotId } from 'botid/server'
import { checkRateLimit } from '@vercel/firewall'
import { createReadClient } from '@/lib/supabase'
import { contactEmail } from '@/lib/contact/email'
import { CONTACT_MAX_BODY_CHARS, isOneLine, isPlainMailbox, isText, trimPhone } from '@/lib/contact/input'
import { verifyRecaptcha } from '@/lib/contact/recaptcha'
import { SMTP_SEND_DEADLINE_MS, smtpTlsMode, smtpTlsOptions } from '@/lib/contact/smtp'
import {
  ELAPSED_FIELD,
  FIELD_MAX,
  HONEYPOT_FIELD,
  MAX_FILL_MS,
  MIN_FILL_MS,
  RECAPTCHA_FIELD,
  type ContactErrorCode,
} from '@/lib/contact/protocol'

// SMTP configuration from environment variables
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465')
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'cloud342.c-f.ro',
  port: SMTP_PORT,
  // 587 and 25: STARTTLS, required; any other port, 465 included: TLS from the first byte (lib/contact/smtp.ts).
  ...smtpTlsMode(SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER || 'noreply@logistiq.ro',
    pass: process.env.SMTP_PASS || '',
  },
  // A mail server that hangs must not hold the request until the platform stops it:
  // nodemailer's defaults wait 2 min to connect, 30 s for the greeting and 10 min of
  // silence. Since nodemailer 10.1 connectionTimeout bounds the whole setup (connecting,
  // TLS, the greeting); socketTimeout is the silence allowed once the session runs.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  // The server's certificate is always verified (SMTP_TLS_SERVERNAME / SMTP_TLS_CA when
  // it needs them): lib/contact/smtp.ts.
  tls: smtpTlsOptions(),
}

// The Vercel WAF rule this route asks: Firewall → custom rule whose condition is
// "@vercel/firewall" with this Rate limit ID. Until the rule exists the check
// answers "not-found" and messages go through.
const RATE_LIMIT_ID = 'contact'

// What each field may hold besides its length (lib/contact/input.ts): name, company and
// phone are one line, the message keeps its line breaks, and the address, the e-mail's
// Reply-To, must be a plain mailbox (checked after the required fields, for its own answer).
const FIELD_RULE: Record<keyof typeof FIELD_MAX, (value: string) => boolean> = {
  name: isOneLine,
  email: () => true,
  company: isOneLine,
  phone: isOneLine,
  message: isText,
}

// Anti-spam on this anonymous write path, cheapest layer first:
//   1. honeypot: a hidden field people never fill;
//   2. fill time: sent under MIN_FILL_MS, or more than MAX_FILL_MS, after the form opened;
//   3. Vercel BotID, basic level: the invisible challenge instrumentation-client.ts attaches;
//   4. Vercel WAF rate limit per IP, answered 429 (people behind one IP can reach it too);
//   5. reCAPTCHA v3, only once its keys are set (lib/contact/recaptcha.ts).
// A request layers 1, 2, 3 or 5 recognise as a bot gets the same 200 as a delivered
// message, and nothing is sent or stored, so the answer teaches a bot nothing.
// Then the email, every field escaped (lib/contact/email.ts), and the lead row.

function silentlyDropped(layer: string) {
  console.warn(`contact: dropped by the ${layer} check`)
  return NextResponse.json({ success: true })
}

function failure(status: number, code: ContactErrorCode, error: string) {
  return NextResponse.json({ error, code }, { status })
}

// BotID needs Vercel (the request context and the project's OIDC token). If it
// can't answer, the other layers still hold, so the message goes on.
async function isBot(): Promise<boolean> {
  try {
    const verification = await checkBotId({ advancedOptions: { checkLevel: 'basic' } })
    return verification.isBot
  } catch (error) {
    console.error('contact: BotID check unavailable, not applied', error)
    return false
  }
}

// Fails open, like BotID: a missing rule, a timeout or running off Vercel must
// not take the contact form down.
async function isRateLimited(request: NextRequest): Promise<boolean> {
  try {
    const { rateLimited, error } = await checkRateLimit(RATE_LIMIT_ID, { request, timeout: 1500 })
    if (error === 'not-found') return false // rule not created yet; the library warns
    return rateLimited
  } catch (error) {
    console.error('contact: rate-limit check unavailable, not applied', error)
    return false
  }
}

// A field as typed (trimmed; the phone also without the direction marks a copied number
// carries at its ends): "" when absent, null when not text, too long, or holding what the
// field may not.
function textField(body: Record<string, unknown>, key: keyof typeof FIELD_MAX): string | null {
  const value = body[key]
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') return null
  const trimmed = key === 'phone' ? trimPhone(value) : value.trim()
  return trimmed.length <= FIELD_MAX[key] && FIELD_RULE[key](trimmed) ? trimmed : null
}

export async function POST(request: NextRequest) {
  try {
    // Read as text and bounded before it is parsed: nothing the form sends comes near the cap.
    let body: unknown
    try {
      const text = await request.text()
      if (text.length > CONTACT_MAX_BODY_CHARS) return failure(400, 'invalid', 'Cererea nu este validă')
      body = JSON.parse(text)
    } catch {
      return failure(400, 'invalid', 'Cererea nu este validă')
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return failure(400, 'invalid', 'Cererea nu este validă')
    }
    const fields = body as Record<string, unknown>

    const name = textField(fields, 'name')
    const email = textField(fields, 'email')
    const company = textField(fields, 'company')
    const phone = textField(fields, 'phone')
    const message = textField(fields, 'message')
    if (name === null || email === null || company === null || phone === null || message === null) {
      return failure(400, 'invalid', 'Un câmp este prea lung sau nu este valid')
    }

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return failure(400, 'invalid', 'Toate câmpurile obligatorii trebuie completate')
    }

    // A plain mailbox, nothing the address parser could read a second recipient out of.
    if (!isPlainMailbox(email)) {
      return failure(400, 'invalid', 'Adresa de email nu este validă')
    }

    // 1. Honeypot: any value at all means a bot filled the hidden field.
    const trap = fields[HONEYPOT_FIELD]
    if (trap !== undefined && trap !== null && trap !== '') return silentlyDropped('honeypot')

    // 2. Fill time, measured by the form itself (immune to a wrong device clock).
    const elapsed = fields[ELAPSED_FIELD]
    if (
      typeof elapsed !== 'number' ||
      !Number.isFinite(elapsed) ||
      elapsed < MIN_FILL_MS ||
      elapsed > MAX_FILL_MS
    ) {
      return silentlyDropped('fill-time')
    }

    // 3. Vercel BotID.
    if (await isBot()) return silentlyDropped('BotID')

    // 4. Rate limit per IP, before anything is sent or stored.
    if (await isRateLimited(request)) {
      return failure(429, 'rate_limited', 'Prea multe mesaje într-un timp scurt. Încearcă din nou peste câteva minute.')
    }

    // 5. reCAPTCHA v3 (skipped while its keys are not set).
    const recaptcha = await verifyRecaptcha(fields[RECAPTCHA_FIELD])
    if (recaptcha === 'fail') return silentlyDropped('reCAPTCHA')
    if (recaptcha === 'unavailable') {
      return failure(503, 'verify_failed', 'Nu am putut verifica mesajul. Încearcă din nou peste câteva minute.')
    }

    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG)
    const { subject, html, text } = contactEmail({ name, email, company, phone, message })

    // Send email
    await transporter.sendMail({
      from: '"Logistiq Contact" <noreply@logistiq.ro>',
      to: 'contact@logistiq.ro',
      replyTo: email,
      subject,
      html,
      text,
      // The whole send's bound: a server that trickles its answers can't hold the request.
      signal: AbortSignal.timeout(SMTP_SEND_DEADLINE_MS),
    })

    // Persist a lead row in addition to the email notification (ADR-005). The email is the
    // source of truth for the human reply — a DB failure here must never turn an already-sent
    // email into a 500, so this is best-effort and only logged on failure.
    try {
      const supabase = createReadClient()
      const { error: leadError } = await supabase.from('leads').insert({
        name,
        email,
        phone,
        company: company || null,
        message,
        source: 'website_contact',
      })
      if (leadError) {
        console.error('lead persist failed (email already sent):', leadError)
      }
    } catch (leadError) {
      console.error('lead persist failed (email already sent):', leadError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return failure(500, 'server', 'A apărut o eroare. Te rugăm să încerci din nou.')
  }
}
