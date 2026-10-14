---
id: TAB-008
title: Komponenty e-ink i testy zrzutów w obu profilach palety
area: tablet
stage: 4
size: M
status: todo
depends_on: [TAB-001, TAB-005]
decisions: [DEC-30]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/TpajJ2vh
---
# TAB-008 · Komponenty e-ink i testy zrzutów w obu profilach palety

## Cel
Wszystkie ekrany tabletu powstają z jednego zestawu komponentów, które same pilnują zasad e-ink: kolor tylko w dużych polach, na kolorze tylko pogrubiony czarny albo biały tekst, status rozpoznawalny bez koloru (słowo, ikona, grubość obrysu), bez animacji, duże przyciski do obsługi w rękawicach. Testy zrzutów pokazują każdy stan w profilu Kaleido 3 i Gallery 3 oraz w skali szarości.

## Kontekst
- **Stan kodu:** `tablet/` z TAB-001 (`src/theme/palette.gen.ts` z `t-*` i profilami, `useTabletPalette()`, font Atkinson Hyperlegible, ESLint bez `Animated` i literałów kolorów), `epdRefresh` i `useEpdOnChange` z TAB-005. Komponentów jeszcze nie ma (prototyp bramki w `src/gate/` z TAB-007 jest jednorazowy).
- **Dokumenty:** `docs/paleta.md` „Zasady tabletu” (kolor tylko w polach: baner flagi, komórki tabeli, kafle ≥ 44 px, pasek popupu 16 px, lewy pasek ≥ 10 px; tekst na kolorze tylko czarny na `t-ok`/`t-warn` albo biały na `t-crit` ≥ 19 px, pogrubiony; neutralne achromatyczne; bez szarych wypełnień w roli struktury; obrysy: krytyczna ciemne pole bez ramki, uwaga ramka 4 px, OK 2 px, do zrobienia 2 px przerywana; info bez wypełnienia, ramka 2 px i ikona), `docs/development-szczegoly.md` 3.5.2 „Zasady e-ink” (popup na nieprzezroczystym `t-scrim`; bez animacji; duże fonty, przyciski ok. 15 mm; pełne odświeżenie po pop-upie, przy nowej fladze krytycznej, przy każdej zmianie pola koloru i co najmniej raz na dobę; zegar częściowo co minutę) i „Testy zrzutów”, 4.1 „Tablet” (zrzuty w obu profilach przeliczone na szarość), 1.1 „Skala makiety” (1 px makiety ≈ 0,22 mm na Air6 C: przycisk 15 mm ≈ 68 px makiety).
- **Makiety:** `mockups/project/TabletBoks.dc.html` (nagłówek 42 px, podtytuł 22 px, przyciski 64 px z ramką 2 px i zaokrągleniem 12 px, kłódka, „Zmień boks”), `TabletPopup.dc.html`, `TabletEkranZablokowany.dc.html` (przyciski z przerywaną ramką), `TabletLogowanie.dc.html` (przełącznik „TELEFON | E-MAIL”: wybrany = czarne pole i biały pogrubiony tekst), `TabletPierwszyBoks.dc.html` (kafle boksów, „WOLNY” z ramką przerywaną).
- **Decyzje:** DEC-30 (profil palety dla modelu po bramce B; development-szczegoly.md 5 pkt 40): do decyzji oba profile.
- **Dane demo:** przykłady kontraktu `board` (BE-064) w trybie `fake` z TAB-001.

## Zakres
- [ ] `tablet/src/ui/` (każdy komponent bierze kolory z `useTabletPalette()`):
  - `Text` (warianty `h1` 42, `h2` 28, `body` 22, `small` 20 z `t-ink-2` tylko na papierze; liczby `tabular-nums`), `Wordmark` (EQUENOR wersalikami, 0,16 em, 700, hasło ≥ 16 px pod spodem);
  - `StatusField` (`kind: crit | warn | ok | todo | info`): krytyczna = pole `t-crit` bez ramki i biały pogrubiony tekst ≥ 19 px; uwaga = `t-warn` + ramka 4 px `t-ink` + czarny pogrubiony; OK = `t-ok` + ramka 2 px; do zrobienia = papier + ramka 2 px przerywana; info = papier + ramka 2 px + ikona; każdy wariant wymaga słowa i ikony (props obowiązkowe);
  - `Button` (min. 68×68 px makiety, ramka 2 px `t-ink`, wariant główny = czarne pole z białym pogrubionym tekstem, `disabledLook: 'dashed'` dla zablokowanego ekranu zamiast szarości), `IconButton` (kłódka, „Zmień boks” 64 px jak na makiecie), `Segmented` („TELEFON | E-MAIL”, „PL | UA”), `Table` (nagłówki białe, linie `t-line` 1–2 px, komórki statusu jako `StatusField`), `Banner` (flaga: pole koloru na pełną szerokość), `Modal` (pop-up na pełnym `t-scrim`, pasek 16 px w kolorze statusu), `Footer` (stopka „ONLINE · aktualne na HH:MM”, PL | UA; region do `partial`), `CodeInput` (6 albo 8 pól, klawiatura 3×4 z „WYCZYŚĆ”), `QwertyKeyboard` (własna klawiatura ekranowa z „WYCZYŚĆ”, jak na planszy TabletLogowanie w `docs/makiety-plan.md` E; pola tekstowe nie otwierają klawiatury systemowej, bo ta na e-inku i w Lock Task bywa nieczytelna albo animowana);
  - `Clock` (HH:MM ze zegara serwera, aktualizacja co minutę przez `epdRefresh('partial', region)`).
- [ ] Reguła „podpis koloru”: każdy ekran zgłasza listę pól koloru (`useColorSignature([...])`); zmiana podpisu = jedno `epdRefresh('full')` (TAB-005), dobowy `full` w nocy; otwarcie i zamknięcie pop-upu też `full`.
- [ ] Lint/test zasad: test Jest przechodzi po wszystkich komponentach w każdym wariancie i sprawdza w stylach: brak kolorowego tekstu poza parami dozwolonymi, brak `t-line` jako wypełnienia, rozmiary pól koloru ≥ minimów, brak `opacity` < 1 (e-ink), brak animacji.
- [ ] Galeria deweloperska `tablet/src/dev/Gallery.tsx` (tylko build `development`, otwierana z ekranu startowego dev): każdy komponent i każdy ekran (gdy powstaną) z fixture'ów, w obu profilach.
- [ ] Testy zrzutów: `tablet/e2e/screens/capture.sh` (emulator z AVD 1404×1872 / 320 dpi z TAB-001): przełącza galerię przez intencję deweloperską, robi `adb exec-out screencap -p` dla każdego wpisu w obu profilach; `tablet/e2e/screens/compare.mjs` porównuje z wzorcami (`tablet/e2e/screens/baseline/*.png`, `pixelmatch` z tolerancją) i zapisuje wersję w 16 poziomach szarości obok; raport HTML z różnicami. Wzorce aktualizuje `npm run screens:update`.

## Poza zakresem
- Same ekrany (TAB-009…TAB-018) i ich treść; logika pop-upów i blokady (TAB-014, TAB-015).
- Ocena czytelności na prawdziwym ekranie (T-20, K-01, K-06; po bramce).

## Kryteria akceptacji
- [ ] [ręcznie] Galeria pokazuje `StatusField` w 5 wariantach, a w wersji szarości warianty różnią się jasnością i obrysem (wizualnie w raporcie zrzutów; jasności z testu tokenów SH-004).
- [ ] Test zasad e-ink wykrywa celowo złamaną regułę (np. `t-ink-2` na `t-ok`, `opacity: 0.5`, pole koloru 30 px).
- [ ] [ręcznie] `capture.sh` + `compare.mjs` dają zrzuty obu profili na emulatorze; zmiana koloru tokenu bez aktualizacji wzorców zatrzymuje porównanie.
- [ ] Zegar odświeża się przez `partial` w swoim regionie, a zmiana pola koloru daje dokładnie jedno `full` (licznik z TAB-005).

## Testy
- Jest + RNTL: render każdego komponentu w obu profilach, test zasad e-ink, `useColorSignature`. `cd tablet && npm test`.
- [ręcznie] Zrzuty: `npm run screens` (emulator wymagany; w CI nocnym, SH-003).

## Definicja gotowości
- `npm run check` w `tablet/` zielone, zrzuty wzorcowe w repo; `tablet/README.md` opisuje galerię i zrzuty; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Szary tekst na kolorze jest zakazany; szary tekst tylko `t-ink-2` ≥ 20 px na papierze.
- Na zablokowanym ekranie przyciski mają przerywaną ramkę, nie wyszarzenie (e-ink nie ma półtonów w szybkich trybach).
- Kolory wyłącznie z `t-*`; LCD-owe tokeny na tablecie nie istnieją.
<!-- dep-ok: SH-003, TAB-007 (CI nocne uruchamia zrzuty; prototyp bramki jest jednorazowy i nie jest potrzebny) -->
