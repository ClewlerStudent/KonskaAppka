# Replaces the tablet "HISTORIA" section with "OSTATNIE AKCJE": exactly the last 5 actions, no full history.
import sys
ICO = {
 'broom': '<path d="M18 3l-5 8"/><path d="M8 11h8l1.5 10h-11z"/><path d="M10.5 15v6M13.5 15v6"/>',
 'bowl': '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M12 7V4"/>',
 'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 'flag': '<path d="M5 21V4h11l-2 4 2 4H5"/>',
}
def svg(n):
    return (f'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICO[n]}</svg>')
ROWS = [
    ('2026-10-13T07:10', '07:10', 'broom', 'Ogarnięte', ''),
    ('2026-10-13T06:40', '06:40', 'bowl', 'Podano śniadanie · <strong>bez Kasztana</strong>: flaga', 'Ola'),
    ('2026-10-13T06:02', '06:02', 'check', 'Potwierdzono flagę <strong>„Bez śniadania”</strong>', ''),
    ('2026-10-13T06:02', '06:02', 'check', 'Potwierdzono flagę <strong>„Nie na padok”</strong>', ''),
    ('2026-10-13T03:16', '03:16', 'flag', 'Nowa flaga <strong>„Nie na padok”</strong> · 14:30–16:00', 'Anna'),
]
def li(i, r):
    dt, t, ic, text, who = r
    sep = '' if i == 0 else '; border-top: 1px solid #ABABAB'
    who_html = f'\n<span style="color: #404040">{who}</span>' if who else ''
    return f'''<li style="min-height: 34px; box-sizing: border-box; padding: 3px 0; display: grid; grid-template-columns: 70px 22px minmax(0, 1fr) auto; align-items: center; gap: 0 10px{sep}">
<time datetime="{dt}" style="text-align: right; font-weight: 700; font-variant-numeric: tabular-nums">{t}</time>
{svg(ic)}
<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{text}</span>{who_html}
</li>'''
SECTION = f'''<section aria-labelledby="ostatnie-tytul" style="flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px">
<h2 id="ostatnie-tytul" style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.06em">OSTATNIE AKCJE</h2>
<span style="font-size: 18px; color: #404040">5 ostatnich · boks i koń</span>
</div>
<ol style="margin: 0; padding: 0 12px; list-style: none; display: flex; flex-direction: column; border: 2px solid #000000; border-radius: 12px; background: #FFFFFF; overflow: hidden; font-size: 20px">
{chr(10).join(li(i, r) for i, r in enumerate(ROWS))}
</ol>
</section>'''

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    i = s.index('<section aria-labelledby="historia-tytul"')
    j = s.index('</section>', i) + len('</section>')
    s = s[:i] + SECTION + s[j:]
    open(path, 'w', encoding='utf-8').write(s)
    print('ok', path.split('/')[-1])
