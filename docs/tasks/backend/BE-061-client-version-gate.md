---
id: BE-061
title: "kit: bramka minimalnej wersji klienta (X-Client-Version)"
area: backend
stage: 1
size: S
status: todo
depends_on: [BE-006]
decisions: []
owner:
branch:
trello: https://trello.com/c/Zfl0i9i5
---
# BE-061 · kit: bramka minimalnej wersji klienta (X-Client-Version)

## Cel
Gdy zmiana API wymaga nowej apki albo nowego APK tabletu, Dawid ustawia minimalną wersję w konfiguracji, a każdy serwis odpowiada starszym klientom `403 client_upgrade_required`. Apka pokazuje wtedy „Zaktualizuj aplikację” (MOB-026), tablet pasek „WYMAGANA AKTUALIZACJA” (TAB-012), a tablet dalej może pobrać nowy APK, bo trasy aktualizacji są spod bramki wyjęte.

## Kontekst
- **Stan kodu:** `backend/src/kit/service.ts` (`prepare()`: weryfikacja tokenu, Origin, limity, walidacja; po BE-006 także polityka trasy), `backend/src/kit/route.ts` (`defineRoute`, rodzaje `external | open | internal`), `backend/src/kit/env.ts` (env wspólne dla serwisów, zod), `backend/src/contracts/common.ts` (`ERRORS`, `ClientIdSchema`: `web | mobile | tablet`; `ops`, `opctl` dochodzą w BE-026). `client_id` aplikacji jest w tokenie (`backend/src/lib/auth/claims.ts`, `Principal`). Kodu `client_upgrade_required` jeszcze nie ma w `ERRORS`. Żadne inne zadanie BE nie robi tej bramki, a apka (MOB-002, MOB-026) i tablet (TAB-009, TAB-012) już wysyłają nagłówek i obsługują kod.
- **Dokumenty:** docs/development-szczegoly.md 3.1.5 (lista kodów błędów z `client_upgrade_required`; „Nagłówek `X-Client-Version`; aplikację serwis zna z `client_id` w tokenie … Bramka minimalnej wersji nie obejmuje tras wydań APK w `platform`, żeby stary tablet zawsze mógł się zaktualizować”). Historyczny projekt (docs/analiza.md ADR-04, nieaktualny w szczegółach, ale dobry jako wzór): env `CLIENT_MIN_VERSIONS` jako JSON, 403 z polem `minVersion`.
- **Format wersji:** apka mobilna wysyła `nativeApplicationVersion` z `expo-application` (semver `1.2.3`, MOB-002); tablet wysyła Android `versionCode` (liczba całkowita, TAB-009). Panel web, `ops` i `opctl` nie podlegają bramce (panel wdraża się razem z backendem).
- **Decyzje:** brak otwartych. Zgodne z przyjętą zasadą: tylko zmiany addytywne w `/v1`; bramka to wyjątek na zmiany, których nie da się zrobić addytywnie.
- **Dane demo:** nie dotyczy (testy na tokenach z `mintToken`, BE-010).

## Zakres
- [ ] `ERRORS.client_upgrade_required` (403, „Client upgrade required”) w `backend/src/contracts/common.ts`; `ProblemSchema` dostaje opcjonalne `minVersion: string` (addytywnie). `npm run openapi`.
- [ ] Env w `backend/src/kit/env.ts`: `CLIENT_MIN_VERSIONS` (JSON, domyślnie `{}`), schemat zod `{ mobile?: semver, tablet?: liczba całkowita jako string }`; błędny JSON albo format = serwis nie startuje.
- [ ] `backend/src/kit/client-version.ts`: `parseClientVersion(client, header)` i `isBelowMin(client, version, min)` (semver dla `mobile` bez zależności npm, porównanie liczb dla `tablet`); brak nagłówka przy ustawionym minimum dla tej aplikacji = poniżej minimum.
- [ ] Wywołanie w `prepare()` dla tras z tokenem, po weryfikacji tokenu, przed polityką trasy: aplikacja z `client_id`, nagłówek `X-Client-Version`; poniżej minimum → `403 client_upgrade_required` z `minVersion`.
- [ ] Wyjątki deklarowane w deskryptorze: `defineRoute({ …, clientVersionGate: false, clientVersionGateReason: '…' })`. Wyłączone od razu: odświeżenie tokenu i wylogowanie w `auth` (stary tablet musi mieć ważny token, żeby pobrać APK); `GET /platform/v1/tablet/latest` i pobranie APK (jeśli BE-040 jest już `done`, dopisz flagę przy jego trasach; w przeciwnym razie zrobi to BE-040). Trasy otwarte (bez tokenu) i `/internal` nie podlegają bramce.
- [ ] Meta-test w `backend/src/contracts/contracts.test.ts`: lista tras z `clientVersionGate: false` zgadza się z listą w teście (jak `open-routes.txt`), każda ma powód.
- [ ] `backend/README.md` (sekcja „Kod”): jak ustawić `CLIENT_MIN_VERSIONS` i które trasy są spod bramki wyjęte.

## Poza zakresem
- Ekrany po stronie klientów (MOB-026, TAB-012, TAB-017); wymuszenie aktualizacji tabletu przez `min_required_version_code` wydania (BE-040, TAB-017) to osobny mechanizm i zostaje.
- Przechowywanie minimalnych wersji w bazie albo zmiana bez restartu (na PoC wystarczy env i rolling restart).

## Kryteria akceptacji
- [ ] `CLIENT_MIN_VERSIONS={"mobile":"1.2.0"}`: token `mobile` z `X-Client-Version: 1.1.9` na dowolnej trasie z tokenem dostaje `403` z `code = client_upgrade_required` i `minVersion = "1.2.0"`; `1.2.0` i `1.10.0` przechodzą; brak nagłówka daje 403.
- [ ] `CLIENT_MIN_VERSIONS={"tablet":"120"}`: tablet z `X-Client-Version: 119` dostaje 403 na trasach `board`, ale `POST /auth/v1/token` (odświeżenie) przechodzi.
- [ ] Token `web` bez nagłówka przechodzi niezależnie od konfiguracji.
- [ ] Pusty `CLIENT_MIN_VERSIONS` (dev) nie zmienia zachowania żadnej trasy; błędny JSON zatrzymuje start serwisu z czytelnym błędem.

## Testy
- Vitest: `client-version.test.ts` (porównania semver i liczb, brak nagłówka, śmieci w nagłówku), `service.test.ts` (trasa testowa z tokenem `mobile`, `tablet`, `web`; wyjątek `clientVersionGate: false`), meta-test listy wyjątków. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone, `npm run openapi` bez różnic po commicie; `backend/README.md` opisuje `CLIENT_MIN_VERSIONS`; status w tym pliku i w `tasks/QUEUE.md` (`node tasks/queue.mjs set BE-061 review`).

## Uwagi dla wykonawcy
- Bramka nie może zablokować drogi aktualizacji: tablet poniżej minimum musi dalej odświeżać token i pytać o nowe APK. Dopisz test, który to sprawdza.
- Nie dodawaj zależności npm do semvera; wystarczy porównanie trzech liczb (bez pre-release).
- `X-Client-Version` jest niezaufany (klient może skłamać): bramka chroni zgodność kontraktu, nie bezpieczeństwo. Nie używaj wersji do autoryzacji.
- Zadanie dopisane przy domykaniu kolejki (luka zgłoszona w MOB-002, MOB-023, TAB-012; ekran apki jest teraz w MOB-026).
<!-- dep-ok: BE-026, MOB-002, MOB-026, TAB-009, TAB-012 (klienci bramki i nowe client_id; bramka działa bez nich) -->
