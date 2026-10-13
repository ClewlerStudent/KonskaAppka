# Applies the final eKoniuszy palette IN PLACE to design-canvas mockups, keeping the
# {{accent}} tweak holes and support.js. Run exactly once per source file (not idempotent).
import sys, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import recolor as R
from tokens import LCD as T, TAB, ACCENTS

ACC = ACCENTS[0][1]; ACC_H = ACCENTS[0][2]

def process_style(tag, attrs, style, fname):
    out = []
    for d in style.split(';'):
        if ':' not in d: out.append(d); continue
        prop, val = d.split(':', 1)
        val = re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: R.map_hex(m.group(0), prop.strip(), style, tag, attrs, fname), val)
        out.append(prop + ':' + val)
    return ';'.join(out)

def wordmark(s, fname):
    e = '<span style="color: {{accent}}; font-weight: 600">e</span>'
    s = re.sub(r'<span style="font-size: (\d+)px; font-weight: 700; letter-spacing: 0\.06em; color: [^"]+"><span style="font-weight: 400">e</span>Koniuszy</span>',
               lambda m: '<span style="font-size: %spx; font-weight: 700; letter-spacing: %s; color: %s">%sKoniuszy</span>' % (m.group(1), '0.01em' if int(m.group(1)) < 16 else '-0.01em', T['ink'], e), s)
    s = re.sub(r'<span style="font-size: 18px; font-weight: 700; color: [^"]+"><span style="font-weight: 500">e</span>Koniuszy</span><span style="font-size: 13px; font-weight: 700; letter-spacing: 0\.08em; text-transform: uppercase; color: ([^"]+)">([^<]+)</span>',
               lambda m: '<span style="font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: %s">%sKoniuszy</span><span style="font-size: 15px; font-weight: 600; color: %s">· %s</span>' % (T['ink'], e, T['ink-2'], m.group(2).lower().replace('stajnia pod lipami', 'Stajnia Pod Lipami')), s)
    return s

def apply(path):
    fname = os.path.basename(path).replace('.dc.html', '')
    s = open(path, encoding='utf-8').read()
    s = wordmark(s, fname)
    def tagfix(m):
        tag, attrs, style = m.group(1).lower(), m.group(2), m.group(3)
        ns = process_style(tag, attrs, style, fname)
        ns = R.polish(tag, attrs, style, ns, fname)
        return '<%s%sstyle="%s"' % (m.group(1), attrs, ns)
    s = re.sub(r'<(\w+)([^<>]*?)style="([^"]*)"', tagfix, s)
    s = re.sub(r'(stroke|fill)="(#[0-9A-Fa-f]{6})"', lambda m: '%s="%s"' % (m.group(1), R.M.get(m.group(2).upper(), m.group(2))), s)
    s = s.replace('a{color:#8B5E3C}a:hover{color:#6E4529}', 'a{color:%s}a:hover{color:%s}' % (ACC, ACC_H))
    s = re.sub(r'"options":\[[^\]]*\]', '"options":[%s]' % ','.join('"%s"' % a[1] for a in ACCENTS), s)
    s = s.replace('"default":"#8B5E3C"', '"default":"%s"' % ACC).replace("?? '#8B5E3C'", "?? '%s'" % ACC)
    s = re.sub(r'rgba\(\s*58,\s*46,\s*38,\s*0\.38\)', 'rgba(46,36,29,0.40)', s, flags=re.I)
    s = re.sub(r'rgba\(\s*30,\s*27,\s*24,\s*0\.62\)', TAB['t-scrim'], s, flags=re.I)
    vals = set(R.M.values())
    s = re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: R.M[m.group(0).upper()] if m.group(0).upper() in R.M and m.group(0).upper() not in vals else m.group(0), s)
    if fname.startswith('Tablet'):
        s = R.tablet_polish(s, fname)
        if fname == 'TabletBoks':
            # hay tile (2nd box tile) was coloured "overdue"; Kasztan is fasting, so show it as a plain to-do tile
            tiles = re.findall(r'<button type="button" style="min-height: 72px;[^"]*">', s)
            if len(tiles) >= 2 and TAB['t-warn'] in tiles[1]:
                s = s.replace(tiles[1], tiles[1].replace('border: 4px solid #000000', 'border: 2px dashed #000000').replace('background: ' + TAB['t-warn'], 'background: #FFFFFF'), 1)
    open(path, 'w', encoding='utf-8').write(s)
    pal = set(h.upper() for h in list(T.values()) + list(TAB.values()) + [a[1] for a in ACCENTS] + [a[2] for a in ACCENTS] if h.startswith('#'))
    left = sorted(set(h.upper() for h in re.findall(r'#[0-9A-Fa-f]{6}\b', s)) - pal)
    print(fname, 'poza paletą:', ' '.join(left) or '—', '| {{accent}}:', s.count('{{accent}}'), '| support.js:', 'support.js' in s)

if __name__ == '__main__':
    for p in sys.argv[1:]: apply(p)
