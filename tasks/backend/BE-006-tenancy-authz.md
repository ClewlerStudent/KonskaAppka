---
id: BE-006
title: "lib/tenancy, lib/authz i polityka w deskryptorze trasy"
area: backend
stage: 0
size: L
status: todo
depends_on: [BE-004, BE-005]
decisions: [DEC-03]
owner:
branch:
trello: https://trello.com/c/UiRhX14w
---
# BE-006 · lib/tenancy, lib/authz i polityka w deskryptorze trasy

## Cel
Każda trasa zewnętrzna deklaruje w kontrakcie, kto może ją wołać (aplikacje, role w stajni, widoczna funkcja, rola platformowa, step-up, audyt), a `kit` egzekwuje to jednakowo w każdym serwisie. Dostęp do stajni liczy `resolveStable` z claimów i danych zasobu, bez wołania `auth` (W2). Obiekt bez dostępu daje 404, admin globalny wchodzi wszędzie (W1).

## Kontekst
- Stan kodu: `backend/src/kit/route.ts` (`defineRoute`: rodzaj `external | open | internal`, `open.rateLimit`, `internal.port/callers`), `backend/src/kit/service.ts` (`prepare()`: weryfikacja tokenu, Origin, limity, walidacja), `backend/src/lib/auth/claims.ts` (`Principal`, `Membership` z `s`, `r`, `f`, `h`), kody błędów w `backend/src/contracts/common.ts`. Tabele `stables`, `boxes` z BE-004; `unitOfWork` i audyt z BE-005.
- Dokumenty: `docs/mikroserwisy.md` 3.6 (`resolveStable`, `platform` przechodzi wszędzie, gdzie `admin`, także sprawdzenie aplikacji, poza trasami wyłącznie tabletowymi; `X-Box-Id`), 8 (macierz uprawnień i kody odmowy), 1.3 (trasy platformowe, log odczytów), 4.4 (log odczytów `plt`); `docs/development-szczegoly.md` 3.1.9 (polityki jako czyste funkcje, widoczność tylko zawęża) i 3.1.10 (`TenantScope`, `scoped`, `joinScoped`, `crossTenant`, 404 zamiast 403).
- Decyzje: DEC-03 wariant A (funkcje roli w claimie `m[].f`; serwisy nie czytają `stable_role_features`).
- Dane demo (testy na fabrykach): Damian admin konta (`biz`), Ola `staff` w dwóch stajniach z różnym `f`, Anna `client` z `h`, tablet z `X-Box-Id`, Kuba `plt = admin` z `client_id = ops`, admin innej firmy (Olszynka).

## Zakres
- [ ] Rozszerzyć `ExternalRouteInput` w `kit/route.ts`: `clients?: ClientId[]`, `stable?: { roles: ('admin' | StableRole)[]; feature?: Feature; write?: boolean }` (ścieżka z `{stableId}` wymagana, gdy jest `stable`), `platform?: PlatformRole[]` (trasy `/…/v1/platform/…`), `stepUp?: boolean`, `audit: { action: string; entity: string } | 'read'`, `ifMatch?: boolean`, `boxHeader?: 'required' | 'optional'` (tablet). `defineRoute` sprawdza spójność (np. `write` bez `audit`, `platform` bez prefiksu `/platform/`).
- [ ] `backend/src/lib/tenancy/`: `resolveStable(principal, stableId, tx)` → `{ as: 'none' | 'admin' | 'platform' | 'member', role?, features?, horses? }` (cache niezmiennego `stables.business_id`, `status` z bazy), `TenantScope`, `scoped(table)`, `joinScoped`, `crossTenant(reason)`; `resolveBox(scope, boxId)` (boks innej stajni: 404) i `assertSameBuilding` (`403 other_building`).
- [ ] `backend/src/lib/authz/`: czyste funkcje `canAccess(route, principal, access)`: kolejność: aplikacja (`client_not_allowed`), rola (`forbidden_role`), funkcja z `m[].f` (`feature_hidden`; admin i `plt` mają wszystko), `plt = support` na trasie tylko admina (`forbidden_platform`), step-up (`auth_time` starszy niż 5 min: `401 step_up_required`). `display` i każdy zapis: 403. `plt = admin` z `client_id = ops` przechodzi tam, gdzie `admin`, poza trasami tylko dla `tablet`.
- [ ] `kit/service.ts`: po weryfikacji tokenu wykonuje politykę; `ctx.scope` (TenantScope) i `ctx.box` w handlerze; 404 `not_found` dla stajni bez dostępu i dla obiektów spoza zakresu; nagłówek `X-Box-Id` (UUID boksu, nigdy numer) walidowany dla tabletu.
- [ ] `If-Match`: przy `ifMatch: true` brak nagłówka daje 428 `precondition_required`, `ctx.expectedVersion` z `"<version>"`; GET pojedynczego zasobu ustawia `ETag`. Kody do `ERRORS` w `contracts/common.ts`: `forbidden_role`, `feature_hidden`, `forbidden_platform`, `other_building`, `step_up_required`.
- [ ] Log odczytów: każde żądanie tokenem z `plt` trafia do osobnego strumienia pino (`stream: 'platform-access'`: serwis, `operationId`, `stableId`, id obiektu, `sid`).
- [ ] Meta-testy w `backend/src/contracts/contracts.test.ts`: każda trasa zewnętrzna ma politykę i deklarację audytu (zapis → `action`); każda trasa z `admin` w `roles` przechodzi dla principala Kuby z `ops` (z wyjątkiem tras tylko tabletu); OpenAPI pokazuje politykę (`x-equenor-policy`).

## Poza zakresem
- Wyliczanie claimów `m`, `f`, `h` (BE-013); pełna generowana macierz izolacji wszystkich serwisów (BE-057).
- Strażnik predykatu `stable_id` w SQL (BE-057).

## Kryteria akceptacji
- [ ] Testowa trasa `GET /test/v1/stables/{stableId}/x` z `roles: ['admin','staff']`: Damian 200 w obu stajniach firmy, Ola 200 tylko w swoich, Anna 403 `forbidden_role`, admin Olszynki 404, Kuba (`ops`) 200, `plt = support` 404.
- [ ] `feature: 'tasks'`: Ola w Pod Lipami 200, w Brzozowej 403 `feature_hidden`.
- [ ] `X-Box-Id` boksu innej stajni daje 404 i handler się nie wykonuje; akcja hali innego budynku 403 `other_building`.
- [ ] Zapis z `stepUp: true` i `auth_time` sprzed 6 min daje 401 `step_up_required`.
- [ ] `getMe` i trasy `auth` dalej działają (audit `'read'`, bez `stable`).

## Testy
- Jednostkowe `lib/authz` (tablica rola × aplikacja × funkcja), integracyjne `kit` na testowym serwisie (`service.external.inject`) i harnessie bazy, meta-testy kontraktów. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`; po zmianie kontraktów `npm run openapi`) i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Widoczność tylko zawęża: zaznaczona funkcja nie daje roli zapisu, którego rola nie ma (A-21: klient z „Zadaniami” dalej 403 na „Biorę”).
- `kit`, `lib` i `contracts` nie importują serwisów (ESLint). Tabel uprawnień `auth` żaden serwis nie czyta (granty BE-003).
- Klient: koń spoza `h` i koń `left` dają 404 od razu (dane zasobu `horses.status`); zostaw helper `assertHorseVisible(scope, horseId, tx)`.
