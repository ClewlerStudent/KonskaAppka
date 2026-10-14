---
id: TAB-007
title: "Bramka sprzętowa B: prototyp tablicy, skrypty pomiarowe i raport"
area: tablet
stage: 0
size: M
status: todo
depends_on: [TAB-003, TAB-004, TAB-005, TAB-006]
decisions: [DEC-13, DEC-30]
needs: [emulator, device, owner]
owner:
branch:
trello: https://trello.com/c/bAoQobvo
---
# TAB-007 · Bramka sprzętowa B: prototyp tablicy, skrypty pomiarowe i raport

## Cel
Przed zakupem kolejnego sprzętu sprawdzamy na jednej sztuce Boox Note Air6 C, czy nadaje się na tablet przy boksie: kiosk bez ucieczki, autostart po rozładowaniu, Wi-Fi, cicha aktualizacja oraz czytelność pól koloru `t-*`. Zadanie daje prototyp tablicy, skrypty pomiarowe i szablon raportu z instrukcją; pomiary na sztuce robi Dawid (albo osoba z urządzeniem), a wynik i decyzja (model zostaje albo plan B, profil palety, czarno-białe w v1) trafiają do DEC-30.

## Kontekst
- **Stan kodu:** `tablet/` z TAB-001 (tryb `fake` z przykładami kontraktu `board` z BE-064, profile palety), moduł kiosku z TAB-002/TAB-003 (DO, Lock Task, OTA, Wi-Fi, watchdog), cicha instalacja z TAB-004, `epdRefresh` i ekran „EPD” z TAB-005, `tablet/tools/provision-tablet` z TAB-006.
- **Dokumenty:** `docs/development-szczegoly.md` 3.6 „Etap 0 tor B” (punkty (B) z 4.3.1: T-01…T-04, T-08, T-13, T-24, T-25 oraz K-01 i K-05 na Boox Note Air6 C, na sztucznych odpowiedziach `board`, z paletą `t-*` w profilu właściwym dla ekranu; kończy się decyzją: model zostaje albo plan B, Samsung Galaxy Tab Active5 dokupiony dopiero, gdy T-01 albo T-02 nie przejdą; ten sam moduł DO przechodzi na nim T-01…T-03), 4.3.1 (opis każdego testu: T-01 DO z `dumpsys device_policy`, T-02 próby ucieczki, T-03 HOME, T-04 obserwacja 72 h, T-08 50 cykli rozładowania, T-13 Wi-Fi 2,4/5 GHz, WPA2/WPA3, opóźnienie przy oszczędzaniu energii, T-24/T-25 aktualizacje; K-01 plansza testowa z polami `t-*` w rozmiarach z makiet, oświetlenie z luksomierzem, zdjęcie z szarą kartą, kolejność jasności; K-05 pola `t-warn`/`t-crit` w A2 i DU, tryb jakościowy w E-Ink Center), 4.5 „Zestaw domowy” (cykle zasilania ręcznie wtyczką, dopóki nie ma przekaźników), 5 pkt 33, 34, 37 (progi do ustalenia przed testem: interwał odpytywania i opóźnienie flagi p95, trafność stuknięć w rękawicach, próg rozróżnialności jasności).
- **Makiety:** `docs/mockups/project/TabletBoks.dc.html` (prototyp), `TabletPopup.dc.html`, `TabletUstawienia.dc.html` (EKRAN: „Profil kolorów: Kaleido 3”, „PLANSZA TESTOWA”).
- **Decyzje:** DEC-13 A (odpytywanie co 5 s z jitterem, p95 opóźnienia flagi ≤ 15 s) jako próg do raportu. DEC-30 (model i firmware po bramce B, profil Gallery 3, czarno-białe w v1): rozstrzyga ją właściciel na podstawie raportu z tego zadania.
- **Dane demo:** przykłady kontraktu `board` (BE-064) w trybie `fake` z TAB-001 (Kasztan HG 7 o 07:15 i pop-up o 06:01, Bella HN 4, Brzozowa boks 1).

## Zakres
- [ ] Prototyp `tablet/src/gate/GateBoard.tsx`: uproszczona TabletBoks z fixture'ów (nagłówek, baner flagi `t-crit` z białym tekstem, „Później: …”, tabela KARMIENIE z WSTRZYMANE i NAMOCZYĆ, OSTATNIE AKCJE, stopka ONLINE) i pop-up na `t-scrim`; przełączanie fixture'ów co N s (symulacja odpytywania z ETag w trybie `fake`), każde przełączenie z polami koloru woła `epdRefresh('full')`, zegar `partial`. Kod bramki w `src/gate/`, usuwany albo zastąpiony przez TAB-011.
- [ ] Plansza testowa K-01 `tablet/src/gate/TestPattern.tsx` (później wpięta w ukryte ustawienia, TAB-016): pola `t-paper`, `t-ok`, `t-warn`, `t-crit`, `t-ink`, `t-scrim` w rozmiarach z makiet (kafel 44 px, baner flagi, pasek popupu 16 px, lewy pasek 10 px), tekst pogrubiony czarny na `t-ok`/`t-warn`, biały 19 px na `t-crit`, `t-ink-2` 20 px na papierze; przełącznik profilu Kaleido 3 / Gallery 3; tryb K-05: te same pola rysowane w A2 i DU (przez `epdRefresh('partial')` w trybie szybkim).
- [ ] Skrypty pomiarowe `tablet/gate/` (bash + adb, zapis do `tablet/gate/results/<data>/`, katalog w `.gitignore`, poza plikiem raportu):
  - `t01-03.sh`: `dumpsys device_policy`, stan Lock Task, `getStatus()` z `EQ_PROVISION`/logcat, restart i czas do kiosku;
  - `t04-observe.sh`: co 10 min przez 72 h `pidof`, `dumpsys activity`, `dumpsys deviceidle`, licznik restartów watchdoga; wykrywa force-stop i wyłączenie pakietu;
  - `t08-power.sh`: rejestr cykli (czas zaniku i powrotu, czas do kiosku, zalogowany, boks zachowany) z wpisem ręcznym operatora przy cyklach wtyczką;
  - `t13-wifi.sh`: RSSI, pasmo, opóźnienie odpytywania z logów apki przy włączonym i wyłączonym oszczędzaniu energii;
  - `t24-25.sh`: aktualizacja N → N+1 (APK z `scripts/build-test-apks.sh`, TAB-004) i warianty przerwań (zerwane Wi-Fi, restart w trakcie, uszkodzony plik);
  - `k01-k05.md`: procedura zdjęć (ekspozycja ręczna, szara karta, luksomierz, odległość 1,5 i 2 m) i arkusz wyników; `screencap` w obu profilach i konwersja do 16 poziomów szarości (skrypt `tablet/gate/grayscale.mjs`, Node bez zależności albo `pngjs` jako zależność dev pakietu) do K-06 orientacyjnie.
- [ ] Szablon raportu `tablet/gate/RAPORT.md`: tabela testów (ID, próg ustalony przed testem, wynik, dowód: plik/zdjęcie, uwagi), model i firmware (z logu provisioningu), lista [niepotwierdzonych] z docs rozstrzygniętych w teście (nazwa pakietu OTA, tryb dla fragmentu ekranu w Onyx SDK, ustawienia E-Ink Center z ADB, profil palety dla Air6 C), rekomendacja (model zostaje / plan B / inny model) z uzasadnieniem.
- [ ] Przed testami: sekcja „Progi” w raporcie uzgodniona z Dawidem (5 pkt 33, 34, 37); bez progów raport nie ma rekomendacji.

## Poza zakresem
- Testy po bramce (T-05…T-30, K-02…K-07 poza K-01/K-05) i stanowisko testowe (4.5).
- Docelowe ekrany tabletu (TAB-008…TAB-018); zakup sprzętu (Dawid).

## Kryteria akceptacji
- [ ] [ręcznie] Na emulatorze: `GateBoard` i plansza testowa działają w trybie `fake`, przełączanie fixture'ów woła `full` tylko przy zmianie pól koloru (licznik), skrypty `t01-03.sh` i `t24-25.sh` przechodzą na emulatorze z DO.
- [ ] Szablon `tablet/gate/RAPORT.md` ma sekcję „Progi” do uzgodnienia, tabelę wszystkich testów (B) z miejscem na wynik i dowód, kroki uruchomienia każdego skryptu i listę testów do powtórzenia na Tab Active5 przy planie B; `tablet/gate/README.md` prowadzi osobę z urządzeniem od provisioningu (TAB-006) do wypełnionego raportu.
- [ ] [ręcznie] Pomiary na Boox Note Air6 C wykonane, raport wypełniony i dołączony do DEC-30 (robi Dawid albo osoba z urządzeniem; nie blokuje zamknięcia części kodowej, patrz tasks/README.md punkt 5).

## Testy
- Jest: przełączanie fixture'ów i liczenie wywołań `full` w `GateBoard`.
- `shellcheck tablet/gate/*.sh`; przebiegi skryptów na emulatorze [ręcznie]; na sztuce [ręcznie].

## Definicja gotowości
- Kod, skrypty i szablon raportu w repo, `npm run check` w `tablet/` zielone; link do wypełnionego raportu w „Rozstrzygnięciu” DEC-30 w `tasks/decisions.md` (nie w `QUEUE.md`, który jest generowany); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Agent bez sprzętu robi prototyp, skrypty i szablon; pomiary na sztuce robi osoba z urządzeniem. Nie zaznaczaj testów jako zaliczonych bez dowodu.
- T-04 i T-08 trwają długo (72 h, 50 cykli): zaplanuj je jako pierwsze po provisioningu.
- Zdjęcia i nagrania nie trafiają do repo (rozmiar); w raporcie ścieżka do miejsca, gdzie leżą.
