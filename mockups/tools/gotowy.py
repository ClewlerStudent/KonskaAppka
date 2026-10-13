#!/usr/bin/env python3
"""„Ogarnięte” -> „Boks gotowy” in mockups, canvas, TV generator and docs. Prints counts and leftovers."""
import re, sys, pathlib
S = pathlib.Path(sys.argv[1]); R = pathlib.Path(sys.argv[2])
REPL = [
    ('Ostatnio ogarnięte', 'Boks gotowy'),
    ('Ogarnięte: ', 'Gotowe boksy: '),
    ('„Ogarnięte” ', '„Boks gotowy” '),
    ('OGARNIĘTE: ten boks', 'BOKS GOTOWY: ten boks'),
    ('ogarnięte: ten boks', 'boks gotowy: ten boks'),
    ('OGARNIĘTE', 'BOKS GOTOWY'),
    ('ogarnięcia', 'sprzątania boksów'),
    ('ogarnięciu', 'sprzątaniu boksu'),
    ('ogarnięcie', 'sprzątanie boksu'),
    ('Ogarnięte', 'Boks gotowy'),
    ('ogarnięte', 'boks gotowy'),
]
def fix(t):
    for a, b in REPL: t = t.replace(a, b)
    return t
files = list((S/'mockups'/'project').glob('*.dc.html')) + [S/'mockups'/'project'/'canvas.json'] + list((S/'gen').glob('*.py')) + list((R/'docs').glob('*.md'))
changed = {}
for f in files:
    t = f.read_text(encoding='utf-8'); n = fix(t)
    if n != t:
        changed[str(f.relative_to(f.parents[1]))] = sum(t.count(a) for a, _ in REPL)
        f.write_text(n, encoding='utf-8')
print(changed)
left = [str(f) for f in files if re.search(r'ogarni[ęe]', f.read_text(encoding='utf-8'), re.I) and not f.name.endswith('.py')]
print('leftovers (ids allowed):')
for f in left:
    t = pathlib.Path(f).read_text(encoding='utf-8')
    for m in re.finditer(r'.{0,40}ogarni[ęe]\w*.{0,20}', t, re.I):
        if 'ogarniete' in m.group(0) and ('id=' in m.group(0) or 'labelledby' in m.group(0)): continue
        print('  ', pathlib.Path(f).name, '|', m.group(0).replace('\n', ' '))
