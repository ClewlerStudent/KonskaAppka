---
id: BE-002
title: "Bramka zakazanych obiektów w bazie"
area: backend
stage: 0
size: M
status: todo
depends_on: [BE-001]
decisions: [DEC-09]
owner:
branch:
trello: https://trello.com/c/huCqQDyQ
---
# BE-002 · Bramka zakazanych obiektów w bazie

## Cel
Zasady erd.md (bez `DEFAULT`, `CHECK`, enumów, `jsonb`, tablic, sekwencji, triggerów, funkcji, RLS i akcji FK) pilnuje automat, a nie przegląd kodu. Zła migracja zatrzymuje `npm run check` i CI.

## Kontekst
- Stan kodu: po BE-001 schematy Drizzle leżą w `backend/src/lib/db/schema/*.ts`, migracje SQL w `backend/migrations/`, harness PostgreSQL w `backend/src/lib/db/testing.ts`. ESLint: `backend/eslint.config.js` (flat config, reguła `equenor/service-boundaries`).
- Dokumenty: `docs/development-szczegoly.md` 3.1.3 (trzy warstwy: lint schematu Drizzle, `sql-gate` na parserze PostgreSQL, test katalogu po migracjach; testy pozytywne; squawk) i 3.1.4 (unikalności, wielokolumnowe FK, brak unikalności `boxes.label`); `docs/erd.md` „Zasady wspólne”.
- Decyzje: DEC-09 wariant B: lint schematu i test katalogu od razu; `sql-gate` i squawk muszą działać przed pierwszą migracją etapu 2 (BE-028, BE-029).
- Dane demo: nie dotyczy.

## Zakres
- [ ] **Warstwa 1, lint schematu** w `backend/eslint.config.js` dla `src/lib/db/schema/**`: `no-restricted-syntax` (albo własna reguła) odrzuca `.default(`, `.defaultNow(`, `.defaultRandom(`, `serial`, `bigserial`, `pgEnum`, `json(`, `jsonb(`, `.array(`, `check(`, `onDelete`, `onUpdate`, `generatedAlwaysAs*`, `timestamp(` bez `withTimezone: true`, `pgPolicy`, `.enableRLS(`. Komunikaty po polsku z odwołaniem do erd.md.
- [ ] **Warstwa 3, test katalogu** `backend/src/lib/db/catalog.test.ts` po wszystkich migracjach (schematy `app` i `audit`): zero trafień w `pg_proc`, `pg_trigger` (`NOT tgisinternal`), `pg_policy`, `relrowsecurity`, `pg_rewrite` dla widoków, `pg_constraint.contype = 'c'`, `pg_attrdef`, `relkind = 'S'`, `attidentity`, `attgenerated`, `pg_type.typtype IN ('e','d')`, kolumny `json`/`jsonb`/tablicowe i `timestamp without time zone`, `confdeltype`/`confupdtype` ≠ `'a'`, schematy aplikacji inne niż `app` i `audit` (poza `public` i systemowymi).
- [ ] Testy pozytywne w tym samym pliku: każda FK z tabeli z `stable_id` do tabeli z `stable_id` jest wielokolumnowa (`stable_id`, `x_id`), a rodzic ma `UNIQUE (stable_id, id)`; na `boxes.label` nie ma unikalnego indeksu (działa po BE-004; do tego czasu test pomija brakujące tabele z komunikatem).
- [ ] **Warstwa 2, `sql-gate`**: `backend/scripts/sql-gate.ts` na `libpg-query` (prawdziwy parser, bez wyrażeń regularnych); czyta nowe pliki `backend/migrations/*.sql` i odrzuca: `CREATE FUNCTION/PROCEDURE/TRIGGER/RULE/POLICY`, `ENABLE ROW LEVEL SECURITY`, `CHECK`, `DEFAULT` i `SET DEFAULT`, `CREATE SEQUENCE`, `serial`, `GENERATED … AS IDENTITY`, kolumny generowane, `CREATE TYPE … AS ENUM`, `CREATE DOMAIN`, `json`/`jsonb`/tablice, akcje FK inne niż domyślne, `DO $$`, `CREATE EXTENSION`, `LISTEN`, `NOTIFY`. Skrypt `npm run sql-gate`, dopięty do `npm run check`.
- [ ] **squawk** na nowych migracjach (`npm run migrations:lint`): blokady, indeksy bez `CONCURRENTLY`, `NOT NULL` bez uzupełnienia danych. Jeśli binarka squawk nie instaluje się przez npm w tym środowisku, opisz w README, jak ją uruchomić, i zostaw krok w CI (SH-003).
- [ ] Wyjątek tylko jeden, jawny: tabela `app.schema_migrations` z BE-001 przechodzi bramkę bez wyjątków (nie ma `DEFAULT` ani sekwencji).

## Poza zakresem
- Granty, role bazy i meta-test grantów (BE-003); strażnik predykatu `stable_id` w zapytaniach (BE-006, BE-057).
- Konfiguracja systemu CI (SH-003): tu tylko skrypty npm.

## Kryteria akceptacji
- [ ] Dodanie w schemacie `.default(…)` albo `jsonb()` daje błąd `npm run lint`.
- [ ] Ręcznie dopisana do migracji linia `ALTER TABLE … ADD CONSTRAINT … CHECK (…)` daje błąd `npm run sql-gate` z nazwą pliku i rodzajem zakazanego obiektu.
- [ ] Test katalogu jest zielony na bieżących migracjach i czerwony na migracji testowej z triggerem, enumem i FK `ON DELETE CASCADE` (fixture w teście, nie w `migrations/`).
- [ ] `npm run check` uruchamia lint schematu i `sql-gate`; test katalogu biegnie w `npm test`.

## Testy
- `catalog.test.ts` (harness z BE-001), testy jednostkowe `sql-gate` na zestawie małych plików SQL (dozwolone i zakazane), test reguły ESLint (`RuleTester` albo plik-fixture z oczekiwanym błędem).
- Komendy: `cd backend && npm run lint && npm run sql-gate && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README (Sprawdzenia) opisuje bramkę; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zakaz widoków (`pg_rewrite`) jest otwarty w docs (sekcja 5); na start traktuj widok jako błąd.
- `libpg-query` ma binaria natywne; jeśli instalacja się nie uda, użyj wersji WASM tej samej biblioteki (`@pgsql/…`) i opisz wybór w README.
- Nie dodawaj listy wyjątków: obiekt zakazany ma zniknąć ze schematu, nie z bramki.
