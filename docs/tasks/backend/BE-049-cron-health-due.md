---
id: BE-049
title: Cron health-due-reminders
area: backend
stage: 7
size: S
status: todo
depends_on: [BE-009, BE-036, BE-047]
decisions: [DEC-20, DEC-27]
owner:
branch:
trello: https://trello.com/c/3C9aOIdo
---
# BE-049 · Cron health-due-reminders

## Cel
Admin stajni (i obsługa z funkcją „Zdrowie”) dostaje przypomnienie SMS-em albo e-mailem o zbliżającej się wizycie albo terminie (np. szczepienie, odrobaczanie). Cron publikuje `health.due`, a `notifications` dobiera odbiorców według reguły `health_due` i widoczności wpisu.

## Kontekst
- **Stan kodu:** szablon crona: BE-009 (`backend/src/jobs/<cron>/`, `publishBeforeCommit`, `--now`). Wpisy zdrowia (`health_events`: `scheduled_at`, `next_due_at`, `visibility`, `deleted_at`): BE-047. Router powiadomień i słownik reguł z `health_due` (DEC-20): BE-036. Strefa stajni: `stables.timezone`.
- **Dokumenty:** docs/mikroserwisy.md 6 (`health-due-reminders`: co godzinę, nic nie pisze, publikuje `health.due`), 5.8 (`health.due` z `visibility`, `owner_private` tylko do roli `admin`, `recipients` z `feature=health`), 10.2 pkt 20; docs/development-szczegoly.md 3.4 (`dedupe_key` `health_due:{eventId}:{rodzaj}:{userId}:{channel}`, stała godzina lokalna stajni), 5 pkt 27; docs/erd.md tabela `health_events`, słownik `notification_rules.event`.
- **Makiety:** PanelZalozPowiadomienia.dc.html (krok 2 kreatora; po DEC-20 dochodzi wiersz przypomnień o wizytach, zmiana makiety po stronie WEB-009).
- **Decyzje:** DEC-20 A (`health_due`: admin; obsługa tylko z funkcją `health`; `owner_private` tylko admin).
- **Dane demo:** wizyty Kasztana (wet 08:00, kowal 15:00 dziś); do testów fixture z `next_due_at` (np. szczepienie za 7 dni).

## Zakres
- [ ] Funkcja domeny `schedule` (np. `backend/src/services/schedule/domain/health/due.ts`): wpisy niewyłączone z `scheduled_at` jutro (rodzaj `visit_tomorrow`) albo z `next_due_at` za 7 dni (rodzaj `due_in_7_days`), wyliczane w strefie stajni (propozycja rodzajów i terminów; potwierdzić z właścicielem przy przeglądzie).
- [ ] Punkt wejścia `backend/src/jobs/health-due-reminders/` według BE-009: przebieg co godzinę, ale publikuje tylko dla stajni, w których jest stała godzina lokalna przypomnień (np. 18:00, z konfiguracji crona); każdy wpis w osobnej transakcji, `publishBeforeCommit` zdarzenia `health.due` (`eventId`, `stableId`, `horseId`, nazwa konia, `type`, termin, rodzaj, `visibility`); bez zapisu w bazie.
- [ ] Konsument `health.due` w `notifications` (BE-036): reguła `health_due`, `recipients` z `feature=health`; przy `visibility = owner_private` tylko rola `admin`; `dedupe_key` `health_due:{eventId}:{rodzaj}:{userId}:{channel}`; szablon treści PL/UA/EN w `lib/i18n` (bez opisu wizyty w SMS).
- [ ] Wpis crona w manifeście `owners.ts` (zapis: brak; zdarzenie `health.due`), schemat zdarzenia w katalogu (BE-008), skrypt `start:cron:health-due-reminders`.

## Poza zakresem
- zmiana kreatora powiadomień w panelu (WEB-009) i ustawień reguł (WEB-022); push w apce (DEC-16: brak).

## Kryteria akceptacji
- [ ] O 18:00 lokalnie dzień przed wizytą publikowane jest jedno zdarzenie na wpis i rodzaj; przebieg o innej godzinie nic nie publikuje.
- [ ] Noc zmiany czasu (25.10.2026, 28.03.2027): przypomnienie wychodzi raz, o właściwej godzinie lokalnej.
- [ ] Powtórzony i równoległy przebieg nie daje drugiego SMS-a (dedupe w `notifications`).
- [ ] Wpis `owner_private` trafia tylko do admina; obsługa bez `health` w macierzy nic nie dostaje.
- [ ] Usunięty wpis (`deleted_at`) nie daje przypomnienia.

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar, `notifications` w procesie testu z atrapą `recipients`).
- Uruchomienie: `cd backend && npm run check`; lokalnie `npm run cron -- health-due-reminders --now=2026-10-13T16:00:00Z`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Cron nic nie pisze i nie zna adresów (W3); treść i odbiorców ustala `notifications`.
- Godzina przypomnień i rodzaje terminów to propozycja; trzymać je w konfiguracji crona, nie w kodzie.
