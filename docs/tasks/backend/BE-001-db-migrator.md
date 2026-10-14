---
id: BE-001
title: "lib/db: Drizzle, migrator, tabele globalne auth i audit"
area: backend
stage: 0
size: L
status: todo
depends_on: []
decisions: [DEC-09, DEC-04, DEC-05, DEC-10]
owner:
branch:
trello: https://trello.com/c/izyxyvjn
---
# BE-001 · lib/db: Drizzle, migrator, tabele globalne auth i audit

## Cel
Backend dostaje warstwę bazy: Drizzle ze schematami `app` i `audit`, własny migrator bez sekwencji, harness testów na PostgreSQL i pierwsze tabele (globalne tabele `auth` i audyt). Na tym budują wszystkie serwisy z bazą i crony.

## Kontekst
- Stan kodu: bazy jeszcze nie ma. `auth` trzyma użytkowników w pamięci (`backend/src/services/auth/users/memory-users.ts`, `access/memory-access.ts`). `backend/docker-compose.yml` w profilu `infra` stawia PostgreSQL 17 (`localhost:5433`, baza i użytkownik `equenor`, hasło `equenor-dev`). Backend to jeden pakiet npm (`backend/package.json`), bez pnpm i `packages/*`: odpowiednik `packages/db` z docs to `backend/src/lib/db`.
- Dokumenty: `docs/erd.md` „Zasady wspólne” (UUIDv7 z kodu, `timestamptz`, statusy `text`, `version` + `updated_at`, zakazy: `DEFAULT`, `CHECK`, enumy, `jsonb`, tablice, sekwencje, triggery, RLS, akcje FK) i diagram ERD (kolumny tabel); `docs/development-szczegoly.md` 3.1.4 (konwencje, unikalności, przepływ migracji, expand/contract, `/readyz` przy brakującej migracji) i 3.1.3 „Stan migracji” (własna tabela stanu w `app`, kluczem nazwa pliku i hash, `pg_advisory_lock`); `docs/mikroserwisy.md` 11.1 (zmiany w modelu).
- Decyzje: DEC-09 (wariant B: Drizzle, migrator, lint schematu i test katalogu od razu; sql-gate i squawk w BE-002), DEC-05 (wariant B: bez tabeli `signing_keys`, klucz z sekretu), DEC-10 (konta zespołu = wiersz `platform_roles`, bez `users.identity_pool`), DEC-04 (wariant A: `businesses` i `business_admins` w `auth`).
- Dane demo: na razie brak (seed: BE-011).

## Zakres
- [ ] Zależności npm (zwykły `npm install`, wersje przypięte jak reszta `package.json`): `drizzle-orm`, sterownik `pg`, dev: `drizzle-kit`, `@testcontainers/postgresql`.
- [ ] `backend/src/lib/db/`: `client.ts` (pula z `DATABASE_URL`, zamknięcie przy SIGTERM), `schema/app.ts` i `schema/audit.ts` (`pgSchema('app')`, `pgSchema('audit')`), pliki tabel pogrupowane według serwisu-właściciela: `schema/auth.ts`, później `schema/stables.ts`, `schema/operations.ts` itd. (BE-004).
- [ ] Wspólne helpery kolumn w `schema/columns.ts`: `id()` (uuid PK bez default), `createdAt()`, `updatedAt()`, `version()` (`bigint` mode number), `tz()` (`timestamp({ withTimezone: true })`). Bez `.default*()`.
- [ ] Tabele `auth` bez `stable_id`: `users` (`id`, `idp_user_id` UK, `account_kind`, `token_version`, `display_name`, `phone_e164`, `email`, `locale`, `contact_synced_at`, `deleted_at`, `version`, `created_at`, `updated_at`; bez `identity_pool`), `businesses` (`tax_id` UK jako 10 cyfr, `name`, adres siedziby, `country_code`, `invoice_email`, `version`…), `business_admins` (PK `business_id`+`user_id`, `granted_via`, `granted_session_id`, `created_at`), `platform_roles` (kolumny z mikroserwisy.md 11.1; częściowy unikalny indeks `user_id` przy `revoked_at IS NULL`), `platform_requests` (11.1).
- [ ] `audit.audit_log` (`id`, `stable_id` bez FK, `service`, `actor_type`, `actor_id`, `client`, `session_id`, `action`, `entity_type`, `entity_id`, `created_at`) i `audit.audit_log_changes` (PK `audit_log_id`+`field`, `old_value`, `new_value`).
- [ ] `drizzle.config.ts` (wyjście `backend/migrations/`), skrypt `npm run db:generate` (`drizzle-kit generate`).
- [ ] Własny migrator `backend/src/lib/db/migrate.ts`: tabela stanu `app.schema_migrations (name text PK, sha256 text, applied_at timestamptz)` tworzona bez `DEFAULT`; `pg_advisory_lock` na czas przebiegu; zmieniony hash już zastosowanego pliku = błąd. Konwencja plików w `backend/migrations/`: pliki `NNNN_<nazwa>.sql` z `drizzle-kit generate` (instrukcje rozdzielone `--> statement-breakpoint`, cały plik w jednej transakcji) oraz ręcznie pisane `NNNN_<nazwa>.concurrent.sql` (każda instrukcja osobno, poza transakcją, np. `CREATE INDEX CONCURRENTLY … IF NOT EXISTS`); kolejność wyłącznie z nazw plików (sortowanie leksykalne), hash SHA-256 całego pliku; `meta/_journal.json` Drizzle tylko dla `drizzle-kit`, migrator go nie czyta. Punkt wejścia `backend/src/lib/db/migrate-main.ts` (env `DATABASE_URL`, kod wyjścia 0/1, log pino). Skrypty `npm run migrate` (`tsx src/lib/db/migrate-main.ts`) i `start:migrate` (`node dist/lib/db/migrate-main.js`, Job w klastrze). `Dockerfile`: katalog `migrations/` w obrazie.
- [ ] `checkMigrations(pool)`: zwraca „gotowe”, gdy w bazie są wszystkie migracje znane kodowi; nowsze migracje w bazie są dozwolone (rolling update). Do użycia przez `isReady` z `backend/src/kit/service.ts`; żaden serwis jeszcze nie ma bazy (`auth` działa w pamięci), podpięcie w `auth` robi BE-013, w kolejnych serwisach ich zadania.
- [ ] Harness `backend/src/lib/db/testing.ts` (wyłączony z buildu): PostgreSQL z Testcontainers albo `TEST_DATABASE_URL` (np. baza z compose), migracje, osobna baza na plik testowy (`CREATE DATABASE … TEMPLATE` z bazy wzorcowej po migracjach; schematy `app` i `audit` są stałe w `pgSchema`, więc osobny schemat odpada), usuwanie bazy po pliku.

## Poza zakresem
- Tabele z `stable_id`, także `stable_members`, `horse_access`, `invitations`, `stable_role_features` (BE-004).
- Bramka zakazanych obiektów (BE-002), role bazy i granty (BE-003), `unitOfWork` i `audit.record` (BE-005), seed (BE-011).

## Kryteria akceptacji
- [ ] `npm run migrate` na pustej bazie z compose tworzy schematy `app`, `audit`, tabele i `app.schema_migrations`; drugi przebieg niczego nie zmienia; dwa równoległe przebiegi nie dublują migracji.
- [ ] W katalogu bazy po migracjach nie ma `pg_attrdef`, sekwencji, enumów, `CHECK`, kolumn `json`/`jsonb`/tablicowych ani `timestamp without time zone` w `app` i `audit` (szybki test tu, pełny w BE-002).
- [ ] Brak `signing_keys` i `users.identity_pool`; unikalności: `users.idp_user_id`, `businesses.tax_id`, częściowa `platform_roles.user_id`.
- [ ] Testowy serwis w harnessie (`createService({ isReady: () => checkMigrations(pool) })`) na bazie bez najnowszej migracji odpowiada `/readyz` 503 `not_ready`, a po `migrate` 200.
- [ ] Plik `*.concurrent.sql` wykonuje się poza transakcją (test z `CREATE INDEX CONCURRENTLY`), a zmiana jednego znaku w zastosowanej migracji zatrzymuje `migrate` z nazwą pliku.

## Testy
- Vitest integracyjne na harnessie: migrator (idempotencja, równoległość, zmieniony hash), `checkMigrations`, wstawienie i odczyt wiersza każdej tabeli. Komenda: `cd backend && npm test` (z Dockerem albo `TEST_DATABASE_URL=postgres://equenor:equenor-dev@localhost:5433/equenor`).

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; `backend/README.md` (sekcje „Kod” i „Uruchomienie lokalne (dev)”: `DATABASE_URL`, `npm run migrate`, profil `infra`, konwencja `*.concurrent.sql`) zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm; żadnego pnpm, Turborepo ani `packages/*`, mimo że docs/development*.md je opisują (`backend/README.md`: struktura 3.1.1 nieaktualna).
- Domyślna tabela migracji Drizzle (`drizzle.__drizzle_migrations` z `SERIAL`) jest zakazana: nie używaj `drizzle-orm/migrator`.
- Wartości `version`, `created_at`, `updated_at` i UUIDv7 (`uuid` v7, już w zależnościach) nadaje kod, nigdy baza.
- `users.phone_e164` i `users.email` to kopie z ZITADEL; tylko `auth` będzie miał do nich `SELECT` (granty: BE-003).
- Testcontainers wymaga Dockera; gdy go nie ma, test ma się pominąć z jasnym komunikatem, a nie paść (CI: SH-003).
