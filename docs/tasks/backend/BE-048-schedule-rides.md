---
id: BE-048
title: "schedule: ujeżdżalnie i jazdy"
area: backend
stage: 7
size: M
status: todo
depends_on: [BE-046, BE-047]
decisions: [DEC-17, DEC-03, DEC-27, DEC-32]
owner:
branch:
trello: https://trello.com/c/aRw25C7T
---
# BE-048 · schedule: ujeżdżalnie i jazdy

## Cel
Admin i instruktor planują jazdy (koń, jeździec, instruktor, ujeżdżalnia, godziny), a system pilnuje kolizji i ostrzega, gdy koń ma flagę „bez jazdy”. Instruktor widzi „Moje jazdy”, klient jazdy swojego konia, a po wyjeździe konia przyszłe jazdy same się anulują.

## Kontekst
- **Stan kodu:** serwis `schedule` (BE-047, `backend/src/services/schedule/`, kontrakt `backend/src/contracts/schedule.ts`). Tabele `arenas`, `rides` (z `rider_user_id`, `instructor_user_id`): BE-004. Flagi z efektem `no_riding`: BE-034. Konsumenci zdarzeń: `backend/src/lib/messaging` (BE-008); cron `horse-left-reconciler`: BE-046. `rides_enabled` w `stable_settings` (BE-030).
- **Dokumenty:** docs/mikroserwisy.md 5.6 (tabela tras „Jazdy”, „Moje jazdy” to `instructor_user_id = sub`, konsument `horse.left`), 11.1 (`*_user_id` zamiast `*_member_id`), 6 (reconciler zamyka przyszłe `rides`), 8 (wiersz „Jazdy”); docs/development-szczegoly.md 3.3 `schedule` „Jazdy” (kolizja konia i areny, pojemność: 409; `no_riding`: ostrzeżenie; `rides_enabled`), 3.4 `horse-left-reconciler`; docs/erd.md tabele `arenas`, `rides`.
- **Makiety:** InstruktorJazdy.dc.html („Dziś 1 jazda · Iskra · Hala główna · boks 1 · 16:00 · Kryta ujeżdżalnia · Jeździec: Karolina W. · Iskra nie ma dziś flag”, „Jutro i dalej · Brak jazd”), AdminDzis.dc.html („16:00 Jazda · Iskra”).
- **Decyzje:** DEC-17 A (jazdy tworzą admin i instruktor; w apce na PoC tylko podgląd, `DodajJazde` później; instruktor nie ustawia flag). DEC-03 A (funkcja `rides`: w Pod Lipami klient, obsługa, instruktor; w Brzozowej tylko instruktor).
- **Dane demo:** ujeżdżalnia „Kryta ujeżdżalnia”; jazda Iskry dziś 16:00, instruktor Marta, jeździec Karolina W. (klientka Iskry); Anna (klientka), Ola (obsługa).

## Zakres
- [ ] Trasy (`/schedule/v1/stables/{stableId}`):
  - `GET …/arenas` (role z `rides`), `POST …/arenas` (admin): `{id, name, capacity}`;
  - `GET …/rides?date=&mine=&horseId=` (instruktor: `mine=true` daje `instructor_user_id = sub`; admin; obsługa i wyświetlacz z `rides`; klient tylko swoje konie);
  - `POST …/rides` (admin, instruktor): `{id, horseId, riderUserId?, riderName?, instructorUserId, arenaId, startsAt, endsAt}`; instruktor może wpisać tylko siebie jako `instructorUserId` (inaczej 403);
  - `PATCH …/rides/{id}` (admin; instruktor tylko swoje jazdy): godziny, arena, jeździec, `status` (`planned | cancelled | done`), `If-Match`.
- [ ] Reguły: kolizja konia (nakładające się jazdy) i przekroczona pojemność areny: `409 schedule_conflict` (nowy kod w `ERRORS`); aktywna flaga z `effect = no_riding` w czasie jazdy: zapis przechodzi, odpowiedź ma `warnings: ['no_riding']`; `rides_enabled = false`: `409 option_disabled`; koń `left` albo z innej stajni: 404.
- [ ] Konsument `horse.left` w `schedule`: przyszłe jazdy konia `status = cancelled` (sprawdza `horses.status` w bazie, idempotentnie).
- [ ] Rozszerzenie `horse-left-reconciler` (BE-046) o przyszłe `rides` (funkcja domeny `schedule`) i wpis w manifeście `owners.ts` (`rides.status`).
- [ ] Audyt zapisów.
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, stałe UUID z `backend/src/lib/testing/demo.ts`): arena i jazda Iskry jak wyżej.
- [ ] `npm run openapi`, `npm run gen:api`.

## Poza zakresem
- jazdy w widokach `board` (BE-042 plan dnia TV, BE-045 karta konia i „Dziś” admina); ekran `InstruktorJazdy` i dodawanie jazd w apce (MOB-022, DEC-17: podgląd).

## Kryteria akceptacji
- [ ] Marta `GET …/rides?date=2026-10-13&mine=true` w Pod Lipami dostaje jazdę Iskry 16:00; w Brzozowej pustą listę.
- [ ] A-21: Anna w Pod Lipami widzi jazdy swoich koni; w Brzozowej (bez `rides`) dostaje `403 feature_hidden`.
- [ ] Druga jazda Iskry w tym samym czasie: 409; jazda przy aktywnej fladze „no_riding”: 201 z ostrzeżeniem.
- [ ] Instruktor nie zmieni cudzej jazdy (403), obsługa nie tworzy jazd (403), wyświetlacz nic nie zapisuje (403).
- [ ] Wyjazd konia anuluje jego przyszłe jazdy (konsument), a przy zgubionym zdarzeniu robi to cron.

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar): kryteria wyżej, idempotencja konsumenta, przebieg crona.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/schedule.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- `schedule` nie czyta `stable_members`, więc nie sprawdzi, czy `riderUserId` i `instructorUserId` są członkami stajni (W2). Na PoC: instruktor wpisuje tylko siebie, admin wybiera osoby z listy pobranej przez aplikację z `auth`; FK do `users` pilnuje tylko istnienia konta. Opisać to ograniczenie w README serwisu.
- Godziny w `timestamptz`, porównania w strefie stajni przez `lib/rules`.
