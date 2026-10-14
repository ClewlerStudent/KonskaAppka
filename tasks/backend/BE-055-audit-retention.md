---
id: BE-055
title: Audyt w platform i retention-pruner
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-005, BE-009, BE-040]
decisions: [DEC-24, DEC-10, DEC-31]
owner:
branch:
trello: https://trello.com/c/a3l08Tvm
---
# BE-055 · Audyt w platform i retention-pruner

## Cel
Admin stajni widzi historię zmian boksu, konia czy ustawień (kto, kiedy, co zmienił), a admin globalny przegląda cały audyt platformy. Stare dane (audyt, historia powiadomień, wnioski platformowe, zdarzenia dostawcy płatności) usuwa nocny cron po okresach retencji.

## Kontekst
- **Stan kodu:** wpisy audytu (`audit.audit_log`, `audit.audit_log_changes`) zapisuje każdy serwis i cron przez `backend/src/lib/audit` (BE-005). Serwis `platform` (BE-040, `backend/src/services/platform/`) jako jedyny czyta schemat `audit` (granty BE-003). Szablon crona: BE-009. Wąskie granty `retention-pruner`: BE-003 (`DELETE` w `audit` z `SELECT (id, created_at)` i `(audit_log_id)`, `DELETE` na `notifications`, `SELECT (id, requested_at)` i `DELETE` na `platform_requests`).
- **Dokumenty:** docs/mikroserwisy.md 5.9 (`GET /platform/v1/…/entities/{type}/{id}/history`: admin; `GET /platform/v1/platform/audit-entries`: `plt = admin`), 4.4 (audyt i log odczytów, autor z zespołu jako „Zespół EQUENOR”), 1.5 i 6 (`retention-pruner`: najpierw `audit_log_changes`, alert przy nietypowej liczbie); docs/development-szczegoly.md 3.3 `platform` „Audyt”, 3.1.11, 3.4 `retention-pruner`, 5 pkt 21 i 26; docs/erd.md schemat `audit`, pkt 5.
- **Makiety:** PanelHistoriaZmian (plansza z planu makiet, H; bez pliku `.dc.html`), BoksSzczegoly.dc.html („Cała historia”).
- **Decyzje:** DEC-24 A (audyt 2 lata, `notifications` 180 dni, pliki `deleted` 30 dni (BE-051), `payment_provider_events` 1 rok, `platform_requests` 1 rok). DEC-10 A (konta zespołu to `platform_roles`, bez osobnej puli: autora z zespołu rozpoznajemy po `actor_type = operator`).
- **Dane demo:** zmiany z seedu (np. przełącznik poidła, przeniesienie Wichra 01.10), Kuba jako operator.

## Zakres
- [ ] Trasy w `backend/src/contracts/platform.ts`:
  - `GET /platform/v1/stables/{stableId}/entities/{type}/{id}/history?before=` (admin konta, `plt`): typy z listy (np. `box`, `horse`, `building`, `stable_settings`, `flag`, `task`); wpisy z `action`, czasem, autorem (`display_name` z `users`; `actor_type = operator` jako „Zespół EQUENOR”; `tablet` jako „Tablet” bez osoby; `system` jako „System”), zmianami pól (już maskowanymi przy zapisie); obiekt innej stajni: 404;
  - `GET /platform/v1/platform/audit-entries?stableId=&actorId=&action=&from=&to=&cursor=` (`plt = admin`), stronicowanie po kursorze, wpis w logu odczytów.
- [ ] Cron `backend/src/jobs/retention-pruner/` (co noc): okresy retencji z konfiguracji (wartości z DEC-24); usuwanie partiami z limitem: `notifications` w stanie końcowym starsze niż 180 dni, `audit.audit_log_changes`, potem `audit.audit_log` starsze niż 2 lata, `platform_requests` starsze niż 1 rok, `payment_provider_events` starsze niż 1 rok (ich pliki oznaczone jako `deleted` funkcją domeny `files`, potem usuwa je `files-gc`); log liczby usuniętych wierszy per tabela i metryka; ostrzeżenie (alert), gdy liczba odbiega od średniej (próg w konfiguracji).
- [ ] Wpis crona w manifeście `owners.ts` i granty: dodać `payment_provider_events` (`DELETE`) i `files` (`UPDATE (status, deleted_at, version, updated_at)`), bo DEC-24 obejmuje zdarzenia dostawcy płatności.
- [ ] Test grantów: rola `platform` czyta `audit`, żadna inna rola serwisu nie czyta ani nie usuwa wpisów; `retention-pruner` widzi tylko kolumny potrzebne do usuwania.

## Poza zakresem
- ekran historii w panelu (WEB-027); log odczytów `plt` jako strumień logów (BE-058; tu tylko wpis z trasy).

## Kryteria akceptacji
- [ ] Damian widzi historię boksu HN 5 (zmiana poidła z audytem) z autorem „Damian”; zmiana zrobiona przez Kubę ma autora „Zespół EQUENOR”.
- [ ] Obsługa dostaje 403, admin innej firmy 404; `audit-entries` tylko dla `plt = admin` (support: `403 forbidden_platform`).
- [ ] Cron z fałszywym zegarem usuwa wyłącznie wiersze starsze niż retencja, najpierw `audit_log_changes`; powtórzony i przerwany przebieg kończy pracę bez błędów.
- [ ] Rola `retention-pruner` nie może czytać treści audytu ani `notifications.body`.

## Testy
- Integracyjne (Testcontainers PostgreSQL, fałszywy zegar): trasy historii, cron na danych z różnymi datami, meta-test grantów.
- Uruchomienie: `cd backend && npm run check`; lokalnie `npm run cron -- retention-pruner`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/platform.json` zaktualizowany, `npm run gen:api` we `frontend/`; skrypt `start:cron:retention-pruner`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-040, bo trasy audytu trafiają do serwisu `platform`, który powstaje tam.
- Bez kolumny `users.identity_pool` (decyzja: konta zespołu to `platform_roles` w tej samej organizacji ZITADEL): autora z zespołu rozpoznajemy po `actor_type = operator`.
- Audyt jest tylko dopisywany; żadna trasa go nie zmienia.
