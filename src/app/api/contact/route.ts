import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'cloud342.c-f.ro',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'noreply@logistiq.ro',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    rejectUnauthorized: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone, message } = await request.json()

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Toate câmpurile obligatorii trebuie completate' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresa de email nu este validă' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG)

    // Email HTML template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Logistiq</h1>
      <p style="color: #64748b; margin: 5px 0 0 0;">Mesaj nou din formularul de contact</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 120px; color: #374151;">Nume:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Telefon:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
        </td>
      </tr>
      ${company ? `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Companie:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${company}</td>
      </tr>
      ` : ''}
    </table>

    <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj:</h3>
      <p style="margin: 0; white-space: pre-wrap; color: #4b5563; font-size: 15px; line-height: 1.7;">${message}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
      Acest mesaj a fost trimis prin formularul de contact de pe logistiq.ro
    </p>
  </div>
</body>
</html>
    `

    // Send email
    await transporter.sendMail({
      from: '"Logistiq Contact" <noreply@logistiq.ro>',
      to: 'contact@logistiq.ro',
      replyTo: email,
      subject: `[Contact] Mesaj nou de la ${name}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'A apărut o eroare. Te rugăm să încerci din nou.' },
      { status: 500 }
    )
  }
}
