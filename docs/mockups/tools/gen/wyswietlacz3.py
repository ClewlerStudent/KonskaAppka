# Generates the central display mockup with consistent, repeated tile markup.
import sys
out_all, out_hall = sys.argv[1], sys.argv[2]

AV = {  # avatar palettes (bg, fg)
    'sand': ('#EFE5D8', '#6E4529'), 'sage': ('#E4E7D6', '#4F5D40'),
    'slate': ('#E6E7E4', '#4E5960'), 'ochre': ('#F3E5C6', '#7A5A1C'),
}
ICON = {
    'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    'x': '<path d="M7 7l10 10M17 7L7 17"/>',
    'broom': '<path d="M18 3l-5 8"/><path d="M8 11h8l1.5 10h-11z"/><path d="M10.5 15v6M13.5 15v6"/>',
    'fence': '<path d="M5 20V6l2-2 2 2v14M15 20V6l2-2 2 2v14M3 10h18M3 15h18"/>',
    'house': '<path d="M4 10l8-6 8 6v10H4z"/><path d="M10 20v-5h4v5"/>',
    'bowloff': '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M3 3l18 18"/>',
    'pill': '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>',
    'alert': '<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17v.01"/>',
    'steth': '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'water': '<path d="M12 3c3.5 4.5 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-11z"/>',
    'hay': '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M8 7v11M16 7v11"/>',
    'list': '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'hammer': '<path d="M14 6l4 4"/><path d="M3 21l9-9"/><path d="M13 3l8 8-3 3-8-8z"/>',
    'saddle': '<path d="M4 14c3-6 13-6 16 0"/><path d="M8 14v5M16 14v5"/><path d="M4 14h16"/>',
}
def svg(name, size=18, color='currentColor', sw='1.9'):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>')

def meal(label, state, time=''):
    # state: done | held | todo | late
    if state == 'done':
        st = 'background: #E4E7D6; color: #4F5D40; border: 1px solid #E4E7D6'
        inner = svg('check', 14) + f'<span>{label} {time}</span>'
        aria = f'{label}: podane {time}'
    elif state == 'held':
        st = 'background: #F2DCD5; color: #7E3A2F; border: 1px solid #F2DCD5'
        inner = svg('x', 14) + f'<span>{label} wstrzymane</span>'
        aria = f'{label}: wstrzymane'
    elif state == 'late':
        st = 'background: #F3E5C6; color: #7A5A1C; border: 1px solid #F3E5C6'
        inner = svg('alert', 14) + f'<span>{label} brak</span>'
        aria = f'{label}: nie odhaczone'
    else:
        st = 'background: transparent; color: #6B5C50; border: 1px dashed #D9CBB9'
        inner = f'<span>{label}</span>'
        aria = f'{label}: później'
    return (f'<li aria-label="{aria}" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; '
            f'border-radius: 999px; font-size: 14px; font-weight: 700; white-space: nowrap; {st}">{inner}</li>')

def tile(no, name=None, av='sand', flag=None, later=None, clean='', paddock='', extra='', state='normal', water=None):
    if name is None:  # free box
        return f'''<article aria-label="Boks {no}, wolny" style="display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 12px; background: #F6F1EA; border: 2px dashed #D9CBB9; border-radius: 16px; color: #6B5C50">
<div style="display: flex; align-items: center; gap: 10px">
<span style="min-width: 40px; height: 40px; box-sizing: border-box; padding: 0 8px; border-radius: 12px; border: 1px dashed #D9CBB9; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700">{no}</span>
<span style="font-size: 20px; font-weight: 700">Wolny</span>
</div>
<span style="margin-top: auto; display: inline-flex; align-items: center; gap: 6px; font-size: 15px">{svg('broom', 17)}Boks gotowy {clean}</span>
</article>'''
    bg, fg = AV[av]
    if state == 'critical':
        box = 'background: #FFFCF7; border: 3px solid #974A3D'
    elif state == 'warn':
        box = 'background: #FBF3E2; border: 3px solid #7A5A1C'
    else:
        box = 'background: #FFFCF7; border: 1px solid #E3D7C8'
    flag_html = ''
    if flag:
        kind, text, sub, icon = flag
        if kind == 'critical':
            c = 'background: #F2DCD5; color: #7E3A2F'
        elif kind == 'warn':
            c = 'background: #F3E5C6; color: #7A5A1C'
        else:
            c = 'background: #E6E7E4; color: #4E5960'
        flag_html = f'''<div style="display: flex; flex-direction: column; gap: 2px; padding: 6px 9px; border-radius: 10px; {c}">
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 700">{svg(icon, 17)}{text}</span>
<span style="font-size: 13px; font-weight: 600">{sub}</span>
</div>'''
    water_html = (f'<span style="display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; padding: 4px 9px; border-radius: 10px; '
                  f'background: #EFE5D8; color: #3A2E26; font-size: 14px; font-weight: 700">{svg("water", 16)}Poidło ręczne · woda {water}</span>') if water else ''
    later_html = f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #6B5C50">{svg("clock", 16)}{later}</span>' if later else ''
    pad_icon = 'fence' if paddock and not paddock.startswith('w boksie') else 'house'
    extra_html = f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #4E5960">{svg("clock", 16)}{extra}</span>' if extra else ''
    return f'''<article aria-label="Boks {no}, {name}" style="display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 12px; border-radius: 16px; {box}">
<div style="display: flex; align-items: center; gap: 10px">
<span style="min-width: 40px; height: 40px; box-sizing: border-box; padding: 0 8px; border-radius: 12px; background: #3A2E26; color: #FFFCF7; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700">{no}</span>
<span style="font-size: 20px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{name}</span>
</div>
{flag_html}
{water_html}
{later_html}
{extra_html}
<div style="margin-top: auto; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 14px; color: #6B5C50">
<span style="display: inline-flex; align-items: center; gap: 5px">{svg('broom', 16)}Boks gotowy {clean}</span>
<span style="display: inline-flex; align-items: center; gap: 5px">{svg(pad_icon, 16)}{paddock}</span>
</div>
</article>'''

D = lambda t: ('R', 'done', t)
P = ('P', 'todo'); W = ('W', 'todo')
T = {}
tiles = [
    tile(1, 'Iskra', 'sand', clean='07:02', paddock='w boksie'),
    tile(2, 'Dukat', 'slate', clean='06:50', paddock='padok A 10–14'),
    tile(3, None, clean='wcz. 16:10'),
    tile(4, 'Sonata', 'sage', later='od 16:00 · Derka: zakładać', clean='wczoraj', paddock='padok A 10–14'),
    tile(5, 'Wicher', 'ochre', clean='07:05', paddock='w boksie'),
    tile(6, 'Fala', 'sand', clean='wczoraj', paddock='padok B 10–16'),
    tile(7, 'Kasztan', 'sand', flag=('critical', 'Bez śniadania', '06:00–10:00 · potwierdzona 06:02', 'bowloff'),
         later='od 14:30 · Nie na padok (kowal 15:00)', clean='07:10', paddock='padok B 10–14:30', extra='Wet 8:00 · kowal 15:00', state='critical'),
    tile(8, 'Hetman', 'slate', flag=('info', 'Leki rano', '06:00–09:00 · potwierdzona 06:20', 'pill'), clean='wczoraj', paddock='w boksie'),
    tile(1, 'Grom', 'sage', clean='wczoraj', paddock='padok A 10–14'),
    tile(2, 'Mgła', 'slate', clean='06:58', paddock='w boksie'),
    tile(3, 'Rumba', 'ochre', clean='07:12', paddock='padok B 10–16'),
    tile(4, 'Bella', 'sage', flag=('warn', 'Nie na padok', 'dziś, cały dzień · NIEPOTWIERDZONA', 'alert'),
         clean='wczoraj', paddock='padok odwołany', state='warn'),
    tile(5, 'Bursztyn', 'ochre', clean='07:14', paddock='padok A 10–14', water='06:55'),
    tile(6, None, clean='09.10'),
]
hall_main, hall_new = tiles[:8], tiles[8:]

def tl(time, icon, title, sub, done=False, now=False):
    dot = ('background: #4F5D40; border-color: #4F5D40' if done else ('background: #8B5E3C; border-color: #8B5E3C' if now else 'background: #FFFCF7; border-color: #D9CBB9'))
    col = '#6B5C50' if done else '#3A2E26'
    return f'''<li style="display: grid; grid-template-columns: 56px 14px minmax(0, 1fr); gap: 10px; align-items: start">
<span style="font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; color: {col}">{time}</span>
<span aria-hidden="true" style="margin-top: 5px; width: 12px; height: 12px; border-radius: 6px; border: 2px solid; box-sizing: border-box; {dot}"></span>
<span style="display: flex; flex-direction: column; gap: 1px; color: {col}">
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 17px; font-weight: 700">{svg(icon, 17)}{title}</span>
<span style="font-size: 14px; color: #6B5C50">{sub}</span>
</span>
</li>'''

timeline = ''.join([
    tl('06:30', 'check', 'Śniadanie', 'główna 06:40 · nowa 06:50', done=True),
    tl('08:00', 'steth', 'Weterynarz', 'Kasztan · główna 7 · na czczo', now=True),
    tl('10:00', 'fence', 'Padoki', 'A: 4 · B: 3 · Bella nie wychodzi'),
    tl('12:00', 'hay', 'Obiad', '12 koni'),
    tl('15:00', 'hammer', 'Kowal', 'Kasztan · główna 7'),
    tl('16:00', 'saddle', 'Jazda', 'Iskra · kryta ujeżdżalnia'),
])

def act(time, text, who):
    return f'''<li style="display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 8px; align-items: baseline; padding: 6px 0; border-top: 1px solid #E3D7C8">
<span style="font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums">{time}</span>
<span style="font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{text}</span>
{f'<span style="font-size: 13px; color: #6B5C50">{who}</span>' if who else ''}
</li>'''
acts = ''.join([
    act('07:14', 'Czyszczenie · nowa 5', ''),
    act('07:12', 'Czyszczenie · nowa 3', ''),
    act('07:10', 'Czyszczenie · główna 7', ''),
    act('07:05', 'Czyszczenie · główna 5', ''),
    act('06:45', 'Woda · główna 7', ''),
    act('06:43', 'Śniadanie · nowa 5', ''),
])

def task(text, sub, done=False):
    box = ('background: #4F5D40; border-color: #4F5D40; color: #FFFCF7' if done else 'background: #FFFCF7; border-color: #D9CBB9; color: transparent')
    return f'''<li style="display: flex; align-items: center; gap: 10px; padding: 6px 0; border-top: 1px solid #E3D7C8">
<span aria-hidden="true" style="width: 22px; height: 22px; flex: none; box-sizing: border-box; border-radius: 6px; border: 2px solid; display: inline-flex; align-items: center; justify-content: center; {box}">{svg('check', 14)}</span>
<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><span style="font-size: 15px; font-weight: 600{'; color: #6B5C50; text-decoration: line-through' if done else ''}">{text}</span><span style="font-size: 13px; color: #6B5C50">{sub}</span></span>
</li>'''
tasks = ''.join([
    task('Czyszczenie boksów', '7 z 14 · do 10:00'),
    task('Woda w poidle · nowa 1', '12:00'),
    task('Derki do pralni', 'zrobione 07:00', done=True),
])

card = 'background: #FFFCF7; border: 1px solid #E3D7C8; border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px'
h2 = 'margin: 0; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; letter-spacing: 0.02em'


def section(title, meta, chips, tiles_html, minw=180, btn=None):
    chips_html = ''.join(
        f'<span style="padding: 3px 10px; border-radius: 999px; font-size: 14px; font-weight: 700; {st}">{t}</span>'
        for t, st in chips)
    return f'''<section aria-label="{title}" style="display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; padding-bottom: 6px; border-bottom: 2px solid #E3D7C8">
<h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase">{title}</h2>
<span style="font-size: 15px; color: #6B5C50">{meta}</span>
{chips_html}
{btn or ''}
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax({minw}px, 1fr)); gap: 10px">
{''.join(tiles_html)}
</div>
</section>'''


ICON['expand'] = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'
ICON['grid'] = '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
def hall_btn(label, icon, href, ml=True):
    return (f'<a href="{href}" style="{'margin-left: auto; ' if ml else ''}min-height: 40px; box-sizing: border-box; display: inline-flex; align-items: center; gap: 8px; '
            f'padding: 0 14px; border-radius: 12px; border: 1px solid #E3D7C8; background: #FFFCF7; color: #3A2E26; text-decoration: none; font-size: 15px; font-weight: 700">'
            f'{svg(icon, 18)}{label}</a>')
def hall_switch(current):
    items = []
    for i, h in enumerate(['Hala główna', 'Hala nowa']):
        on = h == current
        st = 'background: #3A2E26; color: #FFFCF7' if on else 'background: #FFFCF7; color: #3A2E26'
        border = '' if i == 0 else 'border-left: 1px solid #E3D7C8; '
        cur = ' aria-current="true"' if on else ''
        items.append(f'<a href="WyswietlaczHala.dc.html"{cur} style="min-height: 40px; box-sizing: border-box; display: inline-flex; align-items: center; padding: 0 16px; {border}{st}; text-decoration: none; font-size: 15px; font-weight: 700">{h}</a>')
    return ('<div role="group" aria-label="Zmień halę" style="margin-left: auto; display: flex; border: 1px solid #E3D7C8; border-radius: 12px; overflow: hidden">'
            + ''.join(items) + '</div>')
CRIT = 'background: #F2DCD5; color: #7E3A2F'
OKC = 'background: #E4E7D6; color: #4F5D40'
NEU = 'background: #EFE5D8; color: #6B5C50'
WARN = 'background: #F3E5C6; color: #7A5A1C'
INFO = 'background: #E6E7E4; color: #4E5960'

def page(title, h1, sub, main_html, aside_html, footer_where):
    return f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#8B5E3C}}a:hover{{color:#6E4529}}
</style>
</helmet>
<div style="width: 100%; min-height: 900px; box-sizing: border-box; background: #F6F1EA; color: #3A2E26; font-family: Figtree, system-ui, sans-serif; line-height: 1.2; display: flex; flex-direction: column; gap: 12px; padding: 16px 24px">

<header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px">
<div style="display: flex; flex-direction: column; gap: 2px">
<span style="display: flex; align-items: baseline; gap: 10px"><span style="font-size: 18px; font-weight: 700; color: {{{{accent}}}}"><span style="font-weight: 500">e</span>Koniuszy</span><span style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6B5C50">{sub}</span></span>
<h1 style="margin: 0; font-size: 32px; font-weight: 700">{h1}</h1>
</div>
<div style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #FFFCF7; border: 1px solid #E3D7C8; border-radius: 14px">
{svg('clock', 26, '#6E4529')}
<span style="display: flex; flex-direction: column; gap: 2px">
<span style="font-size: 15px; color: #6B5C50">Teraz: po śniadaniu</span>
<span style="font-size: 20px; font-weight: 700">Następny posiłek: obiad 12:00 · za 4 h 45 min</span>
</span>
</div>
<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px">
<span style="font-size: 52px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums">07:15</span>
<span style="font-size: 17px; color: #6B5C50">wtorek, 13 października</span>
</div>
</header>

<div role="alert" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 16px; border-radius: 14px; background: #F3E5C6; color: #7A5A1C">
{svg('alert', 26)}
<strong style="font-size: 20px; letter-spacing: 0.04em">NIEPOTWIERDZONA</strong>
<span style="font-size: 19px; font-weight: 600">Hala nowa · boks 4 · Bella · Nie na padok · dziś, cały dzień · ustawiona 01:20</span>
<span style="margin-left: auto; font-size: 17px">padok o 10:00 · admin powiadomiony</span>
</div>

<div style="flex: 1; display: flex; flex-wrap: wrap; gap: 16px; align-items: stretch">
<main aria-label="Boksy" style="flex: 999 1 640px; min-width: 0; display: flex; flex-direction: column; gap: 14px">
{main_html}
</main>

<aside style="flex: 1 1 330px; min-width: 0; max-width: 380px; display: flex; flex-direction: column; gap: 12px">
{aside_html}
</aside>
</div>

</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"accent":{{"editor":"color","default":"#8B5E3C","options":["#8B5E3C","#7A6A4F","#8E5B52","#6F6A55"]}},"$preview":{{"width":1600,"height":900}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{ accent: this.props.accent ?? '#8B5E3C' }};
}}
}}
</script>
</body>
</html>
'''

def card_section(id_, icon, title, inner, tag='ol'):
    return f'''<section aria-labelledby="{id_}" style="{card}">
<h2 id="{id_}" style="{h2}">{svg(icon, 20)}{title}</h2>
<{tag} style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">{inner}</{tag}>
</section>''' if tag == 'ol-tl' else f'''<section aria-labelledby="{id_}" style="{card}">
<h2 id="{id_}" style="{h2}">{svg(icon, 20)}{title}</h2>
<{tag} style="list-style: none; margin: 0; padding: 0">{inner}</{tag}>
</section>'''

def timeline_section(id_, items):
    return f'''<section aria-labelledby="{id_}" style="{card}">
<h2 id="{id_}" style="{h2}">{svg('calendar', 20)}Dziś w stajni</h2>
<ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">{items}</ol>
</section>'''

# ---- all halls (/wyswietlacz) ----
import re
def compact(t):
    # TV with every hall: shorter texts so each tile stays one line per row
    t = re.sub(r'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #4E5960">.*?</span>\n', '', t)
    t = t.replace('R wstrzymane', 'R stop').replace('06:00–10:00 · potwierdzona 06:02', '06:00–10:00 · potwierdzona').replace('06:00–09:00 · potwierdzona 06:20', '06:00–09:00 · potwierdzona').replace('od 14:30 · Nie na padok (kowal 15:00)', 'od 14:30 · Nie na padok')
    t = t.replace('dziś, cały dzień · NIEPOTWIERDZONA', 'cały dzień · NIEPOTWIERDZONA')
    t = t.replace('padok A 10–14', 'A 10–14').replace('padok B 10–16', 'B 10–16').replace('padok B 10–14:30', 'B 10–14:30').replace('padok odwołany', 'odwołany')
    t = t.replace('gap: 4px 12px; font-size: 14px; color: #6B5C50', 'gap: 4px 10px; font-size: 13px; color: #6B5C50')
    t = t.replace('font-size: 15px">' + svg('broom', 17) + 'Czyszczenie', 'font-size: 14px">' + svg('broom', 17) + 'Czyszczenie')
    t = t.replace('font-size: 15px">' + svg('hay', 17) + 'Ścielenie', 'font-size: 14px">' + svg('hay', 17) + 'Ścielenie')
    t = t.replace('Poidło ręczne · woda ', 'Poidło ręczne ')
    return t
hall_main_c = [compact(t) for t in hall_main]
hall_new_c = [compact(t) for t in hall_new]
main_all = (
    section('Hala główna', 'boksy 1–8 · 7 koni · 1 wolny', [('1 krytyczna', CRIT), ('✓ Śniadanie 06:40', OKC), ('Padok 10:00', NEU)], hall_main_c, btn=hall_btn('Pełny ekran', 'expand', 'WyswietlaczHala.dc.html'))
    + section('Hala nowa', 'boksy 1–6 · 5 koni · 1 wolny', [('1 niepotwierdzona', WARN), ('✓ Śniadanie 06:50', OKC), ('Padok 10:00', NEU)], hall_new_c, btn=hall_btn('Pełny ekran', 'expand', 'WyswietlaczHala.dc.html'))
)
acts_all = ''.join([
    act('07:14', 'Boks gotowy · nowa 5', ''),
    act('07:12', 'Boks gotowy · nowa 3', ''),
    act('07:10', 'Boks gotowy · główna 7', ''),
])
tasks_all = ''.join([
    task('Poidło w boksie 5 do wymiany', 'Hala nowa · do wzięcia'),
    task('Wymienić żarówkę w korytarzu', 'Hala główna · bierze Piotr'),
    task('Przywieźć słomę z magazynu', 'zrobione 06:30', done=True),
])
aside_all = (timeline_section('dzis-t', timeline)
             + card_section('akcje-t', 'list', 'Ostatnie akcje', acts_all)
             + card_section('zadania-t', 'check', 'Zadania obsługi', tasks_all, 'ul'))
open(out_all, 'w', encoding='utf-8').write(page(
    'Wyświetlacz centralny – wszystkie hale', 'Stajnia Pod Lipami', 'wszystkie hale', main_all, aside_all,
    'Wyświetlacz: <strong style="color: #3A2E26">korytarz główny</strong> · wszystkie hale'))

# ---- one hall (/wyswietlacz?hala=...) ----
main_hall = section('Hala nowa', 'boksy 1–6 · 5 koni · 1 wolny', [('1 niepotwierdzona', WARN), ('✓ Śniadanie 06:50', OKC), ('Padok 10:00', NEU)], hall_new, minw=215, btn=hall_switch('Hala nowa') + hall_btn('Wszystkie hale', 'grid', 'WyswietlaczCentralny.dc.html', ml=False))
main_hall = main_hall.replace('<div style="display: grid;', '<div style="zoom: 1.7; display: grid;', 1)
timeline_hall = ''.join([
    tl('06:30', 'check', 'Śniadanie', 'podane 06:50 · 5 koni', done=True),
    tl('10:00', 'fence', 'Padoki', 'A: 2 konie · B: 1 koń · Bella nie wychodzi'),
    tl('12:00', 'hay', 'Obiad', '5 koni'),
    tl('18:00', 'hay', 'Kolacja', '5 koni'),
])
acts_hall = ''.join([
    act('07:14', 'Boks gotowy · boks 5', ''),
    act('07:12', 'Boks gotowy · boks 3', ''),
    act('06:58', 'Boks gotowy · boks 2', ''),
    act('06:50', 'Podano śniadanie', ''),
])
other = f'''<section aria-labelledby="inne-t" style="{card}">
<h2 id="inne-t" style="{h2}">{svg('house', 20)}Pozostałe hale</h2>
<div style="display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px solid #E3D7C8">
<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px">
<strong style="font-size: 17px">Hala główna</strong>
<span style="font-size: 14px; color: #6B5C50">7 koni · 1 wolny</span>
</div>
<span style="display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; padding: 5px 9px; border-radius: 10px; font-size: 15px; font-weight: 700; {CRIT}">{svg('bowloff', 16)}Boks 7 · Kasztan · bez śniadania · przyjęte</span>
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #4E5960; font-weight: 600">{svg('steth', 16)}Weterynarz 08:00 · kowal 12:00</span>
</div>
</section>'''
aside_hall = (timeline_section('dzis-t', timeline_hall)
              + card_section('akcje-t', 'list', 'Ostatnie akcje', acts_hall))
open(out_hall, 'w', encoding='utf-8').write(page(
    'Wyświetlacz – hala na pełnym ekranie', 'Hala nowa', 'Stajnia Pod Lipami · pełny ekran hali', main_hall, aside_hall,
    'Wyświetlacz: <strong style="color: #3A2E26">korytarz hali nowej</strong> · pełny ekran hali, zapamiętany na tym telewizorze'))
print('ok')
