---
id: BE-010
title: "lib/testing, stałe danych demo i dev:token"
area: backend
stage: 0
size: S
status: todo
depends_on: [BE-001, BE-004]
decisions: []
owner:
branch:
trello:
---
# BE-010 · lib/testing, stałe danych demo i dev:token

## Cel
Wspólne narzędzia testów backendu: tokeny EQUENOR dla osób z danych demo i każdej aplikacji, fabryki danych, fałszywy zegar i harness serwisu. Do tego `npm run dev:token`, żeby apka mobilna, tablet i panel mogły pracować w LAN z backendem bez przechodzenia logowania.

## Kontekst
- Stan kodu: testy `auth` budują aplikację ręcznie (`backend/src/services/auth/app.test.ts`, funkcja `setup()`), klucz testowy jest w `backend/src/kit/test-keys.test-support.ts` (`createTestKey`, `accessClaims`), zegar testowy w `backend/src/kit/clock.ts` (`createFakeClock`, domyślnie wt 13.10.2026 07:15 czasu polskiego). Harness bazy: `backend/src/lib/db/testing.ts` (BE-001), tabele: BE-001 i BE-004. Klucz dev: `backend/.local/signing-key.pem` z `npm run dev:setup`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.12 `packages/testing` (`mintToken` dla osób z demo i każdej aplikacji, access i refresh JWT kluczem z pliku, bez sesji w bazie), 3.2 (`dev:token anna --client mobile`, seed ze stałymi UUID); `docs/mikroserwisy.md` 2 (dane demo) i 3.3 (wzorzec claimów dla każdej osoby, funkcje według seedu).
- Decyzje: brak.
- Dane demo: Damian, Ola, Piotr, Paweł, Marta, Anna, Marek Nowak, Karolina W., Tomasz L., Ewa K., „Telewizor korytarz”, „Tablety Pod Lipami”, „Tablety Brzozowa”, Kuba (+ drugi admin globalny), admin Stajni Olszynka; stajnie Pod Lipami, Brzozowa, Olszynka; hale, boksy i konie z 3.2.

## Zakres
- [ ] `backend/src/lib/testing/demo.ts`: stałe UUID (v7, czytelne prefiksy, np. `0199c6a0-0000-7000-8000-0000000000xx`) osób, firm, stajni, hal, boksów (oba „boks 4”!) i koni z seedu; zachowaj istniejące UUID kont z `backend/src/services/auth/identity/demo-users.ts`. Wzorzec claimów (`m`, `f`, `h`, `biz`, `plt`, `client_id`) każdej osoby według mikroserwisy.md 3.3.
- [ ] `mintToken(persona | claims, { client, now?, key? })` → `{ accessToken, refreshToken }` (ES256, `at+jwt` i `rt+jwt`, `iss` i `aud` z `lib/auth/constants.ts`), z kluczem testowym albo z pliku PEM.
- [ ] Fabryki w `lib/testing/factories.ts` (wstawiają wiersze przez Drizzle w transakcji testu): firma, użytkownik, stajnia z `stable_settings` z `lib/rules` (jeśli BE-007 już jest; inaczej stałe w fabryce), hala, boksy, koń, członkostwo, dostęp do konia.
- [ ] `createServiceHarness({ build, db?, clock?, key? })`: baza po migracjach (BE-001), weryfikator access tokenów na kluczu testowym (`lib/auth/verify.ts`, `keys: { jwks }`), `inject(method, url, { as: persona })` z nagłówkiem `Authorization`.
- [ ] `backend/scripts/dev-token.ts` i `npm run dev:token -- <osoba> --client mobile|web|tablet|ops [--box <boxId>]`: drukuje tokeny podpisane `backend/.local/signing-key.pem` (tym samym kluczem co lokalny `auth`), z `iss` z `.local/dev.env`. Na start claimy ze wzorca w `demo.ts`; BE-013 przełączy skrypt na prawdziwe wyliczanie z bazy.
- [ ] `tsconfig.build.json`: `src/lib/testing/**` poza buildem (nie trafia do obrazu); ESLint: kod produkcyjny nie importuje `lib/testing`.

## Poza zakresem
- Seed bazy (BE-011) i wyliczanie claimów w `auth` (BE-013); testy bezpieczeństwa (BE-027).

## Kryteria akceptacji
- [ ] Token z `mintToken('ola', { client: 'mobile' })` przechodzi `createAccessTokenVerifier` z kluczem testowym i ma dwa członkostwa `staff` z funkcjami jak w 3.3.
- [ ] `npm run dev:token -- anna --client mobile` drukuje access i refresh token, a lokalny `auth` (`npm run dev:auth`) przyjmuje ten refresh token na `POST /auth/v1/token`, gdy konto Anny jest w jego repozytorium.
- [ ] Harness pozwala w 5 liniach napisać test trasy jako Damian i jako admin Olszynki.
- [ ] Obraz Dockera nie zawiera `dist/lib/testing`.

## Testy
- `backend/src/lib/testing/testing.test.ts`: tokeny każdej persony (weryfikacja, rozmiar < 4 KB), fabryki na harnessie. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README (sekcja dev): `npm run dev:token`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana względem pierwotnej listy: zależność od BE-004 (fabryki tabel ze `stable_id`), a stałe UUID danych demo są tutaj, bo używa ich też seed (BE-011).
- Skrypt `dev:token` tylko poza prod: odmawia, gdy `APP_ENV=prod`. Nie loguje tokenów poza wydrukiem na stdout.
- Nie twórz własnej kryptografii: `jose` (już w zależnościach).
