---
id: MOB-001
title: Szkielet apki mobilnej (Expo, katalog mobile/)
area: mobile
stage: 1
size: M
status: todo
depends_on: [SH-004]
decisions: [DEC-02, DEC-22]
owner:
branch:
trello:
---
# MOB-001 · Szkielet apki mobilnej (Expo, katalog mobile/)

## Cel
Powstaje pusty, ale kompletny pakiet apki mobilnej EQUENOR (klient, obsługa, admin, instruktor), na którym kolejne zadania MOB-xxx tylko dokładają ekrany. Od pierwszego dnia działa build deweloperski na Androidzie i iOS, testy, lint, typy API z kontraktów i kolory z palety.

## Kontekst
- Stan kodu: w repo są dwa niezależne pakiety npm (`backend/`, `frontend/`), każdy z własnym `package-lock.json`, `.nvmrc` (Node 22.22), `npm run check` (typecheck, ESLint, Prettier, testy) i dokładnymi wersjami zależności (bez `^`). Wzorce do skopiowania (nie importowania): `frontend/package.json` (skrypty `gen:api`, `check`), `frontend/src/api/client.ts` i `auth-api.ts` (openapi-fetch, `ApiResult`), `frontend/src/theme/tokens.ts` (tokeny LCD), `frontend/eslint.config.js`, `frontend/.prettierrc.json`. Katalogu `mobile/` jeszcze nie ma.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Szkielet” (Expo w development buildzie, Expo Router, TanStack Query z trwałym cache, api-client, i18n, `react-native-get-random-values` jako pierwszy import, bo id nadaje klient), 2.9 (EAS: profile `development`, `preview`, `production`; obowiązkowo development builds), 2.8 (Android: `targetSdk` API 36), `docs/paleta.md` „Ekrany LCD” (tokeny `bg`, `surface`, `accent`, `ok-*`, `warn-*`, `crit-*`; font Figtree; znak „EQUENOR” wersalikami), README „Kod” (pakiety bez importów między sobą).
- Decyzje: DEC-02 wariant A (katalog `mobile/` w tym repo jako osobny pakiet npm; typy przez `gen:api` z `backend/openapi/*.json`, tokeny przez `gen:theme` z tabel `docs/paleta.md`, z testem aktualności w CI; wspólny mechanizm robi SH-004). DEC-22 wariant A (bundle ID / `applicationId` `pl.equenor.app`), ale identyfikatory są nieodwracalne: do zatwierdzenia przez Dawida przed założeniem rekordów w sklepach i EAS; do tego czasu buildy deweloperskie z sufiksem `.dev`.
- Makiety: brak (szkielet). Rozmiar planszy apki 390×844 (docs/makiety-plan.md 2.1).
- Dane demo: nie dotyczy (sztuczne odpowiedzi).

## Zakres
- [ ] `mobile/package.json` (`name: equenor-mobile`, `private`, `engines.node >=22.22.0 <23`, dokładne wersje), `mobile/.nvmrc` (22.22), `package-lock.json`, `.npmrc` jak we `frontend/`. Najnowszy stabilny Expo SDK celujący w Android API 36 (sprawdzić w changelogu Expo); zależności natywne instalować `npx expo install`, potem przypiąć dokładnie.
- [ ] `mobile/app.config.ts`: nazwa „EQUENOR”, `scheme: equenor`, `ios.bundleIdentifier` i `android.package` z env `APP_VARIANT` (`development` → `pl.equenor.app.dev`, `production` → `pl.equenor.app`, DEC-22), `extra` bez sekretów; `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PANEL_URL`, `EXPO_PUBLIC_WWW_URL` (bez adresu i konfiguracji ZITADEL, W6). `mobile/eas.json` z profilami `development` (dev client), `preview`, `production`.
- [ ] Expo Router: `mobile/app/_layout.tsx` (providery: `QueryClientProvider` z `PersistQueryClientProvider` i persisterem AsyncStorage, i18n, fonty Figtree z `@expo-google-fonts/figtree` albo plików lokalnych), grupy tras `mobile/app/(auth)/` i `mobile/app/(app)/` z ekranem zastępczym „EQUENOR” (znak i hasło „Equestrian Management, Refined” pod spodem, paleta.md „Zasady”).
- [ ] `mobile/index.ts` (albo `entry`) z `import 'react-native-get-random-values'` jako pierwszą linią; `mobile/src/ids.ts` z `newId()` (UUIDv7, np. pakiet `uuid` w wersji z `v7`) i testem formatu.
- [ ] API: `npm run gen:api` (mechanizm z SH-004) generuje `mobile/src/api/<serwis>.d.ts` z każdego `../backend/openapi/*.json` (dziś `auth.json`); pliki commitowane. `mobile/src/api/client.ts`: `createServiceClient<paths>(baseUrl)` na `openapi-fetch`, typ `ApiResult<T>` i `settle()` jak we `frontend/src/api/auth-api.ts` (kod z problem+json, `network_error`, `unexpected_response`). Sesja i nagłówki dochodzą w MOB-002.
- [ ] Motyw: `npm run gen:theme` (SH-004) generuje `mobile/src/theme/tokens.ts` (tokeny LCD z paleta.md); `mobile/src/theme/index.ts` z odstępami, typografią (Figtree), cieniem karty z paleta.md; komponenty bazowe w `mobile/src/components/`: `Button` (główny w `accent`, drugorzędny z obrysem `line-input`), `Text`, `Card`, `Screen` (bezpieczne marginesy, tło `bg`), `Wordmark`.
- [ ] i18n: `mobile/src/i18n/{index.ts,pl.json,uk.json,en.json}` (np. `i18next` + `react-i18next` + `expo-localization`); język przed logowaniem z systemu (pl/uk/en, inaczej pl); kod `uk` jak w `LocaleSchema` backendu; test kompletności kluczy we wszystkich trzech plikach.
- [ ] Narzędzia: TypeScript strict, ESLint (flat config, `eslint-config-expo` albo typescript-eslint + react-hooks) z regułami: zakaz importów spoza `mobile/` (`no-restricted-imports` dla `../backend`, `../frontend`), zakaz literałów kolorów poza `src/theme/` (jak `frontend/src/test/no-color-literals.node.test.ts`); Prettier; Jest z presetem `jest-expo` i `@testing-library/react-native`.
- [ ] Skrypty: `start`, `android`, `ios` (dev client), `typecheck`, `lint`, `format`, `test`, `check` (= typecheck + lint + format + test), `gen:api`, `gen:theme`, `e2e:android` (Maestro).
- [ ] Maestro: `mobile/e2e/maestro/smoke.yaml` (start apki, widać „EQUENOR”); Detox tylko szkielet konfiguracji dla symulatora iOS (pełne E2E: MOB-024).
- [ ] `mobile/README.md`: wymagania (Node 22.22, Android Studio z emulatorem, Xcode na macOS), `npm ci`, `npx expo run:android` / `eas build --profile development --local`, adres API z emulatora (`10.0.2.2`) i z telefonu w LAN (adres komputera, auth słucha na `HOST=0.0.0.0`), komendy `check`, `gen:api`, `gen:theme`. Wiersz `mobile/` w tabeli „Kod” w README.md w korzeniu.

## Poza zakresem
- Sesja, tokeny i nagłówki (MOB-002); ekrany logowania (MOB-003, MOB-004); nawigacja ról (MOB-005).
- Kolejka zapisów (MOB-008); pełne E2E i Detox (MOB-024); rekordy w sklepach i EAS Submit (MOB-025).
- Generator typów i palety jako taki (SH-004); kroki CI (SH-003).

## Kryteria akceptacji
- [ ] `cd mobile && npm ci && npm run check` przechodzi na czystym klonie; `npx expo-doctor` bez błędów.
- [ ] Build deweloperski uruchamia się na emulatorze Androida (API 36) i na symulatorze iOS i pokazuje znak „EQUENOR” z hasłem pod spodem w kolorach z `tokens.ts`.
- [ ] `npm run gen:api` i `npm run gen:theme` nie zmieniają plików w repo zaraz po wygenerowaniu (wynik aktualny); zmiana koloru w paleta.md i ponowne `gen:theme` zmienia `tokens.ts`.
- [ ] Lint odrzuca import z `../backend/...` i literał `#8A5230` w ekranie.
- [ ] `newId()` zwraca UUIDv7 (test), a pierwszy import w punkcie wejścia to `react-native-get-random-values`.

## Testy
- Jest: `ids.test.ts`, test kompletności i18n, test braku literałów kolorów, prosty test renderu `Wordmark` (`cd mobile && npm test`).
- Maestro: `maestro test mobile/e2e/maestro/smoke.yaml` na emulatorze (`npm run e2e:android`).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; build dev na Androidzie działa; README w `mobile/` i wiersz w README.md zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm: bez pnpm, workspaces i Turborepo (docs/development*.md o `packages/*` są nieaktualne). `mobile/` nie importuje niczego z `backend/` ani `frontend/`; wspólne są tylko pliki generowane.
- Kolory wyłącznie z `src/theme/tokens.ts`; akcent tylko na elementach klikalnych (paleta.md).
- Expo Go nie wystarczy (moduły natywne, Universal Links): od początku development build.
- Nie zapisuj w repo żadnych kluczy EAS ani `google-services.json`; konta Apple, Google i Expo zakłada Dawid.
