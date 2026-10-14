---
id: SH-003
title: CI dla wszystkich pakietów (kroki niezależne od systemu CI)
area: shared
stage: 0
size: M
status: todo
depends_on: [SH-004]
decisions: [DEC-02, DEC-01]
owner:
branch:
trello: https://trello.com/c/pi2KF7Rb
---
# SH-003 · CI dla wszystkich pakietów (kroki niezależne od systemu CI)

## Cel
Każdy PR przechodzi ten sam zestaw sprawdzeń dla `backend/`, `frontend/`, `mobile/` i `tablet/`, a przebieg nocny dokłada testy na pełnym stosie, emulatorze i obrazach. System CI i runnery wybiera Dawid, więc dostarczamy skrypty, które da się wpiąć w dowolny system i uruchomić lokalnie.

## Kontekst
- **Stan kodu:** CI nie ma. W `backend/` i `frontend/` są `npm run check` (typecheck, ESLint, Prettier, Vitest; w backendzie też `openapi:check`) i `npm run build`; `frontend/` ma `npm run e2e` (Playwright, Chromium z `PLAYWRIGHT_BROWSERS_PATH`, sam uruchamia `auth` przez `npm --prefix ../backend run serve:auth`). `backend/src/contracts/contracts.test.ts` porównuje trasy otwarte z `backend/open-routes.txt`. Obrazy: `backend/Dockerfile` (tini, `USER node`), `frontend/Dockerfile`. `mobile/` i `tablet/` jeszcze nie istnieją (MOB-001, TAB-001).
- **Dokumenty:** `docs/development-szczegoly.md` 3.1.2 (kroki PR: instalacja z lockfile, lint/format/typecheck, unit, integracyjne na Testcontainers z PostgreSQL, brokerem i ZITADEL, sql-gate, sprawdzenie migracji, migawki kontraktów, build obrazów zmienionych pakietów, SBOM i skan, build APK i buildów mobilnych; zgodność N-1; meta-testy; testy instrumentowane Kotlin na emulatorze z KVM; przebieg nocny), 4.1 (rodzaje testów), README „Obrazy Docker” (tini niesprawdzony: test z `init: true`).
- **Decyzje:** DEC-02 A (pakiety `mobile/`, `tablet/` obok `backend/`, `frontend/`). DEC-01 (broker w Testcontainers zgodny z wyborem).
- **Dane demo:** E2E na kontach demo z README.

## Zakres
- [ ] Katalog `ci/` (skrypty bash `set -euo pipefail`, uruchamialne lokalnie i w dowolnym CI):
  - `ci/changed.sh`: lista pakietów zmienionych względem bazy porównania z env `CI_BASE_REF` (domyślnie gałąź integracyjna z tasks/README.md punkt 1: dziś `origin/claude/affectionate-bell-325org`, po scaleniu `origin/main`) (`backend`, `frontend`, `mobile`, `tablet`, `tools`, `docs`); zmiana w `backend/openapi/` albo `docs/paleta.md` oznacza też pakiety aplikacji (generowane typy i tokeny);
  - `ci/package.sh <pakiet>`: `npm ci`, `npm run check`, `npm run build` (pomija pakiet, którego katalogu nie ma, z komunikatem); dla pakietów z generowanymi plikami (`frontend`, `mobile`, `tablet`) także `npm run gen:check` (SH-004; brak skryptu w pakiecie aplikacji = błąd z nazwą pakietu);
  - `ci/backend-integration.sh`: testy integracyjne backendu z Testcontainers (PostgreSQL 17, broker wg DEC-01, ZITADEL w wersji z `docker-compose.yml`); bez Dockera kończy się błędem w CI (zmienna `CI=true`), a lokalnie pomija z komunikatem;
  - `ci/backend-db.sh`: kroki bazy, gdy istnieją skrypty (`db:lint`, `sql-gate`, `migrations:lint`, `migrate` od zera, test „brak niewygenerowanych migracji” z BE-001/BE-002); brakujący skrypt = krok pominięty z ID zadania;
  - `ci/contracts.sh`: `openapi:check`, test listy tras otwartych, porównanie `backend/openapi/*.json` z migawkami wydanych wersji (`backend/openapi/snapshots/<aplikacja>-<wersja>/`, na start pusty katalog z README); zmiana łamiąca (usunięte pole, zmieniony typ, nowe pole wymagane w żądaniu) daje błąd; narzędzie: np. `oasdiff` w obrazie Docker albo własny skrypt w `backend/scripts/openapi-compat.ts`;
  - `ci/e2e-web.sh`: `npm ci` w `backend/` i `frontend/`, instalacja przeglądarek Playwright, `npm run e2e` we `frontend/`;
  - `ci/images.sh`: build obu obrazów (`docker buildx build`), SBOM (np. `syft` albo `--sbom=true`), skan podatności (np. `trivy image --exit-code 1 --severity CRITICAL`), opcjonalny push do rejestru z env `REGISTRY` (bez wartości w repo);
  - `ci/image-smoke.sh`: obraz backendu startuje `npm run start:auth` z env jak w README („Obrazy Docker”), `/livez` 200, `docker stop -t 15` kończy proces w < 15 s kodem 0 albo 143, a w logu jest wpis o łagodnym zamknięciu; sprawdza, że `/sbin/tini` istnieje i jest PID 1 (`docker top`); system plików `--read-only`;
  - `ci/mobile.sh` i `ci/tablet.sh`: po MOB-001/TAB-001: `npx expo prebuild --platform android --no-install` i `./gradlew assembleRelease` (tablet) albo `assembleDebug` (mobile, PR) na Linuksie; iOS (`xcodebuild` symulator) tylko w nocnym na runnerze macOS; testy instrumentowane modułu kiosku (`./gradlew :kiosk:connectedAndroidTest`) na emulatorze Android 16 (AOSP bez Play) z KVM, z `adb shell dpm set-device-owner` (szczegóły w TAB-002).
- [ ] `ci/README.md`: tabela zadań CI (nazwa, skrypt, wyzwalacz PR/nocny, wymagania runnera: Docker, KVM, macOS, czas), cache (`~/.npm`, Gradle, przeglądarki Playwright), zmienne i sekrety (nazwy, bez wartości), polityka: PR uruchamia tylko zmienione pakiety (`ci/changed.sh`), gałąź główna i nocny wszystkie.
- [ ] Przebieg nocny (`ci/nightly.sh` wywołuje kolejno): wszystkie pakiety, integracyjne, `e2e-web`, obrazy ze skanem, tablet i mobile z emulatorem; miejsca na kroki z późniejszych zadań: E2E pełnego stosu (WEB-028), Maestro/Detox (MOB-024), testy tabletu na emulatorze (TAB-019), k6 (BE-058), scenariusze A-xx (SH-005) jako wywołania `npm run …`, które dopiszą te zadania.
- [ ] `shellcheck ci/*.sh tools/**/*.sh` jako krok w `ci/lint-shell.sh` (używają go też TAB-006 i WEB-019).
- [ ] `ci/queue.sh`: `node tasks/queue.mjs check` i `node --test tasks/queue.test.mjs` (spójność kolejki zadań i aktualność `tasks/QUEUE.md`; bez `npm ci`, skrypt nie ma zależności); w każdym PR.

## Poza zakresem
- Wybór systemu CI, runnery, rejestr obrazów, sejf sekretów (Dawid). Plików konfiguracyjnych konkretnego systemu (np. `.github/workflows`) nie dodajemy, chyba że Dawid wskaże system (wtedy osobne małe zadanie: cienka warstwa wołająca `ci/*.sh`).
- Klaster nocny z replikami, prawdziwe SMS przez modem (infrastruktura Dawida; nasze testy: BE-058, BE-059).
- Same testy: każde zadanie pisze swoje; tu tylko ich uruchamianie.

## Kryteria akceptacji
- [ ] Na obecnym repo `ci/package.sh backend`, `ci/package.sh frontend`, `ci/e2e-web.sh`, `ci/images.sh` (bez push) i `ci/image-smoke.sh` przechodzą lokalnie na Linuksie z Dockerem; `ci/package.sh mobile` i `tablet` kończą się „pominięto: brak katalogu”.
- [ ] Zmiana tylko w `frontend/` daje w `ci/changed.sh` tylko `frontend`; zmiana w `backend/openapi/auth.json` daje `backend frontend mobile tablet`.
- [ ] Usunięcie pola z odpowiedzi w kontrakcie (próba na gałęzi) zatrzymuje `ci/contracts.sh`, gdy istnieje migawka z tym polem.
- [ ] `ci/image-smoke.sh` wykrywa brak tini (test na obrazie bez `apk add tini`) i zbyt długie zamykanie.
- [ ] `shellcheck` bez ostrzeżeń dla `ci/*.sh`.

## Testy
- Skrypty sprawdza się uruchomieniem (kryteria wyżej) i `shellcheck`; osobnego frameworka testów powłoki nie dodajemy.
- Lokalnie: `bash ci/package.sh backend`, `bash ci/nightly.sh` (z Dockerem; kroki bez wymagań runnera, np. KVM, pomijane z komunikatem).

## Definicja gotowości
- Kryteria spełnione; `ci/README.md` opisuje każde zadanie i wymagania runnera; README.md (sekcja „Sprawdzenia”) odsyła do `ci/`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm i `npm ci` z lockfile w każdym katalogu osobno; żadnych workspaces, pnpm ani Turborepo.
- Wersje narzędzi (syft, trivy, oasdiff, emulatora) przypięte w skryptach albo w obrazach z dokładnym tagiem.
- Skrypty nie mogą wymagać sekretów do kroków PR; push obrazów i podpisywanie APK tylko gdy env jest ustawiony.
- Emulator do Device Owner: obraz AOSP (`system-images;android-36;default;x86_64`), bez konta Google; urządzenie z dodanym kontem odrzuca `dpm set-device-owner` (T-01). Tablety nie potrzebują GMS (development-szczegoly.md 1.1).
<!-- dep-ok: MOB-001, TAB-001 (skrypty pomijają brakujące pakiety z komunikatem) -->
