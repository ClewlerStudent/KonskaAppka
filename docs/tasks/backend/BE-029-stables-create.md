---
id: BE-029
title: "stables: szkielet serwisu i zakładanie stajni"
area: backend
stage: 2
size: L
status: todo
depends_on: [BE-021, BE-028]
decisions: [DEC-20, DEC-27]
owner:
branch:
trello: https://trello.com/c/Rn8Z1NCN
---
# BE-029 · stables: szkielet serwisu i zakładanie stajni

## Cel
Admin konta firmy zakłada stajnię w dwóch krokach (stajnia z pierwszą halą i boksami, potem powiadomienia) jednym żądaniem. Stajnia od razu należy do jego firmy (bez NIP-u i bez przypisywania), dostaje ustawienia domyślne, a `operations` zakłada jej szablony flag i pory posiłków. Gdy to się nie uda, panel może dokończyć zakładanie.

## Kontekst
- Stan kodu: wzór serwisu `auth` i nowy `operations` (BE-028, trasa `POST /operations/v1/internal/stables/{id}/defaults` na porcie `defaults`). Tabele `stables`, `stable_settings`, `notification_rules`, `buildings`, `boxes` (BE-004); `businesses` (BE-021); polityka tras i `resolveStable` (BE-006); `unitOfWork`, publikacja `stable.created` (BE-005, BE-008); domyślne ustawienia i pory w `lib/rules/defaults.ts` (BE-007).
- Dokumenty: `docs/mikroserwisy.md` 5.3 (tabela tras; `POST /stables`: `businessId ∈ biz` albo `plt = admin`, inaczej 404; po COMMIT synchronicznie `operations /internal/stables/{id}/defaults` do 3 prób, potem `stable.created` z porami; `setupPending: ["operations"]`; `POST /stables/{id}/setup/retry` z porami albo bez), 9.2 pkt 6–7; `docs/erd.md` pkt 11, 16, 17 (ustawienia domyślne: wszystko włączone z potwierdzeniami; `notification_rules` dla każdej kombinacji z `enabled` z kroku 2); `docs/development-szczegoly.md` 3.3 stables (`POST /stables`, boksy z ustawieniami przy tworzeniu, brak poidła → `true`, testy).
- Makiety: `PanelZalozStajnie.dc.html` (Nazwa stajni *, Strefa czasowa: Europa/Warszawa, Europa/Kijów, Europa/Berlin; Hala: nazwa *, ulica *, kod *, miejscowość *; Boksy od–do, lista z poidłem Automatyczne/Ręczne, „Ustaw dla wszystkich”, „Bez boksów na razie”; Pory posiłków z dniami i nazwami w innych językach), `PanelZalozPowiadomienia.dc.html` (zdarzenia: Flaga niepotwierdzona po 15 min, Nowa flaga od klienta, Zaproszenie przyjęte, Zaproszenie wygasło, Nowa faktura, Nieudana płatność; odbiorcy Admin konta i Obsługa tej stajni; SMS i e-mail; płatności tylko admin), `PanelPulpitStart.dc.html`.
- Scenariusze: A-22 (Pod Lipami, Hala główna 1–8), A-23 (Brzozowa, ul. Brzozowa 5, 05-500 Piaseczno, boksy 1–6 z poidłem automatycznym; Damian od razu widzi obie stajnie).
- Decyzje: DEC-20 A (domyślne wartości nowej stajni; do słownika reguł dochodzą `health_due` i `payment_overdue`).

## Zakres
- [ ] Serwis `backend/src/services/stables/{main,app,env,deps}.ts`, skrypty `dev:stables`, `serve:stables`, `start:stables`; env jak `operations` plus `OPERATIONS_DEFAULTS_URL`; kontrakty `contracts/stables.ts` → `openapi/stables.json`; port dev (propozycja) 4020.
- [ ] Lokalnie: port według tabeli „Porty serwisów” w tasks/README.md (wiersz w README.md „Porty”); usługa `stables` w `docker-compose.yml` (obraz backendu, `command: ['npm', 'run', 'start:stables']`, env jak w `backend/.env.example`, profil `infra`), trasa `/stables/*` w `tools/local/Caddyfile` już jest (SH-002).
- [ ] `backend/src/lib/internal-client/`: klient HTTP tras `/internal` (limit czasu, do 3 prób z backoffem, tylko dla wywołań idempotentnych, TLS z CA z env w klastrze); użyją go też BE-032 i BE-036.
- [ ] `GET /stables/v1/stables?businessId=` (admin firmy albo `plt`): stajnie firmy z `status`.
- [ ] `POST /stables/v1/stables`: body `{ id (UUIDv7 od klienta, propozycja idempotencji), businessId, name, timezone, building: { name, addressLine1, addressLine2?, postalCode, city, countryCode }, boxes: [{ label, autoWaterer? }], mealSlots: [{ code?, label, localTime, daysMask, labels? }], notificationRules: [{ event, recipientRole, channel, enabled }] }`. Jedna transakcja: `stables` (`active`), `stable_settings` z `lib/rules`, hala, boksy (`auto_waterer` domyślnie `true`), `notification_rules` dla każdej obsługiwanej kombinacji (zdarzenia płatności tylko dla `admin`), audyt. Po COMMIT `defaults` w `operations` (3 próby), potem `stable.created` (`stableId`, `businessId`, `mealSlots`). Odpowiedź 201 `{ stable, setupPending: [] | ['operations'] }`; powtórka z tym samym `id` i treścią → 200 z tym samym wynikiem, z inną treścią → 409 `id_conflict`.
- [ ] `POST /stables/v1/stables/{stableId}/setup/retry` (`{ mealSlots? }`, admin) → ponowienie `defaults` → 200 `{ setupPending }`.
- [ ] `GET`, `PATCH /stables/v1/stables/{stableId}` (`{ name?, timezone? }`, admin, `If-Match`); `business_id` niezmienne.
- [ ] Słownik zdarzeń reguł (DEC-20): `flag_unacknowledged`, `flag_created_by_client`, `invitation_accepted`, `invitation_expired`, `invoice_issued`, `payment_failed`, `health_due`, `payment_overdue` (stała w `lib/rules`).
- [ ] Moduł seedu `stables-rules`: reguły obu stajni jak PanelPulpitStart („Flagi: SMS · zaproszenia i płatności: e-mail”).

## Poza zakresem
- Ustawienia, `features`, edycja reguł (BE-030); kolejne hale i boksy (BE-031); konie (BE-032); konto rozliczeniowe i subskrypcja po `stable.created` (BE-052); ekrany (WEB-009, WEB-010).

## Kryteria akceptacji
- [ ] A-23: Damian zakłada Brzozową; w bazie stajnia, ustawienia (wszystko włączone, z potwierdzeniami), hala, 6 boksów z poidłem automatycznym i reguły zapisały się razem; Damian bez odświeżenia tokenu ma do niej dostęp (przez `biz`).
- [ ] Przy wyłączonym `operations` odpowiedź ma `setupPending: ["operations"]`; `setup/retry` po jego starcie daje `[]`; szablony i pory są.
- [ ] `businessId` spoza `biz` → 404; obsługa → 403; Kuba (`ops`) → 201, wpis audytu z `actor_type = operator` i `session_id = sid`.
- [ ] Body z NIP-em albo polem spoza kontraktu → 400; stajnia, hala, boksy i reguły zapisują się razem albo wcale.

## Testy
- `backend/src/services/stables/create.test.ts` na harnessie (fałszywy `operations` przez `lib/internal-client` z serwerem testowym, adapter wiadomości w pamięci): sukces, awaria i ponowienie, idempotencja, uprawnienia, transakcyjność. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; README (uruchomienie `stables`, porty); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Stan „Dokończ zakładanie stajni” po zamknięciu karty pokaże `board …/setup-checklist` (BE-033) na podstawie braku szablonów w `operations`; `stables` nie zapisuje `setupPending`.
- `stables.business_id` i `boxes.stable_id` są niezmienne (lint z BE-003).
- Serwis nie importuje `operations`: rozmawia z nim tylko przez `/internal`.
