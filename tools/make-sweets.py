"""Generate flat-lay SVG illustrations of sweets for the Shahd site.
Usage: python3 make_sweets.py <out_dir>
"""
import math, random, sys, os

W, H = 600, 800
CX, CY = 300, 430

PALETTES = {
    'pink':   ('#ffe6ec', '#ffd3de', '#ffb9cb'),
    'mint':   ('#e2f4e8', '#cdebd7', '#a9dbbb'),
    'peach':  ('#ffeedd', '#ffdcc0', '#ffc79c'),
    'butter': ('#fff6d6', '#ffeaa8', '#ffdc7a'),
    'lilac':  ('#efe9ff', '#e0d6ff', '#c8b8ff'),
    'sky':    ('#e3f2ff', '#cfe6fb', '#a9d2f5'),
}

R = random.Random()


def f(v):
    return f'{v:.1f}'


def circle(x, y, r, fill, extra=''):
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" {extra}/>'


def ellipse(x, y, rx, ry, fill, rot=0, extra=''):
    return f'<ellipse cx="0" cy="0" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}" transform="translate({f(x)} {f(y)}) rotate({f(rot)})" {extra}/>'


def rand_in_circle(r):
    a = R.random() * math.tau
    d = r * math.sqrt(R.random())
    return d * math.cos(a), d * math.sin(a)


# ---------------------------------------------------------------- garnish
def pistachio_crumbs(cx, cy, r, n, size=(3, 6)):
    cols = ['#8cbf4d', '#a6d06a', '#6e9e3a', '#b9dc7c']
    out = []
    for _ in range(n):
        x, y = rand_in_circle(r)
        out.append(circle(cx + x, cy + y, R.uniform(*size), R.choice(cols)))
    return ''.join(out)


def sugar(cx, cy, r, n, col='#ffffff', op=.85):
    return ''.join(circle(cx + x, cy + y, R.uniform(.8, 2.2), col, f'opacity="{op}"')
                   for x, y in (rand_in_circle(r) for _ in range(n)))


def almond(x, y, rot, s=1):
    return (ellipse(x, y, 13 * s, 7.5 * s, '#fff1d6', rot, 'stroke="#e2c08d" stroke-width="1.6"') +
            ellipse(x - 2 * s, y - 2 * s, 6 * s, 2.4 * s, '#ffffff', rot, 'opacity=".7"'))


def pistachio_nut(x, y, rot, s=1):
    return (f'<g transform="translate({f(x)} {f(y)}) rotate({f(rot)}) scale({s})">'
            '<ellipse rx="16" ry="11" fill="#d8c3a0"/><ellipse rx="12" ry="8" fill="#9ccc5a"/>'
            '<path d="M-10 0 Q0 -5 10 0" stroke="#6e9e3a" stroke-width="2" fill="none"/></g>')


def mint_leaf(x, y, rot, s=1):
    return (f'<g transform="translate({f(x)} {f(y)}) rotate({f(rot)}) scale({s})">'
            '<path d="M0 0 C 18 -22 52 -20 66 0 C 52 20 18 22 0 0Z" fill="#6cc08a"/>'
            '<path d="M4 0 L60 0" stroke="#4e9e6a" stroke-width="2"/></g>')


def sparkle(x, y, s, col):
    return (f'<path transform="translate({f(x)} {f(y)}) scale({s})" fill="{col}" '
            'd="M0 -12 C1.5 -3 3 -1.5 12 0 C3 1.5 1.5 3 0 12 C-1.5 3 -3 1.5 -12 0 C-3 -1.5 -1.5 -3 0 -12Z"/>')


# ---------------------------------------------------------------- vessels
def tray_round(r):
    return (circle(CX, CY, r, '#e6e0d9') + circle(CX, CY, r - 6, '#f5f2ee') +
            circle(CX, CY, r - 15, '#d8d0c6') +
            f'<path d="M{f(CX - r * .7)} {f(CY - r * .7)} A {r} {r} 0 0 1 {f(CX + r * .2)} {f(CY - r * .98)}" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>')


def plate(r, rim='#ffffff', well='#fffaf6'):
    return (circle(CX, CY, r, rim, 'stroke="#f1e2da" stroke-width="3"') +
            circle(CX, CY, r * .8, well, 'stroke="#f3e6de" stroke-width="2"'))


def shadow(shape):
    return f'<g filter="url(#sh)" opacity=".55">{shape}</g>'


# ---------------------------------------------------------------- dishes
def strands(cx, cy, r, n, cols, width=3.2, length=(14, 30)):
    out = []
    for _ in range(n):
        x, y = rand_in_circle(r)
        a = R.random() * math.tau
        L = R.uniform(*length)
        x2, y2 = x + L * math.cos(a), y + L * math.sin(a)
        mx, my = (x + x2) / 2 + R.uniform(-8, 8), (y + y2) / 2 + R.uniform(-8, 8)
        out.append(f'<path d="M{f(cx + x)} {f(cy + y)} Q{f(cx + mx)} {f(cy + my)} {f(cx + x2)} {f(cy + y2)}" '
                   f'stroke="{R.choice(cols)}" stroke-width="{width}" fill="none" stroke-linecap="round"/>')
    return ''.join(out)


def kunafa(kind):
    r = 188
    s = shadow(circle(CX, CY + 16, 214, '#a8735a'))
    s += tray_round(214)
    s += f'<clipPath id="kc"><circle cx="{CX}" cy="{CY}" r="{r}"/></clipPath>'
    s += circle(CX, CY, r, '#e8962f')
    s += f'<g clip-path="url(#kc)">' + strands(CX, CY, r + 10, 620, ['#f5b350', '#d9822a', '#f7c66d', '#c46e1f', '#ffd27f']) + '</g>'
    for i in range(8):
        a = i * math.tau / 8 + .2
        s += f'<line x1="{CX}" y1="{CY}" x2="{f(CX + r * math.cos(a))}" y2="{f(CY + r * math.sin(a))}" stroke="#b5611a" stroke-width="3" opacity=".45"/>'
    s += f'<ellipse cx="{CX - 60}" cy="{CY - 80}" rx="90" ry="40" fill="#fff" opacity=".13" transform="rotate(-30 {CX - 60} {CY - 80})"/>'
    if kind == 'cream':
        s += f'<path d="M{CX - 78} {CY} C {CX - 80} {CY - 60}, {CX - 20} {CY - 86}, {CX + 30} {CY - 72} C {CX + 90} {CY - 56}, {CX + 92} {CY + 20}, {CX + 60} {CY + 58} C {CX + 20} {CY + 92}, {CX - 70} {CY + 70}, {CX - 78} {CY}Z" fill="#fffaf0" stroke="#f1e2c4" stroke-width="3"/>'
        s += pistachio_crumbs(CX, CY, 60, 60) + pistachio_crumbs(CX, CY, r - 10, 40, (2.5, 4.5))
    elif kind == 'mango':
        s += circle(CX, CY, 92, '#fffaf0', 'stroke="#f1e2c4" stroke-width="3"')
        for _ in range(16):
            x, y = rand_in_circle(70)
            s += f'<rect x="-12" y="-12" width="24" height="24" rx="5" fill="{R.choice(["#ffc233", "#ffb000", "#ffd45c"])}" transform="translate({f(CX + x)} {f(CY + y)}) rotate({R.randint(0, 90)})"/>'
        s += mint_leaf(CX + 20, CY - 10, -40, .7)
    elif kind == 'nutella':
        for i in range(7):
            y = CY - 150 + i * 50
            s += f'<path d="M{CX - 170} {y} q 40 -20 80 0 t 80 0 t 80 0 t 80 0" stroke="#5a3220" stroke-width="9" fill="none" stroke-linecap="round" clip-path="url(#kc)"/>'
        s += circle(CX, CY, 70, '#6b3a22') + circle(CX - 20, CY - 22, 18, '#8a5233', 'opacity=".7"')
        for _ in range(9):
            x, y = rand_in_circle(150)
            s += ellipse(CX + x, CY + y, 10, 8, '#b07a45', R.randint(0, 180), 'stroke="#8a5a2e" stroke-width="1.5"')
    elif kind == 'pistachio':
        s += pistachio_crumbs(CX, CY, 130, 420, (3.5, 7))
        s += circle(CX, CY, 34, '#fffaf0') + pistachio_crumbs(CX, CY, 20, 12)
    return s


def qatayef(kind):
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + plate(214)
    pts = [(0, 0, 0)] + [(130 * math.cos(i * math.tau / 6), 130 * math.sin(i * math.tau / 6), i * 60 + 90) for i in range(6)]
    for x, y, rot in pts:
        g = f'<g transform="translate({f(CX + x)} {f(CY + y)}) rotate({rot})">'
        g += '<path d="M-58 8 A 58 58 0 0 1 58 8 Z" fill="#e4ad68" stroke="#c98a43" stroke-width="2.5"/>'
        g += '<path d="M-50 0 A 50 50 0 0 1 50 0" stroke="#f3cb8f" stroke-width="5" fill="none" opacity=".7"/>'
        for k in range(-5, 6):
            a = math.pi + (k + 5) / 10 * math.pi
            g += f'<line x1="{f(56 * math.cos(a))}" y1="{f(8 + 56 * math.sin(a))}" x2="{f(48 * math.cos(a))}" y2="{f(8 + 48 * math.sin(a))}" stroke="#c98a43" stroke-width="2"/>'
        if kind == 'cream':
            g += '<rect x="-56" y="2" width="112" height="16" rx="8" fill="#fffaf0" stroke="#efdcb9" stroke-width="2"/>'
            g += ''.join(circle(R.uniform(-48, 48), R.uniform(6, 16), R.uniform(2.5, 4.5), R.choice(['#8cbf4d', '#a6d06a'])) for _ in range(12))
        else:
            g += ''.join(ellipse(R.uniform(-46, 46), R.uniform(8, 16), R.uniform(5, 8), R.uniform(3, 5), R.choice(['#b07a45', '#d6a868', '#8a5a2e']), R.randint(0, 180)) for _ in range(10))
        s += g + '</g>'
    s += f'<path d="M{CX - 150} {CY - 170} q 60 30 120 0 t 120 0" stroke="#f2a93b" stroke-width="5" fill="none" opacity=".6"/>'
    return s


def lattice(cx, cy, step, sx=1.35, n=7):
    """centers of diamond lattice + line endpoints."""
    c = .7071
    pts = []
    for i in range(-n, n):
        for j in range(-n, n):
            u, v = (i + .5) * step, (j + .5) * step
            pts.append((cx + (u - v) * c * sx, cy + (u + v) * c))
    lines = []
    L = step * n
    for k in range(-n, n + 1):
        u = k * step
        for (a, b) in (((u, -L), (u, L)), ((-L, u), (L, u))):
            lines.append(((cx + (a[0] - a[1]) * c * sx, cy + (a[0] + a[1]) * c), (cx + (b[0] - b[1]) * c * sx, cy + (b[0] + b[1]) * c)))
    return pts, lines


def diamond(x, y, step, sx, shrink=.86):
    h = step * .7071 * shrink
    return f'{f(x)},{f(y - h)} {f(x + h * sx)},{f(y)} {f(x)},{f(y + h)} {f(x - h * sx)},{f(y)}'


def basbousa(kind):
    w, h = 440, 360
    x0, y0 = CX - w / 2, CY - h / 2
    base = {'plain': '#e9ae55', 'cream': '#e9ae55', 'nutella': '#e2a34e', 'harissa': '#d38b42'}[kind]
    s = shadow(f'<rect x="{x0 - 16}" y="{y0}" width="{w + 32}" height="{h + 32}" rx="26" fill="#a8735a"/>')
    s += f'<g transform="rotate(-5 {CX} {CY})">'
    s += f'<rect x="{x0 - 16}" y="{y0 - 16}" width="{w + 32}" height="{h + 32}" rx="26" fill="#e6e0d9"/>'
    s += f'<rect x="{x0 - 8}" y="{y0 - 8}" width="{w + 16}" height="{h + 16}" rx="20" fill="#d8d0c6"/>'
    s += f'<clipPath id="bc"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="14"/></clipPath>'
    s += f'<g clip-path="url(#bc)"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="{base}"/>'
    s += ''.join(circle(x0 + R.uniform(0, w), y0 + R.uniform(0, h), R.uniform(1, 2.6), R.choice(['#f6c877', '#cf8e3c', '#f9d48f']), 'opacity=".8"') for _ in range(700))
    if kind == 'cream':
        s += f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="#fff4dd" opacity=".9"/>'
        s += ''.join(circle(x0 + R.uniform(0, w), y0 + R.uniform(0, h), R.uniform(1.5, 3.5), '#e9ae55', 'opacity=".55"') for _ in range(260))
    if kind == 'nutella':
        for i in range(9):
            y = y0 + 20 + i * 42
            s += f'<path d="M{x0 - 20} {y} q 30 -14 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" stroke="#5a3220" stroke-width="7" fill="none" stroke-linecap="round"/>'
    step = 62
    pts, lines = lattice(CX, CY, step)
    for a, b in lines:
        s += f'<line x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}" stroke="#a9622a" stroke-width="3" opacity=".55"/>'
    for x, y in pts:
        if x0 + 10 < x < x0 + w - 10 and y0 + 10 < y < y0 + h - 10:
            if kind in ('plain', 'harissa'):
                s += almond(x, y, R.uniform(-30, 30), .95 if kind == 'plain' else .8)
            elif kind == 'cream':
                s += pistachio_crumbs(x, y, 9, 7, (2.5, 4))
            else:
                s += ellipse(x, y, 9, 8, '#b07a45', R.randint(0, 180), 'stroke="#7a4a24" stroke-width="1.5"')
    s += f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="url(#gloss)"/></g></g>'
    return s


def baklava(kind='baklava'):
    r = 186
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + tray_round(214)
    s += f'<clipPath id="kc"><circle cx="{CX}" cy="{CY}" r="{r}"/></clipPath>' + circle(CX, CY, r, '#b8732a')
    s += '<g clip-path="url(#kc)">'
    step, sx = 70, 1.25
    pts, _ = lattice(CX, CY, step, sx)
    for x, y in pts:
        if math.hypot(x - CX, y - CY) > r + 40:
            continue
        s += f'<polygon points="{diamond(x, y, step, sx)}" fill="url(#gold)" stroke="#c98232" stroke-width="2"/>'
        s += f'<polygon points="{diamond(x, y, step, sx, .62)}" fill="none" stroke="#f9d690" stroke-width="2" opacity=".8"/>'
        s += pistachio_crumbs(x, y, 11, 9, (2.6, 4.4))
    s += '</g>'
    return s


def nest():
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + plate(214)
    pts = [(0, 0)] + [(132 * math.cos(i * math.tau / 7), 132 * math.sin(i * math.tau / 7)) for i in range(7)]
    for x, y in pts:
        x, y = CX + x, CY + y
        s += circle(x, y, 52, '#cf8a36')
        for k in range(46):
            a = k / 46 * math.tau
            rr = R.uniform(30, 50)
            s += f'<path d="M{f(x + rr * math.cos(a))} {f(y + rr * math.sin(a))} A {f(rr)} {f(rr)} 0 0 1 {f(x + rr * math.cos(a + .6))} {f(y + rr * math.sin(a + .6))}" stroke="{R.choice(["#f2b95a", "#e09a3e", "#f7cf7f"])}" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
        s += circle(x, y, 24, '#6e9e3a') + pistachio_crumbs(x, y, 20, 22, (3, 5.5))
    return s


def goulash():
    w, h = 430, 350
    x0, y0 = CX - w / 2, CY - h / 2
    s = shadow(f'<rect x="{x0 - 16}" y="{y0}" width="{w + 32}" height="{h + 32}" rx="26" fill="#a8735a"/>')
    s += f'<g transform="rotate(4 {CX} {CY})"><rect x="{x0 - 16}" y="{y0 - 16}" width="{w + 32}" height="{h + 32}" rx="26" fill="#e6e0d9"/>'
    s += f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="12" fill="#b8732a"/>'
    cs = 86
    for i in range(5):
        for j in range(4):
            x, y = x0 + i * cs + 4, y0 + j * (h / 4) + 4
            s += f'<rect x="{f(x)}" y="{f(y)}" width="{cs - 8}" height="{f(h / 4 - 8)}" rx="6" fill="url(#gold)"/>'
            for k in range(5):
                yy = y + 10 + k * 15
                s += f'<path d="M{f(x + 6)} {f(yy)} q 12 -5 24 0 t 24 0 t 24 0" stroke="#fbe0a6" stroke-width="2.4" fill="none" opacity=".9"/>'
            s += ellipse(x + cs / 2 - 4, y + 40, 7, 5, '#8a5a2e', R.randint(0, 90), 'opacity=".55"')
    s += '</g>'
    return s


def mini_diamond(x, y, rot):
    return (f'<g transform="translate({f(x)} {f(y)}) rotate({rot})"><polygon points="0,-26 18,0 0,26 -18,0" fill="url(#gold)" stroke="#c98232" stroke-width="2"/>'
            + pistachio_crumbs(0, 0, 6, 5, (2, 3.4)) + '</g>')


def mini_cookie(x, y, r):
    s = circle(x, y, r, '#f2d29a', 'stroke="#d9b06c" stroke-width="2"')
    for k in range(12):
        a = k / 12 * math.tau
        s += f'<line x1="{f(x + r * .5 * math.cos(a))}" y1="{f(y + r * .5 * math.sin(a))}" x2="{f(x + r * .85 * math.cos(a))}" y2="{f(y + r * .85 * math.sin(a))}" stroke="#d9ac68" stroke-width="2"/>'
    return s + sugar(x, y, r * .9, 22)


def assorted():
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + tray_round(214)
    for i in range(16):
        a = i / 16 * math.tau
        x, y = CX + 160 * math.cos(a), CY + 160 * math.sin(a)
        s += mini_diamond(x, y, math.degrees(a) + 90) if i % 2 == 0 else circle(x, y, 22, '#cf8a36') + pistachio_crumbs(x, y, 12, 10, (2.4, 4))
    for i in range(9):
        a = i / 9 * math.tau + .3
        s += mini_cookie(CX + 92 * math.cos(a), CY + 92 * math.sin(a), 27)
    s += circle(CX, CY, 46, '#e9ae55') + ''.join(almond(CX + x, CY + y, R.randint(-40, 40), .8) for x, y in [(-16, -14), (16, -10), (0, 16)])
    return s


def kahk(kind):
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + plate(214)
    if kind == 'kahk':
        pts = [(0, 0)] + [(122 * math.cos(i * math.tau / 7), 122 * math.sin(i * math.tau / 7)) for i in range(7)]
        for x, y in pts:
            s += mini_cookie(CX + x, CY + y, 54)
            s += circle(CX + x, CY + y, 12, '#e8c180') + sugar(CX + x, CY + y, 50, 40)
    elif kind == 'maamoul':
        pts = [(0, 0)] + [(122 * math.cos(i * math.tau / 7 + .2), 122 * math.sin(i * math.tau / 7 + .2)) for i in range(7)]
        for x, y in pts:
            x, y = CX + x, CY + y
            s += circle(x, y, 52, 'url(#dome)', 'stroke="#d6aa62" stroke-width="2"')
            s += f'<clipPath id="m{int(x)}{int(y)}"><circle cx="{f(x)}" cy="{f(y)}" r="44"/></clipPath><g clip-path="url(#m{int(x)}{int(y)})">'
            for k in range(-6, 7):
                s += f'<line x1="{f(x - 60)}" y1="{f(y + k * 13 - 30)}" x2="{f(x + 60)}" y2="{f(y + k * 13 + 30)}" stroke="#d3a35c" stroke-width="2.2"/>'
                s += f'<line x1="{f(x - 60)}" y1="{f(y + k * 13 + 30)}" x2="{f(x + 60)}" y2="{f(y + k * 13 - 30)}" stroke="#d3a35c" stroke-width="2.2"/>'
            s += '</g>' + sugar(x, y, 48, 60)
    elif kind == 'ghorayeba':
        pts = [(0, 0)] + [(84 * math.cos(i * math.tau / 6), 84 * math.sin(i * math.tau / 6)) for i in range(6)] + \
              [(160 * math.cos(i * math.tau / 11 + .15), 160 * math.sin(i * math.tau / 11 + .15)) for i in range(11)]
        for x, y in pts:
            x, y = CX + x, CY + y
            s += circle(x, y + 3, 36, '#efdcb8') + circle(x, y, 36, '#fbf2df', 'stroke="#eedbb6" stroke-width="2"')
            s += f'<path d="M{f(x - 18)} {f(y - 14)} A 26 26 0 0 1 {f(x + 16)} {f(y - 20)}" stroke="#fff" stroke-width="4" fill="none" opacity=".9"/>'
            s += pistachio_nut(x, y + 2, R.randint(0, 180), .5)
    elif kind == 'biscuits':
        for row in range(5):
            for col in range(3):
                x = CX - 120 + col * 120 + (row % 2) * 20
                y = CY - 150 + row * 74
                if math.hypot(x - CX, y - CY) > 150:
                    continue
                g = f'<g transform="translate({x} {y}) rotate(-18)"><rect x="-58" y="-20" width="116" height="40" rx="20" fill="#eabf7a" stroke="#cf9a4c" stroke-width="2"/>'
                for k in range(-4, 5):
                    g += f'<line x1="{k * 12}" y1="-15" x2="{k * 12}" y2="15" stroke="#d3a35c" stroke-width="2.4"/>'
                s += g + '<rect x="-50" y="-16" width="100" height="7" rx="3" fill="#fff" opacity=".35"/></g>'
    return s


def rosette(x, y, r, col, dark):
    return (circle(x, y, r, col) +
            f'<path d="M{f(x)} {f(y)} m {f(-r * .55)} 0 a {f(r * .55)} {f(r * .55)} 0 1 1 {f(r * .9)} {f(r * .3)} a {f(r * .3)} {f(r * .3)} 0 1 1 {f(-r * .4)} {f(-r * .4)}" stroke="{dark}" stroke-width="2.2" fill="none"/>')


def strawberry(x, y, rot, s=1):
    g = f'<g transform="translate({f(x)} {f(y)}) rotate({rot}) scale({s})"><path d="M0 26 C -26 10 -26 -18 -10 -20 C -4 -21 4 -21 10 -20 C 26 -18 26 10 0 26Z" fill="#ef4f5e"/>'
    g += ''.join(ellipse(R.uniform(-12, 12), R.uniform(-10, 14), 1.4, 2.2, '#ffd86b') for _ in range(9))
    g += '<path d="M0 -20 L -12 -28 L -4 -22 L 0 -32 L 4 -22 L 12 -28Z" fill="#5fae5a"/></g>'
    return g


def cake(kind):
    frost, ros, dark = {'strawberry': ('#ffc6d4', '#ffa9bf', '#f07f9c'),
                        'chocolate': ('#7a432a', '#93532f', '#5a2f1c'),
                        'cheesecake': ('#fff1d2', '#f7dda8', '#e2bf7d')}[kind]
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + plate(214)
    s += circle(CX, CY, 180, dark) + circle(CX, CY, 174, frost)
    for i in range(22):
        a = i / 22 * math.tau
        s += rosette(CX + 154 * math.cos(a), CY + 154 * math.sin(a), 15, ros, dark)
    if kind == 'strawberry':
        for i, (x, y) in enumerate([(0, 0), (-50, -36), (48, -30), (-38, 46), (44, 44), (0, -70), (0, 74)]):
            s += strawberry(CX + x, CY + y, R.randint(-40, 40), .95)
        s += mint_leaf(CX + 70, CY - 80, -30, .5)
    elif kind == 'chocolate':
        s += circle(CX, CY, 110, '#5a2f1c', 'opacity=".35"')
        for i in range(8):
            a = i / 8 * math.tau
            x, y = CX + 112 * math.cos(a), CY + 112 * math.sin(a)
            s += circle(x, y, 13, '#d81f3d') + circle(x - 4, y - 4, 4, '#ff8a9a') + f'<path d="M{f(x)} {f(y - 12)} q 6 -16 18 -20" stroke="#4e8a3a" stroke-width="2.4" fill="none"/>'
        s += ''.join(f'<rect x="-6" y="-1.5" width="12" height="3" rx="1.5" fill="{R.choice(["#ffd86b", "#ff9eb5", "#ffffff", "#7fd1b9"])}" transform="translate({f(CX + x)} {f(CY + y)}) rotate({R.randint(0, 180)})"/>' for x, y in (rand_in_circle(80) for _ in range(60)))
    else:
        s += f'<path d="M{CX - 92} {CY} C {CX - 96} {CY - 70}, {CX + 10} {CY - 104}, {CX + 74} {CY - 60} C {CX + 120} {CY - 20}, {CX + 96} {CY + 70}, {CX + 30} {CY + 92} C {CX - 40} {CY + 110}, {CX - 90} {CY + 60}, {CX - 92} {CY}Z" fill="#b5274f"/>'
        for x, y in (rand_in_circle(76) for _ in range(16)):
            if R.random() < .5:
                s += circle(CX + x, CY + y, 11, '#4a4fa3') + circle(CX + x - 3, CY + y - 3, 3, '#9fa6e8')
            else:
                s += circle(CX + x, CY + y, 12, '#e2365b') + ''.join(circle(CX + x + dx, CY + y + dy, 3.4, '#f45c7c') for dx, dy in [(-5, -4), (5, -4), (0, 5), (-5, 4), (5, 4)])
        s += mint_leaf(CX - 20, CY - 20, 20, .5)
    return s


def gateau():
    s = shadow(circle(CX, CY + 16, 214, '#a8735a')) + plate(214)
    tops = [('#ffb3c6', 'cherry'), ('#6b3a22', 'curl'), ('#ffd45c', 'mint'), ('#9fd07a', 'nut'), ('#ffffff', 'berry'), ('#f29e4c', 'curl')]
    k = 0
    for j in range(2):
        for i in range(3):
            x, y = CX - 112 + i * 112, CY - 56 + j * 112
            top, deco = tops[k]; k += 1
            s += f'<rect x="{x - 48}" y="{y - 44}" width="96" height="96" rx="12" fill="#c98d52"/><rect x="{x - 48}" y="{y - 48}" width="96" height="92" rx="12" fill="{top}" stroke="rgba(0,0,0,.08)" stroke-width="2"/>'
            if deco == 'cherry':
                s += circle(x, y - 2, 13, '#d81f3d') + circle(x - 4, y - 6, 4, '#ff8a9a')
            elif deco == 'curl':
                s += f'<path d="M{x - 26} {y} q 13 -22 26 0 t 26 0" stroke="#fff3dc" stroke-width="6" fill="none" stroke-linecap="round"/>'
            elif deco == 'mint':
                s += mint_leaf(x - 20, y, -20, .6)
            elif deco == 'nut':
                s += pistachio_nut(x, y, 30, .9)
            else:
                s += strawberry(x, y, 10, .8)
    return s


def om_ali():
    s = shadow(ellipse(CX, CY + 18, 230, 176, '#a8735a'))
    s += ellipse(CX, CY, 230, 176, '#c4663a') + ellipse(CX, CY, 214, 160, '#a9532c') + ellipse(CX, CY, 200, 148, '#f6dfb0')
    s += f'<clipPath id="oc"><ellipse cx="{CX}" cy="{CY}" rx="200" ry="148"/></clipPath><g clip-path="url(#oc)">'
    for _ in range(70):
        x, y = rand_in_circle(1)
        x, y = CX + x * 200, CY + y * 148
        r = R.uniform(18, 34)
        s += circle(x, y, r, R.choice(['#f2c472', '#e9ae55', '#f7d38c']), 'stroke="#d39444" stroke-width="2"')
        s += circle(x - r * .3, y - r * .3, r * .3, '#fff', 'opacity=".35"')
    s += '</g>'
    for _ in range(14):
        x, y = rand_in_circle(1)
        s += almond(CX + x * 160, CY + y * 110, R.randint(0, 180), .8)
    for _ in range(12):
        x, y = rand_in_circle(1)
        s += ellipse(CX + x * 170, CY + y * 120, 7, 5, '#5a2f2a', R.randint(0, 180))
    for _ in range(30):
        x, y = rand_in_circle(1)
        s += f'<rect x="-7" y="-1.6" width="14" height="3.2" rx="1.6" fill="#ffffff" transform="translate({f(CX + x * 180)} {f(CY + y * 130)}) rotate({R.randint(0, 180)})"/>'
    return s


def cups(kind):
    s = ''
    pts = [(-100, -70), (100, -70), (0, 110)]
    for x, y in pts:
        x, y = CX + x, CY + y
        s += shadow(circle(x, y + 12, 104, '#a8735a'))
        s += circle(x, y, 104, '#f2ebe2', 'stroke="#e3d6c6" stroke-width="3"') + circle(x, y, 88, '#e6dccf')
        surface = '#fffaf0'
        s += circle(x, y, 82, surface)
        s += f'<path d="M{x - 52} {y - 40} A 66 66 0 0 1 {x + 20} {y - 66}" stroke="#fff" stroke-width="6" fill="none" opacity=".9"/>'
        if kind == 'rice':
            s += sugar(x, y, 46, 140, '#b0703a', .75) + circle(x, y, 16, '#a3602e', 'opacity=".5"')
            s += ''.join(ellipse(x + dx, y + dy, 6, 4, '#7a4024', R.randint(0, 180)) for dx, dy in (rand_in_circle(55) for _ in range(4)))
        else:
            s += f'<path d="M{x - 40} {y + 10} q 20 -18 40 0 t 40 0" stroke="#f2a93b" stroke-width="5" fill="none" opacity=".6"/>'
            s += pistachio_crumbs(x, y, 30, 45, (2.6, 4.6))
            s += ''.join(ellipse(x + dx, y + dy, 9, 5, R.choice(['#ff8fab', '#ffb3c6']), R.randint(0, 180)) for dx, dy in (rand_in_circle(50) for _ in range(5)))
    return s


def zalabya():
    s = shadow(circle(CX, CY + 16, 214, '#a8735a'))
    s += circle(CX, CY, 214, '#ffffff', 'stroke="#d8e7f7" stroke-width="3"')
    for i in range(24):
        a = i / 24 * math.tau
        s += circle(CX + 198 * math.cos(a), CY + 198 * math.sin(a), 6, '#5b8fd6')
    s += circle(CX, CY, 182, '#f6efe4')
    placed = []
    for _ in range(600):
        x, y = rand_in_circle(150)
        r = R.uniform(24, 32)
        if all(math.hypot(x - px, y - py) > (r + pr) * .82 for px, py, pr in placed):
            placed.append((x, y, r))
    for x, y, r in placed:
        s += circle(CX + x, CY + y, r, 'url(#ball)', 'stroke="#c97a26" stroke-width="1.6"')
        s += circle(CX + x - r * .35, CY + y - r * .35, r * .25, '#fff', 'opacity=".55"')
    for i in range(6):
        y = CY - 130 + i * 52
        s += f'<path d="M{CX - 150} {y} q 25 -18 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" stroke="#ffb72e" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>'
    s += sugar(CX, CY, 150, 120, '#fffdf5', .9)
    return s


DISHES = {
    'konafa-cream': (lambda: kunafa('cream'), 'peach', 'mint'),
    'konafa-mango': (lambda: kunafa('mango'), 'butter', 'pink'),
    'konafa-nutella': (lambda: kunafa('nutella'), 'pink', 'butter'),
    'konafa-pistachio': (lambda: kunafa('pistachio'), 'mint', 'peach'),
    'qatayef-nuts': (lambda: qatayef('nuts'), 'lilac', 'butter'),
    'qatayef-cream': (lambda: qatayef('cream'), 'sky', 'pink'),
    'basbousa': (lambda: basbousa('plain'), 'butter', 'mint'),
    'basbousa-cream': (lambda: basbousa('cream'), 'pink', 'sky'),
    'basbousa-nutella': (lambda: basbousa('nutella'), 'peach', 'lilac'),
    'harissa': (lambda: basbousa('harissa'), 'sky', 'butter'),
    'baklava': (lambda: baklava(), 'mint', 'pink'),
    'nest': (nest, 'lilac', 'mint'),
    'goulash': (goulash, 'peach', 'sky'),
    'assorted': (assorted, 'pink', 'butter'),
    'kahk': (lambda: kahk('kahk'), 'sky', 'peach'),
    'maamoul': (lambda: kahk('maamoul'), 'lilac', 'butter'),
    'ghorayeba': (lambda: kahk('ghorayeba'), 'mint', 'pink'),
    'biscuits': (lambda: kahk('biscuits'), 'butter', 'sky'),
    'cake-strawberry': (lambda: cake('strawberry'), 'mint', 'pink'),
    'cake-chocolate': (lambda: cake('chocolate'), 'pink', 'peach'),
    'cheesecake': (lambda: cake('cheesecake'), 'lilac', 'mint'),
    'gateau': (gateau, 'sky', 'pink'),
    'om-ali': (om_ali, 'butter', 'lilac'),
    'rice-pudding': (lambda: cups('rice'), 'pink', 'mint'),
    'mahalabia': (lambda: cups('mahalabia'), 'mint', 'lilac'),
    'zalabya': (zalabya, 'peach', 'pink'),
}

DEFS = '''<defs>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9d27d"/><stop offset="1" stop-color="#e29a3c"/></linearGradient>
<linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="dome" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbe7bf"/><stop offset="1" stop-color="#e8c180"/></radialGradient>
<radialGradient id="ball" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffd36e"/><stop offset="1" stop-color="#df8f2c"/></radialGradient>
</defs>'''


def background(pal):
    bg, blob, accent = PALETTES[pal]
    s = f'<rect width="{W}" height="{H}" fill="{bg}"/>'
    s += circle(CX, CY, 268, blob)
    s += circle(80, 110, 70, blob, 'opacity=".8"') + circle(540, 720, 90, blob, 'opacity=".8"')
    for _ in range(26):
        s += circle(R.uniform(0, W), R.uniform(0, H), R.uniform(3, 7), '#ffffff', 'opacity=".7"')
    for x, y in [(70, 680), (520, 120), (110, 300), (500, 560)]:
        s += sparkle(x + R.uniform(-20, 20), y + R.uniform(-20, 20), R.uniform(.8, 1.4), accent)
    return s


def garnish():
    s = ''
    s += pistachio_nut(R.uniform(60, 120), R.uniform(700, 750), R.randint(0, 180), 1.1)
    s += mint_leaf(R.uniform(470, 520), R.uniform(80, 140), R.randint(100, 160), .9)
    s += almond(R.uniform(480, 540), R.uniform(690, 740), R.randint(0, 180), 1.2)
    return s


def render(key, variant):
    fn, pa, pb = DISHES[key]
    R.seed(key + str(variant))
    dish = fn()
    R.seed(key + 'bg' + str(variant))
    if variant == 1:
        body = background(pa) + garnish() + dish
    else:
        body = background(pb) + f'<g transform="translate({CX} {CY}) scale(1.55) rotate(18) translate({-CX} {-CY + 10})">{dish}</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            + DEFS + body + '</svg>')


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for key in DISHES:
        for v in (1, 2):
            name = key if v == 1 else key + '-2'
            with open(os.path.join(out, name + '.svg'), 'w') as fh:
                fh.write(render(key, v))
    print(len(DISHES) * 2, 'files')
