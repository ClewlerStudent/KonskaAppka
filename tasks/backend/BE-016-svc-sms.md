---
id: BE-016
title: "Serwis sms"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-008]
decisions: [DEC-11, DEC-01]
owner:
branch:
trello:
---
# BE-016 · Serwis sms

## Cel
Niezależny serwis `sms` wysyła SMS-y z kolejek: najpierw kody od `auth`, potem powiadomienia od `notifications`, i raportuje wynik powiadomień zdarzeniem `sms.result`. Nie ma tabel, roli bazy ani API (W5).

## Kontekst
- Stan kodu: jeden obraz backendu, serwis wybiera skrypt `start:<serwis>` (`backend/package.json`, `backend/Dockerfile`); szablon serwisu HTTP w `backend/src/kit/service.ts` (tu potrzebne tylko sondy), env w `backend/src/kit/env.ts`, logger z redakcją w `kit/logger.ts`. Kolejki `sms.codes` i `sms.notifications`, zdarzenie `sms.result` i konsument z DLQ: `lib/messaging` (BE-008). SH-002 dodaje do compose `fake-sms` (widok wiadomości, `GET /messages?to=`).
- Dokumenty: `docs/mikroserwisy.md` 5.8 (kolejki FIFO, grupa = `notifications.id`, deduplikacja = `id` + `attempts`, błąd stały bez ponowień, ostatnia próba → `failed`, DLQ tylko dla tego, czego nie dało się oznaczyć, kody bez wyniku i bez treści w logach, at-least-once), 1.4, 7.1 pkt 5 (ruch wychodzący tylko do dostawcy, bez PostgreSQL); `docs/development-szczegoly.md` 3.3 „sms i email”, 3.2 `fake-sms`, 2.5 (SMS do Polski: nadawca, blokada krajów spoza PL).
- Decyzje: DEC-11 wariant B na PoC (polski dostawca SMS przez adapter; lokalnie `fake-sms`; Sender ID „EQUENOR”, numery spoza PL zablokowane; prawdziwy adapter w BE-059), DEC-01 (broker za `lib/messaging`).
- Dane demo: numery z README (np. Ola +48 607 000 218).

## Zakres
- [ ] `backend/src/services/sms/main.ts`, `env.ts`, `app.ts`; skrypty `dev:sms`, `start:sms`. Env: `APP_ENV`, `MESSAGING*`, `SMS_SENDER=console|fake-sms|provider`, `FAKE_SMS_URL`, `SMS_SENDER_ID` (domyślnie `EQUENOR`), `SMS_ALLOWED_COUNTRY_CODES` (domyślnie `48`); `console` i `fake-sms` zabronione w prod.
- [ ] Lokalnie: port według tabeli „Porty serwisów” w tasks/README.md (wiersz w README.md „Porty”); usługa `sms` w `docker-compose.yml` (obraz backendu, `command: ['npm', 'run', 'start:sms']`, env jak w `backend/.env.example`, profil `infra`), trasa `/sms/*` w `tools/local/Caddyfile` już jest (SH-002).
- [ ] Adapter `SmsSender` (`send({ to, body }) → { providerMessageId } | { error: 'permanent' | 'transient', reason }`): `console` (log bez treści kodów), `fake-sms` (POST do lokalnego `fake-sms`), szkielet `provider` (implementacja: BE-059).
- [ ] Pętla: odbiór z `sms.codes`, a gdy pusta, z `sms.notifications`; kody: wysyłka, przy błędzie stałym albo ostatniej próbie usunięcie z kolejki i metryka; powiadomienia: po wysyłce `sms.result` (`notificationId`, `status: sent | failed`, `providerMessageId`), błąd stały albo ostatnia próba → `failed` i potwierdzenie wiadomości, błąd przejściowy → ponowienie przez broker.
- [ ] Walidacja numeru: E.164, kraj z listy dozwolonych; inny kraj = błąd stały (`failed`, bez wysyłki).
- [ ] Bez bazy: ESLint zakazuje importu `lib/db` (i `pg`) w `src/services/sms/**`; test, że moduł startowy nie ładuje sterownika bazy.
- [ ] Sondy `/livez`, `/readyz` na porcie probe (bez innych tras); łagodne zatrzymanie przy SIGTERM (najpierw konsument, potem sondy).
- [ ] Logi: id wiadomości, kanał, wynik; nigdy treść kodu ani numer w całości (maska jak `maskPhone` z `services/auth/contact.ts`; kopia funkcji w `lib`, bo serwis nie importuje `auth`).

## Poza zakresem
- Prawdziwy dostawca, nadawca alfanumeryczny, limity wydatków (BE-059, Dawid); `email` (BE-017); router powiadomień (BE-036).

## Kryteria akceptacji
- [ ] Wiadomość z `sms.codes` trafia do `fake-sms` (`GET /messages?to=+48607000218` ją zwraca) i nie ma jej treści w logach `sms`.
- [ ] Ta sama wiadomość powiadomienia dostarczona dwa razy (ten sam `deduplicationId`) daje jedną wysyłkę i jedno `sms.result`.
- [ ] Przy kolejce powiadomień pełnej wiadomości i jednym kodzie kod wychodzi pierwszy.
- [ ] Numer +44… daje `sms.result` ze statusem `failed` bez wołania adaptera.

## Testy
- `backend/src/services/sms/sms.test.ts` na adapterze wiadomości w pamięci i `SmsSender` testowym: kolejność kodów, duplikat, błędy stały i przejściowy, ostatnia próba, brak treści kodu w logach. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README (porty i uruchomienie `sms`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Docs mówią „AWS SMS/SNS”: według DEC-11 to adapter wymienny, kod bez SDK chmury.
- Możliwy duplikat przy awarii między wysyłką a potwierdzeniem wiadomości to świadome ryzyko (at-least-once).
- Serwis nie importuje innych serwisów (reguła ESLint `service-boundaries`).
