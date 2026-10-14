---
id: BE-033
title: "board: szkielet serwisu i widoki admina (boksy, konie, pierwsze kroki)"
area: backend
stage: 2
size: M
status: todo
depends_on: [BE-030, BE-032]
decisions: []
owner:
branch:
trello:
---
# BE-033 · board: szkielet serwisu i widoki admina (boksy, konie, pierwsze kroki)

## Cel
Powstaje serwis `board`: tylko odczyt, składa ekrany z tabel innych serwisów przy każdym zapytaniu, z ETag i 304. Na start trzy widoki: lista boksów i koni admina (PanelBoksy, BoksyAdmin, liczniki), lista koni obsługi (StajennyKonie) i „Pierwsze kroki” nowej stajni (PanelPulpitStart, z pozycją „Dokończ zakładanie stajni”). Kolejne zadania dokładają flagi i rutynę.

## Kontekst
- Stan kodu: wzór serwisu `auth` i `stables` (BE-029); tabele `stables`, `stable_settings`, `notification_rules`, `buildings`, `boxes`, `horses`, `horse_box_history` (BE-004, dane z BE-029–BE-032), `flag_templates`, `meal_slots` (BE-028); `stableFeatures` (BE-007); polityka z `feature` i `TenantScope` (BE-006); rola bazy `eq_board` tylko `SELECT`, bez tabel prywatnych `auth` (BE-003).
- Dokumenty: `docs/mikroserwisy.md` 5.4 (bez tabel; ETag = hash treści, 304; ścieżki z prefiksem stajni; język w zapytaniu; dane o ludziach aplikacja dociąga z `auth`, `board` nie woła `auth`; tabela tras: `GET …/boxes-overview` admin, `GET …/horses-overview` obsługa i admin, `GET …/setup-checklist` admin), 10.2 pkt 22 (stan „Pomiń” nie ma gdzie się zapisać); `docs/development-szczegoly.md` 3.3 board (ETag i czas serwera w nagłówku, cała odpowiedź przy każdym zapytaniu, konfiguracja zmienia ETag, sortowanie naturalne numerów), 3.5.3 (PanelBoksy).
- Makiety: `PanelBoksy.dc.html` („2 hale · 14 boksów · 13 koni”, liczniki Boksy 14, Konie w boksach 12, Konie bez boksu 1, Wolne boksy 2; sekcje hal „boksy 1–8 · 7 koni · 1 wolny” z adresem; kolumny Boks, Koń, Klient, Aktywne flagi, Boks gotowy), `BoksyAdmin.dc.html` (filtry Wszystkie · Z koniem · Wolne · Koń bez boksu), `StajennyKonie.dc.html` („Konie w stajni … wg boksu”, „Główna 1 · Iskra”, „Bez boksu · Luna”), `PanelPulpitStart.dc.html` („Pierwsze kroki · 3 z 8”: Stajnia, Boksy 1–6 z poidłem, Powiadomienia, Ustawienia stajni „Sprawdź”, Dodaj konia „0 z 6 boksów zajętych”, Ludzie, Tablety, Wyświetlacz „Pomiń”; „Dziś w stajni 06:30 · 12:00 · 18:00”).
- Decyzje: brak (DEC-14 dotyczy widoku TV, BE-042).
- Dane demo: Pod Lipami (dwie hale), Brzozowa (jedna hala: bez nazwy hali przy numerze), nowa stajnia bez koni.

## Zakres
- [ ] Serwis `backend/src/services/board/{main,app,env,deps}.ts`, skrypty `dev:board`, `serve:board`, `start:board`; kontrakty `contracts/board.ts` → `openapi/board.json`; port dev (propozycja) 4040; połączenie rolą tylko do odczytu.
- [ ] Wspólny mechanizm odpowiedzi: treść → `ETag` (skrót SHA-256 kanonicznego JSON), `If-None-Match` → 304, nagłówek `Date` z zegara serwisu (czas nie w treści), `Cache-Control: no-cache`.
- [ ] `GET /board/v1/stables/{stableId}/boxes-overview` (admin): `buildingCount`, liczniki, hale (`id`, `name`, adres, `boxRange`, liczby), boksy (DTO boksu z BE-031 + `horse: { id, name } | null`), konie bez boksu; sortowanie hal po `sort_order`, boksów naturalnie (2 przed 10). Pola na flagi i „Boks gotowy” jako opcjonalne (wypełnią BE-038 i BE-045).
- [ ] `GET …/horses-overview` (obsługa i admin; obsługa tylko w stajni z `m`): konie aktywne z boksem i halą, konie bez boksu na końcu; bez danych klientów (te panel i apka biorą z `auth …/horse-clients`).
- [ ] `GET …/setup-checklist` (admin): pozycje domenowe stajni: dane stajni i pierwsza hala z adresem i strefą, boksy (liczba, poidło), reguły powiadomień (skrót kanałów), ustawienia (zawsze „Sprawdź”), konie („N z M boksów zajętych”), `operationsDefaults` (`missing`, gdy stajnia nie ma szablonów flag: panel pokazuje „Dokończ zakładanie stajni” i woła `POST /stables/v1/stables/{id}/setup/retry`), plan dnia z `meal_slots`. Pozycje o ludziach, tabletach i wyświetlaczu panel liczy z `auth` (bez stanu „Pomiń” na serwerze).
- [ ] Sekcje według `stableFeatures` i `m[].f` (ukryta funkcja znika z odpowiedzi); stajnia `suspended`: na razie tylko pole `status`.

## Poza zakresem
- Flagi w widokach (BE-038), tablica tabletu i „Zmień boks” (BE-041), wyświetlacz (BE-042), rutyna i lista dnia (BE-045), zawieszona stajnia (BE-054); ekrany (WEB-010, WEB-011, MOB-009).

## Kryteria akceptacji
- [ ] Pod Lipami: `boxes-overview` daje 2 hale, 14 boksów, 13 koni, 1 bez boksu (Luna), 2 wolne (Hala główna · 3, Hala nowa · 6), oba boksy „4” z różnymi `id` i halą.
- [ ] Brzozowa: `buildingCount = 1`; drugie zapytanie z `If-None-Match` → 304; po dodaniu konia ETag się zmienia.
- [ ] Nowa stajnia bez szablonów flag: `setup-checklist` ma `operationsDefaults: 'missing'`; po `setup/retry` znika.
- [ ] Ola: `horses-overview` w Pod Lipami 200, `boxes-overview` 403; Paweł w Pod Lipami 404; rola bazy `board` nie ma zapisu ani dostępu do tabel prywatnych `auth`.

## Testy
- `backend/src/services/board/*.test.ts` na harnessie z seedem: treść widoków (migawki), ETag i 304, sortowanie naturalne, uprawnienia; test, że serwis łączy się rolą bez zapisu (po BE-003). `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; README (uruchomienie `board`, porty); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `board` nie woła `auth` ani innych serwisów i nie ma tabel; stan liczy z bazy przy każdym zapytaniu (bez cache tablic).
- Imiona klientów i liczba osób nie pochodzą z `board` (tabele prywatne `auth`).
- Hala przy numerze tylko przy kilku halach: odpowiedź niesie `buildingCount`, a etykietę „Hala nowa · boks 4” składa aplikacja.
