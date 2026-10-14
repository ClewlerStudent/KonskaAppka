---
id: WEB-021
title: Rutyna obsługi w panelu i na TV
area: web
stage: 6
size: M
status: todo
depends_on: [BE-044, BE-045, WEB-011, WEB-016, WEB-015, WEB-017, WEB-018]
decisions: [DEC-31, DEC-18]
owner:
branch:
trello:
---
# WEB-021 · Rutyna obsługi w panelu i na TV

## Cel
Panel i telewizor pokazują stan rutyny obsługi zapisany przyciskami w apce i na tabletach: „Boks gotowy HH:MM” przy boksie, „Poidło ręczne · woda HH:MM”, posiłki i padok hali, ostatnie akcje. Przy wyłączonych przyciskach w stajni te elementy znikają razem ze stanem.

## Kontekst
- **Stan kodu:** PanelBoksy z miejscem na dodatkowe kolumny (WEB-011), kafle, nagłówki hal i „Dziś w stajni” na TV (WEB-016, WEB-017), konfiguracja stajni z `GET /stables/v1/stables/{id}/features` (BE-030; dla TV sekcje według `features` roli `display`).
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 („Boks gotowy” jako kolumna; znacznik „Poidło ręczne · woda HH:MM” tylko przy poidle ręcznym; PanelBoksyBezAkcji bez kolumny i z kartą „Przyciski obsługi” tylko z „Woda” i linią o wyłączonych przyciskach), 3.5.4 (nagłówek hali „Śniadanie podane 06:40 · padok 10:00”, kafle „Boks gotowy HH:MM” i padok z godzinami, „Ostatnie akcje”, WyswietlaczHalaBezAkcji), A-13, A-16, A-19. BE-045: rozszerzenia `boxes-overview` (najnowszy niecofnięty „Boks gotowy” z osobą albo „z tabletu”, godzina wody) i `display` (rutyna w nagłówku hali, kafle, „Ostatnie akcje”, „podane HH:MM” w planie dnia); BE-044: zapisy (`box_care_events`, `building_routines`).
- **Makiety:** mockups/project/PanelBoksy.dc.html (kolumna „Boks gotowy”: „dziś 07:02 · z tabletu”, „wczoraj 16:10 · Piotr”; karta „Przyciski obsługi”: „Boks gotowy”, „Podano śniadanie · obiad · kolację”, „Wyprowadzono na padok”, „Woda”, „Każdą akcję można cofnąć przez godzinę”), PanelBoksyBezAkcji.dc.html („Boks gotowy, posiłek i padok są wyłączone w ustawieniach tej stajni. · Ustawienia stajni”), WyswietlaczCentralny.dc.html (nagłówek hali „✓ Śniadanie 06:40 · Padok 10:00”, kafle „Boks gotowy 07:02 · w boksie / A 10–14 / B 10–14:30 / odwołany”, „Poidło ręczne 06:55”, „Ostatnie akcje: 07:14 Boks gotowy · nowa 5 …”, pasek pilnych „padok o 10:00”), WyswietlaczHala.dc.html, WyswietlaczHalaBezAkcji.dc.html.
- **Decyzje:** brak (DEC-18 „Cofnij” 1 h dotyczy zapisów w apce i na tablecie).
- **Dane demo:** seed rutyny: śniadanie Hala główna 06:40 (Ola, bez Kasztana), Hala nowa 06:50 (Piotr); „Boks gotowy” 7 z 14; woda Hala nowa · boks 5 06:55 z tabletu; wariant BezAkcji.

## Zakres
- [ ] PanelBoksy: kolumna „Boks gotowy” („dziś HH:MM · Ola” / „· z tabletu”, „wczoraj HH:MM”, data dla starszych; „Brak”) tylko przy `tidyEnabled`; znacznik „Poidło ręczne · woda HH:MM” w komórce boksu przy `autoWaterer = false` (bez osobnej kolumny).
- [ ] Karta „Przyciski obsługi” pod tabelą: tylko włączone przyciski (z `features`) i zawsze „Woda”; przy wszystkich trzech wyłączonych linia „Boks gotowy, posiłek i padok są wyłączone w ustawieniach tej stajni.” z linkiem „Ustawienia stajni” (WEB-014). Bez innych objaśnień.
- [ ] TV, widok wszystkich hal i hali: w nagłówku hali „✓ Śniadanie 06:40 · Padok 10:00” (według stanu z odpowiedzi), na kaflu „Boks gotowy HH:MM” i padok („A 10–14”, „w boksie”, „padok odwołany”), „Poidło ręczne · woda HH:MM”; w pasku pilnych „padok o 10:00”, gdy dotyczy; „Ostatnie akcje” (lista z odpowiedzi); w „Dziś w stajni” „podane HH:MM” i liczby koni.
- [ ] Wszystko według odpowiedzi i `features`: element wyłączonej opcji nie występuje (bez pustych miejsc), „Woda” zostaje.
- [ ] Odświeżenie: PanelBoksy co 30 s z ETag (jak WEB-015), TV co 10 s (WEB-016).

## Poza zakresem
- Zapisywanie akcji z panelu (brak przycisków na makietach panelu); ListaDnia i tablet (MOB-016, TAB-018); zadania na TV (WEB-023).

## Kryteria akceptacji
- [ ] A-13: PanelBoksy pokazuje „dziś 07:02 · z tabletu” przy Hala główna · boks 1; TV Hala główna „✓ Śniadanie 06:40 · Padok 10:00”, Kasztan „B 10–14:30”.
- [ ] A-16: tylko Hala nowa · boks 5 ma „Poidło ręczne · woda 06:55” w panelu i na TV; po przestawieniu poidła na automatyczne (WEB-012) znacznik znika przy następnym odpytaniu.
- [ ] A-19 (BezAkcji): panel bez kolumny „Boks gotowy” i z kartą tylko z „Woda” i linią z linkiem; TV Hala nowa bez „Boks gotowy” i padoku, nagłówek hali bez rutyny, „Dziś w stajni” tylko z posiłkami, „Ostatnie akcje”: „06:55 Woda · boks 5”, „01:20 Nowa flaga „Nie na padok” · boks 4”.
- [ ] Bez siana i karmy jako zdarzeń i bez posiłku odhaczanego per koń.

## Testy
- Vitest: komórka „Boks gotowy” (autor, tablet, daty), karta przycisków dla kombinacji ustawień, elementy kafla TV dla fixture'ów Pod Lipami i BezAkcji.
- Playwright na atrapie `mock-api` (WEB-004) z fixture'ami `frontend/web/src/test/fixtures/` (Pod Lipami i BezAkcji, pisane ręcznie według docs/development-szczegoly.md 3.2) i przykładami `display-*` z BE-064: A-13, A-16, A-19 w panelu i na TV (projekt `tv`); aktualizacja wzorców `toHaveScreenshot` z WEB-016, WEB-017 i WEB-018 (makiety tylko do ręcznego przeglądu w PR).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-045; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Autor wpisu z tabletu: „z tabletu” (bez osoby); z zespołu EQUENOR: „Zespół EQUENOR”.
- Na TV bez imion osób także przy rutynie (sam stan i godzina).
