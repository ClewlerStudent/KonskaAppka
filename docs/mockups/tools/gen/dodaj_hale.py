# Generates the web panel "Nowa hala" drawer mockup on top of the boxes page.
import re, sys
src = open(sys.argv[1], encoding='utf-8').read().split('\n')
out = sys.argv[2]
header = '\n'.join(src[18:41])          # <header> … </header>
nav = '\n'.join(src[44:67])             # <nav> … </nav>
# make "Boksy" the current page instead of "Płatności"
nav = nav.replace(' aria-current="page" style="position: relative; min-height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-radius: 12px; border: 1px solid #E3D7C8; background: #FFFCF7; font-size: 15px; font-weight: 700; text-decoration: none; color: {{accent}}">\n<span aria-hidden="true" style="position: absolute; left: -1px; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: {{accent}}"></span>',
                  ' style="min-height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-radius: 12px; border: 1px solid transparent; font-size: 15px; font-weight: 600; text-decoration: none; color: #6B5C50">', 1)
first_boksy = '<li><a href="PanelBoksy.dc.html" style="min-height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-radius: 12px; border: 1px solid transparent; font-size: 15px; font-weight: 600; text-decoration: none; color: #6B5C50">'
assert nav.count(first_boksy) == 2
nav = nav.replace(first_boksy, '<li><a href="PanelBoksy.dc.html" aria-current="page" style="position: relative; min-height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-radius: 12px; border: 1px solid #E3D7C8; background: #FFFCF7; font-size: 15px; font-weight: 700; text-decoration: none; color: {{accent}}">\n<span aria-hidden="true" style="position: absolute; left: -1px; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: {{accent}}"></span>', 1)

PIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>'
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
INFO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>'
X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>'

lab = 'display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600'
inp = 'min-height: 44px; box-sizing: border-box; padding: 0 12px; border-radius: 12px; border: 1px solid #D9CBB9; background: #FFFCF7; font: inherit; font-size: 15px; font-weight: 400; color: #3A2E26'
hint = 'font-size: 13px; font-weight: 400; color: #6B5C50'
def field(label, value, req=True, hint_txt='', width=None):
    star = ' <span aria-hidden="true" style="color: #974A3D">*</span>' if req else ' <span style="font-weight: 400; color: #6B5C50">(opcjonalnie)</span>'
    w = f'; width: {width}' if width else ''
    h = f'\n<span style="{hint}">{hint_txt}</span>' if hint_txt else ''
    return f'<label style="{lab}{w}">\n<span>{label}{star}</span>\n<input type="text" value="{value}"{" required" if req else ""} style="{inp}">{h}\n</label>'

def radio(label, sub, checked=False):
    dot = ('border: 6px solid {{accent}}; background: #FFFCF7' if checked else 'border: 2px solid #D9CBB9; background: #FFFCF7')
    box = ('border: 1px solid {{accent}}; background: #FFFCF7' if checked else 'border: 1px solid #E3D7C8; background: #FFFCF7')
    return f'''<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 12px; {box}">
<input type="radio" name="boksy"{" checked" if checked else ""} style="position: absolute; opacity: 0; width: 1px; height: 1px">
<span aria-hidden="true" style="margin-top: 2px; width: 20px; height: 20px; flex: none; box-sizing: border-box; border-radius: 10px; {dot}"></span>
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 700">{label}</span><span style="{hint}">{sub}</span></span>
</label>'''

drawer = f'''<aside role="dialog" aria-modal="true" aria-labelledby="nowa-hala-tytul" style="position: absolute; top: 0; right: 0; bottom: 0; width: 520px; max-width: 100%; box-sizing: border-box; background: #F6F1EA; border-left: 1px solid #E3D7C8; display: flex; flex-direction: column">
<header style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 24px 12px; border-bottom: 1px solid #E3D7C8; background: #FFFCF7">
<div style="display: flex; flex-direction: column; gap: 2px">
<h2 id="nowa-hala-tytul" style="margin: 0; font-size: 22px; font-weight: 700; line-height: 28px">Nowa hala</h2>
<span style="{hint}">Stajnia Pod Lipami · hale: Hala główna, Hala nowa</span>
</div>
<a href="PanelBoksy.dc.html" aria-label="Zamknij" style="width: 44px; height: 44px; border-radius: 22px; border: 1px solid #E3D7C8; background: #FFFCF7; color: #3A2E26; display: flex; align-items: center; justify-content: center">{X}</a>
</header>

<form style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 16px; padding: 16px 24px">
{field('Nazwa hali', 'Hala zachodnia', hint_txt='Inna niż nazwy pozostałych hal. Widać ją na tabletach i wyświetlaczu.')}

<fieldset style="margin: 0; padding: 0; border: none; display: flex; flex-direction: column; gap: 10px">
<legend style="padding: 0; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700">{PIN}Adres hali</legend>
<label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #3A2E26">
<input type="checkbox" style="width: 18px; height: 18px; margin: 0; accent-color: {{{{accent}}}}">
Taki sam adres jak inna hala
</label>
{field('Ulica i numer', 'ul. Leśna 8')}
<div style="display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 10px">
{field('Kod pocztowy', '05-520')}
{field('Miejscowość', 'Konstancin-Jeziorna')}
</div>
</fieldset>

<fieldset style="margin: 0; padding: 0; border: none; display: flex; flex-direction: column; gap: 8px">
<legend style="padding: 0; margin-bottom: 8px; font-size: 15px; font-weight: 700">Boksy w hali</legend>
{radio('Dodaj nowe boksy', 'Każda hala numeruje boksy od siebie.', True)}
<div style="display: flex; align-items: flex-end; gap: 10px; padding: 0 0 0 42px">
{field('Od numeru', '1', width='120px')}
{field('Do numeru', '8', width='120px')}
<span style="display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 10px; border-radius: 10px; background: #EFE5D8; color: #6E4529; font-size: 13px; font-weight: 700">8 boksów: 1–8</span>
</div>
{radio('Przenieś istniejące boksy', 'Koń, historia i zdarzenia zostają przy boksie.')}
{radio('Bez boksów na razie', 'Boksy dodasz później w tej hali.')}
</fieldset>

<div style="display: flex; gap: 10px; padding: 12px 14px; border-radius: 14px; background: #E6E7E4; color: #4E5960; font-size: 13px; line-height: 1.4">
{INFO}
<span>Po zapisaniu tablety pokażą zakładkę „Hala zachodnia” w „Zmień boks”, a wyświetlacz doda sekcję tej hali przy najbliższym odświeżeniu. Płatności liczą boks dopiero wtedy, gdy stoi w nim koń.</span>
</div>
</form>

<footer style="display: flex; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-top: 1px solid #E3D7C8; background: #FFFCF7">
<a href="PanelBoksy.dc.html" style="min-height: 44px; box-sizing: border-box; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 12px; border: 1px solid #E3D7C8; background: #FFFCF7; color: #3A2E26; text-decoration: none; font-size: 14px; font-weight: 600">Anuluj</a>
<button type="submit" style="min-height: 44px; padding: 0 18px; border-radius: 12px; border: none; background: {{{{accent}}}}; color: #FFFFFF; font: inherit; font-size: 14px; font-weight: 700">Dodaj halę i 8 boksów</button>
</footer>
</aside>'''

def ghost_row(w):
    return f'<div style="height: 44px; border-bottom: 1px solid #E3D7C8; display: flex; align-items: center; gap: 16px; padding: 0 14px"><span style="width: 36px; height: 28px; border-radius: 10px; background: #EFE5D8"></span><span style="width: {w}px; height: 12px; border-radius: 6px; background: #EFE5D8"></span><span style="width: 120px; height: 12px; border-radius: 6px; background: #F1E9DD"></span></div>'

page_main = f'''<main aria-hidden="true" style="flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 4px">
<h1 style="margin: 0; font-size: 26px; font-weight: 700; line-height: 32px">Boksy i konie</h1>
<p style="margin: 0; font-size: 14px; color: #6B5C50">2 hale · 14 boksów · 13 koni</p>
</div>
<div style="background: #FFFCF7; border: 1px solid #E3D7C8; border-radius: 16px; overflow: hidden">
<div style="padding: 10px 14px; background: #F6F1EA; border-bottom: 1px solid #E3D7C8; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase">Hala główna</div>
{ghost_row(90)}{ghost_row(70)}{ghost_row(110)}{ghost_row(80)}
<div style="padding: 10px 14px; background: #F6F1EA; border-bottom: 1px solid #E3D7C8; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase">Hala nowa</div>
{ghost_row(100)}{ghost_row(60)}{ghost_row(90)}
</div>
</main>'''

html = f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Nowa hala</title>
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
<div style="position: relative; width: 100%; min-height: 900px; box-sizing: border-box; background: #F6F1EA; color: #3A2E26; font-family: Figtree, system-ui, sans-serif; line-height: 1.3; overflow: hidden">

{header}

<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: 24px 20px 40px; display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start">
{nav}
{page_main}
</div>

<div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(58, 46, 38, 0.38)"></div>
{drawer}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"accent":{{"editor":"color","default":"#8B5E3C","options":["#8B5E3C","#7A6A4F","#8E5B52","#6F6A55"]}},"$preview":{{"width":1440,"height":900}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{ accent: this.props.accent ?? '#8B5E3C' }};
}}
}}
</script>
</body>
</html>
'''
open(out, 'w', encoding='utf-8').write(html)
print('written', len(html))
