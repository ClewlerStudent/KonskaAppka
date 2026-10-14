---
id: TAB-012
title: Odpytywanie tablicy i stany ekranu (offline, nieaktualne, zawieszona, aktualizacja)
area: tablet
stage: 4
size: M
status: todo
depends_on: [TAB-011]
decisions: [DEC-13]
owner:
branch:
trello:
---
# TAB-012 · Odpytywanie tablicy i stany ekranu (offline, nieaktualne, zawieszona, aktualizacja)

## Cel
Tablet co kilka sekund tanio sprawdza, czy coś się zmieniło (304 bez treści), więc nowa flaga z telefonu pojawia się przy boksie w kilkanaście sekund. Gdy sieć znika, tablet uczciwie mówi, z której godziny są dane, a po zbyt długiej przerwie, że są nieaktualne; po powrocie sieci wraca sam. Zawieszona stajnia i wymagana aktualizacja mają swoje ekrany.

## Kontekst
- **Stan kodu:** `BoardScreen` z TAB-011 (dane z jednego zapytania), sesja z TAB-009 (odświeżanie tokenu), klient API z TAB-001, watchdog z TAB-003 (`kiosk.alive()`, `kiosk.heartbeat()`). `board` z BE-041: ETag = hash treści, `If-None-Match` → 304 bez treści, czas serwera tylko w nagłówku `Date`, stan `suspended` w odpowiedzi.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Odpytywanie” (interwał według decyzji, `If-None-Match`, jitter i backoff; sprawdzić, czy 304 dociera do JS; czas z nagłówka serwera), „Stany ekranu” (wylogowany, bez boksu, wolny, zablokowany, brak uprawnień, stajnia zawieszona, brak sieci, wymagana aktualizacja), 3.1.5 (`client_upgrade_required`, `X-Client-Version`; bramka minimalnej wersji nie obejmuje tras wydań APK), 4.3.1 T-14 (AP wyłączony 1 min/10 min/2 h, WAN odcięty, roaming, straty pakietów; stopka „brak połączenia, dane z HH:MM”, powrót bez dotykania), T-16 (NTP, start bez sieci: `time_quality = unknown`), T-17 (fala powrotów: jitter rozkłada odpytywanie i odświeżanie tokenów), T-18 (opóźnienie flagi p95: interwał + render + odświeżenie EPD).
- **Makiety:** z `docs/makiety-plan.md` E: TabletOffline (stopka na pełną szerokość `t-warn`, czarny pogrubiony tekst, ramka 4 px: „BRAK POŁĄCZENIA · DANE Z 07:05 · NIEWYSŁANE: 1”; po progu „DANE NIEAKTUALNE”; start bez sieci „czas niepotwierdzony”; powrót do ONLINE bez dotykania), TabletZawieszona („SYSTEM NIEAKTYWNY”, bez flag i karmienia, bez instrukcji), TabletAktualizacja (pasek `t-warn` „WYMAGANA AKTUALIZACJA” na tablicy).
- **Decyzje:** DEC-13 A: odpytywanie co 5 s z jitterem, p95 opóźnienia flagi ≤ 15 s, „DANE NIEAKTUALNE” po 2 min bez udanego odpytania; kolejka zapisów offline (TAB-013).
- **Dane demo:** fixture'y z TAB-001 w trybie `fake` (z opóźnieniem i symulacją braku sieci), stos dev z SH-002.

## Zakres
- [ ] `tablet/src/board/usePolledBoard.ts`: pętla co 5 s ± losowy jitter (np. 0–1 s), `If-None-Match` z ostatnim ETag, 304 = brak zmiany stanu i brak renderu, 200 = nowe dane i nowy podpis koloru (TAB-008); przy błędach sieci i 5xx backoff wykładniczy z jitterem (5 s → 10 → 20 → 30 s maks.), po sukcesie powrót do 5 s; po 401 jedno odświeżenie tokenu (TAB-009) i powtórka; zapytanie tylko gdy jest boks, sesja i apka na pierwszym planie (kiosk: zawsze); przy starcie po restarcie pierwszy odpyt z losowym opóźnieniem 0–5 s (T-17).
- [ ] Czas: przesunięcie zegara z nagłówka `Date` każdej odpowiedzi (`serverOffset`), `timeQuality = synced` po pierwszej udanej odpowiedzi od startu, wcześniej `unknown`; zegar tablicy i „aktualne na HH:MM” liczone z czasu serwera w strefie stajni.
- [ ] Sprawdzenie 304: test instrumentowany/integracyjny, że `fetch` w React Native na Androidzie oddaje 304 do JS (bez cache OkHttp zamieniającego 304 na 200); jeśli nie, własne zapytanie natywne w module (opis w `tablet/docs/polling.md`).
- [ ] Stany i ich ekrany/paski w `tablet/src/screens/board/`:
  - `online`: stopka „ONLINE · aktualne na HH:MM”;
  - `offline` (≥ 1 nieudane odpytanie, < 2 min od ostatniego sukcesu): stopka `StatusField` uwaga na pełną szerokość „BRAK POŁĄCZENIA · DANE Z HH:MM · NIEWYSŁANE: N” (N z kolejki TAB-013), tablica z ostatnich danych, przyciski aktywne;
  - `stale` (≥ 2 min bez sukcesu): pasek „DANE NIEAKTUALNE” na pełną szerokość nad treścią, dane dalej widoczne;
  - `noClock` (start bez sieci, brak `Date` serwera): „czas niepotwierdzony” zamiast godziny;
  - `suspended` (odpowiedź `state = suspended`): pełny ekran „SYSTEM NIEAKTYWNY” bez flag i karmienia (TabletZawieszona);
  - `upgradeRequired` (`403 client_upgrade_required` z dowolnej trasy albo `mandatory` z `GET /platform/v1/tablet/latest`, TAB-017): pasek „WYMAGANA AKTUALIZACJA” nad tablicą; odpytywanie tablicy trwa, jeśli serwer ją jeszcze zwraca;
  - `notFound` (404 boksu) → TabletBoksNiedostepny (TAB-010).
- [ ] Sygnały dla watchdoga (TAB-003): `kiosk.alive()` co 30 s z pętli, `kiosk.heartbeat()` po każdej udanej odpowiedzi (200 albo 304).
- [ ] Metryki lokalne do diagnostyki (TAB-020): czas ostatniego sukcesu, liczba błędów z rzędu, udział 304, średni czas odpowiedzi, offset zegara.

## Poza zakresem
- Kolejka zapisów (TAB-013); pobieranie i instalacja aktualizacji (TAB-017); pop-upy (TAB-014).
- Pomiary T-14, T-17, T-18 na sprzęcie (testy po bramce, narzędzia TAB-021).

## Kryteria akceptacji
- [ ] Przy niezmienionych danych tablet dostaje 304 i nie renderuje ponownie (licznik renderów i `epdRefresh` stoją); zmiana flagi w trybie `fake` pojawia się w ≤ 6 s.
- [ ] Wyłączenie sieci emulatora: po pierwszym nieudanym odpytaniu stopka „BRAK POŁĄCZENIA · DANE Z HH:MM”, po 2 min „DANE NIEAKTUALNE”; po włączeniu sieci ONLINE bez dotykania (T-14 w zakresie emulatora).
- [ ] Odpowiedź `suspended` daje „SYSTEM NIEAKTYWNY” bez flag; `403 client_upgrade_required` daje pasek „WYMAGANA AKTUALIZACJA”.
- [ ] Zegar tablicy zgadza się z `Date` serwera przy przestawionym zegarze emulatora (`adb shell date`).
- [ ] 100 symulowanych tabletów (test jednostkowy harmonogramu) rozkłada pierwsze odpytania po restarcie na ≥ 5 s, a backoff nie synchronizuje ich ponownie.

## Testy
- Jest z fałszywymi timerami: interwał i jitter, backoff i powrót, przejścia stanów (online → offline → stale → online), offset zegara, `upgradeRequired`.
- Emulator: test 304 do JS i scenariusz wyłączenia sieci (Maestro `tablet/e2e/maestro/offline.yaml`).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; `tablet/docs/polling.md` (interwały, progi, stany); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Interwał 5 s i próg 2 min to wartości z DEC-13 (do potwierdzenia po pomiarach T-18): trzymaj je w jednym pliku konfiguracji.
- Brak sieci nie wylogowuje i nie czyści danych; czyści je tylko `access_revoked`/`session_revoked` (TAB-009).
- Bez animacji przy zmianie stanu; pasek offline jest czarno-biały z polem `t-warn` i zmienia się jednym pełnym odświeżeniem.
