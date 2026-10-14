---
id: MOB-016
title: ListaDnia obsługi (szybkie akcje, „Boks gotowy”, wymaga potwierdzenia)
area: mobile
stage: 6
size: L
status: todo
depends_on: [BE-044, BE-045, MOB-008, MOB-015, SH-002]
decisions: [DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/GKSVw6qT
---
# MOB-016 · ListaDnia obsługi

## Cel
Obsługa zaczyna dzień od jednego ekranu: szybkie akcje per hala („Podano śniadanie”, „Wyprowadzono na padok”, „Boks gotowy” dla kilku boksów naraz) z cofnięciem, flagi wymagające potwierdzenia i flagi dnia. Pokazuje się tylko to, co stajnia ma włączone.

## Kontekst
- Stan kodu: start obsługi `mobile/app/(app)/(staff)/index.tsx` jako szkielet (MOB-005), kolejka zapisów z `enqueueBuildingRoutine`, `enqueueBoxCare`, `enqueueUndo` i optymistycznym stanem (MOB-008), potwierdzanie i `FlagCard` (MOB-015, MOB-012), konfiguracja przycisków (MOB-007). Trasy: `GET /board/v1/stables/{stableId}/day` (obsługa i admin: szybkie akcje per hala tylko włączone — posiłek bieżący albo następny z „podane HH:MM · autor” i pominiętymi, „Cofnij” w oknie 1 h; padok z godziną, liczbą koni per hala i pominiętymi; „Boks gotowy X z Y” razem i per hala; „Wymaga potwierdzenia”; „Flagi dziś”; skrót zadań przy funkcji `tasks`; boksy z poidłem ręcznym i godziną wody) — BE-045; `POST /operations/v1/stables/{stableId}/building-routines` (`meal_served` z `mealSlotId`, `paddock_out`; odpowiedź z pominiętymi; drugi zapis tej samej pory → 200 `alreadyDone` z godziną i autorem), `POST …/box-care-events` (`tidy`, `items: [{ id, boxId }]`), `POST …/building-routines/{id}/undo`, `POST …/box-care-events/{id}/undo` (po 1 h `409 undo_expired`), `409 option_disabled` — BE-044.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Obsługa i admin” (ListaDnia: „Szybkie akcje” per hala, po zapisie „✓ 06:40”, pominięci, „Cofnij”; „Wyprowadzono na padok” z liczbą koni i pominiętymi; „Boks gotowy” z licznikiem (7 z 14) otwierające siatkę boksów z zaznaczaniem kilku naraz i jednym zapisem; „Wymaga potwierdzenia” tylko z flagami `requires_ack` bez potwierdzenia (w stajni bez potwierdzeń sekcji nie ma, chyba że trwa niepotwierdzona flaga sprzed wyłączenia, A-20); bez listy karmienia per koń; ListaDniaBezAkcji i ListaDniaBrzozowa). `docs/makiety-plan.md` G „ListaDniaGotoweBoksy” (arkusz „Boks gotowy · zaznacz boksy”, „Dziś 7 z 14”, zakładki Hala główna | Hala nowa, boks gotowy z ikoną i godziną, do zrobienia z ramką przerywaną, zaznaczone z ✓, „Zapisz: Boks gotowy · 3 boksy”, „Anuluj”; stany: po zapisie „10 z 14” z „Cofnij”, offline „Zapis czeka na sieć”, odpowiedź z `alreadyDone` „Padok już wyprowadzony 10:00”), 3.H L1 (nowa linia „Poidło ręczne · Hala nowa · boks 5 · woda 06:55” → BoksSzczegolyWoda). A-13, A-17, A-19, A-20.
- Makiety: `docs/mockups/project/ListaDnia.dc.html` („Dziś · wt 13.10”, „Szybkie akcje”, „Podano śniadanie · Cofnij · Główna 06:40 · Ola · Nowa 06:50 · Piotr · pominięty Kasztan (Główna 7): flaga „Bez śniadania””, „Wyprowadzono na padok · następne 10:00 · Główna · 4 konie · Nowa · 3 konie · pominięta Bella (Nowa 4)”, „Gotowe boksy: 7 z 14 · Zaznacz boksy · Główna 4 z 8 · Nowa 3 z 6”, „Wymaga potwierdzenia · 1 flaga”, „Flagi dziś · potwierdzone”, „Zadania · 1 do wzięcia · 1 w toku”; podtytuł „jedno tapnięcie na halę” pomijamy, docs/makiety-plan.md 2.3 i 5 pkt 38), `ListaDniaBrzozowa.dc.html` (cała stajnia, „06:35 · Paweł”, „3 z 6 · dziś boksy 1, 2, 4 · reszta wczoraj”, „Flagi dziś · obowiązują od razu”), `ListaDniaBezAkcji.dc.html` (bez „Szybkich akcji”).
- Decyzje: DEC-18 wariant A („Cofnij” 1 h).
- Dane demo: Ola i Piotr w Pod Lipami o 07:15 (seed), Ola w Brzozowej, wariant BezAkcji seedu.

## Zakres
- [ ] `mobile/app/(app)/(staff)/index.tsx` (ListaDnia): nagłówek z `OnlineStatus`, H1 „Dziś · {dzień}”, sekcje w kolejności z makiety; dane z `GET …/day` przez `use-polled-query` nałożone na oczekujące zapisy z kolejki.
- [ ] `mobile/src/features/day/QuickActions.tsx` (wspólny z AdminDzis, MOB-020): karta posiłku z etykietą pory z `meal_slots` (o 07:15 „Podano śniadanie”), stan per hala („✓ Główna 06:40 · Ola”), pominięci z powodem, „Cofnij” w oknie 1 h; karta padoku z godziną, liczbą koni per hala i pominiętymi; karta „Gotowe boksy: X z Y” z rozbiciem per hala i „Zaznacz boksy”; przy jednej hali „na całą stajnię” bez nazw hal; karty tylko dla włączonych przycisków; brak sekcji, gdy wszystkie wyłączone (ListaDniaBezAkcji).
- [ ] Akcje: stuknięcie posiłku albo padoku hali → `enqueueBuildingRoutine` (id klienta, `mealSlotId` z odpowiedzi) z optymistycznym „✓ HH:MM · czeka na sieć”; `alreadyDone` → komunikat „Padok już wyprowadzony 10:00” (albo posiłek) bez drugiego wpisu; „Cofnij” → `enqueueUndo`; `undo_expired` → komunikat i odświeżenie.
- [ ] `mobile/app/(app)/day/ready-boxes.tsx` (ListaDniaGotoweBoksy, arkusz): zakładki hal (przy jednej hali bez zakładek), siatka boksów z koniem, stanem „gotowy HH:MM” albo „do zrobienia” (ramka przerywana), zaznaczanie kilku, „Zapisz: Boks gotowy · N boksów” → jedno `enqueueBoxCare` z `items[]`, „Anuluj”; ponowne „Boks gotowy” gotowego boksu dozwolone (nowy wpis).
- [ ] „Wymaga potwierdzenia” z `FlagCard` i „Potwierdzam” (MOB-015); „Flagi dziś” z nagłówkiem „potwierdzone” albo „obowiązują od razu”; linia „Poidło ręczne · Hala nowa · boks 5 · woda 06:55” bez linku (wejście do `/box/[boxId]` dla obsługi dodaje MOB-020, które daje obsłudze dostęp do szczegółów boksu); skrót zadań („1 do wzięcia · 1 w toku”, pierwsza pozycja) tylko z funkcją `tasks` — „Biorę” w tym skrócie podłącza MOB-021.
- [ ] Stan offline według ListaDniaOffline (MOB-008): „offline · dane z 07:05 · 2 zapisy czekają”.

## Poza zakresem
- AdminDzis (MOB-020), zadania i „Biorę” (MOB-021), „Woda” i szczegóły boksu (MOB-020).
- Stan per boks dla siatki po stronie backendu, jeśli go brak (patrz Uwagi).

## Kryteria akceptacji
- [ ] A-13: ListaDnia Oli o 07:15 jak na makiecie (śniadanie ✓ 06:40 HG z pominiętym Kasztanem i ✓ 06:50 HN; padok następny 10:00: Główna 4, Nowa 3 z pominiętą Bellą; „7 z 14”; „Wymaga potwierdzenia” tylko Bella; bez listy karmienia per koń).
- [ ] Piotr zaznacza w siatce HG boksy 4, 6, 8 i zapisuje jednym przyciskiem: trzy wpisy `tidy` z Piotrem, licznik „10 z 14”; „Cofnij” w ciągu godziny przywraca stan.
- [ ] O 10:00 Ola stuka „Wyprowadzono na padok” dla Hali nowej: jeden wpis, Bella pominięta; drugie stuknięcie daje „Padok już wyprowadzony 10:00”.
- [ ] A-17: w Brzozowej ListaDniaBrzozowa (✓ 06:35 · Paweł z pominiętą Kometą, „3 z 6”, bez padoku, bez „Wymaga potwierdzenia”, bez zadań, bez hali przy numerze).
- [ ] A-19: wariant BezAkcji bez „Szybkich akcji”, z „Wymaga potwierdzenia”, „Flagami dziś” i zadaniami; wyłączenie samego padoku usuwa tylko kartę padoku.

## Testy
- Jest + RNTL: `day.test.tsx` (Pod Lipami, Brzozowa, BezAkcji, offline), `QuickActions.test.tsx` (Cofnij w oknie, `alreadyDone`), `ready-boxes.test.tsx` (zaznaczanie, jedna i dwie hale) na fixture'ach `mobile/src/test/fixtures/day-*.ts` pisanych ręcznie według docs/development-szczegoly.md 3.2 ze stałymi UUID (`mobile/src/test/fixtures/demo.ts`, kopia `backend/src/lib/demo/ids.ts`), typowanych z `src/api/board.d.ts`, i na atrapie serwera z MOB-008.
- Maestro [ręcznie]: `mobile/e2e/maestro/staff-day.yaml` (A-13) i `offline-queue.yaml` (tryb samolotowy `adb shell cmd connectivity airplane-mode enable`, zapis „Boks gotowy” dla 3 boksów i powrót sieci: na serwerze 3 wpisy); przygotowanie stosu: `npm --prefix backend run db:reset -- --fixed-date --variant <wariant>` (wariant seedu bez zdarzeń, które flow tworzy, albo inne konie i godziny niż w seedzie, żeby powtórka nie dała duplikatów ani `alreadyDone`), `npm run clock -- set <czas>` i restart usług (SH-002), dopiero potem flow: seed z wariantem `bez-rutyny-a13` (BE-044) i zegar `2026-10-13T07:15:00+02:00`, a do kroku padoku `2026-10-13T10:00:00+02:00`. SH-002 daje `db:reset` i `npm run clock`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- W apce nie ma siana i karmy jako zdarzeń ani posiłku odhaczanego per koń (A-13).
- Siatka „Boks gotowy” korzysta ze stanu per boks w `GET …/day` (numer, koń, godzina ostatniego `tidy`, autor; dopisane do BE-045 przy domykaniu kolejki). Jeśli BE-045 zamknięto bez tego pola, dopisz je addytywnie w `backend/src/contracts/board.ts` w osobnym MR w repo backend (podlinkowanym z MR apki); nie używaj `boxes-overview`, bo jest tylko dla admina.
