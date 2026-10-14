---
id: TAB-009
title: Logowanie i sesja tabletu (konto techniczne, hasło i kod MFA)
area: tablet
stage: 4
size: L
status: todo
depends_on: [BE-018, BE-019, BE-023, SH-002, TAB-002, TAB-008]
decisions: [DEC-06, DEC-27]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/kjlwKpVA
---
# TAB-009 · Logowanie i sesja tabletu (konto techniczne, hasło i kod MFA)

## Cel
Tablet loguje się kontem technicznym tabletów stajni (np. „Tablety Pod Lipami”) e-mailem albo telefonem, hasłem i zawsze kodem MFA, a potem tygodniami odświeża sesję sam, także przy zrywanym Wi-Fi. Gdy admin zablokuje konto albo wyloguje wszystkie tablety, tablet w ciągu 5 minut przestaje pokazywać dane i przechodzi na właściwy ekran, pamiętając boks i język.

## Kontekst
- **Stan kodu:** trasy `auth` istnieją: `POST /auth/v1/login` (`{login, password, clientId}` → `{loginToken, channel, maskedContact, expiresIn}`; błędy `invalid_credentials`, `account_not_confirmed`, `account_locked`, `client_not_allowed`), `POST /auth/v1/login/mfa` (kod 6 cyfr, nagłówek `Authorization: Login <loginToken>`; `invalid_code`, `wrong_client`), `POST /auth/v1/token` (`{grantType: 'refresh_token', refreshToken}`; `session_revoked`, `wrong_client`), `GET /auth/v1/me` (`backend/src/contracts/auth.ts`, okna sesji `backend/src/services/auth/tokens/lifetimes.ts`: tablet 30 dni bezczynności, bez limitu całości). BE-019 dodaje `startView = tablet` i `stables[]` (jedna stajnia konta technicznego z nazwą), BE-018 trasy `POST /auth/v1/password/forgot` i `/password/reset` (kod 8 cyfr), BE-023 blokadę (`403 access_revoked`) i „Wyloguj wszystkie tablety” (`401 session_revoked`). Konta „Tablety Pod Lipami” i „Tablety Brzozowa” są w FAKE IdP (BE-063) i w seedzie (BE-011); stos dev z Mailpit i `npm run clock`: SH-002. Wzorzec obsługi sesji: `frontend/web/src/session/session.ts`, `sign-in-flow.ts`. Komponenty: TAB-008 (`Segmented`, `QwertyKeyboard`, `CodeInput`, `Button`); moduł kiosku TAB-002.
- **Dokumenty:** `docs/mikroserwisy.md` 3.1 (kroki logowania, kanał kodu, „Wyślij kod ponownie” wraca do ekranu hasła z wpisanym loginem; zgodność konta z aplikacją: konto `tablet` tylko aplikacją `tablet`, osoba nigdy → `403 wrong_client`), 3.4, 3.7 (refresh token tabletu w Android Keystore; zgubiona odpowiedź: ten sam refresh token działa dalej; tabela odpowiedzi: `token_expired` → ciche odświeżenie; `session_revoked` → logowanie, tablet zachowuje boks i język; `access_revoked` → ekran blokady bez danych, ponawia co 5 min; `Equenor-Token-Refresh: required` → natychmiastowe odświeżenie), 3.8, 5.2 „Kody” i „Limity żądań” (login także w nagłówku `X-Equenor-Login`), 9.3; `docs/development-szczegoly.md` 3.5.2 „Logowanie tabletu”, „Stany ekranu”, 4.3.1 T-23, 4.4 A-25; `docs/erd.md` pkt 2.
- **Makiety:** `docs/mockups/project/TabletLogowanie.dc.html` i `TabletLogowanieKod.dc.html` („ZALOGUJ TABLET”, „TELEFON | E-MAIL”, „ADRES E-MAIL”, „WPISZ KOD Z E-MAILA”, „Wysłaliśmy kod na b•••@stajnielipowe.pl”, 6 pól, klawiatura 3×4 z „WYCZYŚĆ”, „ZALOGUJ”, „WYŚLIJ KOD PONOWNIE ZA 0:42” z ramką przerywaną, „ZMIEŃ E-MAIL”, zły kod: pole `t-warn`, ramka 4 px, „ZŁY KOD”); stany z `docs/makiety-plan.md` E: TabletWylogowany („TABLET WYLOGOWANY”, „BOKS: Hala główna · boks 7”, przyczyna „WYLOGOWANO” / „WYLOGOWANO ZE WSZYSTKICH URZĄDZEŃ” / „SESJA WYGASŁA”, „ZALOGUJ”), TabletBrakUprawnien („TO KONTO NIE OBSŁUGUJE TABLETU” + „ZALOGUJ INNYM KONTEM”; po blokadzie „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI”), stopka „BRAK POŁĄCZENIA”. Plansza TabletLogowanie ma jeszcze „WYŚLIJ KOD” bez hasła (stan sprzed decyzji, `docs/mockups/STAN.md` pkt 7): implementuj pole „HASŁO”, „ZALOGUJ” i „NIE PAMIĘTAM HASŁA”.
- **Decyzje:** DEC-06 A (okna z 3.4, bez DPoP na PoC).
- **Dane demo:** „Tablety Pod Lipami” (boksy@stajnielipowe.pl, kod e-mailem; w dev kod w Mailpit albo dev-inbox), „Tablety Brzozowa”; konto Oli (`+48 607 000 218`) do testu `wrong_client`.

## Zakres
- [ ] `tablet/src/auth/session.ts`: stan sesji (`signedOut(reason) | signingIn | active | revoked(blocked)`), access token tylko w pamięci, refresh token w `expo-secure-store` (na Androidzie szyfrowany kluczem z Android Keystore); odświeżanie: po `expiresIn − 60 s` z losowym jitterem 0–30 s, przy `401 token_expired`, przy nagłówku `Equenor-Token-Refresh: required`; jedno odświeżenie naraz (pozostałe żądania czekają); błąd sieci przy odświeżeniu = ponowienie z backoffem tym samym refresh tokenem (bez wylogowania); `session_revoked` → `signedOut('revoked')`; `access_revoked` → ekran TabletBrakUprawnien „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI”, czyszczenie danych tablicy z pamięci i cache, ponawianie odświeżenia co 5 min; po odblokowaniu przychodzi `session_revoked` → TabletWylogowany „WYLOGOWANO ZE WSZYSTKICH URZĄDZEŃ”.
- [ ] Klient API (`tablet/src/api/client.ts` z TAB-001) dokłada `Authorization: Bearer`, `X-Client-Version` (`versionCode`), a dla tras logowania `X-Equenor-Login`; `clientId: 'tablet'` w treści.
- [ ] Ekrany w `tablet/src/screens/login/`: `LoginScreen` (TELEFON | E-MAIL; telefon z prefiksem +48 i klawiaturą 3×4; e-mail i hasło z `QwertyKeyboard`; „ZALOGUJ”; „NIE PAMIĘTAM HASŁA”), `LoginCodeScreen` (6 pól, „WPISZ KOD Z E-MAILA” albo „Z SMS-A” według `channel`, adres z `maskedContact`; licznik „WYŚLIJ KOD PONOWNIE ZA m:ss” do `expiresIn`, potem przycisk wraca do `LoginScreen` z wpisanym loginem; „ZMIEŃ E-MAIL”/„ZMIEŃ NUMER”; zły kod: `StatusField` uwaga „ZŁY KOD”), `ResetPasswordScreen` (stan z „NIE PAMIĘTAM HASŁA”: login → `password/forgot` → kod 8 cyfr i nowe hasło → `password/reset` → powrót do logowania z komunikatem; odpowiedź nie zdradza istnienia konta), `SignedOutScreen` (TabletWylogowany z boksem z pamięci i przyczyną), `NoPermissionScreen` (TabletBrakUprawnien w obu wariantach). Komunikaty błędów: `invalid_credentials` „ZŁY LOGIN ALBO HASŁO”, `account_locked` „KONTO ZABLOKOWANE” z przyciskiem „NIE PAMIĘTAM HASŁA”, `account_not_confirmed` „KONTO NIEPOTWIERDZONE”, `rate_limited` „ZA DUŻO PRÓB, SPRÓBUJ ZA CHWILĘ”, brak sieci „BRAK POŁĄCZENIA”; teksty PL i UA w i18n.
- [ ] Po kroku MFA: `GET /me`; `startView ≠ tablet` albo `wrong_client` → `NoPermissionScreen` „TO KONTO NIE OBSŁUGUJE TABLETU”; inaczej zapis `stableId` i nazwy konta (do ukrytych ustawień), przejście do zapamiętanego boksu (TAB-010) albo do TabletPierwszyBoks.
- [ ] Wylogowanie z ukrytych ustawień (wywołuje TAB-016): usunięcie tokenów, `SignedOutScreen('WYLOGOWANO')`; boks i język zostają w pamięci lokalnej (erd.md pkt 2).
- [ ] Tablica nigdy nie pokazuje, kto jest zalogowany; nazwa konta tylko w ukrytych ustawieniach.

## Poza zakresem
- Wybór boksu i tablica (TAB-010, TAB-011); ukryte ustawienia (TAB-016); odpytywanie i stany sieci (TAB-012).
- DPoP i klucz urządzenia (po PoC, DEC-06); rejestracja konta technicznego (robi się w panelu, WEB-xxx).

## Kryteria akceptacji
- [ ] A-25 (na stosie dev z SH-002): „Tablety Pod Lipami” logują się e-mailem, hasłem i kodem z e-maila; po kodzie od razu przejście na stan `firstBox` (zaślepka z tytułem; ekran TabletPierwszyBoks powstaje w TAB-010), bez wyboru stajni; konto Oli dostaje „TO KONTO NIE OBSŁUGUJE TABLETU”.
- [ ] [ręcznie] T-23 (emulator): zerwanie sieci w trakcie `POST /token` (odpowiedź zgubiona) i ponowienie tym samym refresh tokenem daje nowe tokeny, bez wylogowania.
- [ ] Blokada konta w panelu: w ≤ 5 min ekran „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI” bez starych flag; po odblokowaniu TabletWylogowany „WYLOGOWANO ZE WSZYSTKICH URZĄDZEŃ”, po ponownym logowaniu ten sam boks i język.
- [ ] „Wyloguj wszystkie tablety”: w ≤ 5 min TabletWylogowany; wylogowanie Oli ze wszystkich urządzeń nie dotyka tabletu.
- [ ] Reset hasła z tabletu: kod 8 cyfr z e-maila konta, nowe hasło, potem zwykłe logowanie; po 5 złych kodach MFA „KONTO ZABLOKOWANE” prowadzi do resetu.
- [ ] Refresh token nie jest w `AsyncStorage` ani w logach (test).

## Testy
- Jest + RNTL z atrapą API: maszyna stanów sesji (wszystkie kody z tabeli 3.7), jitter i pojedyncze odświeżanie, ekrany logowania, kodu i resetu (teksty, licznik), brak tokenu w logach.
- [ręcznie] Integracyjnie na emulatorze ze stosem dev (SH-002): logowanie kontem z seedu, kod z Mailpit API; skrypt Maestro `tablet/e2e/maestro/login.yaml` (rozbudowa w TAB-019).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; flow Maestro logowania przechodzi na emulatorze [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nie loguj haseł, kodów ani tokenów (także w diagnostyce TAB-020).
- Aplikacja nie zna adresu ani bibliotek ZITADEL (W6): tylko trasy `/auth/v1/*`.
- Hasła nie trzymamy: „Wyślij kod ponownie” wymaga ponownego wpisania hasła.
- Zegar do licznika i wygasania z nagłówka `Date` serwera (offset), nie z zegara tabletu (T-16).
