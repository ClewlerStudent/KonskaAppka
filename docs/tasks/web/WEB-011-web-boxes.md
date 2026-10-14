---
id: WEB-011
title: PanelBoksy
area: web
stage: 2
size: L
status: todo
depends_on: [BE-031, BE-033, BE-022, BE-024, WEB-004]
decisions: []
owner:
branch:
trello: https://trello.com/c/OK7FfKP2
---
# WEB-011 · PanelBoksy

## Cel
Admin widzi wszystkie boksy stajni pogrupowane w hale (z adresem hali), z koniem i klientem w każdym boksie, wolne boksy i konie bez boksu, z licznikami, filtrami i wyszukiwarką. To główny ekran pracy admina w panelu i punkt wejścia do dodawania hal, boksów i koni.

## Kontekst
- **Stan kodu:** zaślepka `/stables/$stableId/boxes` (WEB-004), `DataTable` z sekcjami, `FilterChips`, `SearchField`, `StatCard`, `boxLabel`, `formatInStableTz` z WEB-004.
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 „PanelBoksy” (liczniki, filtry i wyszukiwarka, kolumny Boks, Koń, Klient (właściciel albo dzierżawca), Aktywne flagi, Boks gotowy, Akcje; sekcje hal z adresem; konie bez boksu „Luna, klient Marek Nowak, zaproszenie czeka”; hala przy numerze przy kilku halach), 4.1 „Panel web” (wyszukanie „4” zwraca dwa boksy z nazwami hal). docs/mikroserwisy.md 5.4 (dane o ludziach aplikacja dociąga z `auth`, `board` nie woła `auth`). BE-033: `GET /board/v1/stables/{stableId}/boxes-overview` (`buildingCount`, liczniki, hale z `id`, nazwą, adresem, `boxRange`, liczbami; boksy z DTO BE-031 + `horse | null`; konie bez boksu; ETag). BE-024: `GET /auth/v1/stables/{stableId}/horse-clients` (imiona klientów przy koniach). BE-022: `GET …/invitations?status=pending` (klient z koniem „zaproszenie czeka”).
- **Makiety:** mockups/project/PanelBoksy.dc.html: H1 „Boksy i konie”, „2 hale · 14 boksów · 13 koni · stan na wt 13.10.2026, 07:15”, „Dodaj halę”, „Dodaj konia”, „Dodaj boks”; kafle „Boksy 14 | Konie w boksach 12 | Konie bez boksu 1 | Wolne boksy 2”; filtr „Hala: Wszystkie hale | Hala główna | Hala nowa”, chipy „Wszystkie · 14 | Z flagą · 4 | Wolne · 2”, „Szukaj boksu, konia lub osoby”; sekcja „Hala główna · boksy 1–8 · 7 koni · 1 wolny · ul. Lipowa 12, Konstancin-Jeziorna · Edytuj halę”; wiersze „Boks 1 · Iskra · Karolina W. · … · Flaga · Przenieś · Szczegóły”, „Boks 3 · Wolny · Przypisz konia · Szczegóły”; stopka „Pokazano 6 z 14 boksów.”; sekcja „Konie bez boksu · wolne boksy: główna 3, nowa 6 · Luna · Dodana 12.10 · bez boksu · Klient: Marek Nowak · zaproszenie czeka · Wybierz boks · Przypisz boks”. PanelBoksyBezAkcji.dc.html (bez kolumny „Boks gotowy”).
- **Decyzje:** brak.
- **Dane demo:** Pod Lipami: Hala główna 1–8 (Iskra 1, Dukat 2, wolny 3, Sonata 4, Wicher 5, Fala 6, Kasztan 7, Hetman 8), Hala nowa 1–6 (Grom, Mgła, Rumba, Bella, Bursztyn, wolny 6), Luna bez boksu; klienci Anna (Kasztan, Bella), Karolina W. (Iskra), Tomasz L. (Grom), Ewa K. (Sonata). Brzozowa: jedna hala, boksy 1–6.

## Zakres
- [ ] `web/src/features/boxes/BoxesScreen.tsx` na `/stables/$stableId/boxes`: nagłówek z podtytułem (liczby + „stan na …” w strefie stajni), przyciski „Dodaj halę”, „Dodaj boks” (cele z WEB-012; do tego czasu ukryte), „Dodaj konia” (WEB-013; do tego czasu ukryty), kafle liczników.
- [ ] Dane: `boxes-overview` (ETag; odświeżenie przy powrocie na kartę i po zapisach), `horse-clients` (kolumna Klient: imiona; kilku klientów po przecinku), `invitations` (`pending` z `horseId` → „zaproszenie czeka” przy koniu). Brak klienta: „—”.
- [ ] Tabela w sekcjach hal (kolejność hal z odpowiedzi): kolumny Boks, Koń, Klient, Akcje; kolumny „Aktywne flagi” i „Boks gotowy” dokładają WEB-015 i WEB-021 (komponent przyjmuje dodatkowe kolumny). Wolny boks: „Wolny”, akcja „Przypisz konia”; zajęty: „Przenieś”, „Szczegóły”. Akcje do formularzy z WEB-012/WEB-013 przez wspólne zdarzenia (np. `openBoxDetails(boxId)`), do czasu ich realizacji ukryte.
- [ ] Przy jednej hali (Brzozowa): bez nagłówków sekcji i bez filtra hali, sam numer boksu; przy kilku: hala przy numerze w wynikach wyszukiwania i filtrach.
- [ ] Filtry po stronie klienta: hala, chipy „Wszystkie”, „Wolne” (i „Z flagą” po WEB-015), wyszukiwarka po numerze („4” → oba boksy 4 z halami), koniu i kliencie; licznik „Pokazano N z M boksów.”; stan filtrów w parametrach URL (`?building=&q=&chip=`).
- [ ] Sekcja „Konie bez boksu” z listą wolnych boksów („wolne boksy: główna 3, nowa 6”), klientem i „zaproszenie czeka”; „Przypisz boks” dokłada WEB-013.
- [ ] Wersja 390 px: hale jako grupy kart (boks z halą, koń, klient, menu akcji), bez poziomego przewijania.

## Poza zakresem
- Flagi, alert niepotwierdzonej flagi i chip „Z flagą” (WEB-015); „Boks gotowy”, znacznik wody, karta „Przyciski obsługi” (WEB-021); formularze hal, boksów i szczegóły boksu (WEB-012); konie: dodanie, przeniesienie, przypisanie (WEB-013); akcja „Flaga” (brak planszy panelu, P3).

## Kryteria akceptacji
- [ ] Pod Lipami: kafle 14 / 12 / 1 / 2, dwie sekcje z adresami, Luna w „Konie bez boksu” z „Marek Nowak · zaproszenie czeka”.
- [ ] A-10: wyszukanie „4” daje „Hala główna · boks 4 · Sonata” i „Hala nowa · boks 4 · Bella”.
- [ ] Brzozowa: lista boksów 1–6 bez nazwy hali.
- [ ] Nowa hala dodana przez API pojawia się po odświeżeniu (zmiana ETag).
- [ ] Obsługa i klient nie mają ekranu (WEB-004), API daje 403.
- [ ] 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: funkcje filtrów i wyszukiwarki, łączenie `boxes-overview` z `horse-clients` i zaproszeniami (fixture'y Pod Lipami i Brzozowej), widok jednej hali.
- Playwright na atrapie (`e2e/helpers/mock-api.ts` z WEB-004 + fixture `frontend/web/src/test/fixtures/boxes-overview.ts` pisany ręcznie według docs/development-szczegoly.md 3.2, stałe UUID z `fixtures/demo.ts`): liczniki, wyszukiwanie „4”, filtr hali; zrzuty 1440 i 390 jako wzorce `toHaveScreenshot` tworzone w tym zadaniu (PanelBoksy.dc.html tylko do ręcznego przeglądu w PR).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-033; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Boks zawsze po `boxId`; numer tylko do wyświetlania (`boxes.label` nie jest unikalny).
- Bez opisów pod kartami (mockup ma zdania objaśniające, ale docs/makiety-plan.md 2.3 i 5 pkt 38 ma pierwszeństwo).
- Zmiana zależności względem listy: dodane BE-022 i BE-024 (kolumna Klient i „zaproszenie czeka” pochodzą z `auth`).
