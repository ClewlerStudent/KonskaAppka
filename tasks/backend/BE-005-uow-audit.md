---
id: BE-005
title: "unitOfWork i lib/audit"
area: backend
stage: 0
size: M
status: todo
depends_on: [BE-001]
decisions: [DEC-26]
owner:
branch:
trello: https://trello.com/c/1zLeaKV8
---
# BE-005 · unitOfWork i lib/audit

## Cel
Każdy zapis w serwisie i cronie idzie przez jeden wzorzec: transakcja, wpis audytu w tej samej transakcji i bufor zdarzeń, które wychodzą dopiero po COMMIT (a w cronach tuż przed nim). Nie da się zmienić danych bez śladu i nie da się opublikować zdarzenia o zmianie, która się wycofała.

## Kontekst
- Stan kodu: BE-001 daje pulę (`backend/src/lib/db/client.ts`), tabele `audit.audit_log` i `audit.audit_log_changes` oraz harness. Principal z tokenu: `backend/src/lib/auth/claims.ts` (`Principal`: `userId`, `sessionId`, `clientId`, `platformRole`…). Logger z redakcją sekretów: `backend/src/kit/logger.ts`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.6 (`unitOfWork(scope, tx => …)`), 3.1.11 (`audit.record`, maskowanie, meta-test deklaracji audytu), 3.1.7 i 3.1.8 (`publishAfterCommit`, `publishBeforeCommit`); `docs/mikroserwisy.md` 4.4 (`actor_type`, mapowanie `client`: `mobile` → `app`, `web`, `tablet`, `ops`, `opctl`; `session_id` = `sid`; autor z zespołu jako „Zespół EQUENOR”), 1.5 (crony: audyt `actor_type = system`, publikacja przed COMMIT).
- Decyzje: brak.
- Dane demo: nie dotyczy (testy na fabrykach).

## Zakres
- [ ] `backend/src/lib/audit/`: `Actor` (`{ type: 'user' | 'tablet' | 'operator' | 'system', id: string | null, client: 'app' | 'web' | 'tablet' | 'ops' | 'opctl' | null, sessionId: string | null }`), `actorFromPrincipal(principal)` (tablet: `client_id = tablet`, `actor_id` według DEC-26, rekomendacja B: `box_id` z nagłówka `X-Box-Id`, nigdy id konta tabletów, `session_id` = `sid`; operator: `plt` obecne; system: crony), `audit.record(tx, { service, actor, action, entityType, entityId, stableId?, changes? })`.
- [ ] `changes` jako lista `{ field, old, new }` → wiersze `audit_log_changes`; maskowanie pól wrażliwych (lista w kodzie: `password`, `code`, `phone_e164`, `email`, `target`, `recipient_address`, `body`, tokeny) na `[masked]`; wartości jako tekst (daty ISO, liczby, booleany).
- [ ] `backend/src/kit/unit-of-work.ts`: `unitOfWork(deps, { actor, stableId? }, async (tx, ctx) => …)`: transakcja (`BEGIN`/`COMMIT`), `ctx.audit(...)` dopisuje `service` i aktora, `ctx.events.add(envelopeInput)` buforuje; po udanym COMMIT wywołuje `publisher.publishAfterCommit(events)`, po wyjątku nic nie publikuje.
- [ ] Wariant crona: `unitOfWork(..., { publish: 'beforeCommit' })`: zdarzenia publikowane tuż przed COMMIT; błąd publikacji wycofuje transakcję (mikroserwisy.md 1.5).
- [ ] Interfejs `EventPublisher` (`publishAfterCommit`, `publishBeforeCommit`) z implementacją w pamięci do testów; prawdziwą daje BE-008 (`lib/messaging`). Koperta: `{ id, type, version, occurredAt, stableId, producer, payload }` (typy wspólne z BE-008; jeśli BE-008 jest pierwsze, użyj jego typów).
- [ ] Pomocnik optymistycznej współbieżności: `bumpVersion(row)` (`version + 1`, `updated_at = now` z zegara) i `assertVersion(row, expected)` → `ApiError('version_conflict')` (412); kody `version_conflict` i `precondition_required` (428) dopisać do `ERRORS` w `backend/src/contracts/common.ts`.
- [ ] Zegar wstrzykiwany (`backend/src/kit/clock.ts`), żeby testy i crony z `--now` dawały powtarzalne `created_at`.

## Poza zakresem
- Deklaracja audytu w deskryptorze trasy i meta-test „każda trasa zapisująca ma audyt” (BE-006).
- Odczyt audytu, historia obiektu i retencja (BE-055); prawdziwy broker (BE-008).

## Kryteria akceptacji
- [ ] Zapis z `unitOfWork` tworzy wiersz w tabeli domenowej i wpis `audit_log` z `audit_log_changes` w tej samej transakcji; wyjątek w środku nie zostawia ani zmiany, ani wpisu audytu, ani zdarzenia.
- [ ] Zdarzenie z bufora wychodzi dokładnie raz, po COMMIT; w trybie `beforeCommit` nieudana publikacja wycofuje transakcję.
- [ ] Żądanie tokenem z `client_id = mobile` daje `client = app`; tablet `actor_type = tablet`, `actor_id` = `box_id` z `X-Box-Id` (DEC-26), nie id konta technicznego; token z `plt` `actor_type = operator`, `session_id = sid`.
- [ ] Pole `email` w `changes` trafia do bazy jako `[masked]`; hasło i kod nigdy nie trafiają do audytu ani logów.

## Testy
- `backend/src/kit/unit-of-work.test.ts` i `backend/src/lib/audit/audit.test.ts` na harnessie PostgreSQL: COMMIT, rollback, oba tryby publikacji, maskowanie, mapowanie aktora dla każdej aplikacji. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Rola serwisu ma w `audit` tylko `INSERT` (BE-003): `audit.record` nie może robić `RETURNING` ani `SELECT` na `audit`. Id wpisu nadaje kod (UUIDv7).
- `kit` i `lib` nie importują serwisów (reguła ESLint); nazwę serwisu (`service`) podaje wołający.
- Nie wprowadzaj outboxu: brak outboxu to decyzja (erd.md pkt 8); krytyczne ścieżki domykają crony.
