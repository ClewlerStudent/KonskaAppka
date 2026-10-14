---
id: WEB-007
title: "Panel: profil konta"
area: web
stage: 1
size: M
status: todo
depends_on: [BE-020, WEB-004, BE-019]
decisions: []
owner:
branch:
trello:
---
# WEB-007 · Panel: profil konta

## Cel
Osoba zalogowana w panelu zmienia swoje imię i język, kanał kodu logowania (SMS albo e-mail), hasło i kontakt (zawsze po ponownym podaniu hasła i kodu MFA), wylogowuje się ze wszystkich urządzeń i może usunąć konto. Wymagane przez sklepy i RODO; dla admina panel jest głównym miejscem tych zmian.

## Kontekst
- **Stan kodu:** `AppLayout`/`AdminLayout`, PanelMenuKonta z pozycją „Profil i język” → `/account` (zaślepka WEB-004), `CodeInput` (6 i 8), `PasswordField`, `SegmentedControl`, `ConfirmDialog`, `useApi`; sesja z WEB-001 (`refreshNow`, wylogowanie); `MeResponse` z BE-019 (`contact.phoneMasked`, `contact.emailMasked`, `locale`).
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Profil” i „Zmiana kontaktu i hasła” (W6), 3.8 (zmiana hasła podbija `token_version`: inne urządzenia wylogowane, to urządzenie dostaje nowe tokeny). BE-019: `PATCH /auth/v1/me` (`displayName`, `locale`), `POST /me/sign-out-everywhere`. BE-020: `PUT /me/mfa-channel` (`{ password, channel }` → token logowania i kod obecnym kanałem; potwierdzenie `…/verify`), `POST /me/contact` (`{ newContact, password }`) → `POST /me/contact/verify` (`Authorization: Login …`, kod MFA) → `POST /me/contact/confirm` (kod z nowego kontaktu); `POST /me/password` (`{ currentPassword }`) → `POST /me/password/verify` (token, kod, `newPassword`; nowe tokeny, ciasteczko dla `web`); `DELETE /me` (`409 sole_business_admin`); kody `contact_taken`, `contact_not_verified`; konto techniczne 403.
- **Makiety:** apka: makiety-plan.md A „Profil”, „ProfilAdmin” (dialog „Wyloguj ze wszystkich urządzeń?”, usunięcie: „Twoje dane osobowe zostaną usunięte, a wpisy w historii stajni zostaną bez nazwiska.”, zablokowane „Usuń konto” z „Jesteś jedynym adminem konta firmy”), „ProfilZmianaNumeru” (nowy numer i hasło → dwa kody: z nowego numeru i MFA). Planszy panelu nie ma: układ jak karty w PanelUstawieniaStajni.dc.html (sekcje, etykiety, przyciski).
- **Decyzje:** brak.
- **Dane demo:** Damian (telefon i e-mail, jedyny admin firmy: usunięcie zablokowane), Marta (sam e-mail: bez wyboru kanału), nowa osoba po rejestracji.

## Zakres
- [ ] `web/src/features/account/AccountScreen.tsx` na `/account` (każda osoba zalogowana w panelu; konto techniczne → `homePath`), H1 „Profil”, sekcje:
  - „Ty”: imię (edycja w miejscu) i „Język aplikacji” Polski | Українська | English → `PATCH /me`;
  - „Kontakt”: telefon i e-mail zamaskowane, „Zmień numer” / „Zmień e-mail” / „Dodaj e-mail”;
  - „Hasło”: „Zmień hasło”;
  - „Kod logowania: SMS | E-mail” tylko przy obu potwierdzonych kontaktach;
  - „Sesja”: „Wyloguj”, „Wyloguj ze wszystkich urządzeń” (ta sama akcja co w PanelMenuKonta), „Usuń konto” (tekst destrukcyjny).
- [ ] Zmiana kontaktu w `SidePanel`, trzy kroki w stanie komponentu: (1) nowy kontakt i „Hasło” → `POST /me/contact`; (2) „Kod wysłaliśmy na …” (kod MFA, 6 cyfr) → `…/verify`; (3) kod z nowego kontaktu (8 cyfr) → `…/confirm`; potem `GET /me`. Błędy: `invalid_credentials`, `invalid_code`, `contact_taken` („Ten numer należy do innego konta.”), `rate_limited`.
- [ ] Zmiana hasła: „Obecne hasło” → `POST /me/password`; kod MFA i „Nowe hasło” → `…/verify`; po sukcesie nowe tokeny w sesji (bez wylogowania tego urządzenia), toast „Hasło zmienione”.
- [ ] Kanał kodu: wybór → hasło → kod obecnym kanałem → `PUT /me/mfa-channel` i weryfikacja.
- [ ] Usunięcie konta: dialog ze skutkiem („Twoje dane osobowe zostaną usunięte, a wpisy w historii stajni zostaną bez nazwiska.”), `DELETE /me`; `409 sole_business_admin` → przycisk wyłączony z „Jesteś jedynym adminem konta firmy” (sprawdzane też z góry: admin firmy z jednym adminem — jeśli API tego nie zwraca, pokaż po 409); po sukcesie wylogowanie i ekran logowania z komunikatem „Konto usunięte.”.
- [ ] Link „Profil” także z PanelWitaj (osoba bez firmy i osoba spoza roli admina).

## Poza zakresem
- Profil w apce (MOB-006) i „Opuść stajnię” (apka, MOB-006); konto firmy (WEB-003); strona usuwania konta na www (WEB-008).

## Kryteria akceptacji
- [ ] Zmiana języka na „Українська” zapisuje się i przetrwa przeładowanie (zapis `locale` przez `PATCH /me` z BE-019; kody przy następnym logowaniu po ukraińsku dzięki BE-014 i BE-015, które są przodkami przez BE-020).
- [ ] Damian zmienia numer: nowy numer i hasło → kod MFA → kod z nowego numeru → profil pokazuje nowy numer zamaskowany; złe hasło kończy się na kroku 1 bez wysłania kodu.
- [ ] Zmiana hasła: to urządzenie zostaje zalogowane; inna przeglądarka po ≤ 5 min trafia na logowanie (`session_revoked`).
- [ ] Marta (sam e-mail) nie widzi wyboru kanału kodu.
- [ ] Damian nie usunie konta (jedyny admin); nowa osoba usuwa konto i ląduje na logowaniu.
- [ ] Hasła i kody nie trafiają do URL, Web Storage ani konsoli.

## Testy
- Vitest: każdy przepływ na fałszywym API (kroki, błędy, 409), stan „Wyloguj ze wszystkich urządzeń”.
- Playwright: atrapa (zmiana numeru, hasła, usunięcie) i `e2e/auth.spec.ts` z prawdziwym `auth` po BE-020 (kody z dev-inbox).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-020; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Token logowania (`Authorization: Login …`) i kody tylko w pamięci komponentu; po zamknięciu panelu bocznego czyścić stan.
- Teksty bez objaśnień; skutki tylko w dialogach potwierdzenia (docs/makiety-plan.md 2.3 i 5 pkt 38).
