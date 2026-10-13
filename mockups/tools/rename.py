#!/usr/bin/env python3
"""eKoniuszy -> EQUENOR in mockups (.dc.html), canvas.json, TV generators. Run once; prints counts."""
import re, sys, glob, json, pathlib
S = pathlib.Path(sys.argv[1])
P = S / 'mockups' / 'project'
WORD_SPAN = '<span style="color: {{accent}}; font-weight: 600">e</span>Koniuszy'
WORDMARK = '<span style="letter-spacing: 0.16em; font-weight: 700">EQUENOR</span>'
total = {}
def fix_text(t):
    t = t.replace(WORD_SPAN, WORDMARK)
    # any other accent variants of the old wordmark (literal colours from generators)
    t = re.sub(r'<span style="color: #[0-9A-Fa-f]{6}; font-weight: 600">e</span>Koniuszy', WORDMARK, t)
    t = t.replace('eKoniuszy', 'EQUENOR')
    t = t.replace('Twoja stajnia w jednym miejscu', 'Equestrian Management, Refined')
    return t
for f in sorted(P.glob('*.dc.html')):
    t = f.read_text(encoding='utf-8'); n = fix_text(t)
    if n != t:
        total[f.name] = t.count('Koniusz') - n.count('Koniusz')
        f.write_text(n, encoding='utf-8')
c = P / 'canvas.json'; t = c.read_text(encoding='utf-8'); n = fix_text(t)
if n != t: c.write_text(n, encoding='utf-8'); total['canvas.json'] = t.count('Koniusz')
for g in sorted((S / 'gen').glob('*.py')):
    t = g.read_text(encoding='utf-8'); n = fix_text(t)
    if n != t: g.write_text(n, encoding='utf-8'); total['gen/' + g.name] = t.count('Koniusz')
left = [f.name for f in P.glob('*.dc.html') if 'Koniusz' in f.read_text(encoding='utf-8')]
print(json.dumps(total, ensure_ascii=False, indent=0)); print('left with Koniusz:', left)
