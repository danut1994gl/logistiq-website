// The notification email the contact form sends to contact@logistiq.ro. Every
// value the visitor typed is escaped before it reaches the HTML: until 2026-11-08
// they were interpolated raw, so a message could inject links or markup into the
// inbox. Server-only (the route imports it).

export type ContactMessage = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape text for HTML element content and quoted attribute values. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// Line breaks survive as <br>, added after escaping, so nothing else becomes markup.
function multiline(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

// For headers and one-line labels: no control characters (no header injection).
function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

// mailto: percent-encodes what could add headers to the compose window (?, &, #)
// or leave the URL; the whole href is then HTML-escaped for the attribute.
function mailtoHref(email: string): string {
  let target = "";
  try {
    target = encodeURI(email).replace(/[?#&]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch {
    // A malformed string (lone surrogate): no link target rather than a broken one.
  }
  return escapeHtml(`mailto:${target}`);
}

// tel: keeps only what a dialler uses.
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function contactEmail(m: ContactMessage): { subject: string; html: string; text: string } {
  const name = escapeHtml(m.name);
  const email = escapeHtml(m.email);
  const phone = escapeHtml(m.phone);
  const company = escapeHtml(m.company);

  const html = `
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
          <a href="${mailtoHref(m.email)}" style="color: #2563eb; text-decoration: none;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Telefon:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <a href="${telHref(m.phone)}" style="color: #2563eb; text-decoration: none;">${phone}</a>
        </td>
      </tr>
      ${m.company ? `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Companie:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${company}</td>
      </tr>
      ` : ''}
    </table>

    <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj:</h3>
      <p style="margin: 0; overflow-wrap: anywhere; color: #4b5563; font-size: 15px; line-height: 1.7;">${multiline(m.message)}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
      Acest mesaj a fost trimis prin formularul de contact de pe logistiq.ro
    </p>
  </div>
</body>
</html>
    `;

  // The plain-text part carries the values as typed: text is never rendered as markup.
  const text = [
    "Mesaj nou din formularul de contact",
    "",
    `Nume: ${oneLine(m.name)}`,
    `Email: ${oneLine(m.email)}`,
    `Telefon: ${oneLine(m.phone)}`,
    ...(m.company ? [`Companie: ${oneLine(m.company)}`] : []),
    "",
    "Mesaj:",
    m.message,
  ].join("\n");

  return { subject: `[Contact] Mesaj nou de la ${oneLine(m.name)}`, html, text };
}
