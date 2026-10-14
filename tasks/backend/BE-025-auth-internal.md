---
id: BE-025
title: "auth: trasy /internal (odbiorcy powiadomień, wyjazd konia)"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-021, BE-023]
decisions: [DEC-20]
owner:
branch:
trello:
---
# BE-025 · auth: trasy /internal (odbiorcy powiadomień, wyjazd konia)

## Cel
Dwie jedyne synchroniczne trasy wewnętrzne `auth`: `notifications` pyta, do kogo i na jaki adres wysłać powiadomienie (adresowanie, nie autoryzacja), a `stables` po wyjeździe konia każe zamknąć dostępy klientów. Każda trasa na własnym porcie, bez tokenów serwisowych.

## Kontekst
- Stan kodu: kit obsługuje trasy `kind: 'internal'` na nazwanych portach (`internal: { port, callers }` w `backend/src/kit/route.ts`; instancje Fastify na porty w `createService`, `internalPorts`); wzór: JWKS na porcie `jwks` (`contracts/auth.ts` `getJwks`, `services/auth/routes/jwks.ts`, `JWKS_PORT` w `services/auth/env.ts`). OpenAPI nie zawiera tras wewnętrznych (test w `contracts.test.ts`). Tabele: `business_admins` (BE-001, firmy z BE-021), `stable_members` (BE-023), `horse_access`, `stable_role_features`, `horses` (BE-004); funkcje roli z `lib/rules` i `pg-access.ts` (BE-013).
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Wewnętrzne” (`GET /internal/recipients?stableId=&businessId=&roles=&channel=&horseId=&feature=` dla `notifications`; `POST /internal/horses/{id}/left` dla `stables`, zamyka dostęp tylko przy `horses.status = left`), 7.1 (bez tokenów; osobny port na każdy zestaw wołających: `recipients`, `horses`, `jwks`; meta-test: ruch na port = `callers`), 7.2, 3.8 (koń wyjeżdża: od razu dla serwisów, token do 5 min), 5.8 (`feature` zawęża odbiorców; `owner_private` tylko admin; `businessId` = admini firmy); `docs/erd.md` pkt 17 (osoba bez adresu dla kanału pomijana).
- Decyzje: brak (DEC-20 dla `health_due` stosuje `notifications`, BE-036).
- Dane demo: Pod Lipami (Damian admin; obsługa Ola, Piotr; Kasztan z Anną), Brzozowa (Paweł, Ola), konto e-mail Marty.

## Zakres
- [ ] Kontrakt `getRecipients` (`kind: 'internal'`, `port: 'recipients'`, `callers: ['notifications']`): parametry `stableId?`, `businessId?`, `roles` (lista: `admin`, `staff`, `client`, `instructor`), `channel` (`sms | email`), `horseId?`, `feature?`; odpowiedź `[{ userId, displayName, locale, role, address }]`.
- [ ] Logika: `admin` = admini firmy, do której należy stajnia (albo `businessId`); `staff`/`instructor` = aktywni członkowie stajni z tą rolą; `client` z `horseId` = osoby z ważnym dostępem do konia; `feature` usuwa role, które nie widzą funkcji (macierz stajni albo domyślna; admin zawsze widzi); pomija konta usunięte, techniczne i bez adresu dla kanału (`phone_e164` dla `sms`, `email` dla `email`).
- [ ] Kontrakt `horseLeft` (`POST /auth/v1/internal/horses/{horseId}/left`, `port: 'horses'`, `callers: ['stables']`): czyta `horses.status`; przy `left` zamyka wszystkie otwarte `horse_access` konia (`revoked_at = teraz`, `version + 1`, audyt `actor_type = system`) i odpowiada 204; ponowienie niczego nie zmienia (204); koń nie `left` → 409 `horse_not_left`; brak konia → 404.
- [ ] Env `RECIPIENTS_PORT`, `HORSES_PORT` w `services/auth/env.ts` (różne od `PORT` i `JWKS_PORT`), `docker-compose.yml`: porty tylko w sieci compose (`expose`), README „Porty”.
- [ ] Meta-test: każdy port wewnętrzny serwisu ma jeden zestaw `callers`, a port zewnętrzny zwraca 404 na ścieżki `/internal/` (dopisać do testów kit albo kontraktów).

## Poza zakresem
- Wołający: klient HTTP w `stables` (BE-029/BE-032) i w `notifications` (BE-036); NetworkPolicy z `callers` (Dawid, manifest BE-060); `horse-left-reconciler` (BE-046).

## Kryteria akceptacji
- [ ] `recipients?stableId=<Pod Lipami>&roles=admin,staff&channel=sms&feature=flags` zwraca Damiana, Olę i Piotra z numerami; to samo z `feature=tasks` w Brzozowej zwraca tylko Damiana (obsługa Brzozowej nie widzi zadań).
- [ ] `channel=email` pomija osoby bez e-maila; `businessId=<Lipowe>&roles=admin` zwraca adminów firmy.
- [ ] `horses/{kasztan}/left` dla konia `active` daje 409; po zmianie statusu na `left` 204, dostęp Anny ma `revoked_at`; drugie wywołanie 204 bez zmian.
- [ ] Ścieżki `/auth/v1/internal/*` na porcie zewnętrznym dają 404; trasy nie ma w `openapi/auth.json`.

## Testy
- `backend/src/services/auth/internal.test.ts` (`service.internal.recipients.inject`, `service.internal.horses.inject`) na harnessie z seedem albo fabrykami. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; README (porty); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- To adresowanie, nie autoryzacja: odbiorców liczy `auth`, bo tylko on czyta tabele uprawnień i kontakty (W2).
- Bez tokenów serwisowych; granicą jest port i NetworkPolicy (ryzyko: mikroserwisy.md 10.1 pkt 6). Nie dodawaj innych tras `/internal` w `auth`.
- Wywołanie `horses/{id}/left` jest synchroniczne po COMMIT wyjazdu w `stables` (do 3 prób); zgubione skutki domyka cron (BE-046).
