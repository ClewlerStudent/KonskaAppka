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

def tile(no, name=None, av='sand', flag=None, meals=None, clean='', paddock='', extra='', state='normal'):
    if name is None:  # free box
        return f'''<article aria-label="Boks {no}, wolny" style="display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 12px; background: #F6F1EA; border: 2px dashed #D9CBB9; border-radius: 16px; color: #6B5C50">
<div style="display: flex; align-items: center; gap: 10px">
<span style="min-width: 40px; height: 40px; box-sizing: border-box; padding: 0 8px; border-radius: 12px; border: 1px dashed #D9CBB9; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700">{no}</span>
<span style="font-size: 20px; font-weight: 700">Wolny</span>
</div>
<span style="margin-top: auto; display: inline-flex; align-items: center; gap: 6px; font-size: 15px">{svg('broom', 17)}Czyszczenie {clean}</span>
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 15px">{svg('hay', 17)}Ścielenie {paddock}</span>
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
    meals_html = ''.join(meal(*m) for m in (meals or []))
    pad_icon = 'fence' if paddock and not paddock.startswith('w boksie') else 'house'
    extra_html = f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #4E5960">{svg("clock", 16)}{extra}</span>' if extra else ''
    return f'''<article aria-label="Boks {no}, {name}" style="display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 12px; border-radius: 16px; {box}">
<div style="display: flex; align-items: center; gap: 10px">
<span style="min-width: 40px; height: 40px; box-sizing: border-box; padding: 0 8px; border-radius: 12px; background: #3A2E26; color: #FFFCF7; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700">{no}</span>
<span style="font-size: 20px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{name}</span>
</div>
{flag_html}
<ul aria-label="Posiłki" style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 5px">{meals_html}</ul>
{extra_html}
<div style="margin-top: auto; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 14px; color: #6B5C50">
<span style="display: inline-flex; align-items: center; gap: 5px">{svg('broom', 16)}{clean}</span>
<span style="display: inline-flex; align-items: center; gap: 5px">{svg(pad_icon, 16)}{paddock}</span>
</div>
</article>'''

D = lambda t: ('R', 'done', t)
P = ('P', 'todo'); W = ('W', 'todo')
T = {}
tiles = [
    tile(1, 'Iskra', 'sand', meals=[D('06:35'), P, W], clean='07:02', paddock='w boksie'),
    tile(2, 'Dukat', 'slate', meals=[D('06:36'), P, W], clean='06:50', paddock='padok A 10–14'),
    tile(3, None, clean='wcz. 15:50', paddock='wcz. 16:10'),
    tile(4, 'Sonata', 'sage', meals=[D('06:37'), P, W], clean='wczoraj', paddock='padok A 10–14'),
    tile(5, 'Wicher', 'ochre', meals=[D('06:38'), P, W], clean='07:05', paddock='w boksie'),
    tile(6, 'Fala', 'sand', meals=[D('06:39'), P, W], clean='wczoraj', paddock='padok B 10–14'),
    tile(7, 'Kasztan', 'sand', flag=('critical', 'Bez śniadania', 'do 10:00 · przyjęte 06:02', 'bowloff'),
         meals=[('R', 'held'), P, W], clean='07:10', paddock='padok B 10–14', extra='Wet 8:00 · kowal 12:00', state='critical'),
    tile(8, 'Hetman', 'slate', flag=('info', 'Leki rano', 'przyjęte 06:20', 'pill'), meals=[D('06:41'), P, W], clean='wczoraj', paddock='w boksie'),
    tile(9, 'Grom', 'sage', meals=[D('06:38'), P, W], clean='wczoraj', paddock='padok A 10–14', extra='Woda w poidle · 12:00'),
    tile(10, 'Mgła', 'slate', meals=[('R', 'late'), P, W], clean='06:58', paddock='w boksie', state='normal'),
    tile(11, 'Rumba', 'ochre', meals=[D('06:42'), P, W], clean='07:12', paddock='padok B 10–14'),
    tile(12, 'Bella', 'sage', flag=('warn', 'Nie na padok', 'NIEPOTWIERDZONA · od 01:20', 'alert'),
         meals=[D('06:40'), P, W], clean='wczoraj', paddock='padok odwołany', state='warn'),
    tile(13, 'Bursztyn', 'ochre', meals=[D('06:43'), P, W], clean='07:14', paddock='padok A 10–14'),
    tile(14, None, clean='09.10', paddock='09.10'),
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
    tl('06:30', 'check', 'Śniadanie', '10 z 12 · 1 wstrzymane · 1 brak', done=True),
    tl('08:00', 'steth', 'Weterynarz', 'Kasztan · boks 7 · na czczo', now=True),
    tl('10:00', 'fence', 'Padoki', 'A: 4 konie · B: 3 konie · Bella odwołana'),
    tl('12:00', 'hay', 'Obiad', '12 koni'),
    tl('12:00', 'hammer', 'Kowal', 'Kasztan · boks 7'),
    tl('16:00', 'saddle', 'Jazda', 'Iskra · kryta ujeżdżalnia'),
])

def act(time, text, who):
    return f'''<li style="display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; gap: 8px; align-items: baseline; padding: 6px 0; border-top: 1px solid #E3D7C8">
<span style="font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums">{time}</span>
<span style="font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{text}</span>
<span style="font-size: 13px; color: #6B5C50">{who}</span>
</li>'''
acts = ''.join([
    act('07:14', 'Boks 13 wyczyszczony', 'tablet'),
    act('07:12', 'Boks 11 wyczyszczony', 'tablet'),
    act('07:10', 'Boks 7 wyczyszczony', 'tablet'),
    act('07:05', 'Boks 5 wyczyszczony', 'apka'),
    act('06:45', 'Woda · boks 7', 'tablet'),
    act('06:43', 'Śniadanie · boks 13', 'tablet'),
])

def task(text, sub, done=False):
    box = ('background: #4F5D40; border-color: #4F5D40; color: #FFFCF7' if done else 'background: #FFFCF7; border-color: #D9CBB9; color: transparent')
    return f'''<li style="display: flex; align-items: center; gap: 10px; padding: 6px 0; border-top: 1px solid #E3D7C8">
<span aria-hidden="true" style="width: 22px; height: 22px; flex: none; box-sizing: border-box; border-radius: 6px; border: 2px solid; display: inline-flex; align-items: center; justify-content: center; {box}">{svg('check', 14)}</span>
<span style="flex: 1; display: flex; flex-direction: column; gap: 1px"><span style="font-size: 15px; font-weight: 600{'; color: #6B5C50; text-decoration: line-through' if done else ''}">{text}</span><span style="font-size: 13px; color: #6B5C50">{sub}</span></span>
</li>'''
tasks = ''.join([
    task('Czyszczenie boksów', '7 z 14 · do 10:00'),
    task('Woda w poidle · boks 9', '12:00'),
    task('Derki do pralni', 'zrobione 07:00', done=True),
])

card = 'background: #FFFCF7; border: 1px solid #E3D7C8; border-radius: 16px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px'
h2 = 'margin: 0; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; letter-spacing: 0.02em'

