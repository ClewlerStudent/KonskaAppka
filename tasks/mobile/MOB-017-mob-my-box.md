---
id: MOB-017
title: "Klient: MojBoks (Ostatnio i Historia) i skrót z przycisków na Main"
area: mobile
stage: 6
size: M
status: todo
depends_on: [BE-045, MOB-012]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# MOB-017 · Klient: MojBoks (Ostatnio i Historia) i skrót z przycisków na Main

## Cel
Klient widzi, co obsługa zrobiła przy boksie jego konia (boks gotowy, posiłek, padok) i pełną historię flag i akcji od dnia, w którym koń trafił do boksu. W stajni bez przycisków obsługi widzi tylko flagi i jedną neutralną linię.

## Kontekst
- Stan kodu: pasek klienta z pozycją Historia (MOB-005, trasa `mobile/app/(app)/(client)/history.tsx`), Main z opcjonalnym skrótem z przycisków (MOB-012), `boxLabel` i odpytywanie (MOB-007). Trasy `board`: `GET /board/v1/stables/{stableId}/boxes/{boxId}` (klient: tylko boks swojego konia; po BE-045 z rutyną — „Boks gotowy” z najnowszym niecofniętym wpisem, posiłek hali z pominiętymi, padok — bez zdarzeń wyłączonych przycisków), `GET …/boxes/{boxId}/history?before=` (klient od `horse_box_history.from_at` swojego konia w tym boksie; funkcja `box_history`; flagi i zdarzenia przycisków boksu i hali, z osobą albo bez (tablet), pogrupowane po dniach, stronicowane; wpisy wyłączonych przycisków zostają), skrót „Ostatnio” w `client-home` (BE-045); stary boks po przeniesieniu konia → 404.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Klient” (MojBoks: „Ostatnio” tylko zdarzenia z przycisków obsługi — Kasztan: Boks gotowy dziś 07:10, Podano śniadanie 06:40 (pominięty: flaga), Wyprowadzono na padok wczoraj 10:05 · Piotr; „Historia” tylko flagi (utworzenie, potwierdzenie przy `requires_ack`, odwołanie) i zdarzenia z przycisków, także wczorajsze; MojBoksBezAkcji: bez „Ostatnio”, z jedną neutralną linią, „Historia” to 4 zdarzenia flag z dziś; Main: skrót z przycisków, MainBezAkcji bez skrótu). `docs/makiety-plan.md` G „MojBoksWyborKonia” (chipy „Kasztan · Główna 7” | „Bella · Nowa 4”; stany: jeden koń bez chipów, koń bez boksu: tylko flagi). A-06 (historia od dnia przypisania; wpisy z apki z osobą, z tabletu bez), A-13 (drugi „Boks gotowy” z tabletu widoczny w MojBoks), A-19 (po wyłączeniu przycisków „Ostatnio” znika, „Historia” zachowuje stare wpisy).
- Makiety: `mockups/project/MojBoks.dc.html` (H1 „Boks 7 · Hala główna”, „Klient · Kasztan stoi w tym boksie”, „Ostatnio”: „Boks gotowy · dziś 07:10”, „Podano śniadanie · Kasztan pominięty: flaga · dziś 06:40 · Ola”, „Wyprowadzono na padok · Hala główna · Piotr · wczoraj 10:05”; „Historia”: „Dziś · wt 13.10” z wpisami 07:10, 06:40, 06:02 „Potwierdzono flagę „Nie na padok””, 03:16 „Nowa flaga „Nie na padok” · dziś 14:30–16:00 · Anna”, „Wczoraj · pn 12.10” 18:02 „Podano kolację · Hala główna · Piotr”), `MojBoksBezAkcji.dc.html` („W tej stajni obsługa nie zapisuje w aplikacji sprzątania boksów, posiłków ani padoku.”), `Main.dc.html` i `MainBezAkcji.dc.html` (linia „Podano śniadanie 06:50 · boks gotowy wczoraj 17:30” pod Bellą tylko w Main). Stopka „Dane wpisuje obsługa stajni” to objaśnienie — pomijamy (docs/makiety-plan.md 2.3 i 5 pkt 38).
- Decyzje: brak nowych.
- Dane demo: Anna (Kasztan HG 7, Bella HN 4), wariant BezAkcji seedu, Anna w Brzozowej (Kometa, boks 1).

## Zakres
- [ ] `mobile/app/(app)/(client)/history.tsx` (MojBoks): wybór konia chipami przy kilku koniach (MojBoksWyborKonia: „Kasztan · Główna 7” | „Bella · Nowa 4”), nagłówek boksu („Boks 7 · Hala główna”, przy jednej hali „Boks 1”), „Klient · Kasztan stoi w tym boksie”; koń bez boksu: tylko flagi konia (z `card`), bez sekcji boksu.
- [ ] „Ostatnio”: najnowsze zdarzenia przycisków z `GET …/boxes/{boxId}` (Boks gotowy, posiłek z pominiętymi i powodem, padok z halą i osobą); bez sekcji, gdy wszystkie przyciski wyłączone — wtedy jedna linia „W tej stajni obsługa nie zapisuje w aplikacji sprzątania boksów, posiłków ani padoku.”.
- [ ] „Historia”: `GET …/boxes/{boxId}/history` z grupami dni („Dziś · wt 13.10”, „Wczoraj · pn 12.10”), wpisy z godziną, opisem i osobą (bez osoby dla tabletu), doładowanie starszych (`before`) przy przewijaniu; sekcja tylko z funkcją `box_history`.
- [ ] Skrót na Main (MOB-012): linia „Podano śniadanie 06:50 · boks gotowy wczoraj 17:30” z pola `client-home`; brak linii w wariancie BezAkcji i przy wyłączonych przyciskach.
- [ ] 404 starego boksu po przeniesieniu konia → odświeżenie `client-home` i widok nowego boksu.

## Poza zakresem
- Karta konia z planem karmienia i „Dziś” (MOB-018); pełna historia boksu jako osobny ekran „Cała historia” (P3, HistoriaBoksu).

## Kryteria akceptacji
- [ ] A-06: MojBoks Anny dla Kasztana ma „Ostatnio” i „Historię” jak na makiecie; wpisy z tabletu bez osoby, z apki z osobą; historia zaczyna się od dnia przypisania Kasztana do HG 7.
- [ ] A-13: drugi „Boks gotowy” z tabletu HG 7 pojawia się w MojBoks jako nowszy wpis.
- [ ] A-19: w wariancie BezAkcji MojBoks nie ma „Ostatnio”, ma jedną neutralną linię, a „Historia” to 4 zdarzenia flag z dziś; Main nie ma skrótu z przycisków (MainBezAkcji); wczorajszy padok 10:05 zostaje w „Historii” po wyłączeniu samego padoku, a znika z „Ostatnio”.
- [ ] Przy dwóch koniach chipy przełączają boks; w Brzozowej „Boks 1” bez hali.

## Testy
- Jest + RNTL: `my-box.test.tsx` (Main, BezAkcji, dwa konie, koń bez boksu, 404), `history-list.test.tsx` (grupy dni, stronicowanie) na fixture'ach z `backend/openapi/board.json`.
- [ręcznie] Maestro: `mobile/e2e/maestro/client-my-box.yaml` (Anna, seed i wariant BezAkcji).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Opisy zdarzeń składaj z typów i danych z serwera w i18n (PL/UA/EN), bez wolnego tekstu z backendu.
- Zmiana względem listy: dodane sprawdzenie skrótu na Main i wariantu MainBezAkcji (przeniesione z MOB-012, bo dane rutyny daje dopiero BE-045).
