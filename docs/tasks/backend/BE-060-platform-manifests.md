---
id: BE-060
title: Manifesty dla platformy
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-003, BE-008, BE-025, BE-009]
decisions: [DEC-01]
owner:
branch:
trello: https://trello.com/c/KId0zA9n
---
# BE-060 · Manifesty dla platformy

## Cel
Dawid, który sam robi infrastrukturę, dostaje z repozytorium komplet wygenerowanych opisów: kto z kim może rozmawiać (porty `/internal`), jakie role bazy i granty założyć, jakie kolejki i tematy brokera utworzyć, jakie zmienne env i sekrety ma każdy serwis i cron, jakie polecenia i harmonogramy uruchomić. Manifesty powstają z kodu, więc nie rozjeżdżają się z nim.

## Kontekst
- **Stan kodu:** deskryptory tras z `internal.port` i `internal.callers` (`backend/src/kit/route.ts`, kontrakty w `backend/src/contracts/`), porty wewnętrzne serwisów (np. `jwks`, `recipients`, `horses` w `auth`, BE-025), `owners.ts` i generator grantów (BE-003), katalog zdarzeń i manifest kolejek (BE-008), crony z harmonogramami (BE-009), schematy env w zod (`backend/src/kit/env.ts`, `backend/src/services/*/env.ts`), skrypty `start:*` w `backend/package.json`.
- **Dokumenty:** docs/mikroserwisy.md 7.1 (porty per zestaw wołających, NetworkPolicy z manifestu, ruch wychodzący cronów tylko do bazy i brokera, `sms`/`email` bez bazy, ZITADEL tylko z `auth`), 7.2 (wywołania `/internal`), 1.4 i 5.8 (kolejki); docs/development-szczegoly.md 3.1.13 (co development dostarcza Dawidowi), 3.1.5 (manifest kolejek z katalogu zdarzeń), 3.1.4 (lista ról i skrypt grantów), 4.2 „`/internal`”.
- **Makiety:** brak.
- **Decyzje:** DEC-01 (broker: rekomendacja RabbitMQ za `lib/messaging`; manifest kolejek w formie niezależnej od brokera plus wariant dla wybranego).
- **Dane demo:** brak.

## Zakres
- [ ] Skrypt `backend/scripts/manifests.ts` (`npm run manifests`, `npm run manifests:check` w `npm run check`, jak `openapi:check`) zapisujący do `backend/manifests/`:
  - `network.json`: dla każdego serwisu porty (zewnętrzny, wewnętrzne po nazwie, `metrics`), dozwoleni wołający per port (z `callers`), ruch wychodzący (serwisy: baza, broker, `files`/`auth` według wywołań; crony: tylko baza i broker; `sms`/`email`: tylko broker i dostawca; `auth`: ZITADEL);
  - role bazy i granty: nie generujemy drugi raz, tylko wskazujemy `backend/db/grants.sql` z BE-003 (`npm run db:grants`, role `eq_<serwis>` i `eq_cron_<nazwa>`; `sms` i `email` bez roli) i dopisujemy `db-roles.json` z listą ról, ich właścicielem i wołającym procesem;
  - kolejki i tematy: źródłem jest `backend/messaging/manifest.json` z BE-008 (`npm run messaging:manifest`); tu tylko `messaging-access.json` z uprawnieniami publikacji i odbioru per proces (kto publikuje które zdarzenie, kto czyta `sms.codes`, `email.codes`, `sms.notifications`, `email.notifications`);
  - `env.json`: zmienne każdego serwisu i crona (nazwa, wymagana, sekret, opis) z schematów zod;
  - `workloads.json`: serwisy (polecenie `npm run start:<serwis>`, porty, sondy, minimalna liczba replik: 2, `auth` 3) i crony z rejestru `backend/src/jobs/index.ts` (BE-009: polecenie `npm run start:cron:<nazwa>`, harmonogram, `timeZone`, `concurrencyPolicy: Forbid`).
- [ ] Meta-testy: ruch przychodzący na każdy port `/internal` = `callers` jego tras; żaden cron nie ma ruchu do portów serwisów; `sms` i `email` nie mają zmiennych bazy; każdy serwis z trasami zewnętrznymi ma dostęp do portu `jwks` `auth`; każda kolejka ma konsumenta i producenta z katalogu.
- [ ] `backend/README.md`: sekcja „Manifesty dla platformy” (co jest w każdym pliku, jak je odświeżyć, że wdrożenie i NetworkPolicy robi Dawid).

## Poza zakresem
- pisanie manifestów Kubernetes i Helm, zakładanie ról w bazie, kolejek i sekretów, CI na klastrze (infrastruktura: Dawid); test NetworkPolicy na klastrze.

## Kryteria akceptacji
- [ ] `npm run manifests:check` zatrzymuje `npm run check`, gdy kod zmienił porty, wołających, granty, zdarzenia, env albo crony, a manifest nie.
- [ ] `network.json` dla `auth` ma osobne porty `recipients` (tylko `notifications`), `horses` (tylko `stables`) i `jwks` (wszystkie serwisy z API).
- [ ] `backend/db/grants.sql` (BE-003) uruchomiony na pustej bazie po migracjach przechodzi meta-test grantów, a `db-roles.json` ma tę samą listę ról.
- [ ] Manifest nie zawiera żadnych wartości sekretów, tylko ich nazwy.

## Testy
- Jednostkowe: generatory na fixture’ach kontraktów i katalogu zdarzeń.
- Integracyjne: zgodność `db-roles.json` z `backend/db/grants.sql` i `network.json` z kontraktami.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; pliki `backend/manifests/*` w repo i aktualne.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-009, bo manifest obejmuje crony i ich harmonogramy.
- Manifest generujemy z tego, co jest w kodzie; serwisy dodane później dopisują się same przy `npm run manifests`.
- Format neutralny (JSON); konwersję na zasoby klastra robi Dawid.
