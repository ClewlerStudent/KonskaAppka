---
id: BE-003
title: "owners.ts, role bazy i granty"
area: backend
stage: 0
size: M
status: todo
depends_on: [BE-001]
decisions: [DEC-05, DEC-10]
owner:
branch:
trello:
---
# BE-003 · owners.ts, role bazy i granty

## Cel
Jedno źródło prawdy o tym, kto pisze do której tabeli i kto ją czyta (`owners.ts`). Z niego powstają role i granty PostgreSQL dla 9 serwisów z bazą i 9 cronów, reguła lintu „zapis tylko do swoich tabel” i meta-test, że tabel uprawnień `auth` nie czyta nikt inny (W2).

## Kontekst
- Stan kodu: po BE-001 tabele leżą w `backend/src/lib/db/schema/<właściciel>.ts`; po BE-004 dochodzą pozostałe. Granice importów pilnuje `equenor/service-boundaries` w `backend/eslint.config.js`.
- Dokumenty: `docs/mikroserwisy.md` 1.2 (odczyt: tabele domenowe dla wszystkich, prywatne `auth` tylko `auth`, `notifications` tylko `notifications`, `audit` tylko `INSERT`, `users` kolumnowo), 1.5 (wąskie granty cronów: `invitation-expiry-notifier`, `horse-left-reconciler`, `retention-pruner`), 6 (9 cronów i ich zapis); `docs/erd.md` „Manifest zapisu cronów”; `docs/development-szczegoly.md` 3.1.4 „Generator grantów z owners.ts” i lista tabel bez `stable_id`.
- Decyzje: brak nowych; wynika z DEC-10 (bez `users.identity_pool`, więc grant kolumnowy `users` dla innych to `id`, `display_name`, `locale`, `deleted_at`) i DEC-05 (bez `signing_keys`).
- Dane demo: nie dotyczy.

## Zakres
- [ ] `backend/src/lib/db/owners.ts`: dla każdej tabeli `app` i `audit` właściciel (`auth`, `stables`, `operations`, `schedule`, `billing`, `notifications`, `files`, `platform`; `board`, `sms`, `email` nie mają tabel) i `visibility: 'shared' | 'private' | { columns: [...] }`. Prywatne `auth`: `business_admins`, `stable_members`, `horse_access`, `invitations`, `stable_role_features`, `platform_roles`, `platform_requests`; `users` kolumnowo; `businesses` czytają tylko `auth`, `stables`, `billing`; `notifications` prywatna (`recipient_address`, `body`).
- [ ] Manifest cronów w tym samym pliku: 9 cronów z mikroserwisy.md 6 (`escalation-scheduler`, `invitation-expiry-notifier`, `health-due-reminders`, `files-gc`, `billing-usage-snapshot`, `billing-invoicing`, `billing-dunning`, `horse-left-reconciler`, `retention-pruner`), dla każdego: właściciel kodu, tabele i kolumny zapisu (`insert`/`update(cols)`/`delete`), wąskie granty odczytu tabel `auth`.
- [ ] Generator `backend/scripts/db-grants.ts` (`npm run db:grants`): pisze `backend/db/grants.sql` (w repo, dla Dawida): role `eq_<serwis>` i `eq_cron_<nazwa>` (`NOLOGIN`; hasła i logowanie zakłada Dawid), `USAGE` na schematach, `SELECT` według `visibility`, zapis tylko właściciel i crony z manifestu, `audit`: wszystkie role tylko `INSERT`, `platform` też `SELECT`, `retention-pruner` `SELECT (id, created_at)`/`(audit_log_id)` i `DELETE`; `board` tylko `SELECT`; `sms` i `email` bez roli. Test sprawdza, że plik jest aktualny (jak `openapi:check`).
- [ ] Lokalnie i w testach granty da się nałożyć (`npm run db:grants -- --apply` na bazie z `DATABASE_URL`); harness z BE-001 umie uruchomić zapytanie jako dana rola (`SET ROLE`).
- [ ] Lint zapisu: reguła ESLint w `src/services/<svc>/**` i `src/jobs/<cron>/**` odrzuca `insert/update/delete` na obiekcie tabeli z `lib/db/schema/<inny właściciel>.ts` (crony: według manifestu); `UPDATE` kolumn `stables.business_id` i `boxes.stable_id` zakazany wszędzie.
- [ ] Meta-testy na prawdziwej bazie po grantach: żadna rola poza `eq_auth` nie ma `SELECT` na prywatnych tabelach `auth` ani na `users.phone_e164`/`users.email` (wyjątki: kolumny z manifestu cronów); poza `eq_notifications` nikt nie czyta `notifications.recipient_address` i `body`; granty kolumnowe cronów = manifest; żaden cron nie pisze poza manifestem; w `audit` nikt poza `eq_cron_retention_pruner` nie ma `DELETE`/`UPDATE`; każda tabela w bazie ma wpis w `owners.ts`.

## Poza zakresem
- Zakładanie ról z hasłami, pooler, NetworkPolicy, manifesty platformy (Dawid; lista dla niego: BE-060).
- Szablon crona i jego połączenie z rolą (BE-009).

## Kryteria akceptacji
- [ ] `npm run db:grants` daje deterministyczny `backend/db/grants.sql`; zmiana `owners.ts` bez regeneracji zatrzymuje `npm run check`.
- [ ] `SET ROLE eq_board; SELECT * FROM app.stable_members` daje błąd uprawnień; `SET ROLE eq_auth` czyta.
- [ ] `SET ROLE eq_cron_horse_left_reconciler` może `UPDATE app.horse_access (revoked_at, version, updated_at)`, a innych kolumn nie.
- [ ] Wstawienie przez rolę serwisu do tabeli innego właściciela daje błąd bazy, a w kodzie błąd lintu.

## Testy
- `backend/src/lib/db/grants.test.ts` (harness, `SET ROLE`), test aktualności `db/grants.sql`, test reguły lintu na fixture. `cd backend && npm test && npm run lint`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README: jak nałożyć granty lokalnie; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Jeśli BE-004 jest już scalone, obejmij wszystkie tabele; jeśli nie, BE-004 dopisze wpisy, a test „każda tabela ma wpis” to wymusi.
- Klucze obce do `users` z innych tabel działają bez grantu `SELECT` (sprawdza je baza).
- Granty to obrona, a nie autoryzacja: serwisy dalej decydują wyłącznie z tokenu (W2).
<!-- dep-ok: BE-004 (kolejność dowolna: test „każda tabela ma wpis w owners.ts” wymusza wpisy na tym, kto scala drugi) -->
