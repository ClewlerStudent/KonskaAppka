---
id: TAB-002
title: "Moduł kiosku cz. 1: Device Owner, Lock Task, HOME, autostart"
area: tablet
stage: 0
size: L
status: todo
depends_on: [TAB-001]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# TAB-002 · Moduł kiosku cz. 1: Device Owner, Lock Task, HOME, autostart

## Cel
Tablet przy boksie działa jak urządzenie jednej aplikacji: po włączeniu startuje EQUENOR, z ekranu nie da się wyjść (krawędzie, przycisk zasilania, powiadomienia, Recents), ekran nie gaśnie przy zasilaniu, a po restarcie, rozładowaniu i aktualizacji apka wraca sama. Robi to własny moduł Kotlin działający jako Device Owner (DPC), bez GMS i Android Management API.

## Kontekst
- **Stan kodu:** szkielet `tablet/` z TAB-001 (Expo, prebuild do `android/`, które nie jest w repo). Modułu natywnego jeszcze nie ma.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Moduł Kotlin `modules/kiosk`” (Expo Modules API i config plugin; `DeviceAdminReceiver`, `BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED`, `MY_PACKAGE_REPLACED`; Lock Task z `setLockTaskFeatures(LOCK_TASK_FEATURE_NONE)`, `GLOBAL_ACTIONS` wyłączone jawnie; apka jako HOME, `setKeyguardDisabled`, `STAY_ON_WHILE_PLUGGED_IN`; restrykcje `DISALLOW_DEBUGGING_FEATURES` i blokada resetu fabrycznego), 3.1.2 (testy instrumentowane na emulatorze 15/16 bez Play z `dpm set-device-owner`, runner z KVM), 4.3.1 T-01 (DO: `adb shell dpm set-device-owner`, zapis `dumpsys device_policy`; z kontem Google ma się nie udać), T-02 (próby ucieczki: krawędzie i panel Boox z prawej, długie przytrzymanie zasilania, Recents, powiadomienia, szybkie ustawienia, gesty, ładowarka i klawiatura USB), T-03 (po restarcie nasza apka, bez launchera producenta), T-04 (ustawienia producenta: App Freeze, Autostart, „Stay active in the background”), T-08 (autostart po rozładowaniu, zalogowany, na zapamiętanym boksie), T-09 (soft reboot); 1.1 (GMS niepotrzebne, własny DPC).
- **Decyzje:** brak. Wybór modelu tabletu po bramce (TAB-007).
- **Dane demo:** nie dotyczy.

## Zakres
- [ ] `tablet/modules/kiosk/` (Expo Module, `expo-module.config.json`, Kotlin w `android/src/main/java/pl/equenor/kiosk/`), TS API w `tablet/modules/kiosk/index.ts`:
  - `getStatus(): { deviceOwner, lockTaskActive, isHome, keyguardDisabled, stayOn, restrictions[] }` (do diagnostyki);
  - `enterKiosk()`: `setLockTaskPackages(admin, [pakiet])`, `setLockTaskFeatures(admin, LOCK_TASK_FEATURE_NONE)`, `startLockTask()` w aktywności; `setStatusBarDisabled(admin, true)`; `setKeyguardDisabled(admin, true)`; `setGlobalSetting(STAY_ON_WHILE_PLUGGED_IN, AC|USB|WIRELESS)`; `addPersistentPreferredActivity` dla intencji HOME;
  - `applyPolicies(profile: 'dev' | 'prod')`: `prod` dokłada `DISALLOW_DEBUGGING_FEATURES`, `DISALLOW_FACTORY_RESET`, `DISALLOW_SAFE_BOOT`, `DISALLOW_ADD_USER`; `dev` ich nie ustawia (inaczej odetniemy ADB);
  - `exitKioskForService()` (tylko build `development`): `stopLockTask()`, zdjęcie restrykcji.
- [ ] `EquenorAdminReceiver : DeviceAdminReceiver` + `res/xml/device_admin.xml`; odbiornik `BootReceiver` (`BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED` z `android:directBootAware="true"`, `MY_PACKAGE_REPLACED`), który uruchamia główną aktywność i wraca do Lock Task.
- [ ] Config plugin `tablet/modules/kiosk/plugin/` (`withAndroidManifest`): receiver admina z `BIND_DEVICE_ADMIN`, filtry HOME/DEFAULT dla głównej aktywności, `RECEIVE_BOOT_COMPLETED`, `android:testOnly="true"` tylko w wariancie `development` (pozwala zdjąć DO `dpm remove-active-admin`), `lockTaskMode="if_whitelisted"`; podpięcie w `app.config.ts`.
- [ ] Hook JS `useKiosk()` w `tablet/src/kiosk/`: przy starcie apki, gdy DO, wywołuje `enterKiosk()`; gdy nie DO (emulator bez provisioningu, dev), pokazuje w rogu znacznik „NIE DO” tylko w buildzie dev.
- [ ] Testy instrumentowane (`tablet/modules/kiosk/android/src/androidTest/`, UI Automator): po `adb shell dpm set-device-owner pl.equenor.tablet.dev/pl.equenor.kiosk.EquenorAdminReceiver` aplikacja jest w Lock Task (`ActivityManager.getLockTaskModeState() == LOCK_TASK_MODE_LOCKED`), przycisk HOME i Recents nie wychodzą z apki, `pressHome()` zostaje w apce, po `adb reboot` apka startuje sama (T-01…T-03 na emulatorze); skrypt `tablet/scripts/emulator-kiosk-test.sh` (tworzy AVD, instaluje APK, ustawia DO, uruchamia `./gradlew :kiosk:connectedAndroidTest`, zbiera `dumpsys device_policy`).
- [ ] `tablet/docs/kiosk.md`: jak ustawić i zdjąć DO na emulatorze i na sztuce deweloperskiej, co robi każdy profil polityk, znane zachowania firmware (wpisywane po T-04).

## Poza zakresem
- Blokada OTA producenta, Wi-Fi, limit ładowania, watchdog (TAB-003); cicha instalacja APK (TAB-004); `epdRefresh` (TAB-005); skrypt provisioningu (TAB-006).
- Pomiary na Boox Note Air6 C i raport bramki (TAB-007).

## Kryteria akceptacji
- [ ] [ręcznie] Na emulatorze Android 16 (AOSP) po ustawieniu DO: `getStatus()` zwraca `deviceOwner: true, lockTaskActive: true, isHome: true`; HOME, Recents, przeciągnięcie paska stanu i długie przytrzymanie zasilania nie wychodzą z apki (T-02 w zakresie emulatora).
- [ ] [ręcznie] Po `adb reboot` apka startuje sama w Lock Task bez launchera (T-03); po `adb shell am force-stop` i ponownym starcie systemu też.
- [ ] [ręcznie] `adb install -r` nowszej wersji wywołuje `MY_PACKAGE_REPLACED`, a apka wraca do Lock Task bez dotykania ekranu.
- [ ] [ręcznie] Na emulatorze z kontem dodanym przez testowy `AccountAuthenticator` z APK testowego (`androidTest`, typ konta `pl.equenor.test`; AOSP bez Play nie ma innego typu konta) `dpm set-device-owner` się nie udaje, a apka działa dalej jako zwykła aplikacja (bez wyjątku). Na sprzęcie ten sam warunek sprawdza T-01 (bramka B, TAB-007).
- [ ] Profil `prod` ustawia `DISALLOW_DEBUGGING_FEATURES` tylko po jawnym wywołaniu; build `development` ma `testOnly` i daje się zdjąć `dpm remove-active-admin`.

## Testy
- [ręcznie] Instrumentowane: `cd tablet && bash scripts/emulator-kiosk-test.sh` (wymaga KVM; w CI krok z SH-003).
- Jest: `useKiosk()` z atrapą modułu (wywołanie `enterKiosk()` tylko gdy DO).

## Definicja gotowości
- `npm run check` w `tablet/` zielone, testy instrumentowane zielone na emulatorze [ręcznie]; `tablet/docs/kiosk.md` gotowy; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `LOCK_TASK_FEATURE_NONE` wyłącza też menu zasilania (`GLOBAL_ACTIONS`); nie dodawaj go z powrotem.
- Nigdy nie ustawiaj `DISALLOW_DEBUGGING_FEATURES` w dev ani w testach: stracisz ADB i emulator trzeba wyczyścić.
- DO można ustawić tylko na urządzeniu bez kont; na Boox najpierw rozpakowanie bez Wi-Fi i bez konta BOOX (T-01, TAB-006).
- Ten sam moduł ma przejść T-01…T-03 na Samsung Galaxy Tab Active5 (plan B), więc bez kodu zależnego od Boox w tej części.
<!-- dep-ok: SH-003 (krok CI z KVM; lokalnie skrypt emulatora) -->
