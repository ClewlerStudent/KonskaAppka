---
id: BE-007
title: "lib/rules: czas, flagi, konfiguracja stajni"
area: backend
stage: 0
size: L
status: todo
depends_on: []
decisions: [DEC-20]
owner:
branch:
trello: https://trello.com/c/2BiL3Pto
---
# BE-007 · lib/rules: czas, flagi, konfiguracja stajni

## Cel
Jedno miejsce z czystymi funkcjami reguł stajni: kiedy wypada posiłek, jakie okno ma flaga, co wstrzymuje, kiedy eskalować, jak opisać godziny i co dana rola widzi w danej stajni. Używają ich `auth` (macierz domyślna), `operations`, `board`, crony i seed, więc tablet, apka, panel i TV pokazują to samo.

## Kontekst
- Stan kodu: brak; katalog `backend/src/lib/rules/` (odpowiednik `packages/rules` z docs). Typy `Feature` i `StableRole` są w `backend/src/lib/auth/claims.ts`. Zegar: `backend/src/kit/clock.ts`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.12 `packages/rules` (wystąpienia posiłków, okno i `default_window`, `ack_deadline_at`/`warn_at`/`notify_at` tylko przy `requires_ack`, `stableFeatures`, skutki `suspend_meal` i `cancel_paddock`, pominięte konie, etykiety, fast-check, noce zmiany czasu); `docs/erd.md` pkt 12 (godziny flag obowiązkowe, Derka przez północ, przykład Kasztana), pkt 16 (wyłączona opcja znika razem ze stanem; „Nie na padok” przy wyłączonym padoku: „dziś, cały dzień”), „Słowniki wartości”; `docs/mikroserwisy.md` 3.2 (macierz domyślna = Pod Lipami, tablet bez `tasks` i `box_history`).
- Scenariusze: A-09 (noc zmiany czasu: śniadanie zostaje 06:30 lokalnie, Derka 16:00–08:00 z 24.10 na 25.10 trwa 17 h, eskalacje się nie przesuwają), A-12 (godziny flag i Derka), A-19 (wyłączone opcje).
- Decyzje: DEC-20 wariant A (macierz domyślna jak Pod Lipami: klient `flags, feeding_plan, routine, box_history, health, rides`; obsługa wszystko; instruktor `flags, rides`; tablet `flags, feeding_plan, routine, health`; wyświetlacz `flags, feeding_plan, routine, tasks`; pory 06:30, 12:00, 18:00).
- Dane demo do testów: Kasztan (padok B 10:00–16:00, „Bez śniadania” 06:00–10:00, „Nie na padok” 14:30–16:00 → padok 10:00–14:30), Sonata („Derka: zakładać” dziś 16:00 – jutro 08:00, o 07:15 etykieta „od 16:00”), Bella („Nie na padok” cały dzień).

## Zakres
- [ ] `time.ts`: strefa stajni (IANA) ↔ UTC; `mealOccurrences(slots, dayRange, tz)` z `days_mask` (pn = 1 … nd = 64) i `valid_from`/`valid_to`; `serviceDateOf(instant, tz)`. Biblioteka strefowa z pełną obsługą DST (np. `luxon`), wybór opisany w `backend/README.md`.
- [ ] `flags.ts`: `parseDefaultWindow('06:00-10:00' | '16:00-08:00' | 'paddock' | 'all_day')`, `suggestWindow(template, now, tz, paddockPlan?, settings)` (przez północ; `paddock` bez planu albo przy wyłączonym padoku → „dziś, cały dzień”); `validateWindow` (koniec po początku; okno minione → `target_passed`); `ackTimes(validFrom, settings)` → `{ ackDeadlineAt, warnAt, notifyAt }` albo same `null`, gdy `requires_ack = false`.
- [ ] `effects.ts`: `suspendedMeals(flags, occurrences)` (tylko posiłki z godziną w oknie), `paddockAfterFlags(plan, flags)` (skrócenie albo odwołanie w oknie), `skippedHorses(action, building, at, flags)` (flagi obowiązujące w chwili akcji, także niepotwierdzone).
- [ ] `labels.ts`: etykiety jako struktura (`{ kind: 'range', from, to } | { kind: 'from', at } | { kind: 'all_day' }`) i formatter PL („06:00–10:00”, „od 14:30”, „16:00–08:00”, „dziś, cały dzień”); status tylko dla `requires_ack` (`acknowledged HH:MM | unacknowledged`), inaczej „obowiązuje od razu”. UA/EN dopisuje BE-014.
- [ ] `features.ts`: `DEFAULT_ROLE_FEATURES` (DEC-20), `roleFeatures(rows | null, role)` (brak wierszy → domyślna; tablet nigdy `tasks`, `box_history`), `stableFeatures(settings, activeTemplates, features, role)` → kafelki flag (aktywne szablony + „Inna flaga”), `soak`, przyciski (`tidy`, `mealServed`, `paddockOut`), tryb potwierdzeń, widoczne funkcje; admin (`features = null`) widzi wszystko.
- [ ] `defaults.ts`: domyślne ustawienia nowej stajni (wszystko włączone, z potwierdzeniami; progi `warn_offset_min = 30`, `notify_offset_min = 15`), domyślne pory posiłków (`breakfast` 06:30, `lunch` 12:00, `dinner` 18:00, codziennie), domyślne szablony flag (`bez_sniadania`, `bez_kolacji`, `nie_na_padok`, `derka` z wariantem, `leki`, `wet`; `severity`, `effect`, `meal_slot_code`, `default_window` według makiety SzybkaFlaga i seedu; wartości bez źródła w docs oznacz komentarzem „propozycja”).

## Poza zakresem
- Zapisy w bazie, trasy i i18n treści (BE-014, BE-028, BE-034, BE-044); stan wykonania akcji („podane 06:40”) liczy `board`.

## Kryteria akceptacji
- [ ] Kasztan: padok B 10:00–16:00 z „Nie na padok” 14:30–16:00 daje 10:00–14:30; „Bez śniadania” 06:00–10:00 wstrzymuje śniadanie 06:30, nie obiad 12:00.
- [ ] Derka 16:00–08:00 z 24.10.2026 kończy się 25.10.2026 08:00 czasu lokalnego (17 h); śniadanie 25.10 i 28.03.2027 zostaje o 06:30 lokalnie; `notify_at` nie przesuwa się o godzinę.
- [ ] Flaga zaczynająca się później ma etykietę „od 16:00” i nie wstrzymuje niczego przed początkiem okna.
- [ ] `stableFeatures` Brzozowej (bez derek, moczenia, padoku, potwierdzeń) nie zwraca kafelka Derki, `soak`, przycisku padoku ani trybu potwierdzeń; tablet nigdy nie dostaje `tasks` ani `box_history`.

## Testy
- Vitest + `fast-check` (dev dependency): właściwości okien (koniec po początku, przez północ, DST), `days_mask`, skutki flag; przykłady z seedu jako testy tabelaryczne. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Tylko czyste funkcje: bez bazy, sieci i `Date.now()` (czas zawsze z argumentu).
- Aplikacje (frontend, mobile, tablet) nie importują `backend/`: ten sam wynik dostają z API (`GET …/features`, `board`). Nie ma więc współdzielenia kodu; spójność dają odpowiedzi serwera.
- Kody błędów (`target_passed`) zwracaj jako wartości, a `ApiError` rzuca dopiero serwis.
