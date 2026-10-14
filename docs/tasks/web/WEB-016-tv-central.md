---
id: WEB-016
title: "Wyświetlacz: WyswietlaczCentralny"
area: web
stage: 5
size: L
status: todo
depends_on: [BE-042, WEB-001, WEB-004]
decisions: [DEC-14, DEC-29]
owner:
branch:
trello: https://trello.com/c/2svfgPbk
---
# WEB-016 · Wyświetlacz: WyswietlaczCentralny

## Cel
Telewizor w korytarzu stajni loguje się zwykłą stroną panelu kontem technicznym z rolą Wyświetlacz i od razu pokazuje tablicę wszystkich hal: zegar, „Teraz” i następny posiłek, pasek pilnych flag, kafle boksów z flagami i godzinami oraz „Dziś w stajni”. Tablica sama się odświeża co 10 s i nie pokazuje danych osobowych.

## Kontekst
- **Stan kodu:** trasa-zaślepka `/display` i routing `startView = display` (WEB-001), sesja z cichym odświeżaniem (TV: sesja 30 dni bezczynności / 365 dni), `createServiceClient` z dostępem do `ETag` i `Date` (CORS z WEB-001), tokeny `frontend/src/theme` (LCD), fonty lokalne `src/theme/fonts.css`.
- **Dokumenty:** docs/development-szczegoly.md 3.5.4 (WyswietlaczCentralny: nagłówek, pasek pilnych, sekcje hal z „Pełny ekran”, kafle bez posiłków per koń, „Dziś w stajni”; kolory: bez pól w akcencie, kafel krytyczny `crit-solid` z ramką 3 px `crit-line`, niepotwierdzony 3 px `warn-line` na `warn-tint-weak`, wolny przerywana 2 px `line-strong` na `bg`, `tabular-nums`; odpytywanie co 10 s z ETag; zegar z przesunięcia względem `Date`; przy jednej hali bez sekcji, „Pełny ekran” i przełącznika), 4.1 „widok wyświetlacza w panelu”, A-08, A-24. docs/mikroserwisy.md 9.4, 5.4. BE-042: `GET /board/v1/stables/{stableId}/display?buildingId=&lang=` (nagłówek „Teraz”, następny posiłek; `urgent`; hale z liczbami i kaflami: numer, hala, koń, flagi z `hoursLabel` i statusem, „wolny”, znacznik „Poidło ręczne”; `otherBuildings`; `today` z posiłkami, padokami, wizytami i jazdami bez opisów; `singleBuilding`; ETag/304; bez danych osobowych).
- **Makiety:** docs/mockups/project/WyswietlaczCentralny.dc.html (generowany z docs/mockups/tools/gen): „EQUENOR · wszystkie hale · Stajnia Pod Lipami”, „Teraz: po śniadaniu”, „Następny posiłek: obiad 12:00 · za 4 h 45 min”, „07:15”, „wtorek, 13 października”; pasek „NIEPOTWIERDZONA · Hala nowa · boks 4 · Bella · Nie na padok · dziś, cały dzień · ustawiona 01:20 · admin powiadomiony”; „Hala główna · boksy 1–8 · 7 koni · 1 wolny · 1 krytyczna · Pełny ekran”; kafle „7 · Kasztan · Bez śniadania · 06:00–10:00 · potwierdzona · od 14:30 · Nie na padok”, „3 · Wolny”; „Dziś w stajni”: „06:30 Śniadanie”, „08:00 Weterynarz · Kasztan · główna 7”, „10:00 Padoki”, „12:00 Obiad · 12 koni”, „15:00 Kowal”, „16:00 Jazda · Iskra · kryta ujeżdżalnia”. WyswietlaczLogowanie.dc.html i WyswietlaczKod.dc.html = PanelLogowanie i PanelLogowanieKod.
- **Decyzje:** DEC-14 A (wizyty i jazdy w „Dziś w stajni” jako część `routine`).
- **Dane demo:** „Telewizor korytarz” (Pod Lipami, e-mail tv.korytarz@stajnielipowe.pl, w UI t•••@stajnielipowe.pl), funkcje `flags, feeding_plan, routine, tasks`; Brzozowa bez wyświetlacza (test jednej hali na fixture z kontem `display`).

## Zakres
- [ ] `web/src/features/display/DisplayScreen.tsx` na `/display` (tylko konto `display`; inne role → `homePath`): pełnoekranowy układ bez nagłówka panelu, projektowany na 1920×1080 i skalowany do 1280×720 i 3840×2160 (jednostki względne do szerokości/wysokości okna).
- [ ] `usePolledBoard(url, 10_000)`: `If-None-Match` z ostatnim `ETag`, 304 nie zmienia stanu (brak przerysowania), 200 podmienia dane; zapis czasu ostatniej udanej odpowiedzi; przesunięcie zegara z nagłówka `Date`; stajnia z `GET /me` (jedna stajnia konta technicznego), `lang` z `GET /me` `locale` (PL domyślnie).
- [ ] Nagłówek: znak, „wszystkie hale”, nazwa stajni, „Teraz: …”, „Następny posiłek: … · za X h Y min” (liczone lokalnie od zegara serwera), duży zegar HH:MM i data słownie w strefie stajni.
- [ ] Pasek pilnych (`urgent`): status „NIEPOTWIERDZONA” albo krytyczna, boks z halą, koń, flaga, godziny, „ustawiona HH:MM”, „admin powiadomiony”.
- [ ] Sekcje hal: nagłówek z liczbami („boksy 1–8 · 7 koni · 1 wolny · 1 krytyczna / 1 niepotwierdzona”) i przyciskiem „Pełny ekran” (działanie w WEB-017); kafle w siatce: numer (z halą przy kilku halach), koń, flagi z godzinami i statusem tylko przy `requiresAck`, wolny boks, znacznik „Poidło ręczne”. Style kafli według 3.5.4.
- [ ] „Dziś w stajni” z `today`: godzina, typ, koń z boksem, miejsce; bez opisów i osób. Sekcje według `features` roli `display` (brak `routine` → brak „Dziś w stajni”).
- [ ] Jedna hala (`singleBuilding`): bez sekcji, „Pełny ekran” i przełącznika, sam numer boksu.
- [ ] Logowanie TV: zwykły PanelLogowanie → PanelLogowanieKod; po kodzie od razu `/display`; e-mail tylko zamaskowany; fokus 3 px widoczny (pilot przez CEC).

## Poza zakresem
- Pełny ekran hali, przełącznik i zapamiętany wybór (WEB-017); brak połączenia, strony co 20 s, stany wylogowany/zablokowany/start, regresja wizualna i skan PII (WEB-018); rutyna, „Boks gotowy”, woda, ostatnie akcje (WEB-021); zadania (WEB-023); stajnia zawieszona (WEB-025); Raspberry Pi (WEB-019).

## Kryteria akceptacji
- [ ] A-24: konto „Telewizor korytarz” loguje się e-mailem, hasłem i kodem MFA z e-maila na zwykłej stronie logowania i od razu widzi tablicę wszystkich hal.
- [ ] A-08: Hala główna „7 koni · 1 wolny · 1 krytyczna”, Hala nowa „5 koni · 1 wolny · 1 niepotwierdzona”; każdy kafel z halą przy numerze; tylko Hala nowa · boks 5 ze znacznikiem „Poidło ręczne”.
- [ ] Odpytywanie co 10 s (sztuczny zegar Playwright `page.clock`): odpowiedź 304 nie zmienia DOM; zmiana flagi w atrapie pojawia się w ≤ 10 s.
- [ ] Zegar zgodny z `Date` serwera mimo przestawionego zegara przeglądarki.
- [ ] Brzozowa-fixture (jedna hala): bez sekcji i „Pełny ekran”.
- [ ] Brak pól w kolorze akcentu; liczby z `tabular-nums`; brak żądań do zewnętrznych hostów (fonty lokalne).

## Testy
- Vitest: `usePolledBoard` (ETag, 304, przesunięcie zegara), wyliczenie „za X h Y min” w strefie stajni (noc 25.10.2026), składanie kafli z fixture'ów.
- Playwright: projekt `tv` (1920×1080) na atrapie `mock-api` (WEB-004) z przykładami kontraktu `display-podlipami`, `display-podlipami-hala-nowa`, `display-brzozowa` (`frontend/src/api/examples/board/`, BE-064): A-08, odpytywanie z `page.clock`, logowanie TV na atrapie `mock-auth`; wzorzec zrzutu `toHaveScreenshot` tworzony w tym zadaniu (WyswietlaczCentralny.dc.html tylko do ręcznego przeglądu w MR).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-042; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Strona nie rozpoznaje telewizora: o widoku decyduje tylko rola z `GET /me`.
- Każdy zapis kontem `display` daje 403: widok nie ma żadnych przycisków zapisu.
- Bez danych osobowych w DOM i logach konsoli (także w `title`, `aria-label`).
