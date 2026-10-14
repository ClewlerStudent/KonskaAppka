---
id: BE-046
title: "horse.left: konsumenci i horse-left-reconciler"
area: backend
stage: 6
size: M
status: todo
depends_on: [BE-009, BE-032, BE-034, BE-043]
decisions: [DEC-01]
owner:
branch:
trello:
---
# BE-046 · horse.left: konsumenci i horse-left-reconciler

## Cel
Gdy koń wyjeżdża ze stajni, wszystko, co do niego należało, ma się domknąć: trwające i przyszłe flagi są odwołane, plany karmienia i padoku zamknięte, koń znika z towarzyszy na padoku, a klienci tracą dostęp. Zdarzenie może zginąć (bez outboxu), więc cron co godzinę domyka to samo wprost w bazie.

## Kontekst
- **Stan kodu:** wyjazd konia (`POST /stables/v1/stables/{s}/horses/{id}/leave`), synchroniczne `auth /internal/horses/{id}/left` i publikacja `horse.left`: BE-032; zamknięcie `horse_access` po stronie `auth`: BE-025. Konsumenci i kolejki: `backend/src/lib/messaging` (BE-008). Szablon crona: BE-009 (`backend/src/jobs/<cron>/`, rola bazy z manifestu). Domena flag (`cancelFlag`): BE-034; plany: BE-043. Wąski grant crona na `horse_access`: BE-003 (`SELECT (id, stable_id, horse_id, revoked_at, version)`, `UPDATE (revoked_at, version, updated_at)`).
- **Dokumenty:** docs/mikroserwisy.md 6 (`horse-left-reconciler`: konie `left` z 30 dni, co zamyka), 7.3 (`horse.left`), 1.5 (crony przekrojowe używają modułów domeny kilku serwisów); docs/development-szczegoly.md 3.4 `horse-left-reconciler`, 3.1.8 (idempotencja bez tabeli `inbox`), 4.1 („Awaria po commicie, przed publikacją”); docs/erd.md „Crony” (manifest zapisu), pkt 8.
- **Makiety:** brak (proces w tle); skutki widać w PanelKonie i apce (koń znika).
- **Decyzje:** DEC-01 (broker za `lib/messaging`).
- **Dane demo:** fixture testowy: koń z flagą trwającą i przyszłą, planem karmienia, planem padoku i towarzyszem, dostępem klienta (np. kopia Kasztana w stajni testowej).

## Zakres
- [ ] Konsument `horse.left` w `operations` (`backend/src/services/operations/consumers/horse-left.ts`): traktuje zdarzenie jako sygnał i sprawdza `horses.status = left` w bazie (bez tego: ponowienie, potem DLQ); odwołuje flagi konia trwające i przyszłe (`cancelled_at`, `cancel_reason = horse_left`, audyt `actor_type = system`), zamyka `feeding_plans` i `paddock_plans` (`valid_to` = dzień wyjazdu w strefie stajni), usuwa konia z `paddock_plan_companions`; idempotentnie (warunkowe aktualizacje).
- [ ] Funkcje domeny wywoływane przez konsumenta i przez crona: `closeHorseOperations(tx, horseId, at)` w `backend/src/services/operations/domain/horse-left.ts`, `closeHorseAccess(tx, horseId, at)` w `backend/src/services/auth/domain/` (logika z trasy `horseLeft` w BE-025; jeśli leży poza `domain/`, przenieść ją, bo crony importują tylko `src/services/<serwis>/domain/**`, BE-009), bez podbijania `token_version`.
- [ ] Cron `backend/src/jobs/horse-left-reconciler/` (co godzinę, według BE-009): konie `left` z `left_at` w ostatnich 30 dniach; dla każdego w osobnej transakcji te same funkcje domeny (operations i `horse_access`), audyt `actor_type = system`; bez publikacji zdarzeń; podsumowanie w logu (ile koni, ile domkniętych obiektów).
- [ ] Wpis crona w manifeście `owners.ts` (BE-003): zapis `horse_access` (wąski grant), `horse_flags.cancelled_at`, `feeding_plans.valid_to`, `paddock_plans.valid_to`, usuwanie z `paddock_plan_companions`; miejsca na `tasks` (BE-050) i `rides` (BE-048) dopisują te zadania.
- [ ] Testowy punkt wstrzyknięcia awarii w `stables` (po COMMIT, przed publikacją `horse.left`; tylko w buildzie testowym albo przez zależność wstrzykiwaną w teście), jeśli BE-032 go nie dodał.

## Poza zakresem
- `member.removed` i zwalnianie „Biorę” oraz odwoływanie zadań konia (BE-050; zmiana względem pierwotnej listy, gdzie `member.removed` był tutaj);
- anulowanie przyszłych jazd (BE-048); sam wyjazd konia i wywołanie `auth` (BE-032).

## Kryteria akceptacji
- [ ] Po wyjeździe konia jego trwające i przyszłe flagi są odwołane, plany zamknięte, a koń nie jest towarzyszem żadnego planu; zakończone flagi i historia zostają.
- [ ] To samo zdarzenie 2× i 10× (także równolegle) daje ten sam stan; zdarzenie, które przyszło przed widocznym `status = left`, czeka na ponowienie.
- [ ] Awaria „po COMMIT, przed publikacją”: bez zdarzenia cron w następnym przebiegu domyka flagi, plany, towarzyszy i `horse_access`.
- [ ] Powtórzony i równoległy przebieg crona daje ten sam stan; cron nie podbija `users.token_version`.
- [ ] Rola bazy crona pisze tylko kolumny z manifestu (meta-test BE-003).

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar): konsument, cron, awaria wstrzyknięta, granty.
- Uruchomienie: `cd backend && npm run check`; lokalnie `npm run cron -- horse-left-reconciler`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; skrypt `start:cron:horse-left-reconciler`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Cron przekrojowy importuje moduły domeny kilku serwisów; leży w `backend/src/jobs/`, więc reguła ESLint „serwis nie importuje innego serwisu” go nie blokuje, ale same moduły serwisów nadal nie importują się nawzajem.
- Bez tokenów i bez wywołań serwisów (W3); jedna transakcja na konia.
- Koń `left` daje 404 od razu dzięki danym zasobu (`horses.status`), więc konsument i cron domykają tylko skutki.
