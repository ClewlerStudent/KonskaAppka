---
id: TAB-018
title: "SZYBKIE AKCJE na tablecie: BOKS GOTOWY, posiłek, PADOK, WODA, Cofnij"
area: tablet
stage: 6
size: M
status: todo
depends_on: [BE-044, BE-045, TAB-011, TAB-013]
decisions: [DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/XrG41HDQ
---
# TAB-018 · SZYBKIE AKCJE na tablecie: BOKS GOTOWY, posiłek, PADOK, WODA, Cofnij

## Cel
Obsługa zapisuje rutynę jednym stuknięciem przy boksie: „Boks gotowy” dla tego boksu, podany posiłek i wyprowadzenie na padok dla całej hali, wodę przy poidle ręcznym. Stan widać od razu na tym tablecie, a przy najbliższym odpytaniu na pozostałych tabletach hali, w apce i na wyświetlaczu. Przycisk wyłączony w ustawieniach stajni znika razem ze swoim stanem.

## Kontekst
- **Stan kodu:** `BoardScreen` z miejscem na `QuickActions` (TAB-011), kolejka zapisów z `X-Box-Id` i „Cofnij” w kolejce (TAB-013), komponenty `Button`/`StatusField` (TAB-008). API (BE-044): `POST /operations/v1/stables/{stableId}/box-care-events` (`{kind: tidy | water, items: [{id, boxId}], occurredAt, timeQuality}`; z tabletu tylko boks z `X-Box-Id`; `water` tylko przy poidle ręcznym, inaczej 409), `POST …/building-routines` (`{id, kind: meal_served | paddock_out, mealSlotId?, occurredAt, timeQuality}`; hala z `X-Box-Id`; inna hala `403 other_building`; akcja hali już zrobiona tego dnia: `200` z polem `alreadyDone: { occurredAt, authorName | null }` (nie kod błędu); wyłączony przycisk `409 option_disabled`), `POST …/box-care-events/{id}/undo`, `POST …/building-routines/{id}/undo` (do `undoUntil` z odpowiedzi zapisu, czyli 1 h od zapisu na serwerze; potem `409 undo_expired`). Stan na tablicy (BE-045): „Boks gotowy dziś HH:MM”, posiłek z etykietą pory z `meal_slots` („podane 06:40”, „potem obiad 12:00”), padok konia po skutkach flag („B 10:00–14:30 z Falą i Rumbą”), znacznik wody, rutyna w ostatnich akcjach, przyciski według `stableFeatures` (`config`).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „TabletBoks” → SZYBKIE AKCJE (podpis „boks gotowy: ten boks · posiłek i padok: cała hala”; do trzech dużych przycisków tylko włączonych; BOKS GOTOWY: ten boks, stan „dziś 07:10”, ponowne tapnięcie zapisuje ponownie; posiłek: etykieta pory („ŚNIADANIE”, „OBIAD”, „KOLACJA”, np. „SIANO”), stan „podane 06:40”, „potem obiad 12:00”, pomija konie z flagą; PADOK: dla hali, pokazuje padok konia po skutkach flag; WODA przy poidle ręcznym ze znacznikiem „Poidło ręczne · woda 06:55”; zapis z tabletu bez autora, `source = tablet`), „TabletBoksBrzozowa” (tylko BOKS GOTOWY i ŚNIADANIE, posiłek dla całej stajni), „TabletBoksBezAkcji” (bez sekcji), 4.4 A-05, A-13, A-16, A-17, A-19.
- **Makiety:** `mockups/project/TabletBoks.dc.html` („SZYBKIE AKCJE”: „BOKS GOTOWY · dziś 07:10”, „ŚNIADANIE · podane 06:40 · potem obiad 12:00”, „PADOK · B 10:00–14:30 · z Falą i Rumbą”), `TabletBoksBrzozowa.dc.html` („BOKS GOTOWY · dziś 07:00”, „ŚNIADANIE · podane 06:35 · potem obiad 12:00”), `TabletBoksBezAkcji.dc.html`; z `docs/makiety-plan.md` E: TabletBoksWoda (siatka 2×2 z WODA „06:55”; po WODA „woda 07:16” i „COFNIJ”), TabletBoksWolny (BOKS GOTOWY „ostatnio 09.10 14:40”, posiłek i PADOK dla hali), stany: „Padok już wyprowadzony 10:00” (odpowiedź z `alreadyDone`), „Stajnia wyłączyła tę akcję” (`option_disabled`).
- **Decyzje:** DEC-18 A („Cofnij” przez 1 h).
- **Dane demo:** HG 7 Kasztan (trzy przyciski), HN 5 Bursztyn (WODA 06:55), HN 6 wolny, HG 4 Sonata (drugi tablet hali), Brzozowa 1 Kometa, wariant BezAkcji.

## Zakres
- [ ] `tablet/src/screens/board/QuickActions.tsx`: nagłówek „SZYBKIE AKCJE” i podpis z makiety; przyciski z `config` (kolejność: BOKS GOTOWY, posiłek, PADOK, WODA), układ 3 w rzędzie albo 2×2 przy WODA; każdy przycisk: etykieta wersalikami i stan pod spodem z odpowiedzi `board`; brak sekcji, gdy żaden przycisk nie jest włączony i boks ma poidło automatyczne.
- [ ] Akcje (jedno stuknięcie, bez okna potwierdzenia; przy blokadzie ekranu nieaktywne, TAB-015):
  - BOKS GOTOWY → `enqueue` `box-care-events` `tidy` z `boxId` bieżącego boksu (także wolnego, A-05);
  - posiłek → `building-routines` `meal_served` z `mealSlotId` bieżącej albo najbliższej pory z odpowiedzi;
  - PADOK → `building-routines` `paddock_out`;
  - WODA → `box-care-events` `water` (tylko gdy `autoWaterer = false`).
- [ ] Stan po stuknięciu: od razu lokalnie „✓ HH:MM · czeka na wysłanie” (godzina z czasu serwera), po wysłaniu stan z kolejnego odpytania; odpowiedź z `alreadyDone` → „<Akcja> już <podany/wyprowadzony> HH:MM” (godzina z `alreadyDone.occurredAt`, PL i UA), bez drugiego wpisu; `option_disabled` → „Stajnia wyłączyła tę akcję” i przycisk znika przy najbliższym odpytaniu; `other_building` (nie powinno wystąpić) → log diagnostyki.
- [ ] „COFNIJ”: przy akcji zapisanej z tego tabletu, dopóki trwa jej `undoUntil` (`id` z `useUndoable` z TAB-013: wpis jeszcze w `outbox` albo już w `sent_log`), przycisk pod stanem; stuknięcie → „Cofnij” z TAB-013; po `undoUntil` znika; `409 undo_expired` → komunikat i odświeżenie stanu.
- [ ] Ostatnie akcje: zapisy z kolejki jeszcze niewysłane dopisane na górze z „czeka na wysłanie” (TAB-013).
- [ ] Teksty PL i UA (etykiety pór z serwera w języku tablicy).

## Poza zakresem
- Szybkie akcje w apce (MOB-016, MOB-020) i na TV (WEB-021); zapis i reguły po stronie serwera (BE-044); składanie stanu (BE-045).
- Zadania (tablet ich nie pokazuje ani nie odhacza).

## Kryteria akceptacji
- [ ] A-13: tablet HG 7 o 07:15 pokazuje trzy przyciski jak na makiecie; o 10:00 (zegar seedu) „PADOK” zapisuje jeden wpis `paddock_out` dla Hali głównej bez autora (`source = tablet`); „PADOK” na tablecie HG 4 potem daje „Padok już wyprowadzony 10:00” i żadnego drugiego wpisu.
- [ ] Drugie „BOKS GOTOWY” tego dnia na HG 7 zapisuje nowy wpis, stan pokazuje nowszą godzinę.
- [ ] A-16: tablet HN 5 ma WODA ze stanem „06:55”; stuknięcie daje nowy wpis bez autora i „COFNIJ”; „COFNIJ” przywraca „woda 06:55”; boksy z poidłem automatycznym nie mają WODA.
- [ ] A-05: „BOKS GOTOWY” na wolnym HN 6 zapisuje wpis tylko dla tego boksu.
- [ ] A-17/A-18: Brzozowa boks 1: tylko BOKS GOTOWY i ŚNIADANIE („podane 06:35”), bez PADOK.
- [ ] A-19: po wyłączeniu przycisku „Padok” w ustawieniach stajni PADOK znika przy najbliższym odpytaniu; po wyłączeniu wszystkich trzech brak sekcji (poza WODA przy HN 5); stuknięcie w przycisk tuż przed zniknięciem daje „Stajnia wyłączyła tę akcję”.
- [ ] Akcja bez sieci trafia do kolejki, licznik „NIEWYSŁANE” rośnie, po powrocie sieci zapis przechodzi.

## Testy
- Jest + RNTL z fixture'ami: widoczność przycisków według `config` i `autoWaterer`, stany po stuknięciu (lokalny, `alreadyDone`, `option_disabled`), „COFNIJ” w oknie 1 h (fałszywe timery).
- [ręcznie] Emulator na stosie dev: A-13 i A-16 (zegar seedu przez `npm run clock`), flow Maestro `tablet/e2e/maestro/quick-actions.yaml`; zrzuty w obu profilach.

## Definicja gotowości
- `npm run check` w `tablet/` zielone; flow Maestro przechodzi [ręcznie]; zrzuty TabletBoks, TabletBoksWoda, TabletBoksWolny, TabletBoksBrzozowa i BezAkcji zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Tablet nie liczy, które konie pominąć ani jaki jest padok: wszystko przychodzi z `board`.
- `X-Box-Id` boksu z chwili stuknięcia; hala akcji wynika z boksu (nie wysyłaj `buildingId` z tabletu).
- Bez siana i karmy jako zdarzeń; nazwy pasz tylko w planie karmienia.
