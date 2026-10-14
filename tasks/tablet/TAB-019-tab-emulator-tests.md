---
id: TAB-019
title: Testy tabletu na emulatorze i skrypty dla sztuk z ADB
area: tablet
stage: 9
size: M
status: todo
depends_on: [SH-002, TAB-015, TAB-016, TAB-018]
decisions: []
owner:
branch:
trello:
---
# TAB-019 · Testy tabletu na emulatorze i skrypty dla sztuk z ADB

## Cel
Najważniejsze zachowania tabletu (logowanie i język, „Zmień boks”, blokada ekranu, konfiguracja drugiej stajni, ten sam numer boksu w dwóch halach) sprawdzają się automatycznie na emulatorze z prawdziwym backendem i seedem z makiet, w nocnym CI i przed każdym wydaniem APK. Te same skrypty da się puścić na sztuce deweloperskiej z ADB na stanowisku testowym.

## Kontekst
- **Stan kodu:** apka tabletu z TAB-001…TAB-018 (flow Maestro dodawane w kolejnych zadaniach: `tablet/e2e/maestro/login.yaml`, `change-box.yaml`, `popup.yaml`, `screen-lock.yaml`, `settings.yaml`, `quick-actions.yaml`, `offline.yaml`), skrypt „mycia” `tablet/e2e/scripts/wipe-simulation.sh` (TAB-015), zrzuty `npm run screens` (TAB-008), emulator AVD 1404×1872/320 dpi (TAB-001), DO na emulatorze (`scripts/emulator-kiosk-test.sh`, TAB-002). Stos lokalny z SH-002 (`docker compose --profile infra up -d`, `npm run setup -- --fixed-date`, `npm run clock -- set …`, fake-sms `GET /messages?to=`, Mailpit API), seed BE-011 (konta „Tablety Pod Lipami” i „Tablety Brzozowa”, stałe UUID boksów).
- **Dokumenty:** `docs/development-szczegoly.md` 4.1 „Tablet” (testy na emulatorze ze sztucznym zegarem: „Zmień boks” z zakładkami i powrotem po 30 s, wybór zachowany po zabiciu procesu, jedna hala bez zakładek; blokada ekranu: seria stuknięć bez zapisów, odblokowanie po 3 s, pop-up mimo blokady, po 10 min schodzi; logowanie i język: e-mail albo telefon, hasło, kod z SMS-a i e-maila, od razu lista boksów, konto osoby albo Wyświetlacz → TabletBrakUprawnien, język zostaje po zabiciu procesu i ponownym logowaniu, drugi tablet ma swój język; konfiguracja Brzozowej: tylko boksy 1–6, bez hali, bez „POTWIERDZONA” i pop-upu, tylko BOKS GOTOWY i ŚNIADANIE, bez NAMOCZYĆ, zrzut porównany z makietą; scenariusze UI na sztukach deweloperskich z ADB przez Maestro albo UI Automator), 4.3.1 T-28, 4.4 A-10, A-15, A-17, A-18, A-25, 4.5 (drugi tablet = emulator albo skrypt odpytujący `board` z `X-Box-Id`).
- **Decyzje:** brak.
- **Dane demo:** seed ze stałą datą wt 13.10.2026 07:15; „Tablety Pod Lipami” (boksy@stajnielipowe.pl), „Tablety Brzozowa”, konto Oli i „Telewizor korytarz” do TabletBrakUprawnien.

## Zakres
- [ ] Konfiguracja testowa apki: build `development` z `EXPO_PUBLIC_TEST_TIMINGS=1` skraca czasy z `tablet/src/config.ts` (powrót z „Zmień boks” 30 s → 5 s, blokada 10 min → 20 s, interwał odpytywania bez zmian), tylko w buildzie dev (test, że release ich nie czyta).
- [ ] `tablet/e2e/run.sh`: sprawdza stos (proxy `http://10.0.2.2:8000` z emulatora), `npm --prefix ../backend run setup -- --fixed-date`, uruchamia 1 albo 2 emulatory (`-port 5554/5556`), instaluje APK, ustawia DO (opcjonalnie, `--kiosk`), uruchamia zestaw flow Maestro, zbiera wyniki (JUnit XML) i zrzuty do `tablet/e2e/results/` (w `.gitignore`).
- [ ] Pomocnicze `tablet/e2e/helpers/`: odczyt kodu MFA z fake-sms i Mailpit (`code.sh <login>`), reset danych między flow (`npm run reset` albo transakcyjny reset seedu), ustawienie zegara seedu (`npm run clock -- set …` + restart usług), tryb samolotowy (`adb shell cmd connectivity airplane-mode enable|disable`).
- [ ] Zestawy (pliki w `tablet/e2e/maestro/suites/`, każdy z tagiem scenariusza w nazwie):
  - `A-25-login-language`: logowanie e-mailem (kod z Mailpit) i telefonem (kod z fake-sms, jeśli konto ma telefon), od razu TabletPierwszyBoks; konto Oli i „Telewizor korytarz” → „TO KONTO NIE OBSŁUGUJE TABLETU”; język UA zostaje po `am force-stop` i po wylogowaniu i ponownym logowaniu; drugi emulator dalej PL;
  - `T-28-change-box`: zakładki hal, przełączenie od razu, powrót po (skróconych) 30 s, wybór zachowany po `force-stop`; konto Brzozowej: lista bez zakładek;
  - `A-15-screen-lock`: `wipe-simulation.sh` przy blokadzie (zero zapisów w `psql` i w kolejce), odblokowanie przytrzymaniem 3 s, pop-up z apki (flaga utworzona przez API tokenem Anny z `npm run dev:token`) mimo blokady, POTWIERDZAM po odblokowaniu, automatyczne zdjęcie blokady;
  - `A-17-A-18-brzozowa`: „Tablety Brzozowa”, boks 1: nagłówek „BOKS 1 · KOMETA”, baner „obowiązuje od razu”, brak pop-upu po nowej fladze, SZYBKIE AKCJE tylko BOKS GOTOWY i ŚNIADANIE, bez NAMOCZYĆ; zrzut porównany z `mockups/project/TabletBoksBrzozowa.dc.html` (wzrokowo w raporcie albo wzorzec z TAB-008);
  - `A-10-two-halls`: emulator 1 na Hala główna · boks 4, emulator 2 na Hala nowa · boks 4; flaga Belli tylko na emulatorze 2; POTWIERDZAM zapisuje `box_id` boksu 4 Hali nowej; „BOKS GOTOWY” z emulatora 1 trafia do boksu 4 Hali głównej (sprawdzenie `psql` po stałych UUID); wariant z jednym emulatorem: skrypt `tablet/e2e/scripts/poll-box.sh <boxId>` odpytuje `board` jak drugi tablet.
- [ ] Sztuki deweloperskie z ADB: `tablet/e2e/device.sh --serial <id>` uruchamia te same zestawy na urządzeniu (bez zakładania AVD, bez DO, jeśli już ustawione); opis w `tablet/e2e/README.md`, także czego nie da się zrobić na sztuce produkcyjnej (ADB wyłączone: obserwacja kamerą i logami, stuknięcia ręczne).
- [ ] Raport `tablet/e2e/REPORT.md` generowany przez `run.sh`: tabela scenariusz (A-xx/T-xx) → wynik → plik dowodu; do SH-005.
- [ ] Wpięcie do nocnego CI: polecenie `npm run e2e:emulator` w `tablet/package.json` (kroki CI: SH-003).

## Poza zakresem
- Testy na prawdziwym sprzęcie bez ADB i testy środowiskowe (T-11…T-30 na stanowisku; narzędzia TAB-021).
- Harness wszystkich scenariuszy A-01…A-25 (SH-005).

## Kryteria akceptacji
- [ ] `cd tablet && npm run e2e:emulator` na Linuksie z KVM i stosem z SH-002 przechodzi wszystkie zestawy (dwa emulatory dla A-10 albo wariant ze skryptem).
- [ ] Raport wskazuje dla każdego zestawu wynik i dowód; zepsucie powrotu po 30 s (np. zmiana na 60 s) wywraca `T-28-change-box`.
- [ ] `device.sh` przechodzi `T-28-change-box` i `A-25-login-language` na sztuce deweloperskiej (wykonuje osoba z urządzeniem; wynik w raporcie).
- [ ] Build release nie zawiera skróconych czasów (test jednostkowy konfiguracji).

## Testy
- Same zestawy Maestro i skrypty są testami; dodatkowo Jest dla konfiguracji czasów testowych.
- Komendy: `cd tablet && npm run e2e:emulator`, `bash tablet/e2e/device.sh --serial <id>`.

## Definicja gotowości
- Zestawy zielone lokalnie i w nocnym przebiegu; `tablet/e2e/README.md` i raport gotowe; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Asercje po stałych UUID boksów z seedu, nigdy po numerze boksu.
- Kody MFA czytaj z fake-sms i Mailpit przez ich API; nie wypisuj ich w logach CI.
- Czas: zegar serwera ustawia SH-002 (`CLOCK_OFFSET_SEC`); tablet bierze czas z `Date`, więc emulatora nie przestawiaj, chyba że test dotyczy zegara tabletu (T-16).
