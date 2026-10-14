---
id: SH-005
title: Scenariusze akceptacyjne A-01…A-25 w jednym harnessie
area: shared
stage: 9
size: M
status: todo
depends_on: [BE-057, MOB-024, TAB-019, WEB-028]
decisions: []
owner:
branch:
trello:
---
# SH-005 · Scenariusze akceptacyjne A-01…A-25 w jednym harnessie

## Cel
Jednym poleceniem sprawdzamy, czy produkt robi to, co pokazują makiety: 25 scenariuszy z życia stajni (flagi Kasztana, martwy tablet Belli, dwie hale z tym samym numerem, druga stajnia bez potwierdzeń, konto firmy, telewizor i tablety na kontach technicznych) przechodzi na seedzie z makiet przez backend, panel, apkę i tablet. Raport mówi, co przeszło automatycznie, a co wymaga stanowiska testowego.

## Kontekst
- **Stan kodu:** suity E2E z zadań: panel i TV w Playwright na pełnym stosie (`frontend/playwright.full.config.ts`, `npm run e2e:full`, raport pokrycia `frontend/e2e/full/COVERAGE.md`; WEB-028), apka w Maestro/Detox (`mobile/e2e/`, raport `mobile/e2e/REPORT.md`; MOB-024), tablet na emulatorach (`tablet/e2e/run.sh`, raport `tablet/e2e/REPORT.md`; TAB-019), macierz izolacji i meta-testy backendu (BE-057), seed ze stałą datą (BE-011), stos lokalny i zegar (`npm run setup -- --fixed-date`, `npm run clock -- set …`, fake-sms, Mailpit; SH-002), `npm run dev:token` (BE-010), crony z `--now` (BE-009).
- **Dokumenty:** `docs/development-szczegoly.md` 4.4 (A-01…A-25 z krokami i oczekiwanymi wynikami; dane z seedu 3.2: wt 13.10.2026 07:15, Hala główna 1–8, Hala nowa 1–6, Brzozowa 1–6; asercje po stałych UUID boksów; A-01…A-16 w Pod Lipami z potwierdzeniami, A-17…A-21 konfiguracja per stajnia, A-22…A-25 konto firmy, dostęp, TV i tablety), 4.5 (stanowisko: drugi tablet jako emulator albo skrypt odpytujący `board` z `X-Box-Id`; kryterium „wszystkie scenariusze przechodzą automatycznie i na stanowisku”), 3.6 (warunki gotowości etapów odwołują się do A-xx).
- **Makiety:** zrzuty porównywane w suitach UI (warianty BezAkcji: A-19).
- **Decyzje:** wartości z DEC-13, DEC-18, DEC-21, DEC-23 wpływają na oczekiwania (np. „Cofnij” 1 h, trwająca Derka po wyłączeniu szablonu); harness bierze je z konfiguracji, nie z kodu testu.
- **Dane demo:** seed obu stajni i fixture drugiej firmy (Olszynka) do A-23.

## Zakres
- [ ] `tools/acceptance/scenarios.json`: dla każdego A-xx lista kroków-asercji (ID `A-01.3` itd., opis z 4.4) z przypisaniem do suity: `backend` (API i baza), `web`, `mobile`, `tablet` albo `manual` (np. „bez kolorowego śladu na kolorowym e-inku”, T-21); każdy krok automatyczny ma wskazanie testu (nazwa z tagiem `[A-01.3]` w tytule testu).
- [ ] Suita `backend` dla kroków bez UI: `backend/test/acceptance/A-xx.test.ts` (Vitest przeciw działającemu stosowi z SH-002, HTTP przez proxy `localhost:8000`, tokeny z `dev:token` albo logowanie z kodem z fake-sms/Mailpit, sprawdzenia w bazie `psql` po stałych UUID; zegar przez `npm run clock` i restart usług; crony uruchamiane `npm run cron <nazwa> -- --now …`); skrypt `npm run test:acceptance` w `backend/` (osobna konfiguracja Vitest, poza `npm test`). Obejmuje m.in. A-02 (eskalacje: jeden wiersz `flag_escalations` na poziom, jedno powiadomienie także przy dwóch przebiegach crona), A-09 (noc 25.10.2026), A-12 (okna flag, 422 bez `valid_to`), A-14 (409 przy równoległym „Biorę”), A-18 (`ack_not_required`, zero eskalacji), A-20, A-21 (403 na trasach ukrytych funkcji), A-22 (`tax_id_taken`), A-23 (404 między firmami), A-24 i A-25 (blokada kont technicznych, `access_revoked` w ≤ 5 min przez skrócony test z odświeżeniem tokenu).
- [ ] `tools/acceptance/run.mjs` (Node bez zależności): przygotowuje stos (`setup --fixed-date`), uruchamia po kolei suity (`backend` → `web` (`npm --prefix frontend run e2e:full`) → `mobile` (`npm --prefix mobile run e2e:android`) → `tablet` (`npm --prefix tablet run e2e:emulator`)), z opcją `--only A-10` i `--suite web`; zbiera wyniki (JUnit XML i raporty z WEB-028, MOB-024, TAB-019), mapuje po tagach `[A-xx.y]` na kroki z `scenarios.json`.
- [ ] Raport `tools/acceptance/REPORT.md` (generowany, w repo ostatni przebieg z gałęzi głównej): tabela A-xx → kroki → wynik (`auto: zielony/czerwony`, `brak testu`, `manual: do stanowiska`), podsumowanie: ile kroków automatycznych, ile ręcznych, lista braków z ID zadania, które ma je pokryć.
- [ ] Lista kontrolna stanowiska `tools/acceptance/STANOWISKO.md`: kroki `manual` z każdym A-xx (np. A-01 „pełne odświeżenie bez kolorowego śladu”, A-15 mycie mokrą ścierką), z miejscem na datę, osobę i wynik.
- [ ] Wpięcie do nocnego CI (`ci/nightly.sh` z SH-003): `node tools/acceptance/run.mjs --ci`.

## Poza zakresem
- Pisanie testów UI od nowa: suity powstają w WEB-028, MOB-024, TAB-019; tu tylko dopisanie brakujących tagów `[A-xx.y]` i testów `backend` dla kroków bez UI.
- Wykonanie testów na stanowisku i w stajni pilotażowej (zespół, 4.5).

## Kryteria akceptacji
- [ ] `node tools/acceptance/run.mjs` na Linuksie z Dockerem i KVM przechodzi przez wszystkie suity i generuje raport; każdy krok z 4.4 ma w `scenarios.json` przypisanie (auto albo manual), żaden nie jest „brak testu” bez wskazanego zadania.
- [ ] Scenariusze, które są warunkami gotowości etapów (A-01, A-02, A-12, A-18, A-20 dla etapu 3; A-13, A-16, A-17, A-19 dla etapu 6; A-14, A-21 dla etapu 7; A-22, A-23 dla etapu 1/2) mają wszystkie kroki automatyczne zielone.
- [ ] `--only A-10` uruchamia tylko kroki A-10 we wszystkich suitach (backend i tablet na dwóch emulatorach albo ze skryptem `poll-box.sh`).
- [ ] Celowe złamanie reguły (np. pominięcie Kasztana przy „Podano śniadanie”) daje czerwony krok A-01.x w raporcie.

## Testy
- Samo zadanie jest testem; `node --test tools/acceptance` dla parsera wyników i mapowania tagów.
- Uruchomienie: `node tools/acceptance/run.mjs [--only A-xx] [--suite backend|web|mobile|tablet]`.

## Definicja gotowości
- Raport z pełnego przebiegu w repo, lista stanowiska gotowa, nocny przebieg wpięty; README.md (sekcja „Sprawdzenia”) odsyła do `tools/acceptance/`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Asercje zawsze po stałych UUID boksów z seedu, nigdy po numerze.
- Zegar: serwery na `CLOCK_OFFSET_SEC` (SH-002), przeglądarka `page.clock`, tablet i apka biorą czas z `Date`; nie mieszaj z zegarem systemu.
- Kody MFA z fake-sms/Mailpit przez API, nigdy w logach raportu.
