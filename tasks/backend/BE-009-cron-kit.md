---
id: BE-009
title: "Szablon crona (src/jobs)"
area: backend
stage: 0
size: M
status: todo
depends_on: [BE-003, BE-008]
decisions: []
owner:
branch:
trello:
---
# BE-009 · Szablon crona (src/jobs)

## Cel
Wspólny szablon dla 9 cronów: jeden przebieg to jeden proces z limitem czasu i podsumowaniem, pisze wprost do bazy własną rolą z manifestu, kodem domeny właściciela, z audytem `actor_type = system` i publikacją zdarzeń tuż przed COMMIT. Bez tokenów i bez wołania serwisów (W3).

## Kontekst
- Stan kodu: obraz backendu uruchamia serwis skryptem `start:<serwis>` (`backend/package.json`, `backend/Dockerfile`); po BE-003 jest manifest cronów w `backend/src/lib/db/owners.ts` i generator ról `eq_cron_<nazwa>`; po BE-005 `unitOfWork` z trybem `publish: 'beforeCommit'`; po BE-008 publikacja zdarzeń. Granice importów: `equenor/service-boundaries` w `backend/eslint.config.js`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.7 (szablon crona: jeden proces, rola z manifestu, kod domeny właściciela, `publishBeforeCommit`, jedna transakcja na obiekt, `pg_try_advisory_xact_lock`, `--now`, test dwóch przebiegów) i 3.4 (lista cronów, cztery przypadki testów); `docs/mikroserwisy.md` 1.5 i 6 (harmonogramy, zapis, publikacje).
- Decyzje: brak. Układ katalogów według decyzji użytkownika: crony w `backend/src/jobs/<cron>/`, kod domeny w module serwisu-właściciela.
- Dane demo: nie dotyczy.

## Zakres
- [ ] `backend/src/kit/cron.ts`: `runCron({ name, timeoutMs, run: async (ctx) => summary })`: env (zod: `APP_ENV`, `DATABASE_URL`, `MESSAGING*`, `CRON_NOW` opcjonalnie), logger z `cron = <nazwa>`, zegar (systemowy albo stały z `--now=<ISO>`), pula bazy, publisher; limit czasu → kod wyjścia ≠ 0; podsumowanie w logu (`processed`, `written`, `published`, `skipped`, `durationMs`); SIGTERM kończy po bieżącym obiekcie.
- [ ] `ctx.forEachObject(items, async (tx, item) => …)`: jedna transakcja na obiekt przez `unitOfWork` z `actor = { type: 'system' }` i `publish: 'beforeCommit'`; błąd jednego obiektu nie przerywa przebiegu (licznik błędów, kod wyjścia ≠ 0 na końcu).
- [ ] `ctx.lock(key)`: `pg_try_advisory_xact_lock` na cron albo obiekt; zajęty lock = obiekt pominięty (log `skipped`).
- [ ] Rejestr cronów `backend/src/jobs/index.ts` (nazwa → moduł, harmonogram i strefa jako dane dla manifestów BE-060) i katalog `backend/src/jobs/_example/` z cronem przykładowym na testowej tabeli (tylko testy).
- [ ] Skrypty: `npm run cron -- <nazwa> [--now=…]` (tsx, dev) oraz dla każdego crona `start:cron:<nazwa>` (`exec node dist/jobs/<nazwa>/main.js`), dodawane razem z cronem w jego zadaniu.
- [ ] ESLint: `src/jobs/<cron>/**` może importować `kit`, `lib`, `contracts` i moduł domeny swojego właściciela z manifestu (`src/services/<właściciel>/domain/**`); crony przekrojowe (`horse-left-reconciler`, `retention-pruner`) moduły kilku serwisów; serwisy nie importują `src/jobs`. Rozszerz regułę `service-boundaries`.
- [ ] Pomocnik testów `runCronForTest(name, { now, db })` i test szablonowy: dwa przebiegi po kolei dają ten sam stan; dwa równoległe też; przerwanie między publikacją a COMMIT nie daje drugiej wiadomości w następnym przebiegu (przy deduplikacji odbiorcy).
- [ ] Połączenie z bazą rolą crona: w testach `SET ROLE eq_cron_<nazwa>` po nałożeniu grantów (BE-003), żeby zapis poza manifestem dawał błąd już w testach.

## Poza zakresem
- Konkretne crony (BE-035, BE-037, BE-046, BE-049, BE-051, BE-053, BE-055); CronJob, harmonogram w klastrze i konta serwisowe (Dawid; dane dla niego: BE-060).

## Kryteria akceptacji
- [ ] `npm run cron -- _example --now=2026-10-13T05:15:00Z` przetwarza obiekty i kończy się kodem 0 z podsumowaniem w logu.
- [ ] Cron przykładowy uruchomiony dwa razy równolegle daje ten sam stan bazy co jeden przebieg.
- [ ] Wstawienie przez cron do tabeli spoza manifestu daje błąd uprawnień bazy w teście.
- [ ] Import modułu innego serwisu z crona spoza listy przekrojowych daje błąd lintu.

## Testy
- `backend/src/kit/cron.test.ts` (fałszywy zegar, adapter wiadomości w pamięci, harness bazy z grantami), test reguły ESLint. `cd backend && npm test && npm run lint`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README: jak uruchomić cron lokalnie; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Docs piszą `services/<właściciel>/jobs/<cron>` i `pnpm cron`: u nas `backend/src/jobs/<cron>` i `npm run cron`.
- Cron nie zna adresów i nie woła serwisów: tylko baza i broker (W3). Treść powiadomień robi `notifications`.
- Idempotencję dają unikalności w bazie; advisory lock tylko ogranicza równoległość.
