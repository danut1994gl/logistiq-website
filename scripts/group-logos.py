"""Builds the footer's "Logistiq Group" logos from the brand's own artwork.

    uv run --with skia-pathops --with fonttools python scripts/group-logos.py

Writes public/logistiq-ro.svg, logistiq-be.svg, logistiq-cloud.svg and qrgo.svg,
all in one frame height so the footer can stack them at the same size.

Sources (both exported from Canva, text already turned into outlines):
- public/logistiq-banner-dark.svg: the X mark + "Logistiq . cloud".
- scripts/og/qrgo-logo.svg: the QRGO icon with "QRGO" below it.

The wordmark's typeface is not a free font, and the export only holds the letters of
"Logistiq . cloud". So ".ro" and ".be" reuse those letters, and the three missing ones
are rebuilt from them:
- b: the d, mirrored.
- r: the q mirrored into a p and cut at the baseline: the stem plus the left half of
  the bowl's top arc, ended by a vertical cut (the t ends the same way).
- e: the o with a bar slightly above the middle and the right side cut open below the
  bar; both cuts are horizontal, like the c's terminals.
Swap the output for official exports from Canva whenever they exist.
"""

import re
from pathlib import Path

import pathops
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parent.parent
BANNER = (ROOT / "public/logistiq-banner-dark.svg").read_text()
QRGO = (ROOT / "scripts/og/qrgo-logo.svg").read_text()
ORANGE = "#fa7315"


def num(v: float) -> str:
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def short(svg: str) -> str:
    """Two decimals in outlines and translations: plenty for a logo drawn ~24px high."""
    def rounded(m: re.Match) -> str:
        return re.sub(r"-?\d+\.\d+", lambda n: num(float(n.group())), m.group())
    return re.sub(r'd="[^"]*"|translate\([^)]*\)', rounded, svg)


def path(d: str) -> pathops.Path:
    p = pathops.Path()
    parse_path(d, p.getPen())
    return p


def moved(p: pathops.Path, a, b, c, d, e, f) -> pathops.Path:
    out = pathops.Path()
    p.draw(TransformPen(out.getPen(), (a, b, c, d, e, f)))
    return out


def rect(x0, y0, x1, y1) -> pathops.Path:
    p = pathops.Path()
    pen = p.getPen()
    pen.moveTo((x0, y0))
    pen.lineTo((x1, y0))
    pen.lineTo((x1, y1))
    pen.lineTo((x0, y1))
    pen.closePath()
    return p


def union(*ps):
    out = ps[0]
    for p in ps[1:]:
        out = pathops.op(out, p, pathops.PathOp.UNION)
    return out


def both(a, b):
    return pathops.op(a, b, pathops.PathOp.INTERSECTION)


def minus(a, b):
    return pathops.op(a, b, pathops.PathOp.DIFFERENCE)


def svg_d(p: pathops.Path) -> str:
    pen = SVGPathPen(None, ntos=num)
    p.draw(pen)
    return pen.getCommands()


def drawn_bounds(fragment: str, svg: str):
    """Bounds of the shapes in a fragment, each clipped by its clip-path (empty ones skipped)."""
    clips = dict(re.findall(r'<clipPath id="([^"]+)"><path d="([^"]+)"', svg))
    box = None
    for clip, d in re.findall(r'(?:<g clip-path="url\(#([^)]+)\)">)?<path fill="#[0-9a-fA-F]+" d="([^"]+)"', fragment):
        shape = both(path(d), path(clips[clip])) if clip else path(d)
        if shape.area == 0:
            continue
        b = shape.bounds
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box


# The banner's letters, in order: one <g> per glyph, placed by translate(x, baseline).
GLYPH = re.compile(
    r'<g fill="([^"]+)" fill-opacity="1"><g transform="translate\(([\d.]+), ([\d.]+)\)">'
    r'<g(?:/>|><path d="([^"]*)"/></g>)'
)
glyphs = [(ch, float(x), d) for ch, (_, x, _, d) in zip("Logistiq . cloud", GLYPH.findall(BANNER))]
assert [ch for ch, _, _ in glyphs] == list("Logistiq . cloud"), "the banner's letters changed"
BASELINE = float(GLYPH.search(BANNER).group(3))
at = {ch: (x, path(d) if d else None) for ch, x, d in reversed(glyphs)}  # first occurrence wins

# Glyph-local coordinates: y grows downwards, baseline at 0, x-height at -70.44.
STEM_LEFT, STEM_RIGHT = at["i"][1].bounds[0], at["i"][1].bounds[2]
o, d, q = at["o"][1], at["d"][1], at["q"][1]

b = moved(d, -1, 0, 0, 1, STEM_LEFT + d.bounds[2], 0)
p_shape = both(moved(q, -1, 0, 0, 1, STEM_LEFT + q.bounds[2], 0), rect(-50, -300, 300, 0))
r = both(p_shape, union(rect(-50, -300, STEM_RIGHT + 0.01, 1), rect(-50, -300, 54, -36)))
e = minus(union(o, rect(20, -48, 66, -33)), rect(42.59, -33, 300, -19))

DOT_X, SUFFIX_X = at["."][0], at["c"][0]  # ". " then the suffix, as in the banner
SUFFIXES = {
    "logistiq-ro.svg": [(r, 0), (o, r.bounds[2] - 1.5)],
    "logistiq-be.svg": [(b, 0), (e, b.bounds[2] - 2.87)],
    "logistiq-cloud.svg": [(path(d), x - SUFFIX_X) for _, x, d in glyphs[11:]],
}

defs = BANNER[BANNER.index("<defs>") + 6 : BANNER.index("</defs>")]
mark = BANNER[BANNER.index("</defs>") + 7 : BANNER.index('<g fill="url(#logistiqGradient)"')]
word = BANNER[BANNER.index('<g fill="url(#logistiqGradient)"') : BANNER.index('<g fill="#373636"')]

# One frame for every logo, fitted to the X mark (it is taller than the letters).
MARK_LEFT, MARK_TOP, MARK_RIGHT, MARK_BOTTOM = drawn_bounds(mark, BANNER)
X0, Y0, Y1 = MARK_LEFT - 1.4, MARK_TOP - 1, MARK_BOTTOM + 1
WORD_LEFT = at["L"][0] + at["L"][1].bounds[0]
CAP_HEIGHT = -at["L"][1].bounds[1]


def frame(right: float, body: str) -> str:
    width = right + 1.5 - X0
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(X0)} {num(Y0)} {num(width)} {num(Y1 - Y0)}">'
        f"{body}</svg>"
    )


def write(name: str, svg: str) -> None:
    svg = short(svg)
    (ROOT / "public" / name).write_text(svg)
    w, h = (float(v) for v in re.search(r'viewBox="[^ ]+ [^ ]+ ([^ ]+) ([^"]+)"', svg).groups())
    print(f"{name}: {len(svg)} bytes, {round(24 * w / h)}x24 at h-6")


for name, suffix in SUFFIXES.items():
    parts = [(at["."][1], DOT_X)] + [(p, SUFFIX_X + x) for p, x in suffix]
    letters = "".join(f'<path transform="translate({num(x)} {num(BASELINE)})" d="{svg_d(p)}"/>' for p, x in parts)
    right = max(x + p.bounds[2] for p, x in parts)
    write(name, frame(right, f'<defs>{defs}</defs>{mark}{word}<g fill="{ORANGE}">{letters}</g>'))

# QRGO: the icon beside the letters (the export stacks them), sized like the Logistiq logos.
qdefs = QRGO[QRGO.index("<defs>") + 6 : QRGO.index("</defs>")]
icon = QRGO[QRGO.index('<g clip-path="url(#') : QRGO.index("</svg>")]
qletters = re.findall(r'<g transform="translate\(([\d.]+), ([\d.]+)\)"><g><path d="([^"]+)"', QRGO)
assert len(qletters) == 4, "expected the four letters of QRGO"
qfill = re.search(r'<g fill="(#[0-9a-fA-F]+)" fill-opacity="1"><g transform', QRGO).group(1)
Q, R, O = path(qletters[0][2]), path(qletters[1][2]), path(qletters[3][2])
icon_box = drawn_bounds(icon, QRGO)
# The icon is a dense shape, so it is drawn a bit smaller than the open X mark.
icon_scale = 0.86 * (MARK_BOTTOM - MARK_TOP) / (icon_box[3] - icon_box[1])
icon_x = MARK_LEFT - icon_box[0] * icon_scale
icon_y = (MARK_TOP + MARK_BOTTOM) / 2 - (icon_box[1] + icon_box[3]) / 2 * icon_scale
icon_right = MARK_LEFT + (icon_box[2] - icon_box[0]) * icon_scale
text_scale = CAP_HEIGHT / -R.bounds[1]  # the R's cap height -> the L's
text_x = icon_right + (WORD_LEFT - MARK_RIGHT) - (float(qletters[0][0]) + Q.bounds[0]) * text_scale
text_y = BASELINE - float(qletters[0][1]) * text_scale
letters = "".join(f'<path transform="translate({x} {y})" d="{d}"/>' for x, y, d in qletters)
right = text_x + (float(qletters[3][0]) + O.bounds[2]) * text_scale
write(
    "qrgo.svg",
    frame(
        right,
        f"<defs>{qdefs}</defs>"
        f'<g transform="matrix({icon_scale:.5f} 0 0 {icon_scale:.5f} {icon_x:.3f} {icon_y:.3f})">{icon}</g>'
        f'<g fill="{qfill}" transform="matrix({text_scale:.5f} 0 0 {text_scale:.5f} {text_x:.3f} {text_y:.3f})">'
        f"{letters}</g>",
    ),
)
