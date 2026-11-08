import { describe, it, expect } from "vitest";
import { contactEmail, escapeHtml } from "@/lib/contact/email";

const base = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Bună ziua",
};

describe("escapeHtml", () => {
  it("escapes every character that can open markup or leave an attribute", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });
});

describe("contactEmail", () => {
  it("escapes the name, company, phone and message (no injected markup reaches the inbox)", () => {
    const { html } = contactEmail({
      ...base,
      name: "<b>Ion</b>",
      company: `<img src=x onerror="alert(1)">`,
      phone: `"><script>alert(1)</script>`,
      message: `<a href="https://evil.example">click here</a>`,
    });
    expect(html).not.toMatch(/<b>Ion|<img|<script|<a href="https:\/\/evil/);
    expect(html).toContain("&lt;b&gt;Ion&lt;/b&gt;");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;click here&lt;/a&gt;");
  });

  it("escapes the email in the text and in the mailto: link", () => {
    const { html } = contactEmail({ ...base, email: `"><svg/onload=alert(1)>@evil.ro` });
    expect(html).not.toContain("<svg");
    expect(html).toContain("&quot;&gt;&lt;svg/onload=alert(1)&gt;@evil.ro</a>");
    const href = html.match(/href="(mailto:[^"]*)"/)?.[1];
    expect(href).toBeDefined();
    expect(href).not.toMatch(/[<>"]/);
  });

  it("keeps the mailto: link from adding headers to the reply", () => {
    const { html } = contactEmail({ ...base, email: "ion@firma.ro?cc=all@corp.ro&body=x" });
    const href = html.match(/href="(mailto:[^"]*)"/)?.[1] ?? "";
    expect(href).toBe("mailto:ion@firma.ro%3Fcc=all@corp.ro%26body=x");
  });

  it("keeps only dialler characters in the tel: link", () => {
    const { html } = contactEmail({ ...base, phone: `+40 (771) 570-577"onmouseover="x` });
    expect(html).toContain('href="tel:+40771570577"');
  });

  it("keeps the message's line breaks", () => {
    const { html, text } = contactEmail({ ...base, message: "Rândul 1\nRândul 2\r\n\r\nRândul 4" });
    expect(html).toContain("Rândul 1<br>Rândul 2<br><br>Rândul 4");
    expect(text).toContain("Rândul 1\nRândul 2\r\n\r\nRândul 4");
  });

  it("puts the name on one line in the subject (no header injection)", () => {
    const { subject } = contactEmail({ ...base, name: "Ion\r\nBcc: all@corp.ro" });
    expect(subject).toBe("[Contact] Mesaj nou de la Ion Bcc: all@corp.ro");
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("omits the company row when there is none", () => {
    expect(contactEmail({ ...base, company: "" }).html).not.toContain("Companie:");
    expect(contactEmail(base).html).toContain("Transport SRL");
  });
});
