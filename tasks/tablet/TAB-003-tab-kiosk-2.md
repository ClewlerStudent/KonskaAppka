---
id: TAB-003
title: "Moduł kiosku cz. 2: blokada OTA, Wi-Fi przez DPC, limit ładowania, watchdog"
area: tablet
stage: 0
size: M
status: todo
depends_on: [TAB-002]
decisions: [DEC-13, DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/J91TKWaA
---
# TAB-003 · Moduł kiosku cz. 2: blokada OTA, Wi-Fi przez DPC, limit ładowania, watchdog

## Cel
Tablet nie aktualizuje sam firmware producenta (który może zepsuć kiosk albo odświeżanie e-ink), da się na nim zmienić sieć Wi-Fi z poziomu naszej apki, bateria nie siedzi stale na 100% i nie puchnie, a zawieszona apka sama się restartuje bez człowieka.

## Kontekst
- **Stan kodu:** moduł `tablet/modules/kiosk/` z TAB-002 (Device Owner, Lock Task, `getStatus()`, `applyPolicies(dev|prod)`), hook `tablet/src/kiosk/useKiosk.ts`.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Moduł Kotlin” (blokada aktualizatora OTA producenta przez `setPackagesSuspended` albo `setApplicationHidden` i `setSystemUpdatePolicy`; watchdog: restart procesu, gdy JS przez N minut nie zgłosi udanego odpytania; limit ładowania tam, gdzie firmware go udostępnia, Boox: `charge_control_en`; dodanie sieci Wi-Fi jako DO (`WifiManager.addNetwork`), sprawdzone pod kątem kolizji z `DISALLOW_CONFIG_WIFI`), 1.1 (Boox „Charging protection” ze stałym progiem 80%: na Note Air6 C FW 4.3 ustawienie zapisuje `charge_control_end_threshold`, przełącznik `/sys/class/qcom-battery/charge_control_en`; nazwa pakietu aktualizatora OTA [niepotwierdzone]), 4.3.1 T-05 (aktualizator: ustalić nazwę pakietu; okres zamrożenia ≤ 90 dni), T-06 (restrykcje nie przeszkadzają w cichej instalacji ani w dodaniu sieci), T-10 (limit ładowania 80%), T-15 (zmiana sieci w kiosku, zgodność z `DISALLOW_CONFIG_WIFI`), T-26 (crash przy starcie uruchamia watchdog).
- **Decyzje:** DEC-18 A (Wi-Fi zmienia na PoC każdy przy tablecie, przez ukryte ustawienia; ekran: TAB-016). DEC-13 A (odpytywanie co 5 s; watchdog liczy brak udanego odpytania, nie brak sieci).
- **Makiety:** `TabletUstawienia.dc.html` (SIEĆ „Stajnia-PodLipami” → „ZMIEŃ SIEĆ”), plansza TabletWifi opisana w `docs/makiety-plan.md` E (lista sieci, hasło, WPA2/WPA3, „POŁĄCZ”, stany: łączenie, złe hasło, połączono, sieć bez internetu).

## Zakres
- [ ] OTA: `blockVendorUpdater(packages: string[])` (`setPackagesSuspended(admin, pkgs, true)`, a gdy pakiet tego nie dopuszcza, `setApplicationHidden`); lista pakietów w `tablet/src/kiosk/vendor-updaters.ts` per model (Boox: do ustalenia w T-05 na sztuce, np. przez `adb shell pm list packages | grep -i ota`); `setSystemUpdatePolicy(SystemUpdatePolicy.createPostponeInstallPolicy())` albo okno zamrożenia (≤ 90 dni) z odnowieniem; wynik w `getStatus().updater` (`blocked | not_found | failed`).
- [ ] Wi-Fi: `listNetworks()` (zapisane sieci i bieżąca: SSID, BSSID, pasmo, RSSI, link speed), `scanNetworks()` (DO nadaje sobie potrzebne uprawnienia przez `setPermissionGrantState`, np. lokalizacja do skanu), `addNetwork({ ssid, password, security: 'WPA2' | 'WPA3' })` (`WifiManager.addNetwork`/`addNetworkPrivileged` jako DO; `enableNetwork`), `removeNetwork(id)`; zdarzenia stanu połączenia do JS (`connecting | connected | auth_failed | no_internet`). Sprawdzenie z ustawioną restrykcją `DISALLOW_CONFIG_WIFI`: DO dalej dodaje sieć, a użytkownik nie zmieni jej z ustawień systemu (T-15).
- [ ] Limit ładowania: `getChargeLimitSupport()` (sprawdza znane klucze i ścieżki: `Settings.Global`/`System` `charge_control_*`, `/sys/class/qcom-battery/charge_control_en`; zwraca `supported | unsupported | no_permission` z opisem), `setChargeLimit(enabled)`; gdy firmware nie pozwala, jawny status w diagnostyce, nie cichy brak. Odczyt baterii (`BatteryManager`: poziom, temperatura, stan ładowania, zdrowie) do diagnostyki.
- [ ] Watchdog z dwoma sygnałami z JS: `kiosk.alive()` co 30 s z głównej pętli (JS działa; także na ekranie logowania i offline) i `kiosk.heartbeat()` po każdym udanym odpytaniu `board` (TAB-012). Natywny `WatchdogScheduler` (AlarmManager `setExactAndAllowWhileIdle` co 1 min) restartuje proces, gdy: brak `alive` przez `WATCHDOG_ALIVE_MIN` (domyślnie 2 min: zawieszony JS, crash przy starcie z T-26) albo brak `heartbeat` przez `WATCHDOG_POLL_MIN` (domyślnie 15 min, zgodnie z 3.5.2: „N minut bez udanego odpytania”; tylko gdy konto jest zalogowane). Restart: zapis przyczyny do lokalnego logu, `PendingIntent` do aktywności i `Process.killProcess`; licznik restartów na dobę w `getStatus()`; backoff przy braku sieci: kolejny restart z powodu braku `heartbeat` najwcześniej po 2× poprzednim odstępie (maks. 2 h), żeby długa awaria Wi-Fi (T-14) nie dawała pętli restartów. Wartości w `app.config.ts` (`extra.watchdog`).
- [ ] TS API i typy w `tablet/modules/kiosk/index.ts`; atrapy modułu do testów Jest w `tablet/src/kiosk/__mocks__/`.
- [ ] `tablet/docs/kiosk.md` uzupełniony: OTA, Wi-Fi, ładowanie, watchdog, wyniki sprawdzeń na emulatorze i (po TAB-007) na Boox.

## Poza zakresem
- Ekran zmiany sieci i ukryte ustawienia (TAB-016); cicha instalacja APK (TAB-004); odpytywanie (TAB-012).
- Pomiary T-05, T-10, T-15 na sztuce i ich raport (TAB-007, testy po bramce).

## Kryteria akceptacji
- [ ] [ręcznie] Emulator z DO: `addNetwork` dodaje sieć emulatora (`AndroidWifi`) także przy `DISALLOW_CONFIG_WIFI`; złe hasło daje zdarzenie `auth_failed`, nie wyjątek w JS.
- [ ] `blockVendorUpdater(['pakiet.nieistniejacy'])` zwraca `not_found`, a dla istniejącego pakietu testowego (np. zainstalowane APK testowe) `blocked`; `setSystemUpdatePolicy` jest widoczne w `dumpsys device_policy`.
- [ ] Watchdog: bez `alive` przez skrócony w teście czas (1 min) proces jest restartowany i wraca do Lock Task; bez `heartbeat` przy żywym `alive` restart następuje po `WATCHDOG_POLL_MIN`, a kolejny dopiero po podwojonym odstępie; przy regularnych sygnałach restartu nie ma; licznik restartów rośnie.
- [ ] [ręcznie] `getChargeLimitSupport()` na emulatorze zwraca `unsupported` z opisem (bez wyjątku).

## Testy
- [ręcznie] Instrumentowane na emulatorze (rozszerzenie `scripts/emulator-kiosk-test.sh` z TAB-002): Wi-Fi z restrykcją, polityka aktualizacji, watchdog ze skróconym limitem.
- Jest: logika backoffu watchdoga i mapowanie zdarzeń Wi-Fi (atrapa modułu). `cd tablet && npm test`.

## Definicja gotowości
- `npm run check` w `tablet/` zielone, testy instrumentowane zielone; `tablet/docs/kiosk.md` zaktualizowany; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nie zgaduj nazwy pakietu OTA Boox w kodzie produkcyjnym: lista per model, uzupełniana po T-05.
- `charge_control_*` to obserwacja społeczności (BooxUltimatum), nie API producenta; traktuj jako „może nie działać po aktualizacji firmware” i raportuj.
- Watchdog nie może zamienić awarii sieci w pętlę restartów: dlatego dwa sygnały i backoff dla `heartbeat`. Wylogowany tablet nie wysyła `heartbeat`, więc liczy się tylko `alive`.
