---
id: MOB-003
title: Logowanie hasłem i krok MFA w apce
area: mobile
stage: 1
size: M
status: todo
depends_on: [MOB-002]
decisions: []
owner:
branch:
trello:
---
# MOB-003 · Logowanie hasłem i krok MFA w apce

## Cel
Każda osoba (klient, obsługa, admin, instruktor) loguje się w apce telefonem albo e-mailem i hasłem, a potem zawsze kodem z SMS-a albo e-maila. Kod z SMS-a podpowiada się sam, hasło uzupełnia menedżer haseł, a błędy są krótkie i prowadzą do wyjścia (np. „Nie pamiętam hasła”).

## Kontekst
- Stan kodu: trasy `POST /auth/v1/login` (`{ login, password, clientId }` → `{ loginToken, channel, maskedContact, expiresIn }`) i `POST /auth/v1/login/mfa` (nagłówek `Authorization: Login <loginToken>`, `{ code }` 6 cyfr → `TokenResponse` z `refreshToken`) działają w `backend/src/services/auth/routes/login.ts`; kody w dev trafiają do `backend/.local/inbox.jsonl` (`npm run dev:inbox` w `backend/`). Ten sam przepływ w panelu: `frontend/web/src/screens/LoginScreen.tsx`, `LoginCodeScreen.tsx`, `frontend/web/src/session/sign-in-flow.ts` (stan między ekranami bez hasła), `frontend/web/src/components/CodeInput.tsx`, komunikaty `frontend/web/src/errors.ts`. Sesja i `auth-open.ts`: MOB-002.
- Dokumenty: `docs/makiety-plan.md` 2.3 „Logowanie” (przełącznik „Telefon | E-mail”, pole kontaktu, „Hasło”, „Nie pamiętam hasła”; potem krok MFA „Kod wysłaliśmy na …”, 6 pól; „Wyślij kod ponownie” wraca do pierwszego ekranu z wpisanym kontaktem, bo apka nie trzyma hasła; bez dopisków), A „LogowanieNumer” (stany: „Wpisz 9 cyfr numeru”, „Obsługujemy tylko numery z Polski (+48)”, jeden komunikat dla złego hasła i nieznanego konta, konto niepotwierdzone → potwierdzenie, limit prób, brak sieci, „Wpisz poprawny adres e-mail”; „600…”, „+48 600…”, „0048…” to ten sam numer) i „LogowanieBlad” („Zły kod”; „Kod wygasł” → „Zaloguj się ponownie”; „Za dużo prób” → „Nie pamiętam hasła”). `docs/mikroserwisy.md` 3.1 (krok MFA, token logowania 5 min, `409 account_not_confirmed`, `403 account_locked`, `403 wrong_client`), 8 „Kody odmowy”. `docs/development-szczegoly.md` 3.5.1 „Logowanie” (`one-time-code`, SMS Retriever, menedżer haseł). `mockups/STAN.md` pkt 7 (zmiany w makietach logowania).
- Makiety: `mockups/project/LogowanieNumer.dc.html` (dziś bez hasła; docelowy układ według makiety-plan), `mockups/project/Logowanie.dc.html` (krok MFA; usunąć „Kod jest ważny 10 minut.”, link TOTP i „Masz zaproszenie?…”).
- Decyzje: brak nowych; rejestracja i reset w MOB-004.
- Dane demo: Anna (+48 600 000 412, kod SMS), Marta (marta@stajnielipowe.pl, kod e-mailem), Ola (+48 607 000 218).

## Zakres
- [ ] `mobile/app/(auth)/login.tsx` (LogowanieNumer): logo 60 px na `accent-soft`, „EQUENOR” 28 px i hasło pod spodem; H1 „Zaloguj się”; `SegmentedControl` „Telefon | E-mail”; telefon ze stałym prefiksem „+48” i 9 cyframi (normalizacja do E.164 w `mobile/src/format/phone.ts`), e-mail; „Hasło” z „pokaż”; link „Nie pamiętam hasła” (→ `reset-password`, MOB-004); „Zaloguj się”; mniejszym „Załóż konto” (→ `sign-up`, MOB-004) i „Załóż konto firmy” (otwiera `EXPO_PUBLIC_PANEL_URL` w przeglądarce); link „Polityka prywatności” (`EXPO_PUBLIC_WWW_URL`).
- [ ] Autouzupełnianie: kontakt `textContentType="username"`/`autoComplete="username"` (telefon jako `tel`), hasło `textContentType="password"`/`autoComplete="password"`.
- [ ] `mobile/src/session/sign-in-flow.ts`: wersja robocza (rodzaj kontaktu, numer, e-mail), wyzwanie MFA (`loginToken`, `channel`, `maskedContact`, czas wygaśnięcia), wskazówki dla ekranu logowania (np. `focusPassword` po „Wyślij kod ponownie”, komunikat „Konto potwierdzone. Zaloguj się.” z MOB-004); tylko w pamięci, bez hasła.
- [ ] `mobile/app/(auth)/login-code.tsx` (Logowanie, krok MFA): H1 „Wpisz kod”, „Kod wysłaliśmy na +48 600 *** 412”, „Zmień numer” (albo „Zmień e-mail”) → `login`; komponent `CodeInput` (6 pól, jedno ukryte pole z `textContentType="oneTimeCode"` na iOS i `autoComplete="sms-otp"` na Androidzie, wklejanie całego kodu, etykiety dostępności „Cyfra 1 z 6”); „Zaloguj się”; „Wyślij kod ponownie” → `login` z wpisanym kontaktem i fokusem na haśle.
- [ ] Błędy logowania: `401 invalid_credentials` → „Nieprawidłowy numer, e-mail lub hasło.” (jak w `frontend/web/src/errors.ts`); `409 account_not_confirmed` → `POST /auth/v1/sign-up/resend` i ekran potwierdzenia konta z MOB-004; `403 account_locked` → komunikat z linkiem „Nie pamiętam hasła”; `403 wrong_client` (konto techniczne tabletu albo TV) → BrakDostepu (MOB-005); `429 rate_limited` → „Za dużo prób. Spróbuj ponownie za chwilę.”; `network_error` → „Brak połączenia z serwerem. Spróbuj ponownie.”
- [ ] Błędy kroku MFA (LogowanieBlad): `401 invalid_code` → pola z ramką „uwaga” i „Zły kod”; `401 invalid_token` albo upływ `expiresIn` → „Kod wygasł” z „Zaloguj się ponownie”; `403 account_locked` (po 5 złych kodach) → „Za dużo prób” z „Nie pamiętam hasła”.
- [ ] Po sukcesie: `session.completeLogin(tokens)` (MOB-002), potem start według MOB-005 (do czasu MOB-005: ekran zastępczy z `displayName`).
- [ ] Teksty w `mobile/src/i18n/{pl,uk,en}.json`; komponenty `SegmentedControl` i `CodeInput` w `mobile/src/components/` (używa ich też MOB-004 i MOB-006).

## Poza zakresem
- Rejestracja, potwierdzenie konta i reset hasła (MOB-004); start roli i BrakDostepu (MOB-005).
- SMS Retriever API z hashem apki w treści SMS-a: wymaga zmiany treści kodu (BE-014) i decyzji; na PoC autofill systemu.

## Kryteria akceptacji
- [ ] Anna loguje się numerem „600 000 412”, „+48 600 000 412” i „0048600000412” (ten sam login E.164), hasłem i kodem z dev-inbox; Marta e-mailem i kodem z e-maila; obie widzą po zalogowaniu swój start (albo ekran zastępczy przed MOB-005).
- [ ] Złe hasło i nieistniejący numer dają ten sam komunikat; zły kod daje „Zły kod” bez utraty tokenu logowania; po 5 złych kodach widać „Za dużo prób” z przejściem do resetu.
- [ ] „Wyślij kod ponownie” wraca do ekranu hasła z wpisanym numerem; nowe logowanie wysyła nowy kod.
- [ ] Konto „Tablety Pod Lipami” w apce dostaje BrakDostepu (`wrong_client`), bez danych stajni.
- [ ] Na ekranach nie ma „Kod jest ważny 10 minut”, TOTP ani dopisków o zaproszeniach (makiety-plan 2.3, dec. 38).

## Testy
- Jest + React Native Testing Library: `login.test.tsx`, `login-code.test.tsx` na atrapie API (każdy kod błędu z listy), `phone.test.ts` (normalizacja numerów), `CodeInput.test.tsx` (wklejanie, kasowanie, dostępność).
- Maestro: `mobile/e2e/maestro/login-sms.yaml` i `login-email.yaml` na lokalnym `auth` z odczytem kodu z `backend/.local/inbox.jsonl` (skrypt pomocniczy jak `frontend/e2e/helpers/inbox.ts`).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi na emulatorze z lokalnym `auth`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Apka rozmawia tylko z `auth`; żadnych bibliotek ani adresów ZITADEL (W6).
- Hasło nie trafia do stanu nawigacji, pamięci podręcznej ani logów; po kroku hasła pole jest czyszczone.
- Teksty bez objaśnień (makiety-plan 2.3, dec. 38); komunikaty zgodne z panelem, żeby osoba widziała to samo w obu miejscach.
