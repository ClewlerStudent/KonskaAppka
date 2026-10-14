---
id: TAB-015
title: "Blokada ekranu na czas mycia (TabletEkranZablokowany)"
area: tablet
stage: 4
size: M
status: todo
depends_on: [TAB-014]
decisions: [DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/qMry2GLg
---
# TAB-015 · Blokada ekranu na czas mycia (TabletEkranZablokowany)

## Cel
Przed myciem albo wycieraniem tabletu obsługa stuka kłódkę i ekran przestaje reagować na dotyk: mokra ścierka nie zapisze „Boks gotowy”, nie potwierdzi flagi i nie zmieni boksu. Tablica dalej się odświeża, nowa flaga dalej się pojawia, a blokada sama schodzi po 10 minutach.

## Kontekst
- **Stan kodu:** `BoardScreen` z przyciskiem kłódki w nagłówku (TAB-011), pop-upy (TAB-014), „Zmień boks” (TAB-010), komponenty z wariantem `disabledLook: 'dashed'` (TAB-008), odpytywanie (TAB-012).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „TabletEkranZablokowany” (kłódka obok „Zmień boks” włącza blokadę; tablica dalej się odświeża, dotyk nic nie zmienia; pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować”, kółko postępu przytrzymania; przyciski z przerywaną ramką zamiast wyszarzenia; pop-up nowej flagi mimo blokady, POTWIERDZAM po odblokowaniu; blokada schodzi sama po 10 min; stan tylko w pamięci apki, bez API; po restarcie odblokowany; to blokada dotyku, nie boksu), 4.1 „Tablet” (seria stuknięć i przeciągnięć nie wysyła żadnego zapisu; odblokowanie dopiero po 3 s; pop-up mimo blokady; po 10 min schodzi), 4.3.1 T-30 (mycie na sztuce: zero zapisów, mokra ścierka nie odblokowuje; czytelność paska z 1,5 m; bez „duchów”), 4.4 A-15; `docs/erd.md` pkt 2 „Blokada ekranu”.
- **Makiety:** `mockups/project/TabletEkranZablokowany.dc.html` (tablica Kasztana z przyciskami SZYBKIE AKCJE z przerywaną ramką i podpisem „dotyk wyłączony do odblokowania”, pasek „EKRAN ZABLOKOWANY · do 07:25 · przytrzymaj kłódkę 3 s, aby odblokować”); TabletPopupZablokowany (`docs/makiety-plan.md` E: POTWIERDZAM z przerywaną ramką i „Przytrzymaj kłódkę 3 s, aby odblokować, potem POTWIERDZAM”, licznik „1 z 2”); TabletEkranZablokowanyBrzozowa (P3) jako wariant bez hali.
- **Decyzje:** DEC-18 A (blokada schodzi po 10 min; wartości w jednym pliku konfiguracji).
- **Dane demo:** HG 7 Kasztan o 07:15; nowa flaga z apki w trakcie blokady (A-15).

## Zakres
- [ ] `tablet/src/lock/useScreenLock.ts`: stan `{ locked, until }` tylko w pamięci (bez SQLite i bez API); `lock()` ustawia `until = teraz + 10 min` (czas z zegara serwera z TAB-012, do etykiety „do HH:MM”); timer zdejmuje blokadę po czasie; restart apki = odblokowany.
- [ ] Warstwa przechwytująca dotyk (`LockOverlay`): przy `locked` pełnoekranowy `View` nad treścią przechwytuje wszystkie zdarzenia (`onStartShouldSetResponder`), poza obszarem kłódki; żaden przycisk pod spodem nie dostaje dotyku (także gesty wielopalcowe i przeciągnięcia).
- [ ] Odblokowanie: przytrzymanie kłódki 3 s z kółkiem postępu (czarno-białe, rysowane skokowo, np. 4 segmenty co 0,75 s z `epdRefresh('partial')`, bez animacji płynnej); puszczenie przed czasem zeruje postęp; dotyk wielu palców albo przesuwający się (mokra ścierka) nie liczy się jako przytrzymanie: wymagane jedno stabilne dotknięcie w obrębie kłódki (tolerancja przesunięcia np. 24 px makiety).
- [ ] Wygląd przy blokadzie: pasek `StatusField` (czarno-biały, bez szarości) „EKRAN ZABLOKOWANY · do HH:MM · przytrzymaj kłódkę 3 s, aby odblokować” zamiast stopki; przyciski (SZYBKIE AKCJE, „Zmień boks”, PL | UA) z przerywaną ramką; podpis „dotyk wyłączony do odblokowania”; wejście w ukryte ustawienia (przytrzymanie stopki, TAB-016) nie działa; zmiana wyglądu przy blokadzie i odblokowaniu jednym pełnym odświeżeniem (bez „duchów”, T-21).
- [ ] Pop-up przy blokadzie (TabletPopupZablokowany): pokazuje się normalnie, POTWIERDZAM z przerywaną ramką i dopiskiem „Przytrzymaj kłódkę 3 s, aby odblokować, potem POTWIERDZAM”; kłódka dostępna na pop-upie; po odblokowaniu POTWIERDZAM działa od razu.
- [ ] Teksty PL i UA w i18n.

## Poza zakresem
- Fizyczny przycisk zamiast dotyku (decyzja otwarta, development-szczegoly.md 5 pkt 46).
- Test mycia na sztuce (T-30; testy po bramce).

## Kryteria akceptacji
- [ ] [ręcznie] A-15 na emulatorze: po zablokowaniu seria stuknięć i przeciągnięć po całym ekranie (skrypt `adb shell input tap/swipe` w pętli) nie wysyła żadnego żądania zapisu (log klienta API i kolejka puste), boks się nie zmienia, „Zmień boks” się nie otwiera.
- [ ] Przytrzymanie kłódki 2,9 s nie odblokowuje, 3 s odblokowuje; przytrzymanie z przesunięciem > tolerancji nie odblokowuje.
- [ ] Nowa flaga z apki w trakcie blokady: pop-up się pojawia, POTWIERDZAM nie działa do odblokowania, po odblokowaniu działa.
- [ ] Po 10 min blokada schodzi sama; po zabiciu procesu ekran jest odblokowany; blokowanie i odblokowanie nie wysyłają żadnego żądania.
- [ ] Tablica przy blokadzie dalej się odświeża (zmiana „Boks gotowy” z apki widoczna przy najbliższym odpytaniu).

## Testy
- Jest + RNTL z fałszywymi timerami: przechwytywanie dotyku, progi 3 s i 10 min, przesunięcie palca, pop-up przy blokadzie.
- [ręcznie] Emulator: flow Maestro `tablet/e2e/maestro/screen-lock.yaml` + skrypt `tablet/e2e/scripts/wipe-simulation.sh` (losowe `input swipe`/`tap` przez 60 s, potem sprawdzenie, że kolejka i log zapisów są puste).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; flow Maestro i skrypt „mycia” przechodzą [ręcznie]; zrzuty TabletEkranZablokowany i TabletPopupZablokowany w galerii; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Serwer o blokadzie nie wie; nie zapisuj jej w pamięci trwałej (po restarcie ma być odblokowane).
- Blokada nie wyłącza odpytywania ani pełnych odświeżeń EPD przy zmianie statusu.
- 3 s i 10 min trzymaj w `tablet/src/config.ts` obok innych wartości z DEC-18.
