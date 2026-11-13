"""Builds the owner's e-mail signature: its three images and the paste-ready HTML.

    uv run --with pillow python scripts/email-signature/build.py
    uv run --with pillow python scripts/email-signature/build.py --local-preview /tmp/sig

Needs `rsvg-convert` (librsvg) on the PATH.

Writes:
- public/email/signature/logistiq.png     the official banner (public/banner.svg), its
  wordmark in the footer's blue gradient (the navy one disappears on a dark background)
- public/email/signature/qrgo-driver.png  the QRGo Driver app icon, corners rounded
- public/email/signature/divider.png      a vertical capsule in the site's .gradient-text
  colours (blue, cyan, blue)
- scripts/email-signature/signature.html  the signature itself, for HTML signature editors
- public/email/signature/index.html       the owner's page at https://logistiq.ro/email/signature
  (next.config.ts redirects there; the dotted path skips the language middleware): light and
  dark previews, copy buttons, the set-up steps per mail app. noindex, linked from nowhere.

E-mails already sent load the images from https://logistiq.ro/email/signature/. Never move,
rename or delete them; to change one, give the new image a new name and rebuild.

Light and dark mode: mail apps recolour text and backgrounds in dark mode but never images.
So the signature sets no background; the name takes the reader's own text colour; every other
colour sits halfway between white and near-black (about 4:1 on both); every image reads on
either background.
"""

import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent.parent
HERE = Path(__file__).resolve().parent
IMAGES = ROOT / "public/email/signature"
BANNER = ROOT / "public/banner.svg"
APP_ICON = HERE / "qrgo-driver-app-icon.png"  # apps/driver-mobile iOS AppIcon icon-light.png
IMG_BASE = "https://logistiq.ro/email/signature"

SCALE = 3                  # images are drawn at 3x their display size (sharp on retina)
LOGO_H = 34                # display height of the Logistiq lockup
ICON = 32                  # display size of the app icon
DIV_W, DIV_H = 2, 100      # display size of the divider

BLUE = "#3176f4"           # the mark's own blue: ~4.3:1 on white and ~3.9:1 on #1e1e1e
MUTED = "#737d8c"          # neutral slate with the same balance (~4.1:1 on both)
FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

NAME = "Dănuț Cătălin Bălan"
EMAIL = "danut.balan@logistiq.ro"
ROLE = "Logistiq · QRGo Driver"
TAGLINE = "Dock booking · Driver check-in · Yard management"
FOOTER = "Digital warehouse flow · Real-time driver coordination"
SITES = [("logistiq.ro", "https://logistiq.ro/en"),
         ("logistiq.be", "https://logistiq.be/en"),
         ("qrgo.ro", "https://qrgo.ro/")]
# The app is listed in the European stores but not in the US one, and a link without a
# country opens the US page in a desktop browser: 404. The RO page answers (in English);
# on a phone the App Store app opens the reader's own store whatever the link says.
APP_STORE = "https://apps.apple.com/ro/app/qrgo-driver/id6756977629"
GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=ro.qrgo.driver"


# --- images -----------------------------------------------------------------------------

def build_logo(out: Path) -> tuple[int, int]:
    svg = BANNER.read_text()
    svg = svg.replace('fill="#1f40af"', 'fill="url(#sigWordmark)"')
    gradient = ('<linearGradient id="sigWordmark" x1="0%" y1="0%" x2="100%" y2="0%">'
                '<stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#2563eb"/>'
                "</linearGradient>")
    svg = svg.replace("<defs>", "<defs>" + gradient, 1)
    with tempfile.TemporaryDirectory() as tmp:
        src, big = Path(tmp) / "logo.svg", Path(tmp) / "logo.png"
        src.write_text(svg)
        subprocess.run(["rsvg-convert", "-h", "2000", str(src), "-o", str(big)], check=True)
        im = Image.open(big).convert("RGBA")
        im = im.crop(im.getbbox())
    h = LOGO_H * SCALE
    w = round(im.width * h / im.height)
    im.resize((w, h), Image.LANCZOS).save(out / "logistiq.png", optimize=True)
    return round(w / SCALE), LOGO_H


def build_app_icon(out: Path) -> None:
    im = Image.open(APP_ICON).convert("RGBA")
    n = im.width
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, n - 1, n - 1), radius=round(n * 0.2237), fill=255)
    im.putalpha(mask)
    im.resize((ICON * SCALE, ICON * SCALE), Image.LANCZOS).save(out / "qrgo-driver.png", optimize=True)


def build_divider(out: Path) -> None:
    w, h = DIV_W * SCALE * 4, DIV_H * SCALE * 4      # drawn 4x larger, then downsampled
    ends, middle = (0x25, 0x63, 0xEB), (0x06, 0xB6, 0xD4)
    bar = Image.new("RGBA", (w, h))
    px = bar.load()
    for y in range(h):
        k = 1 - abs(2 * y / (h - 1) - 1)              # 0 at both ends, 1 in the middle
        colour = tuple(round(a + (b - a) * k) for a, b in zip(ends, middle))
        for x in range(w):
            px[x, y] = (*colour, 255)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=w // 2, fill=255)
    bar.putalpha(mask)
    bar.resize((DIV_W * SCALE, DIV_H * SCALE), Image.LANCZOS).save(out / "divider.png", optimize=True)


# --- signature HTML ---------------------------------------------------------------------
# Tables, inline styles and absolute image URLs only: that is what Gmail, Outlook (Word
# engine included) and Apple Mail all keep. The font stack starts with the site's Inter and
# falls back to each system's own sans-serif.

TABLE = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">'
DOT = f'<span style="color:{MUTED};">&nbsp;&middot;&nbsp;</span>'


def esc(s: str) -> str:
    """Text as HTML: the separators as entities, every other non-ASCII letter as a numeric
    one, so the code survives any charset (Outlook's .htm signatures among them)."""
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace(" · ", " &middot; ")
    return s.encode("ascii", "xmlcharrefreplace").decode()


def td(style: str, inner: str, valign: bool = False) -> str:
    attr = ' valign="middle"' if valign else ""
    return f'<td{attr} style="font-family:{FONT};{style}">{inner}</td>'


def link(href: str, text: str) -> str:
    # Every link names its colour: a link left to inherit gets the editor's own link blue
    # (Chrome drops `color:inherit` on paste as "redundant", and the <a> turns #0000ee).
    return f'<a href="{href}" style="color:{BLUE};text-decoration:none;">{text}</a>'


def img(src: str, w: int, h: int, alt: str) -> str:
    return (f'<img src="{src}" width="{w}" height="{h}" alt="{alt}" '
            f'style="display:block;border:0;outline:none;width:{w}px;height:{h}px;">')


def signature(base: str, logo_w: int, logo_h: int) -> str:
    app = (TABLE + "<tr>"
           + td("padding:0 9px 0 0;vertical-align:middle;",
                link("https://qrgo.ro/", img(f"{base}/qrgo-driver.png", ICON, ICON, "QRGo Driver")), True)
           + td("vertical-align:middle;",
                TABLE
                + "<tr>" + td("font-size:13px;line-height:16px;font-weight:700;white-space:nowrap;", esc("QRGo Driver")) + "</tr>"
                + "<tr>" + td("font-size:11px;line-height:15px;font-weight:600;white-space:nowrap;",
                              link(APP_STORE, "App Store") + DOT + link(GOOGLE_PLAY, "Google Play")) + "</tr>"
                + "</table>", True)
           + "</tr></table>")
    left = (TABLE
            + "<tr>" + td("padding:0;", link("https://logistiq.ro/en",
                                            img(f"{base}/logistiq.png", logo_w, logo_h, "Logistiq"))) + "</tr>"
            + "<tr>" + td("padding:16px 0 0;", app) + "</tr>"
            + "</table>")
    right = (TABLE
             + "<tr>" + td("font-size:19px;line-height:24px;font-weight:700;letter-spacing:-0.2px;padding:0 0 2px;",
                           esc(NAME)) + "</tr>"
             + "<tr>" + td(f"font-size:13px;line-height:19px;font-weight:600;color:{BLUE};", esc(ROLE)) + "</tr>"
             + "<tr>" + td(f"font-size:12px;line-height:18px;color:{MUTED};padding:0 0 10px;", esc(TAGLINE)) + "</tr>"
             + "<tr>" + td("font-size:13px;line-height:20px;", link(f"mailto:{EMAIL}", EMAIL)) + "</tr>"
             + "<tr>" + td("font-size:13px;line-height:20px;font-weight:600;",
                           DOT.join(link(href, label) for label, href in SITES)) + "</tr>"
             + "</table>")
    footer = (f'<td colspan="3" style="font-family:{FONT};padding:14px 0 0;font-size:11px;line-height:16px;'
              f'color:{MUTED};letter-spacing:0.2px;"><span style="color:{BLUE};">&#9679;</span>&nbsp;&nbsp;'
              f"{esc(FOOTER)}</td>")
    return (TABLE + "<tr>"
            + td("padding:0 20px 0 0;vertical-align:middle;", left, True)
            + f'<td width="{DIV_W}" valign="middle" style="padding:0;width:{DIV_W}px;vertical-align:middle;">'
            + img(f"{base}/divider.png", DIV_W, DIV_H, "") + "</td>"
            + td("padding:0 0 0 20px;vertical-align:middle;", right, True)
            + "</tr><tr>" + footer + "</tr></table>")


def plain_text() -> str:
    return "\n".join([NAME, ROLE, TAGLINE, EMAIL, " · ".join(label for label, _ in SITES)])


# --- preview page -----------------------------------------------------------------------

STEPS = [
    ("Apple Mail (Mac)",
     "Mail → Configurări → Semnături → alege contul → + → lipește (⌘V) în câmpul din dreapta. "
     "Debifează „Always match my default message font”, altfel Mail schimbă fontul."),
    ("Gmail",
     "⚙ → Vezi toate setările → General → Semnătură → Creează → lipește → "
     "„Salvează modificările”, jos de tot."),
    ("Outlook (nou, web, Mac)",
     "Setări → Conturi → Semnături → Semnătură nouă → lipește → Salvează. Alege-o apoi ca "
     "implicită pentru mesajele noi și pentru răspunsuri."),
    ("Outlook clasic (Windows)",
     "Fișier → Opțiuni → E-mail → Semnături → Nou → lipește → OK."),
    ("Thunderbird",
     "Setări cont → Text semnătură → bifează „Utilizează HTML” → lipește codul HTML."),
    ("Webmail (Roundcube și altele)",
     "Setări → Identități → Semnătură → treci editorul pe HTML / sursă (<>) → lipește codul HTML."),
    ("iPhone (Mail)",
     "Deschide pagina asta în Safari pe iPhone (logistiq.ro/email/signature) → „Copiază "
     "semnătura” → Configurări → Apps → Mail → Semnătură → lipește. Dacă formatarea dispare, "
     "scutură telefonul și alege Anulează (Undo)."),
]

PANELS = [("Mod luminos", "#ffffff", "#222222"), ("Mod întunecat", "#1e1e1e", "#f2f2f2")]


def preview(sig: str) -> str:
    panels = "".join(
        f'<section class="panel" style="background:{bg};color:{fg};"><p class="tag">{title}</p>'
        f'<div class="mail"><p>Cu stimă,</p>{sig}</div></section>'
        for title, bg, fg in PANELS)
    steps = "".join(f"<li><b>{app}:</b> {how.replace('<', '&lt;').replace('>', '&gt;')}</li>"
                    for app, how in STEPS)
    code = sig.replace("&", "&amp;").replace("<", "&lt;")
    return f"""<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Semnătură e-mail Logistiq</title>
<style>
  body {{ margin: 0; background: #e5e7eb; color: #111827; font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
  main {{ max-width: 720px; margin: 0 auto; padding: 28px 16px 48px; }}
  h1 {{ margin: 0 0 4px; font-size: 22px; }}
  .lead {{ margin: 0 0 18px; color: #4b5563; }}
  .bar {{ display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 0 0 18px; }}
  button {{ font-family: inherit; font-size: 14px; font-weight: 600; line-height: 1; padding: 11px 16px; border-radius: 10px; border: 1px solid #2563eb; cursor: pointer; }}
  .primary {{ background: #2563eb; color: #fff; }}
  .ghost {{ background: transparent; color: #1d4ed8; }}
  #status {{ color: #047857; font-weight: 600; }}
  .panel {{ border-radius: 14px; padding: 18px 24px 24px; margin: 0 0 14px; overflow-x: auto; }}
  .tag {{ margin: 0 0 12px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .55; }}
  .mail p {{ margin: 0 0 16px; font-size: 14px; }}
  h2 {{ margin: 28px 0 8px; font-size: 17px; }}
  ol {{ padding-left: 20px; }} li {{ margin: 0 0 8px; }}
  details {{ margin-top: 18px; }}
  textarea {{ width: 100%; height: 160px; box-sizing: border-box; font: 12px/1.45 ui-monospace, Menlo, Consolas, monospace; }}
  .note {{ color: #4b5563; font-size: 13px; }}
</style>
</head>
<body>
<main>
  <h1>Semnătura de e-mail</h1>
  <p class="lead">{esc(NAME)} · Logistiq · QRGo Driver. Arată la fel în modul luminos și în cel întunecat.</p>
  <div class="bar">
    <button class="primary" onclick="copySig('rich')">Copiază semnătura</button>
    <button class="ghost" onclick="copySig('code')">Copiază codul HTML</button>
    <span id="status" role="status"></span>
  </div>
  {panels}
  <h2>Cum o pui în programul de mail</h2>
  <p class="note">„Copiază semnătura” pentru programele în care lipești text formatat; „Copiază codul HTML” pentru cele cu editor HTML.</p>
  <ol>{steps}</ol>
  <details><summary>Codul HTML</summary><textarea readonly>{code}</textarea></details>
  <p class="note">Imaginile vin de pe logistiq.ro/email/signature/. Nu le muta și nu le redenumi:
  e-mailurile deja trimise le încarcă de acolo.</p>
</main>
<script>
  const SIG = {json.dumps(sig)};
  const PLAIN = {json.dumps(plain_text(), ensure_ascii=False)};
  function copySig(kind) {{
    const status = document.getElementById("status");
    const onCopy = (e) => {{
      e.preventDefault();
      if (kind === "rich") {{ e.clipboardData.setData("text/html", SIG); e.clipboardData.setData("text/plain", PLAIN); }}
      else {{ e.clipboardData.setData("text/plain", SIG); }}
    }};
    document.addEventListener("copy", onCopy);
    let ok = false;
    try {{ ok = document.execCommand("copy"); }} catch (_) {{}}
    document.removeEventListener("copy", onCopy);
    status.textContent = ok
      ? (kind === "rich" ? "Copiată. Lipește-o (⌘V / Ctrl+V) în setările de semnătură." : "Codul HTML e copiat.")
      : "Nu s-a putut copia: deschide „Codul HTML” de mai jos și copiază-l de mână.";
  }}
  // Phone mail apps shrink a signature wider than the screen; the preview does the same.
  function fit() {{
    document.querySelectorAll(".mail").forEach((m) => {{
      m.style.zoom = 1;
      const w = m.querySelector("table").getBoundingClientRect().width;
      m.style.zoom = w > m.clientWidth ? (m.clientWidth / w).toFixed(3) : 1;
    }});
  }}
  addEventListener("load", fit);
  addEventListener("resize", fit);
</script>
</body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--local-preview", type=Path,
                        help="also write a preview that loads the freshly built images from disk")
    args = parser.parse_args()

    IMAGES.mkdir(parents=True, exist_ok=True)
    logo_w, logo_h = build_logo(IMAGES)
    build_app_icon(IMAGES)
    build_divider(IMAGES)

    sig = signature(IMG_BASE, logo_w, logo_h)
    (HERE / "signature.html").write_text(sig + "\n")
    (IMAGES / "index.html").write_text(preview(sig))
    print(f"logo {logo_w}x{logo_h}px, signature {len(sig)} characters (Gmail allows 10,000)")

    if args.local_preview:
        args.local_preview.mkdir(parents=True, exist_ok=True)
        for f in IMAGES.glob("*.png"):
            shutil.copy(f, args.local_preview / f.name)
        (args.local_preview / "preview.html").write_text(preview(signature(".", logo_w, logo_h)))
        print(f"local preview: {args.local_preview / 'preview.html'}")


if __name__ == "__main__":
    main()
