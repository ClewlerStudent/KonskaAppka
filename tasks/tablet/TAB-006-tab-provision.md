---
id: TAB-006
title: tools/provision-tablet (provisioning przez ADB)
area: tablet
stage: 0
size: M
status: todo
depends_on: [TAB-002, TAB-003]
decisions: [DEC-18]
needs: [emulator, device]
owner:
branch:
trello: https://trello.com/c/zfHBOBQ4
---
# TAB-006 · tools/provision-tablet (provisioning przez ADB)

## Cel
Nowy tablet z pudełka staje się kioskiem EQUENOR jednym skryptem, w stałej kolejności, z zapisem modelu i firmware, bez konta producenta i bez ręcznego klikania w ustawieniach (poza krokami, których nie da się zautomatyzować). Ten sam skrypt służy do wymiany tabletu i ponownego provisioningu po resecie z recovery.

## Kontekst
- **Stan kodu:** moduł `tablet/modules/kiosk/` z TAB-002 (DO, Lock Task, `applyPolicies(dev|prod)`); TAB-003 dodaje Wi-Fi przez DPC i blokadę OTA (skrypt woła je, gdy są). APK budowany `npm run apk` w `tablet/` (TAB-001). Katalog `tools/` w korzeniu to skrypty spoza npm (jak `tools/display-kiosk` w WEB-019).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „`tools/provision-tablet`, w tej kolejności”: 1) rozpakowanie bez Wi-Fi i bez konta; 2) zapis modelu, numeru firmware i `ro.board.platform`; 3) włączenie ADB według procedury dla modelu; 4) `adb install`; 5) `dpm set-device-owner`; 6) blokada aktualizatora OTA i polityki oraz ustawienia producenta; 7) dopiero teraz sieć przez DPC; 8) logowanie kontem technicznym tabletów i wybór boksu; 9) wyłączenie ADB. „Odzyskanie tabletu”: reset z recovery jako ścieżka serwisowa, potem ponowny provisioning (FRP bez konta Google: [niepotwierdzone], T-06). 4.3.1 T-04 (ustawienia producenta: App Freeze wyłączone, Autostart włączony, „Stay active in the background” Unlimited, auto-uśpienie i auto-wyłączenie wyłączone, Wi-Fi w uśpieniu), T-07 (czas od rozpakowania do kiosku i powtarzalność), K-02 (ustawienia E-Ink Center: zapisać domyślne, zamrozić w provisioningu; czy z ADB/DPC: [niepotwierdzone]). 1.1 (numer firmware zapisujemy przed pierwszym połączeniem z Wi-Fi).
- **Decyzje:** brak. Model tabletu po bramce (TAB-007); kto zmienia Wi-Fi później: DEC-18 (TAB-016).
- **Dane demo:** konto „Tablety Pod Lipami” (b•••@stajnielipowe.pl) w kroku 8 na środowisku dev/test; boks wybierany na ekranie TabletPierwszyBoks (TAB-010).

## Zakres
- [ ] `tools/provision-tablet/provision.sh` (bash, `set -euo pipefail`, wymaga `adb` i `jq` opcjonalnie): argumenty `--apk <plik>`, `--serial <adb-serial>`, `--profile dev|prod`, `--wifi-ssid`, `--wifi-pass-file <plik>` (hasło z pliku, nie z argumentu), `--model-config <plik>`; kroki 2–7 i 9 automatycznie, kroki 1, 3 i 8 jako instrukcja na ekranie z oczekiwaniem na Enter; każdy krok z czasem trwania.
- [ ] Krok 2: `adb shell getprop ro.product.manufacturer|model|ro.build.fingerprint|ro.build.display.id|ro.board.platform`, `dumpsys account` (musi być pusto, inaczej przerwij z komunikatem), zapis do `tools/provision-tablet/logs/<serial>-<data>.json` (katalog w `.gitignore`).
- [ ] Krok 4–5: `adb install -r`, `adb shell dpm set-device-owner <pakiet>/pl.equenor.kiosk.EquenorAdminReceiver`, zapis `dumpsys device_policy` do logu.
- [ ] Krok 6: wywołanie DPC przez ADB: `adb shell am broadcast -a pl.equenor.tablet.PROVISION -n <pakiet>/pl.equenor.kiosk.ProvisionReceiver --es step policies --es profile <dev|prod>`; odbiornik w module kiosku chroniony uprawnieniem, które ma tylko powłoka ADB (np. `android.permission.DUMP`), wywołuje `blockVendorUpdater`, `setSystemUpdatePolicy`, `applyPolicies`; ustawienia producenta z pliku modelu (`tools/provision-tablet/models/<model>.json`: lista komend `settings put …`/`pm …` dla Boox z T-04 i K-02, gdy da się je ustawić z ADB; inaczej lista kroków ręcznych wypisana operatorowi).
- [ ] Krok 7: `--es step wifi` z SSID i hasłem (hasło przekazane przez plik tymczasowy usuwany po kroku albo przez `--es` z ostrzeżeniem o historii powłoki), oczekiwanie na `connected` i test `curl` portu 443 do API z tabletu (`adb shell` + `toybox nc` albo odczyt diagnostyki).
- [ ] Krok 9 (`--profile prod`): `--es step finalize` (DPC ustawia `DISALLOW_DEBUGGING_FEATURES`), potem ADB znika; skrypt kończy podsumowaniem (model, firmware, wersja APK, czas całości) dopisanym do logu.
- [ ] `tools/provision-tablet/README.md`: procedura dla Boox Note Air6 C (jak włączyć ADB bez konta BOOX, kroki ręczne), dla emulatora (`--serial emulator-5554`), odzyskanie po resecie z recovery, jak dodać nowy model (plik w `models/`), co zrobić, gdy `set-device-owner` odmawia (konta, użytkownicy, ponowny reset).
- [ ] `ProvisionReceiver` w module kiosku (Kotlin, część tego zadania): kroki `policies`, `wifi`, `finalize`, `status` (zwraca JSON do `logcat` z tagiem `EQ_PROVISION`), odrzuca wywołania, gdy apka nie jest DO.

## Poza zakresem
- Logowanie kontem tabletów i wybór boksu jako ekrany (TAB-009, TAB-010): skrypt tylko prosi operatora o wykonanie kroku 8.
- Pomiary T-07 na Boox i raport (TAB-007); flota i zdalne zarządzanie (nie ma tabeli urządzeń, erd.md pkt 2).

## Kryteria akceptacji
- [ ] [ręcznie] Na emulatorze AOSP bez kont `provision.sh --profile dev --serial emulator-5554` przechodzi kroki 2–7 bez błędu, a apka jest DO w Lock Task, z dodaną siecią; log JSON zawiera model, fingerprint i czasy kroków.
- [ ] [ręcznie] Na emulatorze z kontem skrypt przerywa w kroku 2 z czytelnym komunikatem.
- [ ] Ponowne uruchomienie na tym samym urządzeniu (już DO) jest bezpieczne: kroki już wykonane raportuje jako „bez zmian”.
- [ ] [ręcznie] `--profile prod` na emulatorze kończy się odcięciem ADB (`adb devices` pokazuje `unauthorized`/brak), co potwierdza krok 9; emulator trzeba potem wyczyścić (opis w README).
- [ ] `shellcheck tools/provision-tablet/*.sh` bez ostrzeżeń.

## Testy
- [ręcznie] Ręczny przebieg na emulatorze (kryteria wyżej) i na sztuce deweloperskiej przez osobę z urządzeniem (wynik T-07 do raportu bramki).
- Instrumentowane: `ProvisionReceiver` odrzuca wywołanie bez uprawnienia i bez DO.

## Definicja gotowości
- Kryteria spełnione; `tools/provision-tablet/README.md` gotowy; `shellcheck` w kroku CI z SH-003; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Kolejność kroków jest ważna: sieć dopiero po DO i blokadzie OTA (inaczej tablet może pobrać aktualizację firmware przed blokadą).
- Hasła Wi-Fi i danych logowania nie zapisuj w logach skryptu; plik hasła z prawami 600.
- `DUMP` jako uprawnienie ochronne odbiornika to propozycja: sprawdź na Android 16, że zwykła apka nie wywoła odbiornika, a `adb shell am broadcast` tak.
<!-- dep-ok: WEB-019 (tylko wzór katalogu tools/) -->
