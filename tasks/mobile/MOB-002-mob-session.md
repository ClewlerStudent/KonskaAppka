---
id: MOB-002
title: Sesja apki i klient API (tokeny, ciche odświeżanie, GET /me)
area: mobile
stage: 1
size: M
status: todo
depends_on: [BE-063, MOB-001]
decisions: [DEC-06]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/YgAoaHqL
---
# MOB-002 · Sesja apki i klient API (tokeny, ciche odświeżanie, GET /me)

## Cel
Apka trzyma sesję EQUENOR bezpiecznie i niewidocznie dla osoby: refresh token w bezpiecznym magazynie telefonu, access token tylko w pamięci, odświeżanie bez kodu, a po każdym powrocie na pierwszy plan świeży profil z `GET /me`. Każdy kolejny ekran woła API przez jeden klient, który to wszystko obsługuje.

## Kontekst
- Stan kodu: `auth` (`backend/src/services/auth/routes/session.ts`, `routes/me.ts`) wydaje dla `clientId: 'mobile'` refresh token w treści odpowiedzi (`TokenResponse.refreshToken`, `backend/src/contracts/auth.ts`) i przyjmuje go w `POST /auth/v1/token` jako `{ grantType: 'refresh_token', refreshToken }` (bez ciasteczka i bez `X-Equenor-Client`; żądania bez `Origin` nie przechodzą kontroli CORS, `backend/src/kit/origin.ts`). Wzorzec sesji do skopiowania: `frontend/web/src/session/session.ts` (single-flight odświeżania, `REFRESH_MARGIN_MS`, `authorized(call)`), mapowanie błędów `frontend/web/src/errors.ts`. Szkielet i klient bazowy: MOB-001 (`mobile/src/api/client.ts`).
- Dokumenty: `docs/mikroserwisy.md` 3.7 (refresh token w `expo-secure-store`, access token w pamięci; tabela reakcji: `401 token_expired` → jedno ciche odświeżenie i powtórzenie; `401 session_revoked` przy odświeżeniu → ekran logowania; nagłówek `Equenor-Token-Refresh: required` → natychmiastowe odświeżenie; powrót apki na pierwszy plan → odświeżenie i `GET /me`; zgubiona odpowiedź → ponowienie tym samym refresh tokenem), 3.4 (apka: bezczynność 30 dni, maksimum 180 dni), 9.1 (przepływ Oli), 5.2 „Profil” (`GET /me`). `docs/development-szczegoly.md` 3.1.5 (nagłówek `X-Client-Version`, kod `client_upgrade_required`).
- Decyzje: DEC-06 wariant A (okna z 3.4, bez DPoP w apce).
- `GET /me` (kontrakt i dane demo w pamięci: BE-063; na bazie: BE-019): `stables[]` (`id`, `name`, `businessId`, `role`, `features` albo `null` dla admina, `status`), `businesses` (UUID), `businessAccounts[]`, `platformRole`, `accountKind`, `startView` (`welcome`, `admin_today`, `staff_day`, `client_home`, `instructor`, `display`, `tablet`), `matchedInvitations[]`, `locale`, `displayName`, `contact` (maski).
- Dane demo: Ola (+48 607 000 218), Anna (+48 600 000 412), Damian (+48 602 000 145), Marta (marta@stajnielipowe.pl), hasło `DEV_DEMO_PASSWORD` z `backend/.local/dev.env`; tokeny do pracy bez logowania: `npm run dev:token -- ola --client mobile` w `backend/` (BE-010).

## Zakres
- [ ] `mobile/src/session/token-store.ts`: zapis, odczyt i usunięcie refresh tokenu w `expo-secure-store` (`keychainAccessible: AFTER_FIRST_UNLOCK`, klucz zależny od wariantu apki); nic innego w tym magazynie; access token wyłącznie w pamięci modułu.
- [ ] `mobile/src/session/session.ts`: stan `loading | signedOut | signedIn`, `me`, `init()` (przy starcie: jest refresh token → `POST /auth/v1/token` → `GET /auth/v1/me`), `completeLogin(tokens)`, `authorized(call)` (odświeża, gdy do `exp` access tokenu zostało < 30 s, i raz ponawia po `401 token_expired`), single-flight odświeżania (jedno równoczesne `POST /token`), `logout()` (usuwa tokeny lokalnie, czyści cache zapytań i stan; bez wołania serwera, bo `POST /logout` czyści tylko ciasteczko panelu).
- [ ] Reakcje według 3.7: `401 session_revoked` albo `invalid_token` przy odświeżeniu → `signedOut` z powodem (ekran logowania z wpisanym ostatnim loginem); `403 access_revoked` i `403 wrong_client` → stan „brak dostępu” (ekran BrakDostepu w MOB-005); błąd sieci przy odświeżeniu → sesja zostaje, ponowienie z backoffem (ten sam refresh token działa do `exp`); nagłówek `Equenor-Token-Refresh: required` w dowolnej odpowiedzi → odświeżenie i `GET /me`.
- [ ] `AppState` → `active`: odświeżenie tokenu i `GET /me` (nie częściej niż raz na 30 s); zmiana `me` publikowana subskrybentom (`useSession()`).
- [ ] `mobile/src/api/api.ts`: `createApi({ baseUrl, session })` z klientami `openapi-fetch` dla każdego wygenerowanego serwisu (na start `auth`; kolejne pliki `*.d.ts` dochodzą same po `gen:api`), middleware: `Authorization: Bearer`, `X-Client-Version` (wersja z `expo-application`), obsługa nagłówka odświeżenia, mapowanie problem+json na `ApiResult` (kopia logiki z `frontend/src/api/auth-api.ts`), globalny stan `upgradeRequired` przy `client_upgrade_required` (ekran: MOB-026).
- [ ] Trasy otwarte `auth` (logowanie, rejestracja, reset) w `mobile/src/api/auth-open.ts`: zawsze `clientId: 'mobile'`, login dodatkowo w nagłówku `X-Equenor-Login` (docs/mikroserwisy.md 5.2 „Kody”, limity na brzegu).
- [ ] Hook `useMe()` i selektory (`stables`, `role(stableId)`, `features(stableId)`) dla MOB-005 i dalszych; nieznana wartość `startView` traktowana jak `welcome`.
- [ ] Cache TanStack Query: klucze zawsze z `userId` (z `me.id`) i `stableId`; przy wylogowaniu albo zmianie konta cache i persister czyszczone.

## Poza zakresem
- Ekrany logowania i MFA (MOB-003), rejestracja i reset (MOB-004), routing po `startView`, BrakDostepu i przełącznik stajni (MOB-005), ekran „Zaktualizuj aplikację” (MOB-026).
- Bramka minimalnej wersji po stronie backendu (BE-061; apka tylko wysyła `X-Client-Version` jako semver `nativeApplicationVersion` i obsługuje kod).

## Kryteria akceptacji
- [ ] Po zalogowaniu (na razie wywołaniem z testu albo tokenem z `dev:token`) restart apki nie wymaga logowania: `init()` odświeża token i pobiera `GET /me`.
- [ ] Wygaśnięcie access tokenu (5 min) w trakcie pracy: żądanie dostaje `401 token_expired`, apka odświeża po cichu i powtarza je raz; dwa równoległe żądania dają jedno `POST /token`.
- [ ] `POST /auth/v1/me/sign-out-everywhere` z innego urządzenia (albo podbicie `token_version`) → przy najbliższym odświeżeniu apka przechodzi do logowania i nie pokazuje starych danych.
- [ ] Odpowiedź z `Equenor-Token-Refresh: required` wywołuje odświeżenie i nowe `GET /me` (Ola przypisana do nowej stajni widzi ją bez ponownego logowania, docs/mikroserwisy.md 3.8).
- [ ] Refresh token nie występuje w AsyncStorage, logach ani raportach błędów (test na atrapie magazynu i loggera).

## Testy
- Jest z fałszywym `fetch` i zegarem: `session.test.ts` (start z tokenem i bez, single-flight, `token_expired`, `session_revoked`, `access_revoked`, nagłówek odświeżenia, powrót na pierwszy plan, wylogowanie czyści cache), `api.test.ts` (nagłówki `Authorization`, `X-Client-Version`, `X-Equenor-Login`, mapowanie błędów). `cd mobile && npm test`.
- [ręcznie] Ręcznie na emulatorze z lokalnym `auth` (`cd backend && npm run dev:auth`) i tokenem z `npm run dev:token`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; README `mobile/` opisuje pracę z `dev:token`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Apka nie dekoduje tokenu (docs/mikroserwisy.md 3.2): role, stajnie i funkcje bierze z `GET /me`, a `exp` z `expiresIn`.
- Nie loguj tokenów, haseł ani kodów (także w `console.log` w dev); pola `Authorization` maskuj w każdym loggerze i raporcie błędów.
- Nie dodawaj `Origin` ani `X-Equenor-Client` w apce: wtedy `auth` potraktuje żądanie jak przeglądarkę.
- Zgubiona odpowiedź przy odświeżeniu nie jest błędem sesji: stary refresh token działa do swojego `exp`, więc po prostu ponów.
