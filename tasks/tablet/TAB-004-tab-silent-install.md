---
id: TAB-004
title: Cicha instalacja APK jako Device Owner
area: tablet
stage: 0
size: M
status: todo
depends_on: [TAB-002]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# TAB-004 · Cicha instalacja APK jako Device Owner

## Cel
Tablet instaluje nową wersję naszej apki bez dotykania ekranu i bez sklepu: tylko plik o zgodnej sumie `sha256` i podpisany naszym certyfikatem, z wyższym `versionCode`. Uszkodzony albo obcy plik jest odrzucany, a po instalacji tablet sam wraca do kiosku na tym samym boksie i z tą samą sesją.

## Kontekst
- **Stan kodu:** moduł `tablet/modules/kiosk/` z TAB-002 (Device Owner, Lock Task, odbiornik `MY_PACKAGE_REPLACED`, który wraca do Lock Task). Serwer wydań: BE-040 (`GET /platform/v1/tablet/latest` zwraca `versionCode`, `sha256`, `signingCertSha256`, `sizeBytes`, `downloadUrl`, `mandatory`, okno instalacji); pobieranie i decyzja „kiedy instalować”: TAB-017.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 („cicha instalacja przez `PackageInstaller`, z kontrolą `sha256` i certyfikatu podpisu”; „Aktualizacja APK”: cofnięcie wersji to APK z wyższym `versionCode`), 4.3.1 T-24 (B: `PackageInstaller` jako DO, restart przez `MY_PACKAGE_REPLACED` i powrót do Lock Task; zły podpis albo uszkodzony plik odrzucony, stara wersja działa dalej), T-25 (B: przerwana aktualizacja: Wi-Fi, wygasły presigned URL, zanik prądu i restart w trakcie instalacji; zawsze kończy na działającej wersji i wraca do kiosku), T-26 (wadliwa wersja: watchdog i `halted`), T-27 (Play Protect; T-24 powtarzać po aktualizacjach Play services).
- **Decyzje:** brak.
- **Dane demo:** dwa APK testowe tej samej apki: `versionCode` N i N+1 podpisane kluczem dev, oraz N+1 podpisany innym kluczem.

## Zakres
- [ ] TS API w `tablet/modules/kiosk/index.ts`:
  - `verifyApk(path, { sha256, signingCertSha256, minVersionCode }) → { ok } | { ok: false, reason: 'sha256_mismatch' | 'signature_mismatch' | 'not_newer' | 'wrong_package' | 'unreadable' }`: SHA-256 pliku strumieniowo; `PackageManager.getPackageArchiveInfo(path, GET_SIGNING_CERTIFICATES)`: ta sama nazwa pakietu, `versionCode` > zainstalowanego, SHA-256 certyfikatu podpisu równy `signingCertSha256` z serwera i równy certyfikatowi zainstalowanej apki (obie kontrole);
  - `installApk(path) → Promise<'committed'>` i zdarzenie `installResult` (`success | failure` z kodem `PackageInstaller.STATUS_*`): sesja `MODE_FULL_INSTALL`, zapis pliku, `commit` z `IntentSender` do `InstallResultReceiver`; jako DO bez okna potwierdzenia;
  - przed `commit` apka zapisuje znacznik „instalacja w toku” (wersja, czas) w pamięci lokalnej; po starcie nowej wersji znacznik jest czyszczony i trafia do diagnostyki jako „zaktualizowano z X do Y”; po starcie starej wersji ze znacznikiem: „instalacja przerwana” w diagnostyce, plik do ponownej weryfikacji.
- [ ] Powrót po instalacji: `MY_PACKAGE_REPLACED` (TAB-002) uruchamia aktywność, Lock Task wraca; JS po starcie czyta boks, język i refresh token z pamięci lokalnej (to robią TAB-009/TAB-010; tu test, że dane w `AsyncStorage`/SQLite i Keystore przetrwały `adb install -r`).
- [ ] Sprzątanie: pliki APK w `filesDir/updates/` usuwane po udanej instalacji i po odrzuceniu; najwyżej jeden plik naraz.
- [ ] Skrypt `tablet/scripts/build-test-apks.sh`: buduje APK `versionCode` N i N+1 (env `TABLET_VERSION_CODE`), wariant N+1 z innym kluczem (`keytool` tymczasowy) i uszkodzoną kopię (obcięty plik), wypisuje `sha256` i SHA-256 certyfikatu (`apksigner verify --print-certs`).
- [ ] Testy instrumentowane (rozszerzenie `scripts/emulator-kiosk-test.sh`): instalacja N+1 z pliku w `filesDir` przechodzi bez UI i apka wraca do Lock Task; obcy podpis, uszkodzony plik i ten sam `versionCode` są odrzucane przez `verifyApk` (a gdyby ominąć weryfikację, `PackageInstaller` też odrzuca obcy podpis), stara wersja dalej działa; `adb reboot` w trakcie `commit` kończy się działającą wersją (starą albo nową) i powrotem do kiosku.
- [ ] `tablet/docs/kiosk.md`: sekcja „Aktualizacja APK” (wymagania wobec wydania: ten sam klucz podpisu, rosnący `versionCode`, cofnięcie = wyższy `versionCode`; gdzie Dawid trzyma keystore).

## Poza zakresem
- Pobieranie z `downloadUrl` ze wznawianiem, okno serwisowe, pusta kolejka zapisów, ekran TabletAktualizacja (TAB-017).
- Serwer wydań i rollout (BE-040), CLI wydań (BE-056).

## Kryteria akceptacji
- [ ] [ręcznie] T-24 na emulatorze: N → N+1 instaluje się bez dotykania ekranu; po instalacji apka jest w Lock Task, a znacznik w diagnostyce mówi „zaktualizowano z N do N+1”.
- [ ] Obcy podpis: `signature_mismatch`, nic się nie instaluje; uszkodzony plik: `sha256_mismatch`; ten sam albo niższy `versionCode`: `not_newer`.
- [ ] [ręcznie] T-25 (emulator): restart w trakcie instalacji kończy się działającą wersją i powrotem do kiosku; znacznik „instalacja przerwana”, gdy została stara wersja.
- [ ] Dane lokalne (boks, język, refresh token) przetrwały aktualizację (test z wartościami zapisanymi przed instalacją).

## Testy
- [ręcznie] Instrumentowane: `cd tablet && bash scripts/build-test-apks.sh && bash scripts/emulator-kiosk-test.sh --suite install`.
- Jest: logika znacznika „instalacja w toku” i mapowanie powodów odrzucenia (atrapa modułu).

## Definicja gotowości
- `npm run check` w `tablet/` zielone, testy instrumentowane zielone; `tablet/docs/kiosk.md` zaktualizowany; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Weryfikuj przed `commit`: `PackageInstaller` też odrzuci obcy podpis, ale my chcemy jawny powód w diagnostyce i nie chcemy zaczynać sesji dla złego pliku.
- Sprawdź, czy przy `targetSdk` 36 potrzebne jest uprawnienie `REQUEST_INSTALL_PACKAGES` dla DO; dopisz je przez config plugin tylko, jeśli test bez niego nie przechodzi.
- Klucz podpisu release to sekret (keystore Dawida z kopią poza klastrem); w repo i w testach tylko klucze tymczasowe.
- Utrata klucza podpisu = brak aktualizacji na wszystkich tabletach (trzeba ponownego provisioningu); dopisz to do runbooków (SH-006).
<!-- dep-ok: BE-040 (serwer wydań woła dopiero TAB-017; tu instalacja z pliku) -->
