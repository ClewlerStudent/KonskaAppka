---
id: BE-035
title: Cron escalation-scheduler
area: backend
stage: 3
size: M
status: todo
depends_on: [BE-009, BE-034]
decisions: [DEC-01, DEC-27]
owner:
branch:
trello:
---
# BE-035 · Cron escalation-scheduler

## Cel
Gdy nikt nie potwierdzi flagi w terminie (np. tablet przy boksie jest wyłączony), tablica, lista dnia i wyświetlacz pokazują „NIEPOTWIERDZONA”, a admin stajni dostaje SMS albo e-mail według reguł stajni. Cron co minutę zapisuje eskalacje prosto do bazy i publikuje `flag.escalated`, bez zależności od tabletów i bez wołania serwisów (W3).

## Kontekst
- **Stan kodu:** szablon crona z BE-009 (punkt wejścia `backend/src/jobs/<cron>/`, `npm run cron -- <nazwa>`, `npm run start:cron:<nazwa>` w obrazie, rola bazy z manifestu `owners.ts`, `publishBeforeCommit`, `pg_try_advisory_xact_lock`, przełącznik `--now` i fałszywy zegar). Domena flag (`backend/src/services/operations/domain/flags/`) i pola `warn_at`, `notify_at`, `ack_deadline_at` liczone przy zapisie flagi: BE-034. Tabela `flag_escalations` (unikalne `flag_id` + `level`): BE-004. Manifest zapisu cronów: BE-003 (`escalation-scheduler` pisze tylko `flag_escalations`).
- **Dokumenty:** docs/mikroserwisy.md 6 (tabela cronów) i 1.5 (publikacja przed COMMIT, jedna transakcja na obiekt, kod domeny właściciela); docs/development-szczegoly.md 3.4 `escalation-scheduler`, 3.1.7 (szablon crona), 4.1 „Crony” (powtórzony, równoległy, nadrabianie, zegar); docs/erd.md tabela `flag_escalations`, „Crony”, pkt 12.
- **Makiety:** WyswietlaczCentralny.dc.html (pasek „NIEPOTWIERDZONA … admin powiadomiony”), ListaDnia.dc.html („Wymaga potwierdzenia”), StatusFlagi.dc.html („Admin stajni dostał powiadomienie”), WiadomosciSms.dc.html (SMS „Flaga niepotwierdzona · do Damiana” o 01:21).
- **Decyzje:** DEC-01 (broker za `lib/messaging`; na start adapter w pamięci z BE-008).
- **Dane demo:** Bella (Hala nowa · boks 4) „Nie na padok” dziś 00:00–23:59, ustawiona 01:20, niepotwierdzona: w seedzie ma eskalacje `board_warning` i `admin_notify`. Stajnia Pod Lipami `warn_offset_min = 30`, `notify_offset_min = 15`. Stajnia Brzozowa bez potwierdzeń (flagi Komety i Lorda nigdy nie eskalują).

## Zakres
- [ ] Funkcja domeny `escalateDueFlags(tx, now)` w `backend/src/services/operations/domain/escalations/` (kod `operations`, używany przez crona):
  - wybiera flagi z `requires_ack = true`, `acknowledged_at IS NULL`, `cancelled_at IS NULL`, `valid_to > now` i `warn_at <= now` albo `notify_at <= now`;
  - każda flaga w osobnej transakcji: blokada wiersza `horse_flags` (`SELECT … FOR UPDATE`), ponowne sprawdzenie warunków, `INSERT … ON CONFLICT (flag_id, level) DO NOTHING` dla `board_warning` (po `warn_at`) i `admin_notify` (po `notify_at`), audyt `actor_type = system`;
  - gdy powstał wiersz `admin_notify`: `publishBeforeCommit` zdarzenia `flag.escalated` (`flagId`, `stableId`, `horseId`, nazwa konia, `boxId` z halą i numerem, etykieta flagi, godziny, `level`).
- [ ] Punkt wejścia `backend/src/jobs/escalation-scheduler/` według BE-009 i wpis w rejestrze `backend/src/jobs/index.ts` (co minutę, `timeZone` Europe/Warsaw), limit czasu przebiegu i podsumowanie w logu (liczba flag, eskalacji, publikacji).
- [ ] Ścieżka potwierdzenia w BE-034 blokuje ten sam wiersz `horse_flags` w tej samej kolejności, więc potwierdzenie i eskalacja się nie mijają (sprawdzić, a w razie potrzeby poprawić w module flag).
- [ ] Schemat `flag.escalated` w katalogu zdarzeń (BE-008), jeśli jeszcze go nie ma; zdarzenie niesie dane do treści, konsument (BE-036) sprawdza flagę w bazie przed wysyłką.
- [ ] Seed: eskalacje Belli (`board_warning`, `admin_notify`) przez tę funkcję domeny z fałszywym zegarem, bez publikacji zdarzenia w seedzie (wiersz `notifications` dopisuje BE-036).
- [ ] Wpis w README backendu: jak uruchomić lokalnie (`npm run cron -- escalation-scheduler --now=2026-10-13T00:21:00Z`).

## Poza zakresem
- wysyłka SMS i e-maila oraz reguły odbiorców (BE-036); pokazanie stanu na tablicy i TV (BE-041, BE-042, BE-045);
- manifest CronJoba dla klastra (BE-060, wdrożenie robi Dawid).

## Kryteria akceptacji
- [ ] A-02: po `warn_at` dokładnie jeden wiersz `board_warning`, po `notify_at` dokładnie jeden `admin_notify` i jedna publikacja `flag.escalated`, także przy restarcie crona, dwóch przebiegach naraz i ręcznym przebiegu w trakcie.
- [ ] Potwierdzenie przed `notify_at` (test wyścigu: potwierdzenie i przebieg równolegle) daje zero `admin_notify`; A-03: odwołanie tuż przed `notify_at` też.
- [ ] A-18: flagi z `requires_ack = false` nigdy nie eskalują; A-20: niepotwierdzona flaga z `requires_ack = true` eskaluje dalej po wyłączeniu potwierdzeń w stajni.
- [ ] Nadrabianie po godzinnej przerwie nie tworzy dubli; flagi potwierdzone albo odwołane w przerwie nie eskalują.
- [ ] A-09: w nocy 25.10.2026 i 28.03.2027 eskalacje nie przesuwają się o godzinę.
- [ ] Nieudana publikacja wycofuje transakcję (brak wiersza); nieudany COMMIT po publikacji daje przy następnym przebiegu ponowną publikację tego samego poziomu (BE-036 nie wyśle drugiego SMS-a dzięki `dedupe_key`).
- [ ] Rola bazy crona pisze tylko do `flag_escalations` (meta-test grantów z BE-003).

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar): cztery przypadki szablonu crona (powtórzony, równoległy, przerwany między publikacją a COMMIT, zegar z nocą zmiany czasu) oraz wyścig z potwierdzeniem.
- Uruchomienie: `cd backend && npm run check`; pojedynczo `npx vitest run src/services/operations/domain/escalations src/jobs/escalation-scheduler`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; skrypt `start:cron:escalation-scheduler` w `backend/package.json`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Cron nie woła serwisów, nie ma tokenów i nie zna adresów odbiorców (W3): tylko zapis i zdarzenie.
- Idempotencję daje unikalność `(flag_id, level)`, nie pamięć procesu; `concurrencyPolicy: Forbid` nie chroni przed ręcznym przebiegiem.
- Jedna transakcja na flagę, nie na cały przebieg; publikacja tuż przed COMMIT (wyjątek tylko dla cronów).
- Znaczenie offsetów (`warn_offset_min`, `notify_offset_min`) liczy `lib/rules` przy zapisie flagi; cron porównuje tylko zapisane `warn_at` i `notify_at` z czasem.
- Flagi już zakończone (`valid_to ≤ teraz`) cron pomija (propozycja; potwierdzić w przeglądzie z właścicielem).
