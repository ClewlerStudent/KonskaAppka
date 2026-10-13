# Replaces the tablet "BOKS" section with three quick-action buttons:
# Ogarnięte (this box), meal served and paddock out (whole hall). Tablet palette only (t-*).
import re, sys
ICO = {
 'broom': '<path d="M18 3l-5 8"/><path d="M8 11h8l1.5 10h-11z"/><path d="M10.5 15v6M13.5 15v6"/>',
 'bowl': '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M12 7V4"/>',
 'fence': '<path d="M5 20V6l2-2 2 2v14M15 20V6l2-2 2 2v14M3 10h18M3 15h18"/>',
 'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 'lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
}
def svg(n, s=28, sw='1.8'):
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">{ICO[n]}</svg>')

def button(icon, title, status, note, done, scope, locked):
    look = ('border: 2px solid #000000; background: #ACDA9D' if done else 'border: 2px dashed #000000; background: #FFFFFF')
    dis = ' disabled aria-disabled="true"' if locked else ''
    lock = (f'<span style="position: absolute; bottom: 8px; right: 8px">{svg("lock", 18, "2")}</span>') if locked else ''
    st_icon = svg('check', 22, '2.4') if done else ''
    return f'''<button type="button"{dis} aria-label="{title}: {scope}" style="position: relative; min-height: 100px; box-sizing: border-box; {look}; border-radius: 12px; color: #000000; font: inherit; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; padding: 8px 12px; text-align: left">
{lock}<span style="display: flex; align-items: center; gap: 8px">{svg(icon)}<span style="font-size: 24px; font-weight: 700; letter-spacing: 0.03em; line-height: 1.05">{title}</span></span>
<span style="display: flex; align-items: center; gap: 4px; font-size: 21px; font-weight: 700; font-variant-numeric: tabular-nums">{st_icon}{status}</span>
<span style="font-size: 17px; font-weight: 700">{note}</span>
</button>'''

def section(locked):
    hint = 'dotyk wyłączony do odblokowania' if locked else 'ogarnięte: ten boks · posiłek i padok: cała hala'
    btns = ''.join([
        button('broom', 'OGARNIĘTE', 'dziś 07:10', 'ten boks', True, 'ten boks', locked),
        button('bowl', 'ŚNIADANIE', 'podane 06:40', 'potem obiad 12:00', True, 'cała hala', locked),
        button('fence', 'PADOK', 'B 10:00–14:30', 'z Falą i Rumbą', False, 'cała hala', locked),
    ])
    return f'''<section aria-labelledby="boks-tytul" style="display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px">
<h2 id="boks-tytul" style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.06em">SZYBKIE AKCJE</h2>
<span style="font-size: 18px; color: #404040">{hint}</span>
</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
{btns}
</div>
</section>

'''

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    locked = 'Zablokowany' in path
    k = s.find('<dl style="margin: 0; display: grid; grid-template-columns: 124px')
    if k >= 0:
        s = s[:k] + s[s.index('</dl>', k) + len('</dl>\n'):].lstrip('\n')
    i = s.index('<section aria-labelledby="boks-tytul"')
    j = s.index('<section aria-labelledby="historia-tytul"')
    s = s[:i] + section(locked) + s[j:]
    open(path, 'w', encoding='utf-8').write(s)
    print('ok', path.split('/')[-1])
