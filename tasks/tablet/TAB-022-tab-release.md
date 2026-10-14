---
id: TAB-022
title: Pierwsze wydanie produkcyjne APK tabletu
area: tablet
stage: 9
size: M
status: todo
depends_on: [TAB-017, TAB-019, BE-040, TAB-006]
decisions: [DEC-22, DEC-30]
needs: [device, owner]
owner:
branch:
trello:
---
# TAB-022 · Pierwsze wydanie produkcyjne APK tabletu

## Cel
Tablety stajni pilotażowej dostają pierwszą wersję produkcyjną aplikacji: APK z docelowym identyfikatorem `pl.equenor.tablet`, podpisany kluczem od Dawida, zarejestrowany jako wydanie w `platform`, a sztuki pilotażowe są zaprovisionowane tą wersją. Od tego wydania kolejne wersje przychodzą same (TAB-017).

## Kontekst
- **Stan kodu:** build `npm run apk` z wariantem `production` i podpisem z env `TABLET_KEYSTORE_*` (TAB-001), `versionCode` z `TABLET_VERSION_CODE`; cicha instalacja i aktualizacje (TAB-004, TAB-017); provisioning `tools/provision-tablet/provision.sh --profile prod` (TAB-006); testy na emulatorze `npm run e2e:emulator` (TAB-019); wydania APK w `platform`: wgranie pliku, `signingCertSha256`, wdrożenie procentowe, okno instalacji, `halted` (BE-040; przez `opctl` po BE-056 albo trasą `/platform/*`).
- **Dokumenty:** docs/development-szczegoly.md 3.5.2 „Aktualizacja APK” i „`tools/provision-tablet`”, 2.8 (Android, `targetSdk`), 4.3.1 (T-24, T-25, T-27 Play Protect), 4.5 (gotowość stajni pilotażowej), 5 pkt 29 (identyfikatory), 38–41 (model, firmware, profil palety).
- **Makiety:** TabletAktualizacja (docs/makiety-plan.md E).
- **Decyzje:** DEC-22 (identyfikatory aplikacji, nieodwracalne: przed rozstrzygnięciem nie wydajemy APK z docelowym `applicationId`). DEC-30 (model i firmware po bramce B, profil palety, czarno-białe w v1: wydanie dla zatwierdzonej pary model + firmware).
- **Dane demo:** nie dotyczy (stajnia pilotażowa; konto „Tablety <stajnia>” zakłada admin przez zaproszenie konta technicznego).

## Zakres
- [ ] `tablet/RELEASE.md`: lista kontrolna wydania: zatwierdzony `applicationId` (DEC-22), keystore wydania (tworzy i przechowuje Dawid poza repo; odcisk SHA-256 certyfikatu zapisany w `RELEASE.md` i w konfiguracji `platform`), `versionCode` rosnący, build `APP_VARIANT=production npm run apk`, `apksigner verify --print-certs`, sprawdzenie `targetSdk`, brak `testOnly` i `debuggable`.
- [ ] Skrypt `tablet/scripts/release.sh` (bash, `set -euo pipefail`): build produkcyjny z env, weryfikacja podpisu i odcisku z oczekiwanym, `sha256` pliku, wynik w `tablet/dist/release-<versionCode>.json` (dane do rejestracji wydania); bez sekretów w logu.
- [ ] Rejestracja wydania w `platform` (BE-040): instrukcja krok po kroku (trasa `/platform/*` albo `opctl`, gdy jest), wdrożenie 0 % → sztuki testowe → 100 % w stajni pilotażowej, okno instalacji; cofnięcie = nowe wydanie z wyższym `versionCode` (bez downgrade).
- [ ] Provisioning sztuk pilotażowych `provision.sh --profile prod` z tym APK: zapis modelu, firmware i wersji z logu do `tablet/RELEASE.md` (tabela sztuk bez numerów seryjnych w repo, jeśli Dawid tak zdecyduje).
- [ ] [ręcznie] Na zatwierdzonym modelu (DEC-30): instalacja, logowanie kontem tabletów stajni, wybór boksu, aktualizacja N → N+1 przez `platform` w oknie serwisowym (T-24).

## Poza zakresem
- Zakup sprzętu, konta i sejf na keystore, infrastruktura `platform` w klastrze (Dawid); publikacja apki mobilnej w sklepach (MOB-025).

## Kryteria akceptacji
- [ ] `tablet/scripts/release.sh` na buildzie testowym (keystore testowy z `tablet/scripts/build-test-apks.sh`) daje APK z `applicationId` z konfiguracji, poprawnym podpisem i plikiem `release-<versionCode>.json`; podpis innym kluczem zatrzymuje skrypt.
- [ ] [ręcznie] Wydanie produkcyjne jest w `platform`, a sztuki pilotażowe mają tę wersję w diagnostyce (TAB-020) i przechodzą aktualizację testową N → N+1.

## Testy
- `shellcheck tablet/scripts/release.sh`; przebieg skryptu na keystore testowym.
- [ręcznie] T-24 na sztuce pilotażowej.

## Definicja gotowości
- `npm run check` i `npm run build` w `tablet/` zielone; `RELEASE.md` i skrypt w repo; kryteria [ręcznie] sprawdza właściciel (tasks/README.md punkt 5); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Powstało z uwagi do kolejki: apka mobilna miała zadanie publikacji (MOB-025), tablet nie.
- Keystore wydania jest nieodwracalny tak jak `applicationId`: utrata klucza = nowa aplikacja i ponowny provisioning wszystkich tabletów. Klucza nie ma w repo ani w logach CI.
<!-- dep-ok: BE-056 (wydanie da się zarejestrować trasą /platform/* bez opctl) -->
