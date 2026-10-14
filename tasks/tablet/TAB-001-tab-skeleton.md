---
id: TAB-001
title: Szkielet apki tabletu (Expo, katalog tablet/)
area: tablet
stage: 0
size: M
status: todo
depends_on: [SH-004]
decisions: [DEC-02, DEC-22]
owner:
branch:
trello:
---
# TAB-001 · Szkielet apki tabletu (Expo, katalog tablet/)

## Cel
Powstaje pakiet apki tabletu e-ink przy boksie (kiosk Android, konto techniczne „Tablety …”), na którym kolejne zadania TAB-xxx dokładają moduł kiosku i ekrany. Od pierwszego dnia buduje się APK, działa paleta `t-*` w obu profilach i tryb sztucznych odpowiedzi `board`, więc bramka sprzętowa (TAB-007) i ekrany mogą powstawać przed backendem.

## Kontekst
- **Stan kodu:** w repo są niezależne pakiety npm `backend/` i `frontend/` (każdy z `package-lock.json`, `.nvmrc` 22.22, `.npmrc`, `npm run check`, dokładne wersje zależności). Wzorce do skopiowania (nie importowania): `frontend/package.json` (skrypty), `frontend/src/api/client.ts` i `auth-api.ts` (openapi-fetch, `ApiResult`, `settle()`), `frontend/eslint.config.js`, `frontend/src/test/no-color-literals.node.test.ts`. Generatory `gen:api` i `gen:theme`: SH-004 (`tools/codegen/`). Katalogu `tablet/` jeszcze nie ma; `mobile/` powstaje równolegle (MOB-001) i ma podobny szkielet.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 (Expo w development buildzie, dystrybucja tylko jako APK przez `platform`; sprzęt: Boox Note Air6 C 10,3″, Android 16; zasady e-ink; język tablicy PL | UA lokalnie), 1.1 („Skala makiety”: plansza 702×936 = 1404×1872 / 2, GMS niepotrzebne), `docs/paleta.md` „Tablet e-ink” (tokeny `t-*`, profile Kaleido 3 i Gallery 3), `docs/makiety-plan.md` 2.1 (tablet: 702×936, tylko `t-*`, font Atkinson Hyperlegible).
- **Makiety:** `mockups/project/TabletBoks.dc.html` (stopka „ONLINE · aktualne na 07:15”, „PL | UA”), `TabletLogowanie.dc.html` (znak „EQUENOR” i hasło „Equestrian Management, Refined” ≥ 16 px).
- **Decyzje:** DEC-02 A (katalog `tablet/` w tym repo, osobny pakiet npm; typy i tokeny z generatorów SH-004). DEC-22 A (`applicationId` `pl.equenor.tablet`; nieodwracalne, do zatwierdzenia przez Dawida; do tego czasu buildy dev z sufiksem `.dev`).
- **Dane demo:** fixture'y z seedu z makiet: Stajnia Pod Lipami (Hala główna boksy 1–8, Hala nowa 1–6; Kasztan HG 7, Bella HN 4, Bursztyn HN 5 z poidłem ręcznym, wolne HG 3 i HN 6), Stajnia Brzozowa (boksy 1–6, Kometa 1, wolny 5); wt 13.10.2026 07:15.

## Zakres
- [ ] `tablet/package.json` (`name: equenor-tablet`, `private`, `engines.node >=22.22.0 <23`, dokładne wersje), `.nvmrc`, `.npmrc`, `package-lock.json`. Najnowszy stabilny Expo SDK z `targetSdk` 36; tylko Android (`platforms: ['android']`). Zależności natywne przez `npx expo install`, potem przypięte dokładnie.
- [ ] `tablet/app.config.ts`: nazwa „EQUENOR Tablet”, orientacja pionowa, `android.package` z `APP_VARIANT` (`development` → `pl.equenor.tablet.dev`, `production` → `pl.equenor.tablet`), `versionCode` z env `TABLET_VERSION_CODE` (rosnący, wymagany przy `production`), `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_MODE=real|fake`; bez sekretów. Podpis release z env (`TABLET_KEYSTORE_FILE`, `TABLET_KEYSTORE_PASSWORD`, `TABLET_KEY_ALIAS`, `TABLET_KEY_PASSWORD`); keystore poza repo.
- [ ] Punkt wejścia `tablet/index.ts` z `import 'react-native-get-random-values'` jako pierwszą linią; `src/ids.ts` z `newId()` (UUIDv7, pakiet `uuid`).
- [ ] Nawigacja bez Expo Router: `src/app/App.tsx` + `src/state/screen.ts` (maszyna stanów ekranów: `login`, `mfa`, `firstBox`, `board`, `changeBox`, `settings`, … ekrany dokładają kolejne zadania); na start ekran zastępczy ze znakiem „EQUENOR” i hasłem pod spodem (`t-ink` na `t-paper`).
- [ ] Motyw: `npm run gen:theme` (SH-004, `--target native`) → `src/theme/palette.gen.ts`; `src/theme/index.ts`: `useTabletPalette()` zwraca tokeny profilu; wybór profilu: ręczne nadpisanie z pamięci lokalnej, inaczej mapa `src/theme/device-profiles.ts` (`Build.MODEL`/`Build.MANUFACTURER` → `kaleido3 | gallery3`, domyślnie `kaleido3`; dane modelu z `expo-device`). Font Atkinson Hyperlegible (400, 700) w `assets/fonts/`, ładowany `expo-font`, bez sieci.
- [ ] i18n: `src/i18n/{index.ts,pl.json,uk.json}` (język tablicy PL albo UA, kod `uk` jak `LocaleSchema` w backendzie); język zapisany lokalnie (`src/storage/local.ts` na `AsyncStorage` z try/catch), domyślnie `pl`; test kompletności kluczy.
- [ ] API: `npm run gen:api` (SH-004) → `src/api/<serwis>.d.ts` z `../backend/openapi/*.json`; `src/api/client.ts` (`createServiceClient<paths>(baseUrl)`, `ApiResult`, `settle()` jak we `frontend/src/api/auth-api.ts`); tryb `fake`: `src/api/fake/` serwuje fixture'y JSON (`src/api/fake/fixtures/board-HG7-0715.json`, `board-HG7-0601-popup.json`, `board-HN4-bella.json`, `board-HN5-woda.json`, `board-HN6-wolny.json`, `board-brzozowa-1.json`, `board-HG7-bezakcji.json`, `boxes-podlipami.json`, `boxes-brzozowa.json`) z ETag i 304 oraz opóźnieniem sieci do ustawienia. Do czasu `backend/openapi/board.json` (BE-041) typy tablicy w `src/board/types.ts` (pola z BE-041: `building`, `box`, `horse`, `flags.banner`, `flags.later`, `feeding`, `config`, `recentActions`, `state`), oznaczone jako tymczasowe.
- [ ] Narzędzia: TypeScript strict z `noUncheckedIndexedAccess`; ESLint (flat config) z regułami: zakaz importów spoza `tablet/` (`../backend`, `../frontend`, `../mobile`), zakaz literałów kolorów poza `src/theme/` (plus test jak `no-color-literals` we frontendzie), zakaz `Animated`/`LayoutAnimation` (e-ink bez animacji); Prettier; Jest z `jest-expo` i `@testing-library/react-native`.
- [ ] Skrypty: `start` (dev client), `android`, `typecheck`, `lint`, `format`, `test`, `check`, `gen:api`, `gen:theme`, `gen:check`, `apk` (`expo prebuild --platform android --no-install` i `./gradlew assembleRelease` w `android/`; `android/` generowany, w `.gitignore`).
- [ ] Emulator do pracy: opis AVD 1404×1872, 320 dpi (= 702×936 dp jak makieta), obraz AOSP Android 16 bez Play (`system-images;android-36;default;x86_64`).
- [ ] `tablet/README.md`: wymagania (Node 22.22, Android Studio, JDK), `npm ci`, `npx expo run:android`, tryb `fake`, adres API z emulatora (`10.0.2.2:8000` przez proxy z SH-002) i z tabletu w LAN, `npm run apk`; wiersz `tablet/` w tabeli „Kod” w README.md.

## Poza zakresem
- Moduł kiosku w Kotlinie (TAB-002…TAB-004), `epdRefresh` (TAB-005), provisioning (TAB-006), prototyp do bramki (TAB-007).
- Komponenty e-ink i ekrany (TAB-008 i dalej); logowanie (TAB-009).
- Wydania APK w `platform` (BE-040) i CI (SH-003).

## Kryteria akceptacji
- [ ] `cd tablet && npm ci && npm run check` przechodzi na czystym klonie; `npm run gen:check` nic nie zmienia.
- [ ] `npm run apk` daje APK, który na emulatorze z AVD jak wyżej pokazuje znak „EQUENOR” z hasłem w Atkinson Hyperlegible, w kolorach z `palette.gen.ts`.
- [ ] Tryb `fake` zwraca fixture `board-HG7-0715.json` z `ETag`, a drugie zapytanie z `If-None-Match` daje 304.
- [ ] Lint odrzuca `import … from '../backend/…'`, literał `#9E2A1C` w ekranie i użycie `Animated`.
- [ ] Profil palety: model z mapy dostaje swój profil, nieznany model `kaleido3`, ręczne nadpisanie wygrywa.

## Testy
- Jest: `ids.test.ts`, kompletność i18n, brak literałów kolorów, wybór profilu palety, klient `fake` (ETag/304), render ekranu zastępczego. Komenda: `cd tablet && npm test`.

## Definicja gotowości
- `npm run check` w `tablet/` zielone, APK się buduje i startuje na emulatorze; `tablet/README.md` i README.md („Kod”) zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm: bez pnpm, workspaces i Turborepo (docs/development*.md o `apps/tablet` są nieaktualne). `tablet/` nie importuje niczego z innych pakietów; wspólne są tylko pliki generowane.
- Kolory wyłącznie z `t-*` (profil Kaleido 3 albo Gallery 3); na tablecie nie ma tokenów LCD.
- Bez GMS i bez sklepu Play: APK dystrybuuje `platform` (BE-040); nie dodawaj bibliotek wymagających Google Play Services.
- `android/` jest generowany przez prebuild; zmiany natywne tylko przez config plugin albo moduł Expo (TAB-002).
