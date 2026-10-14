---
id: TAB-021
title: Narzędzia do testów ciągłych tabletu (T-11, T-14, T-17)
area: tablet
stage: 9
size: S
status: todo
depends_on: [TAB-019, TAB-020]
decisions: []
owner:
branch:
trello:
---
# TAB-021 · Narzędzia do testów ciągłych tabletu (T-11, T-14, T-17)

## Cel
Na stanowisku testowym tablety pracują tygodniami, a my bez ręcznego notowania wiemy, czy apka się wysypuje, czy rośnie pamięć, jak często gubi Wi-Fi, jak grzeje się bateria i jak tablety wracają po awarii sieci. Wynik to powtarzalny raport, który wchodzi do kryteriów gotowości pilotażu.

## Kontekst
- **Stan kodu:** bufor logów i metryk w SQLite z eksportem JSONL (`tablet/src/diagnostics/`, TAB-020: RSSI, ponowne połączenia Wi-Fi, bateria, temperatura, PSS i sterta JS, udział 304, błędy odpytań, restarty watchdoga, crashe), zestawy emulatorowe i `tablet/e2e/device.sh` dla sztuk z ADB (TAB-019), watchdog i licznik restartów (TAB-003).
- **Dokumenty:** `docs/development-szczegoly.md` 4.3.1 T-11 (praca ciągła 72 h w bramce, potem ≥ 28 dni: crash i ANR, PSS i sterta JS z trendem tygodniowym, restarty, ponowne połączenia Wi-Fi, temperatura i stan baterii z `BatteryManager`, temperatura w obudowie, grubość tabletu co tydzień, liczba interwencji człowieka, czy diagnostyka dociera do logów i metryk), T-14 (AP wyłączony 1 min, 10 min, 2 h; WAN odcięty; restart AP i roaming; `netem` 5–30% strat; 802.11k/v/r; stopka „brak połączenia, dane z HH:MM” i powrót bez dotykania), T-17 (fala powrotów: jitter rozkłada odpytywanie i odświeżanie tokenów), 4.5 (stanowisko: 4 tablety, przekaźniki, `netem`, dziennik testów: każda interwencja, zawieszony ekran, „duch”, wynik cyklu zasilania; kryteria: zero interwencji w ostatnich 2 tygodniach, pamięć bez trendu, bateria bez puchnięcia, temperatura w zakresie producenta).
- **Decyzje:** brak (progi testów: development-szczegoly.md 5 pkt 33–37, ustala Dawid z właścicielem).
- **Dane demo:** środowisko testowe z seedem obu stajni; tablety stanowiska na HG 4, HG 7, HN 4, HN 6 (4.5).

## Zakres
- [ ] `tools/tablet-soak/collect.sh` (bash + adb, dla sztuk z ADB i emulatorów): co N minut (domyślnie 10) dla każdego `--serial`: `dumpsys meminfo <pakiet>` (PSS), `dumpsys batterymanager`/`dumpsys battery` (poziom, temperatura, stan), `dumpsys wifi` (RSSI, BSSID, liczba rozłączeń), `pidof <pakiet>` (zmiana PID = restart), `logcat -b crash` i wpisy `ANR in <pakiet>` od ostatniego odczytu; zapis CSV per tablet w `tools/tablet-soak/data/<data>/` (w `.gitignore`); odporność na chwilowy brak ADB.
- [ ] Import eksportu z apki: `tools/tablet-soak/import-diag.sh --serial <id>` pobiera JSONL z bufora (TAB-020) i dokłada do danych (dla sztuk bez ADB: plik z „WYŚLIJ DIAGNOSTYKĘ” przeniesiony ręcznie albo z narzędzia wybranego przez Dawida).
- [ ] Scenariusze sieci T-14 dla stanowiska: `tools/tablet-soak/net-faults.sh` (na moście Linux z `tc netem` i sterowaniem AP przez przekaźnik/API, jeśli dostępne; inaczej instrukcja ręczna z rejestracją czasów): AP off 1 min/10 min/2 h, WAN off, straty 5/15/30%; każdy krok zapisuje czas awarii i czas powrotu ONLINE z logów apki (pierwsze udane odpytanie po awarii).
- [ ] T-17: `tools/tablet-soak/wave-analysis.mjs` (Node bez zależności) liczy z logów rozkład pierwszych odpytań i odświeżeń tokenów po wspólnym powrocie sieci (histogram w sekundach; alarm, gdy > X% w tej samej sekundzie).
- [ ] Raport: `tools/tablet-soak/report.mjs` z danych CSV/JSONL tworzy `tools/tablet-soak/data/<data>/REPORT.md`: dla każdego tabletu crash/ANR, restarty (z przyczyną), trend PSS i sterty JS (nachylenie tygodniowe), rozłączenia Wi-Fi na dobę, maks. temperatura, poziom baterii (czy trzyma limit 80%), czasy powrotu po awariach T-14, wynik T-17; sekcja ręczna: interwencje człowieka, grubość tabletu, temperatura w obudowie (wpisy z dziennika).
- [ ] `tools/tablet-soak/README.md`: przygotowanie stanowiska, uruchomienie zbierania na tygodnie (`tmux`/`systemd --user`), dziennik testów (szablon `JOURNAL.md`), interpretacja raportu wobec kryteriów z 4.5.

## Poza zakresem
- Sprzęt stanowiska (przekaźniki, AP, komora) i jego zakup (Dawid); same długie testy (wykonuje zespół na stanowisku).
- Test obciążenia backendu (BE-058).

## Kryteria akceptacji
- [ ] `collect.sh` na emulatorze przez 1 h zbiera dane co 1 min; zabicie procesu apki w trakcie jest widoczne w raporcie jako restart; crash wywołany przyciskiem dev jest policzony.
- [ ] `report.mjs` na danych przykładowych (`tools/tablet-soak/fixtures/`) daje raport z trendem pamięci i listą zdarzeń; test `node --test tools/tablet-soak`.
- [ ] `net-faults.sh` na emulatorze w wariancie uproszczonym (`adb shell svc wifi disable/enable`) mierzy czas powrotu do ONLINE.
- [ ] `shellcheck tools/tablet-soak/*.sh` bez ostrzeżeń.

## Testy
- `node --test tools/tablet-soak` (parsowanie `dumpsys`, trend, histogram fali); ręczny przebieg na emulatorze.

## Definicja gotowości
- Narzędzia i README w repo, testy zielone; przykładowy raport z emulatora dołączony do zadania (ścieżka w tym pliku); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `tools/` to skrypty bez pakietu npm (Node 22 bez zależności, bash).
- Dane z testów nie trafiają do repo (rozmiar, możliwe dane sieci); tylko fixture'y do testów narzędzi.
- Nie zbieraj z tabletu niczego, czego nie ma w diagnostyce TAB-020 (bez danych osobowych).
