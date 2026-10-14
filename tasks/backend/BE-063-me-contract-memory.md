---
id: BE-063
title: "auth: kontrakt GET /me v1 i dane demo w pamięci"
area: backend
stage: 0
size: M
status: todo
depends_on: []
decisions: [DEC-15, DEC-23]
owner:
branch:
trello:
---
# BE-063 · auth: kontrakt GET /me v1 i dane demo w pamięci

## Cel
Apka mobilna, panel i tablet mogą od razu budować sesję i nawigację według ról, bez czekania na bazę: `GET /auth/v1/me` ma docelowy kształt (stajnie z rolą i funkcjami, firmy, widok startowy), a lokalny `auth` z FAKE IdP i magazynem w pamięci (`AUTH_STORE=memory`, dziś jedyny) zwraca go dla wszystkich kont demo z prawdziwymi claimami `biz`, `m`, `f`, `h`. BE-019 przenosi potem to samo na bazę (BE-013).

## Kontekst
- **Stan kodu:** `GET /auth/v1/me` w `backend/src/contracts/auth.ts` (`MeResponse`: `id`, `displayName`, `locale`, `contact` z maskami, `businesses: uuid[]`, `startView` tylko `welcome`) i `backend/src/services/auth/routes/me.ts`; konta demo `backend/src/services/auth/identity/demo-users.ts` (Damian, Ola, Anna, Marta; `username` = stały UUID); `access/access-repository.ts` (`AccessGrants`), `access/memory-access.ts` (zawsze brak dostępu, testy nadają przez `set`); claimy `tokens/claims.ts` (`computeAccessClaims`, `isClientAllowed`). Konsumenci kształtu `MeResponse` dziś: `frontend/web/src/test/fake-api.ts`, `frontend/e2e/helpers/mock-auth.ts`, `frontend/src/api/auth.d.ts` (z `npm run gen:api`).
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Profil” (`GET /me`: stajnie z nazwą, rolą, funkcjami i statusem, firmy admina, `plt`, widok startowy, świeżo dopasowane zaproszenia), 3.2 (reguły `m`, `f`, `h`; konto techniczne dokładnie jedno `m`), 3.3 (wzorce claimów i funkcje według seedu dla każdej osoby: tabela i członkostwa Anny), 9.1, 9.2, 9.4 (widoki startowe Oli, nowej osoby, TV).
- **Decyzje:** DEC-15 A (panel tylko dla admina i wyświetlacza; inni na `web` dostają `welcome`, czyli PanelWitaj z linkiem do apki). DEC-23 A (klient bez ważnego konia nie ma stajni w `m`).
- **Dane demo:** Stajnie Lipowe sp. z o.o. (admin Damian) ze stajniami Pod Lipami i Brzozowa; Ola (obsługa w obu), Anna (klientka: Kasztan i Bella w Pod Lipami, Kometa w Brzozowej), Marta (instruktorka w obu), „Telewizor korytarz” (`display`, Pod Lipami, tv.korytarz@stajnielipowe.pl, kod e-mailem), „Tablety Pod Lipami” (boksy@stajnielipowe.pl), „Tablety Brzozowa” (boksy.brzozowa@stajnielipowe.pl, propozycja z docs/development-szczegoly.md 3.2). Funkcje ról według mikroserwisy.md 3.3.

## Zakres
- [ ] `backend/src/lib/demo/ids.ts`: stałe UUID danych demo używane w kodzie uruchomieniowym dev i w testach: osoby (istniejące UUID z `demo-users.ts` bez zmian, nowe dla kont technicznych), firma Stajnie Lipowe, stajnie Pod Lipami i Brzozowa, konie Anny (Kasztan, Bella, Kometa). Plik rozszerzają BE-064 (hale, boksy, pozostałe konie), BE-010 (`lib/testing/demo.ts` z wzorcami claimów, importuje stąd) i BE-011 (seed). Moduł bez zależności, tylko stałe.
- [ ] `demo-users.ts`: konta „Telewizor korytarz”, „Tablety Pod Lipami”, „Tablety Brzozowa” (e-mail, kod e-mailem, `displayName` jak w seedzie docs/development-szczegoly.md 3.2); UUID z `lib/demo/ids.ts`.
- [ ] `access/demo-access.ts`: dostęp kont demo zgodny z mikroserwisy.md 3.3 (`biz` Damiana; `m` Oli, Anny z `h`, Marty, TV i obu tabletów z `f` według seedu). `main.ts`: przy `IDP=fake` `MemoryAccessRepository` startuje z tymi danymi (testy dalej nadają własne przez `set`). Konto techniczne = dokładnie jedno `m` z rolą `display` albo `tablet`.
- [ ] Interfejs `StableDirectory` (`backend/src/services/auth/directory/`): `stables(ids)` → `{ id, name, businessId, status: 'active' | 'suspended' }[]`, `businesses(ids)` → `{ id, name }[]`; implementacja w pamięci z danymi demo. Implementację na bazie dodaje BE-019.
- [ ] Kontrakt `MeResponse` rozszerzony addytywnie (zostają `id`, `displayName`, `locale`, `contact`, `businesses: uuid[]`): `stables: [{ id, name, businessId, role: 'admin' | 'staff' | 'instructor' | 'client' | 'display' | 'tablet', features: Feature[] | null (admin: null = wszystko), status }]` (stajnie firm z `biz` z rolą `admin` + członkostwa z `m`), `businessAccounts: [{ id, name }]`, `platformRole: 'admin' | 'support' | null`, `accountKind: 'person' | 'technical'`, `startView`, `matchedInvitations: [{ stableId, stableName, role, horseName? }]` (tu zawsze pusta lista; wypełnia BE-022). `StartView` rozszerzony o `admin_today`, `staff_day`, `client_home`, `instructor`, `display`, `tablet` (opis „nieznana wartość = welcome” zostaje).
- [ ] `services/auth/me/start-view.ts`: czysta funkcja `startViewFor({ accountKind, stables, businesses, platformRole, clientId })`: konto tabletu → `tablet`; konto wyświetlacza → `display`; admin firmy albo `plt` → `admin_today`; potem rola w pierwszej stajni: `staff_day`, `client_home`, `instructor`; bez firmy i stajni → `welcome`. Na `web` osoba bez roli admina dostaje `welcome` (DEC-15 A). Test tabelaryczny.
- [ ] `routes/me.ts`: składa odpowiedź z claimów liczonych tak samo jak przy wydaniu tokenu (`AccessRepository`) i nazw ze `StableDirectory`.
- [ ] `npm run openapi`; we `frontend/` `npm run gen:api` i minimalne uzupełnienie `web/src/test/fake-api.ts` oraz `e2e/helpers/mock-auth.ts` o nowe pola (puste listy, `startView: 'welcome'`), żeby `npm run check` i E2E frontendu zostały zielone. Pełne fixture'y i routing robi WEB-001.

## Poza zakresem
- Implementacja na bazie, nagłówek `Equenor-Token-Refresh`, `PATCH /me`, `POST /me/sign-out-everywhere`, polityka trasy (BE-019); dopasowanie zaproszeń (BE-022).
- Konta demo spoza listy wyżej (Piotr, Paweł, klienci, Kuba, Olszynka: BE-011).
- Routing po `startView` w aplikacjach (WEB-001, MOB-002, MOB-005, TAB-009).

## Kryteria akceptacji
- [ ] Lokalny `auth` (`npm run dev:auth`, FAKE IdP): Damian na `web` dostaje `startView = admin_today`, `stables` z Pod Lipami i Brzozową z rolą `admin` i `features = null`, `businessAccounts` z „Stajnie Lipowe sp. z o.o.”; Ola na `mobile` `staff_day` z dwiema stajniami (w Brzozowej bez `tasks` i `rides`); Ola na `web` `welcome`; Anna na `mobile` `client_home`; Marta `instructor`; „Telewizor korytarz” na `web` `display`; „Tablety Pod Lipami” na `tablet` `tablet` z jedną stajnią; nowo zarejestrowana osoba `welcome`.
- [ ] Access token Anny ma `m` z `h` Kasztana i Belli w Pod Lipami i Komety w Brzozowej, zgodnie z mikroserwisy.md 3.3; token TV ma jedno `m` z rolą `display`.
- [ ] `businesses` zostaje listą UUID (zgodność wstecz); `cd frontend && npm run check && npm run e2e` zielone po `gen:api`.

## Testy
- `backend/src/services/auth/me/start-view.test.ts` (tabela przypadków), rozszerzenie `app.test.ts` (odpowiedź `GET /me` i claimy dla każdego konta demo). `cd backend && npm run check`.
- `cd frontend && npm run check && npm run e2e` po aktualizacji typów.

## Definicja gotowości
- `npm run check` i `npm run build` zielone w `backend/` i `frontend/`; `backend/openapi/auth.json` i `frontend/src/api/auth.d.ts` zaktualizowane; README „Konta demo” z nowymi kontami; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Powstało z uwagi do kolejki: aplikacje czekały na pełne BE-019 (BE-001 → BE-004 → BE-010 → BE-013), choć logowanie działa w pamięci. Kontrakt jest docelowy; BE-019 tylko podmienia źródło danych na bazę i dodaje resztę profilu.
- `businessAccounts` zamiast zmiany typu `businesses` (zmiany w `/v1` tylko addytywne, tasks/README.md punkt 3).
- Dane demo w pamięci to dane uruchomieniowe dev (jak `demo-users.ts`), nie testowe: nie umieszczaj ich w `lib/testing` (ten katalog jest poza buildem). W prod FAKE IdP i dane demo są zablokowane (`forbidInProd`).
- Token nie niesie nazw; aplikacje nie dekodują tokenu, role i stajnie biorą z `GET /me`.
