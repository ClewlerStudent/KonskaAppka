---
id: BE-044
title: "operations: szybkie akcje"
area: backend
stage: 6
size: L
status: todo
depends_on: [BE-030, BE-043, BE-034]
decisions: [DEC-18, DEC-26]
owner:
branch:
trello: https://trello.com/c/py4kv5rd
---
# BE-044 · operations: szybkie akcje

## Cel
Codzienną rutynę obsługa zapisuje jednym stuknięciem: „Boks gotowy” (jeden boks z tabletu albo kilka zaznaczonych w apce), „Woda” przy poidle ręcznym, „Podano śniadanie / obiad / kolację” i „Wyprowadzono na padok” dla całej hali, z listą koni pominiętych przez flagi i z „Cofnij” przez godzinę. Tablet zapisuje bez autora, apka z osobą.

## Kontekst
- **Stan kodu:** `operations` (BE-028), plany i pory (BE-043, BE-028), flagi (BE-034). Tabele `box_care_events`, `building_routines`: BE-004 (częściowe unikalności dla `building_routines` przy `cancelled_at IS NULL`). Walidacja `X-Box-Id` (boks stajni z tokenu, hala akcji = hala boksu, `403 other_building`): BE-006. Przełączniki `tidy_enabled`, `meal_served_enabled`, `paddock_out_enabled` i `boxes.auto_waterer`: BE-030, BE-031. `backend/src/lib/rules` (BE-007): pominięte konie przy akcjach hali, plan padoku po skutkach flag, `service_date` w strefie stajni.
- **Dokumenty:** docs/mikroserwisy.md 5.5 tabela „Opieka” (`POST …/box-care-events`, `POST …/building-routines`, `…/undo`), 9.3 pkt 6 (zapis z tabletu bez autora); docs/development-szczegoly.md 3.3 `operations` „Szybkie akcje” (wszystkie reguły: `already_done` z docs to w API odpowiedź 200 z polem `alreadyDone`, etykieta pory, „Cofnij”), 4.1 „Rutyna obsługi” (testy integracyjne), 5 pkt 17 i 21; docs/erd.md tabele `box_care_events`, `building_routines`, pkt 3, słowniki `kind` i `source`.
- **Makiety:** ListaDnia.dc.html („Podano śniadanie · Cofnij · Główna 06:40 · Ola · Nowa 06:50 · Piotr · pominięty Kasztan (Główna 7): flaga »Bez śniadania«”, „Wyprowadzono na padok · następne 10:00 · Główna · 4 konie · Nowa · 3 konie · pominięta Bella”, „Gotowe boksy: 7 z 14 · Zaznacz boksy”), TabletBoks.dc.html („SZYBKIE AKCJE”), BoksSzczegoly.dc.html („Boks gotowy”).
- **Decyzje:** DEC-18 A („Cofnij” przez 1 h od zapisu, potem 409).
- **Dane demo:** Ola (apka, Hala główna), Piotr (apka), tablety HG 7, HG 4, HN 6, HN 5 (poidło ręczne, Bursztyn); Brzozowa z wyłączonym padokiem; wariant seedu BezAkcji (wszystkie trzy przyciski wyłączone).

## Zakres
- [ ] Kontrakty w `backend/src/contracts/operations.ts`:
  - `POST …/box-care-events`: `{kind: tidy | water, items: [{id, boxId}], occurredAt, timeQuality}`; z apki kilka boksów jednym żądaniem (wiersz na boks), z tabletu tylko boks z `X-Box-Id`;
  - `POST …/building-routines`: `{id, kind: meal_served | paddock_out, buildingId?, mealSlotId?, occurredAt, timeQuality}`; z tabletu hala wynika z `X-Box-Id` (inna hala w treści: `403 other_building`, bez zapisu);
  - `POST …/box-care-events/{id}/undo`, `POST …/building-routines/{id}/undo`.
- [ ] Reguły:
  - kto: tablet (swój boks i jego hala), obsługa (apka), admin (apka, panel, `ops`); klient, instruktor i wyświetlacz: `403 forbidden_role`; tablet z boksem innej stajni: 404 bez zapisu;
  - `source` z `client_id` (`tablet | app | web | ops`), z tabletu `user_id = NULL`;
  - id nadane przez klienta i `request_hash` (powtórzenie: ten sam wynik; inna treść: `409 id_conflict`); przy `box-care-events` `request_hash` liczony osobno dla każdego elementu `items[i]` (`{kind, boxId, occurredAt, timeQuality}`), więc ponowienie żądania z częścią już zapisanych elementów jest idempotentne;
  - `occurredAt` (czas urządzenia) najwyżej czas serwera + 2 min, inaczej 422 `validation_failed` z polem `occurredAt`; każdy wiersz ma też `created_at` z zegara serwera;
  - wyłączony przycisk: `409 option_disabled`; „Woda” dla boksu z `auto_waterer = true`: 409 (`option_disabled`);
  - `meal_served`: `service_date` i pora z `lib/rules` w strefie stajni; drugi zapis tej samej pory w hali tego dnia (inne `id`) daje 200 z polem `alreadyDone` (DTO niżej), bez drugiego wiersza (także przy dwóch replikach naraz: unikalność częściowa);
  - `paddock_out`: jeden na halę i dzień; odpowiedź z liczbą koni wychodzących według planów i pominiętymi (flagi „Nie na padok” obowiązujące teraz, także niepotwierdzone);
  - odpowiedź posiłku z pominiętymi (flagi `suspend_meal`, których okno obejmuje godzinę posiłku): `[{horseId, name, boxId, reason}]`; pominiętych nie zapisujemy;
  - „Cofnij”: w oknie z konfiguracji (DEC-18: 1 h) liczonym od `created_at` wiersza (czas serwera zapisu, nie `occurredAt` urządzenia, bo wpis z kolejki offline może przyjść po godzinie) ustawia `cancelled_at`; później `409 undo_expired` (nowy kod w `ERRORS`); po cofnięciu akcję można zapisać ponownie.
- [ ] Odpowiedzi (jedyne źródło kształtu dla MOB-008, MOB-016, MOB-020, TAB-013, TAB-018):
  - nowy zapis `building-routines`: `201 { id, kind, buildingId, serviceDate, mealSlotId: uuid | null, occurredAt, undoUntil, skipped: [{ horseId, name, boxId, reason }], horsesOut: number | null }` (`horsesOut` tylko przy `paddock_out`);
  - ta sama pora albo padok tej hali i dnia już zapisane (inne `id`): `200 { id: <id pierwszego wpisu>, alreadyDone: { occurredAt, authorName: string | null } }` (`null` = zapis z tabletu), bez wiersza i bez `undoUntil`;
  - nowy zapis `box-care-events`: `201 { items: [{ id, boxId, occurredAt, undoUntil }] }`;
  - powtórka tego samego `id` z tą samą treścią (kolejka po zgubionej odpowiedzi): ten sam status i ta sama treść co za pierwszym razem;
  - `…/undo`: `200 { id, cancelledAt }`; ponowne `undo` cofniętego wpisu: ten sam wynik; po oknie `409 undo_expired`.
- [ ] Audyt z `actor_type` `user | tablet | operator` przez `actorFromPrincipal` z BE-005; boks zawsze w zmianach wpisu. Dla tabletu `actor_id` według DEC-26 (rekomendacja B: `box_id`, nie id konta tabletów; docs/development-szczegoly.md 5 pkt 21), ustalane wyłącznie w `actorFromPrincipal` z BE-005.
- [ ] Moduł domeny `backend/src/services/operations/domain/routine/` (funkcje używane też przez widoki `board` przez wspólne `lib/rules`).
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, stałe UUID z `backend/src/lib/testing/demo.ts`): rutyna z docs/development-szczegoly.md 3.2 („Podano śniadanie” HG 06:40 Ola i HN 06:50 Piotr, wczoraj kolacja HG 18:02 i padok 10:05 Piotr; „Boks gotowy” 7 z 14 dziś i wcześniejsze; „Woda” HN 5 06:55 z tabletu; Brzozowa: śniadanie 06:35 Paweł, „Boks gotowy” 3 z 6, wczoraj kolacja 18:00 i boks 1 16:30) oraz warianty (opcja `--variant` z BE-011): `bez-akcji` (bez tych wierszy, przyciski wyłączone) i `bez-rutyny-a13` (bez „Podano śniadanie” Hali nowej 06:50 i bez padoku dziś, żeby A-13 dało się odtworzyć w E2E: MOB-016, TAB-018).
- [ ] `npm run openapi`, `npm run gen:api`.

## Poza zakresem
- pokazanie stanu na tablicy, liście dnia, TV i w apce klienta (BE-045); kolejki zapisów w apkach (MOB-008, TAB-013); ekrany (MOB-016, MOB-020, TAB-018, WEB-021).

## Kryteria akceptacji
- [ ] A-13: Piotr zaznacza HG 4, 6 i 8 → trzy wiersze `tidy` z autorem; drugi „Boks gotowy” z tabletu HG 7 tego dnia to nowy wiersz bez autora; „Wyprowadzono na padok” HN przez Olę o 10:00 pomija Bellę; drugi zapis daje `alreadyDone`; „Cofnij” w ciągu godziny od zapisu na serwerze działa, po godzinie `409 undo_expired`; wpis z kolejki z `occurredAt` sprzed 2 h, wysłany teraz, da się cofnąć przez godzinę; `occurredAt` 10 min w przyszłości daje 422.
- [ ] A-13 tablet: „PADOK” z tabletu HG 7 zapisuje jeden wiersz dla Hali głównej bez autora (Dukat, Sonata, Fala, Kasztan); ten sam padok z tabletu HG 4 daje `alreadyDone`.
- [ ] A-16: „Woda” dla HN 5 zapisuje `kind = water`; dla HN 4 (poidło automatyczne) 409 bez wiersza.
- [ ] A-19 i A-17: wyłączone przyciski dają `409 option_disabled` z apki i z tabletu; w Brzozowej „Wyprowadzono na padok” daje 409.
- [ ] A-05: „BOKS GOTOWY” na tablecie HN 6 (wolny boks) zapisuje się bez autora tylko dla tego boksu.
- [ ] A-09: „Podano śniadanie” w noc 25.10.2026 ma właściwą `service_date`.
- [ ] Tablet z `X-Box-Id` HG 7 i `buildingId` Hali nowej: 403, bez wiersza; klient: 403.

## Testy
- Integracyjne (Testcontainers PostgreSQL z seedem, fałszywy zegar): kryteria wyżej, równoległy zapis tego samego posiłku z dwóch „replik” (dwa połączenia) daje jeden wiersz.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/operations.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Bez karmienia odhaczanego per koń, bez siana i karmy jako zdarzeń; woda tylko przy poidle ręcznym.
- `X-Box-Id` niesie `boxes.id` (UUID), nigdy numer boksu.
- Zadania nie są szybkimi akcjami: tablet nie zapisuje zadań (BE-050).
