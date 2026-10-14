---
id: BE-008
title: "lib/messaging: zdarzenia i kolejki"
area: backend
stage: 0
size: L
status: todo
depends_on: [BE-005, SH-002]
decisions: [DEC-01]
owner:
branch:
trello:
---
# BE-008 · lib/messaging: zdarzenia i kolejki

## Cel
Wspólna warstwa komunikacji asynchronicznej: zdarzenia domenowe (publish/subscribe z kolejką na konsumenta i DLQ), kolejki FIFO `sms` i `email` dla powiadomień i osobne kolejki kodów (krótka retencja, bez DLQ). Serwisy i crony używają jednego API, a broker da się wymienić (DEC-01).

## Kontekst
- Stan kodu: BE-005 daje `unitOfWork` z buforem zdarzeń i interfejsem `EventPublisher` (`publishAfterCommit`, `publishBeforeCommit`). `auth` wysyła kody przez `CodeSender` (`backend/src/services/auth/codes/code-sender.ts`, dziś skrzynka dev). SH-002 dodaje broker do `docker-compose.yml`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.8 (publikacja po COMMIT z ponowieniami i metryką, konsument z DLQ, long polling, idempotencja bez tabeli `inbox`, nieznany typ do DLQ, narzędzie DLQ), 3.1.5 „Zdarzenia” (koperta, katalog z wersjami, konsument wersji N czyta N-1, manifest); `docs/mikroserwisy.md` 7.3 (katalog: `invitation.created/accepted/expired`, `user.deleted`, `member.removed`, `business_admin.changed`, `stable.created`, `horse.left`, `subscription.status_changed`, `flag.created`, `flag.escalated`, `health.due`, `invoice.issued`, `payment.failed`, `payment.overdue`, `sms.result`, `email.result`), 5.8 (FIFO: grupa = `notifications.id`, deduplikacja = `id` + `attempts`), 5.2 „Kody” (kolejki kodów: retencja ≤ 5 min, bez DLQ, grupa i deduplikacja z UUID od `auth`), 1.4 i 1.5.
- Decyzje: DEC-01 rekomendacja B: RabbitMQ za interfejsem `lib/messaging`, adapter w pamięci do testów; zadania ruszają na adapterze w pamięci. Jeśli Dawid wybierze inaczej, zmienia się tylko adapter.
- Dane demo: nie dotyczy.

## Zakres
- [ ] `backend/src/lib/messaging/envelope.ts`: koperta `{ id (UUIDv7), type, version, occurredAt, stableId | null, producer, actor?, payload }` (zod), `traceparent` w nagłówkach wiadomości.
- [ ] `catalog.ts`: katalog zdarzeń z 7.3 (typ, wersja, schemat zod ładunku, producent, konsumenci). Ładunek niesie identyfikatory i dane potrzebne konsumentowi (np. `invitation.created`: kanał, adres, imię, język); wersja N konsumenta czyta N-1. Kolejne zadania dopisują pola, nie typy.
- [ ] `publisher.ts`: `publishAfterCommit` (ponowienia z backoffem; po wyczerpaniu log i licznik `events_publish_failed_total`), `publishBeforeCommit` (błąd = wyjątek, transakcja się wycofuje); wpięcie w `EventPublisher` z BE-005.
- [ ] `consumer.ts`: `consume(type, handler, { queue })`: kolejka na parę (serwis, zdarzenie), DLQ po N próbach, partie, przedłużanie widoczności, potwierdzenie dopiero po sukcesie; nieznany typ albo wersja → DLQ i log `alert`; łagodne zatrzymanie przy SIGTERM (najpierw konsumenci, potem HTTP, potem pula; kolejność z 3.1.6).
- [ ] `queues.ts`: kolejki wiadomości `sms.notifications`, `email.notifications` (FIFO na grupę, deduplikacja po `deduplicationId` w oknie 5 min, DLQ) i `sms.codes`, `email.codes` (retencja ≤ 5 min, bez DLQ, czytane przed powiadomieniami); typy wiadomości `{ id, to, subject?, body, notificationId?, attempts? }`.
- [ ] Adapter w pamięci (`memory.ts`): ta sama semantyka (kolejność w grupie, deduplikacja, DLQ, retencja kodów) do testów i dev bez brokera.
- [ ] Adapter brokera według DEC-01 (`rabbitmq.ts` przy wariancie B: quorum queues, DLX, TTL kolejek kodów, single active consumer dla FIFO; deduplikację rób po stronie konsumenta, jeśli broker jej nie ma). Konfiguracja z env (`MESSAGING=memory|rabbitmq`, `MESSAGING_URL`); `memory` zabronione przy `APP_ENV=prod` (`forbidInProd` z `kit/env.ts`).
- [ ] Manifest kolejek i tematów generowany z katalogu (`npm run messaging:manifest` → `backend/messaging/manifest.json`, test aktualności) i skrypt zakładania zasobów lokalnie (`npm run messaging:setup`).
- [ ] Narzędzie DLQ: `npm run events -- dlq list|show <id>|redrive <queue>`.

## Poza zakresem
- Serwisy `sms`, `email`, `notifications` i przepięcie kodów `auth` na kolejki (BE-015, BE-016, BE-017, BE-036).
- Dobór i uruchomienie brokera na klastrze (Dawid); compose: SH-002.

## Kryteria akceptacji
- [ ] Zdarzenie z `unitOfWork` trafia do wszystkich subskrybentów dokładnie raz po COMMIT; rollback nie publikuje.
- [ ] Handler, który rzuci 5 razy, przenosi wiadomość do DLQ; `redrive` oddaje ją do kolejki.
- [ ] Dwie wiadomości FIFO z tym samym `deduplicationId` w 5 min dają jedno doręczenie; wiadomości jednej grupy przychodzą w kolejności.
- [ ] Wiadomość w kolejce kodów starsza niż 5 min nie jest doręczana i nie trafia do DLQ.
- [ ] Zdarzenie nieznanego typu albo z niepoprawnym ładunkiem trafia do DLQ z alertem w logu.

## Testy
- Wspólny zestaw testów kontraktowych uruchamiany na adapterze w pamięci zawsze, a na brokerze, gdy ustawiony `MESSAGING_TEST_URL` (Testcontainers w CI, SH-003). `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README: jak uruchomić z brokerem z compose, zmienne `MESSAGING*`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Docs mówią „SNS + SQS” i LocalStack; to opis z czasów przed DEC-01. Nazwy w kodzie: neutralne (`topic`, `queue`), bez AWS.
- Bez outboxu i bez tabeli `inbox`: idempotencję konsumentów dają unikalności w bazie (np. `notifications.dedupe_key`).
- Treść wiadomości z kodem nie trafia do logów (redakcja w `kit/logger.ts`, test hasła-kanarka w BE-015).
