---
id: WEB-001
title: "Panel: klient API i sesja według ról"
area: web
stage: 1
size: L
status: todo
depends_on: [BE-063, SH-004]
decisions: [DEC-07, DEC-15]
owner:
branch:
trello:
---
# WEB-001 · Panel: klient API i sesja według ról

## Cel
Panel umie rozmawiać z każdym serwisem (nie tylko z `auth`) jednym mechanizmem: access token z sesji, ciche odświeżenie, obsługa nagłówka `Equenor-Token-Refresh` i kodów odmowy. Po zalogowaniu każda rola trafia na swój ekran: admin konta na pulpit stajni, wyświetlacz na tablicę, pozostali na PanelWitaj z linkiem do apki.

## Kontekst
- **Stan kodu:** `frontend/src/api/client.ts` (openapi-fetch tylko dla `auth`), `frontend/src/api/auth-api.ts` (`settle`, `problemCode`, `ApiResult`), `frontend/web/src/session/session.ts` (access token w pamięci, `authorized`, jedno odświeżenie naraz), `frontend/web/src/session/home.ts` (`homePath` zawsze `/welcome`), `frontend/web/src/router.tsx` (TanStack Router, strażnicy `guestOnly`/`signedInOnly`), `frontend/web/src/services.tsx`, `frontend/web/src/screens/WelcomeScreen.tsx`, testy `web/src/test/fake-api.ts`, `web/src/test/render-app.tsx`, `e2e/helpers/mock-auth.ts`. Proxy dev tylko `/auth` w `vite.web.config.ts`. CORS w `backend/src/kit/service.ts` (`allowedHeaders`, `exposedHeaders`).
- **Dokumenty:** docs/mikroserwisy.md 3.7 (tabela „Co robi aplikacja”: `token_expired` → odświeżenie i powtórzenie, `session_revoked` → logowanie, `access_revoked` → ekran blokady i ponowienie co 5 min, `Equenor-Token-Refresh: required` → natychmiastowe odświeżenie), 3.4 (okna sesji panelu i TV), 8 (kody odmowy), 9.4 (TV: `GET /me` daje widok tablicy). docs/development-szczegoly.md 3.5.3. BE-063: `MeResponse` z `stables[]` (`id`, `name`, `businessId`, `role`, `features`, `status`), `businesses` (lista UUID, bez zmian), `businessAccounts[]` (`id`, `name`), `platformRole`, `accountKind`, `startView` (`welcome`, `admin_today`, `staff_day`, `client_home`, `instructor`, `display`, `tablet`), `matchedInvitations[]`; lokalny `auth` z FAKE IdP zwraca je dla kont demo w pamięci. Ten sam kontrakt na bazie: BE-019.
- **Makiety:** mockups/project/PanelWitaj.dc.html, MapaNawigacjiRol.dc.html; makiety-plan.md B „PanelWitaj” (stan dla innej roli: „Panel jest dla admina konta firmy” i linki do apki).
- **Decyzje:** DEC-07 A (panel `panel.<domena>`, API `api.<domena>`, ciasteczko `__Secure-eq_rt` bez BFF). DEC-15 A (panel tylko admin i wyświetlacz; inni PanelWitaj z linkiem do apki).
- **Dane demo:** Damian (admin, 2 stajnie), Ola (obsługa), Marta (instruktor), „Telewizor korytarz” (display), nowa osoba po rejestracji (welcome); stałe UUID w `backend/src/lib/demo/ids.ts` (BE-063). Konto „Tablety Pod Lipami” w panelu dostaje `403 wrong_client`.

## Zakres
- [ ] `frontend/src/api/http.ts`: wspólne `settle`/`problemCode` (przeniesione z `auth-api.ts`), `createServiceClient<Paths>(baseUrl)` na openapi-fetch dla każdego pliku typów z SH-004 (`src/api/<serwis>.d.ts`), middleware dokładające `Authorization: Bearer` z `session.authorized`, czytające `Equenor-Token-Refresh: required` (→ `session.refreshNow()` i ponowne `GET /me`) i zwracające `ETag` obok danych (potrzebne do `If-Match` i 304).
- [ ] Warstwa danych: `@tanstack/react-query` (dokładna wersja jak reszta zależności) z `QueryClient` w `Services`; hook `useApi(…)` dla zapytań i mutacji z mapowaniem błędów; klucze zapytań per stajnia (`['stable', stableId, …]`).
- [ ] `frontend/src/lib/ids.ts`: `newId()` (UUIDv7, `crypto.getRandomValues`) z testem kolejności i formatu; użyją go `Idempotency-Key`, id zapisów i kreator stajni.
- [ ] Sesja: `refreshNow()`, status `blocked` (refresh albo logowanie z `403 access_revoked`; ponowienie co 5 min; po odblokowaniu `401 session_revoked` → logowanie), znacznik „wylogowano zdalnie o HH:MM” przy `session_revoked` (dla WyswietlaczWylogowany w WEB-018), odświeżenie i `GET /me` przy `visibilitychange` po powrocie karty.
- [ ] `homePath(me)`: `admin_today` → `/stables/$stableId` (ostatnio używana z `localStorage` `eq.panel.lastStableId` w try/catch, inaczej pierwsza), a admin bez stajni → `/stables/new`; `display` → `/display`; `welcome` i każda inna albo nieznana wartość → `/welcome`. Trasy-zaślepki z tytułem: `/stables/new` (WEB-009), `/stables/$stableId` (WEB-010/WEB-020), `/display` (WEB-016), `/blocked` (wygląd docelowy w WEB-018).
- [ ] PanelWitaj, wariant dla osoby z członkostwem bez roli admina (Ola): „Panel jest dla admina konta firmy”, link „Pobierz aplikację” do `${wwwUrl}/app` (strona z WEB-008), „Wyloguj”; bez „Załóż konto firmy”. Osoba bez firmy i członkostw: obecny ekran.
- [ ] `wrong_client` w kroku MFA: komunikat na PanelLogowanieKod „Tym kontem nie zalogujesz się w panelu.” (propozycja) i powrót do logowania; dopisać do `web/src/errors.ts`.
- [ ] Proxy dev w `vite.web.config.ts` dla `/stables`, `/operations`, `/board`, `/schedule`, `/notifications`, `/billing`, `/files`, `/platform` (cel z env, np. `API_PROXY_TARGET` na reverse proxy z SH-002; bez niego porty dev serwisów z tabeli „Porty serwisów” w tasks/README.md).
- [ ] Backend (jedyna zmiana poza `frontend/`): CORS w `backend/src/kit/service.ts` — `allowedHeaders` + `if-match`, `if-none-match`, `idempotency-key`, `x-box-id`, `x-equenor-login`; `exposedHeaders` + `etag`, `date`, `equenor-token-refresh`; test w `service.test.ts`. Bez tego panel na innym hoście niż API (DEC-07) nie odczyta `ETag` ani `Date`.
- [ ] Fixture'y demo dla testów: `frontend/web/src/test/fixtures/demo.ts` (stałe UUID skopiowane z `backend/src/lib/demo/ids.ts`, bez importu; wspólne dla testów Vitest i Playwright, z nich korzystają fixture'y widoków w kolejnych zadaniach WEB), `MeResponse` Damiana, Oli, TV i nowej osoby; aktualizacja `fake-api.ts` i `e2e/helpers/mock-auth.ts` (pole `startView` i `stables`).

## Poza zakresem
- Układ panelu admina, nawigacja i przełącznik stajni (WEB-004); ekrany stajni (WEB-009…); widok TV (WEB-016); panel `[OPS]` (WEB-026).

## Kryteria akceptacji
- [ ] Damian po kroku MFA ląduje na `/stables/<id Pod Lipami>`; po wejściu w Brzozową i przeładowaniu wraca do Brzozowej; z `localStorage` rzucającym wyjątek wraca do pierwszej stajni bez błędu.
- [ ] Ola na `web` widzi „Panel jest dla admina konta firmy” i link do `/app`; TV (`startView = display`) ląduje na `/display`; nowa osoba na PanelWitaj z „Załóż konto firmy”.
- [ ] `401 token_expired` na dowolnym serwisie: jedno odświeżenie i powtórzenie; równoległe żądania dają jedno `POST /auth/v1/token`.
- [ ] Odpowiedź z `Equenor-Token-Refresh: required` wywołuje odświeżenie i nowe `GET /me` (nowa stajnia widoczna bez ponownego logowania).
- [ ] Odświeżenie z `401 session_revoked` → `/login`; z `403 access_revoked` → `/blocked`, kolejna próba po 5 min (sztuczny zegar).
- [ ] Nieznana wartość `startView` prowadzi na `/welcome`.

## Testy
- Vitest: `session.test.ts` (blocked, refreshNow, visibilitychange, fake timers), `home.test.ts` (tabela `startView` × stajnie), `http.test.ts` (middleware, ETag, nagłówek odświeżenia), `ids.test.ts`; testy ekranów przez `renderApp` (PanelWitaj obu wariantów, `wrong_client`).
- Playwright `e2e/panel.spec.ts` na atrapie: start Damiana, Oli i TV (1440 i 390 px); `e2e/auth.spec.ts` z prawdziwym `auth` (FAKE IdP, dane demo w pamięci z BE-063).
- `cd frontend && npm run check && npm run e2e`; `cd backend && npm run check` (zmiana CORS).

## Definicja gotowości
- `npm run check` i `npm run build` zielone we `frontend/` i `backend/`; E2E zielone; README (proxy dev, nowe env) zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Access token tylko w pamięci, nigdy w Web Storage; `localStorage` tylko na wygody (ostatnia stajnia), zawsze w try/catch.
- Aplikacja nie dekoduje tokenu: role i stajnie tylko z `GET /me`.
- `access_revoked` w panelu dotyczy tylko kont technicznych (osoby go nie dostają, 3.7 pkt 3), więc w praktyce to zablokowany wyświetlacz.
- Zwykły npm, dokładne wersje w `package.json`; bez importów z `backend/` (typy tylko z `src/api/*.d.ts`).
- Zmiana zakresu względem listy: „access_revoked i wrong_client → BrakDostepu” rozdzielone — `access_revoked` → ekran blokady (`/blocked`, docelowo WyswietlaczZablokowany), `wrong_client` → komunikat na logowaniu (BrakDostepu to plansza apki); dodana zmiana CORS w `backend/src/kit/service.ts`.
