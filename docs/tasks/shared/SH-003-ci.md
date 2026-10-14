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
Każdy MR w repo `backend`, `frontend`, `mobile` i `tablet` przechodzi ten sam zestaw sprawdzeń, a przebieg nocny dokłada testy na pełnym stosie, emulatorze i obrazach. Repo są na GitLabie, ale system CI i runnery wybiera Dawid, więc dostarczamy skrypty `ci/*.sh` w każdym repo, które da się wpiąć w dowolny system i uruchomić lokalnie.

## Kontekst
- **Stan kodu:** CI nie ma. W `backend/` i `frontend/` są `npm run check` (typecheck, ESLint, Prettier, Vitest; w backendzie też `openapi:check`) i `npm run build`; `frontend/` ma `npm run e2e` (Playwright, Chromium z `PLAYWRIGHT_BROWSERS_PATH`, sam uruchamia `auth` przez `npm --prefix ../backend run serve:auth`). `backend/src/contracts/contracts.test.ts` porównuje trasy otwarte z `backend/open-routes.txt`. Obrazy: `backend/Dockerfile` (tini, `USER node`), `frontend/Dockerfile`. Repo są osobne i leżą obok siebie w workspace; `frontend` czyta z sąsiednich repo w `gen:api` (`../backend/openapi`), E2E (`../backend`) i teście palety (`../docs/paleta.md`). Repo `mobile` i `tablet` jeszcze nie istnieją (MOB-001, TAB-001).
- **Dokumenty:** `docs/development-szczegoly.md` 3.1.2 (kroki MR: instalacja z lockfile, lint/format/typecheck, unit, integracyjne na Testcontainers z PostgreSQL, brokerem i ZITADEL, sql-gate, sprawdzenie migracji, migawki kontraktów, build obrazów zmienionych pakietów, SBOM i skan, build APK i buildów mobilnych; zgodność N-1; meta-testy; testy instrumentowane Kotlin na emulatorze z KVM; przebieg nocny), 4.1 (rodzaje testów), `backend/README.md` „Obrazy Docker” (tini niesprawdzony: test z `init: true`).
- **Decyzje:** DEC-02 A (osobne repo `mobile` i `tablet` obok `backend` i `frontend`). DEC-01 (broker w Testcontainers zgodny z wyborem).
- **Dane demo:** E2E na kontach demo z `backend/README.md` („Konta demo”).

## Zakres
- [ ] Katalog `ci/` w każdym repo (skrypty bash `set -euo pipefail`, uruchamialne lokalnie z korzenia repo i w dowolnym CI). Kroki, które czytają sąsiednie repo (`gen:api` i `gen:check` z `../backend`, `gen:theme` i test palety z `../docs`, E2E frontendu z `../backend`), wymagają w CI checkoutu tych repo obok, w układzie workspace: gałąź o tej samej nazwie, jeśli istnieje (zadanie w kilku repo ma wszędzie tę samą gałąź), inaczej `main`. Brak sąsiedniego repo = błąd z jego nazwą.
  - `backend/ci/changed.sh` i `docs/ci/changed.sh`: pliki zmienione względem bazy porównania z env `CI_BASE_REF` (domyślnie `origin/main`); zmiana w `backend/openapi/`, `backend/tools/codegen/` albo `docs/paleta.md` wypisuje repo aplikacji (`frontend`, `mobile`, `tablet`), które muszą przejść `gen:check` z tą gałęzią obok (generowane typy i tokeny); jak wyzwolić ich przebieg, zależy od systemu CI, a do tego czasu łapie to przebieg nocny repo aplikacji;
  - `ci/package.sh` w każdym repo kodu: `npm ci`, `npm run check`, `npm run build`; w repo z generowanymi plikami (`frontend`, `mobile`, `tablet`) także `npm run gen:check` (SH-004; brak skryptu = błąd z nazwą repo);
  - `backend/ci/backend-integration.sh`: testy integracyjne backendu z Testcontainers (PostgreSQL 17, broker wg DEC-01, ZITADEL w wersji z `backend/docker-compose.yml`); bez Dockera kończy się błędem w CI (zmienna `CI=true`), a lokalnie pomija z komunikatem;
  - `backend/ci/backend-db.sh`: kroki bazy, gdy istnieją skrypty (`db:lint`, `sql-gate`, `migrations:lint`, `migrate` od zera, test „brak niewygenerowanych migracji” z BE-001/BE-002); brakujący skrypt = krok pominięty z ID zadania;
  - `backend/ci/contracts.sh`: `openapi:check`, test listy tras otwartych, porównanie `backend/openapi/*.json` z migawkami wydanych wersji (`backend/openapi/snapshots/<aplikacja>-<wersja>/`, na start pusty katalog z README); zmiana łamiąca (usunięte pole, zmieniony typ, nowe pole wymagane w żądaniu) daje błąd; narzędzie: np. `oasdiff` w obrazie Docker albo własny skrypt w `backend/scripts/openapi-compat.ts`;
  - `frontend/ci/e2e-web.sh`: `npm ci` w `../backend` i we `frontend/`, instalacja przeglądarek Playwright, `npm run e2e` we `frontend/`;
  - `ci/images.sh` w `backend` i `frontend`: build obrazu repo (`docker buildx build`), SBOM (np. `syft` albo `--sbom=true`), skan podatności (np. `trivy image --exit-code 1 --severity CRITICAL`), opcjonalny push do rejestru z env `REGISTRY` (bez wartości w repo);
  - `backend/ci/image-smoke.sh`: obraz backendu startuje `npm run start:auth` z env jak w `backend/README.md` („Obrazy Docker”), `/livez` 200, `docker stop -t 15` kończy proces w < 15 s kodem 0 albo 143, a w logu jest wpis o łagodnym zamknięciu; sprawdza, że `/sbin/tini` istnieje i jest PID 1 (`docker top`); system plików `--read-only`;
  - `mobile/ci/mobile.sh` i `tablet/ci/tablet.sh` (razem z `ci/package.sh` tych repo, gdy repo już istnieją; repo, które powstanie później, dostaje te skrypty w MOB-001/TAB-001): `npx expo prebuild --platform android --no-install` i `./gradlew assembleRelease` (tablet) albo `assembleDebug` (mobile, MR) na Linuksie; iOS (`xcodebuild` symulator) tylko w nocnym na runnerze macOS; testy instrumentowane modułu kiosku (`./gradlew :kiosk:connectedAndroidTest`) na emulatorze Android 16 (AOSP bez Play) z KVM, z `adb shell dpm set-device-owner` (szczegóły w TAB-002).
- [ ] `ci/README.md` w każdym repo: tabela zadań CI tego repo (nazwa, skrypt, wyzwalacz MR/nocny, wymagania runnera: Docker, KVM, macOS, sąsiednie repo do checkoutu, czas), cache (`~/.npm`, Gradle, przeglądarki Playwright), zmienne i sekrety (nazwy, bez wartości), polityka: MR uruchamia sprawdzenia swojego repo (repo aplikacji także po zmianie wskazanej przez `changed.sh` w `backend` albo `docs`), `main` i nocny wszystkie.
- [ ] Przebieg nocny (`ci/nightly.sh` w każdym repo kodu wywołuje kolejno jego kroki): `backend`: pakiet, integracyjne, obraz ze skanem; `frontend`: pakiet, `e2e-web`, obraz ze skanem; `mobile` i `tablet`: pakiet i natywny build z emulatorem; miejsca na kroki z późniejszych zadań: E2E pełnego stosu (WEB-028, `frontend`), Maestro/Detox (MOB-024, `mobile`), testy tabletu na emulatorze (TAB-019, `tablet`), k6 (BE-058, `backend`), scenariusze A-xx (SH-005, `backend` z repo aplikacji obok) jako wywołania `npm run …`, które dopiszą te zadania.
- [ ] `ci/lint-shell.sh` w każdym repo kodu: `shellcheck ci/*.sh tools/**/*.sh` (używają go też TAB-006 w `tablet` i WEB-019 we `frontend`).
- [ ] `docs/ci/queue.sh` (repo `docs`): `node tasks/queue.mjs check` i `node --test tasks/queue.test.mjs` (spójność kolejki zadań i aktualność `tasks/QUEUE.md`; bez `npm ci`, skrypt nie ma zależności); w każdym MR i przy każdym pushu na `main` (status zadań trafia prosto na `main`).
- [ ] `.gitlab-ci.yml` tylko wtedy, gdy Dawid potwierdzi GitLab CI: w każdym repo cienka warstwa wołająca `ci/*.sh`, z checkoutem sąsiednich repo jak wyżej. Bez potwierdzenia ten punkt odpada (zapisz to w „Uwagach dla wykonawcy”).

## Poza zakresem
- Wybór systemu CI, runnery, rejestr obrazów, sejf sekretów (Dawid). Konfiguracji innego systemu CI niż wskazany przez Dawida nie dodajemy.
- Klaster nocny z replikami, prawdziwe SMS przez modem (infrastruktura Dawida; nasze testy: BE-058, BE-059).
- Same testy: każde zadanie pisze swoje; tu tylko ich uruchamianie.

## Kryteria akceptacji
- [ ] W workspace z `backend/`, `frontend/` i `docs/` obok siebie `backend/ci/package.sh`, `frontend/ci/package.sh`, `frontend/ci/e2e-web.sh`, `ci/images.sh` w obu repo (bez push) i `backend/ci/image-smoke.sh` przechodzą lokalnie na Linuksie z Dockerem; `frontend/ci/package.sh` bez `../backend` kończy się błędem z nazwą brakującego repo.
- [ ] Zmiana w `backend/openapi/auth.json` daje w `backend/ci/changed.sh` `frontend mobile tablet`, zmiana w `docs/paleta.md` w `docs/ci/changed.sh` to samo, a zmiana tylko w `backend/src/` nic.
- [ ] Usunięcie pola z odpowiedzi w kontrakcie (próba na gałęzi) zatrzymuje `backend/ci/contracts.sh`, gdy istnieje migawka z tym polem.
- [ ] `backend/ci/image-smoke.sh` wykrywa brak tini (test na obrazie bez `apk add tini`) i zbyt długie zamykanie.
- [ ] `shellcheck` bez ostrzeżeń dla `ci/*.sh` we wszystkich repo.

## Testy
- Skrypty sprawdza się uruchomieniem (kryteria wyżej) i `shellcheck`; osobnego frameworka testów powłoki nie dodajemy.
- Lokalnie w korzeniu repo: `bash ci/package.sh`, `bash ci/nightly.sh` (z Dockerem; kroki bez wymagań runnera, np. KVM, pomijane z komunikatem).

## Definicja gotowości
- Kryteria spełnione; `ci/README.md` w każdym repo opisuje jego zadania, wymagania runnera i sąsiednie repo; `backend/README.md` i `frontend/README.md` (sekcja „Sprawdzenia”) odsyłają do `ci/`; zmiany w kilku repo jako osobne MR podlinkowane nawzajem; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm i `npm ci` z lockfile w każdym repo osobno; żadnych workspaces, pnpm ani Turborepo.
- Wersje narzędzi (syft, trivy, oasdiff, emulatora) przypięte w skryptach albo w obrazach z dokładnym tagiem.
- Skrypty nie mogą wymagać sekretów do kroków MR; push obrazów i podpisywanie APK tylko gdy env jest ustawiony.
- Emulator do Device Owner: obraz AOSP (`system-images;android-36;default;x86_64`), bez konta Google; urządzenie z dodanym kontem odrzuca `dpm set-device-owner` (T-01). Tablety nie potrzebują GMS (development-szczegoly.md 1.1).
<!-- dep-ok: MOB-001, TAB-001 (skrypty `ci/` repo mobile i tablet trafiają do nich, gdy repo powstaną) -->
