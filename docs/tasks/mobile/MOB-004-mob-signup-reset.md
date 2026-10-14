---
id: MOB-004
title: Rejestracja z potwierdzeniem kodem i reset hasła w apce
area: mobile
stage: 1
size: M
status: todo
depends_on: [BE-018, MOB-003]
decisions: [DEC-27]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/stK7YtPy
---
# MOB-004 · Rejestracja z potwierdzeniem kodem i reset hasła w apce

## Cel
Zaproszona osoba (np. Marek Nowak z SMS-a) zakłada konto w apce telefonem albo e-mailem, potwierdza je kodem i loguje się; zaproszenie dopasuje się samo. Kto zapomniał hasła, ustawia nowe kodem, bez kontaktu ze stajnią.

## Kontekst
- Stan kodu: trasy otwarte `POST /auth/v1/sign-up` (`{ login, password, displayName, locale, clientId }` → `CodeSentResponse { channel, maskedContact }`), `POST /auth/v1/sign-up/confirm` (`{ login, code }` 8 cyfr, 204), `POST /auth/v1/sign-up/resend` działają (`backend/src/services/auth/routes/sign-up.ts`); `POST /auth/v1/password/forgot` (`{ login, clientId }` → 202 bez treści) i `POST /auth/v1/password/reset` (`{ login, code, newPassword }` → 204) dochodzą w BE-018. Panel ma gotowe odpowiedniki: `frontend/web/src/screens/SignUpScreen.tsx`, `SignUpCodeScreen.tsx`, `frontend/web/src/components/ResendButton.tsx` (odliczanie). Komponenty `SegmentedControl`, `CodeInput`, `sign-in-flow.ts`: MOB-003.
- Dokumenty: `docs/makiety-plan.md` A „Rejestracja” (H1 „Załóż konto”; „Telefon | E-mail”; „Hasło”; „Imię i nazwisko”; język „Polski | Українська | English”; polityka prywatności; „Załóż konto”; mniejszym „Mam już konto”; stany: ● RejestracjaKod — H1 „Potwierdź konto”, „Kod wysłaliśmy na …”, 8 pól, „Potwierdź”, „Wyślij kod ponownie za 0:42”, po potwierdzeniu logowanie z komunikatem „Konto potwierdzone. Zaloguj się.”; kontakt z kontem wygląda jak sukces; za krótkie hasło) i „ResetHasla” (H1 „Nowe hasło”, „Wyślij kod”, 8 pól, „Nowe hasło”, „Zapisz hasło” → logowanie z „Hasło zmienione. Zaloguj się.”). `docs/mikroserwisy.md` 3.1 (rejestracja nie zdradza istnienia konta; bez automatycznego logowania; kod resetu idzie tym samym kanałem co kod MFA), 5.2 „Kody” (kody weryfikacji i resetu 8 cyfr, 15 min). `mockups/STAN.md` pkt 7 (ZaproszeniePrzyjmij → Rejestracja).
- Makiety: `mockups/project/ZaproszeniePrzyjmij.dc.html` (z niej zostają „Imię i nazwisko” i „Język aplikacji”; karta zaproszenia i „Przyjmij zaproszenie” znikają), `Logowanie.dc.html` (układ ekranu kodu).
- Decyzje: brak (docs/makiety-plan.md 5 pkt 4 i 9 z makiety-plan rozstrzygnięte: imię i język przy rejestracji, bez „Przyjmij”).
- Dane demo: nowe konto na dowolny numer +48 z kodem z dev-inbox; scenariusz Marka Nowaka (zaproszenie do Luny, BE-022) do sprawdzenia razem z MOB-005.

## Zakres
- [ ] `mobile/app/(auth)/sign-up.tsx` (Rejestracja): pola jak wyżej, język domyślnie z systemu (`pl`, `uk`, `en`), walidacja po wpisaniu (bez reguł pod polem), `POST /auth/v1/sign-up` z `clientId: 'mobile'` i `X-Equenor-Login`; `422 weak_password` → „Hasło musi mieć co najmniej 10 znaków.”; `429` i brak sieci jak w MOB-003.
- [ ] `mobile/app/(auth)/sign-up-code.tsx` (RejestracjaKod): 8 pól (`CodeInput` z długością 8), „Potwierdź” → `POST /sign-up/confirm`; `401 invalid_code` → „Nieprawidłowy kod.”; „Wyślij kod ponownie za 0:42” z odliczaniem 60 s → `POST /sign-up/resend`; po 204 przejście do `login` z komunikatem „Konto potwierdzone. Zaloguj się.” i wpisanym kontaktem.
- [ ] Wejście z logowania przy `409 account_not_confirmed` (MOB-003): ten sam ekran kodu po `POST /sign-up/resend`.
- [ ] `mobile/app/(auth)/reset-password.tsx` (ResetHasla) jako jeden ekran z dwoma krokami: krok 1 „Telefon | E-mail”, kontakt, „Wyślij kod” → `POST /auth/v1/password/forgot` (zawsze ten sam wynik); krok 2: etykieta „Wpisz kod z SMS-a albo e-maila” (patrz Uwagi), 8 pól, „Nowe hasło” (z „pokaż”), „Zapisz hasło” → `POST /auth/v1/password/reset`; po 204 `login` z „Hasło zmienione. Zaloguj się.”; błędy `invalid_code`, `weak_password`, `rate_limited`.
- [ ] Wejścia do resetu: link „Nie pamiętam hasła” w `login` i komunikaty `account_locked` z MOB-003 (po resecie konto jest odblokowane, BE-018).
- [ ] Teksty PL/UA/EN w `mobile/src/i18n/`.

## Poza zakresem
- Dopasowanie zaproszenia i start roli po pierwszym logowaniu (backend BE-022, ekran MOB-005).
- Zmiana hasła i kontaktu zalogowanej osoby (MOB-006).
- Strona pobierania apki z linku w SMS-ie (WEB-008).

## Kryteria akceptacji
- [ ] Nowe konto telefonem: rejestracja → kod z dev-inbox → „Konto potwierdzone. Zaloguj się.” → logowanie hasłem i kodem MFA (MOB-003) działa; to samo e-mailem.
- [ ] Rejestracja na numer, który ma już potwierdzone konto (np. Ola), przechodzi do ekranu kodu jak sukces; na ten numer przychodzi tylko wiadomość „Masz już konto” (nie kod).
- [ ] Za krótkie hasło daje komunikat bez wysyłki; zły kod potwierdzenia daje „Nieprawidłowy kod.”, a „Wyślij kod ponownie” jest aktywne dopiero po odliczaniu.
- [ ] Reset hasła Anny: kod z dev-inbox, nowe hasło, logowanie nowym hasłem; stare hasło daje `invalid_credentials`; inne urządzenia Anny przy najbliższym odświeżeniu wracają do logowania (`token_version`).
- [ ] Reset na nieistniejący numer wygląda tak samo jak na istniejący.

## Testy
- Jest + RNTL: `sign-up.test.tsx`, `sign-up-code.test.tsx`, `reset-password.test.tsx` na atrapie API (wszystkie kody błędów, odliczanie na fałszywym zegarze).
- [ręcznie] Maestro: `mobile/e2e/maestro/sign-up-phone.yaml`, `sign-up-email.yaml`, `reset-password.yaml` na lokalnym `auth` z kodami z `backend/.local/inbox.jsonl`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzą lokalnie [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Odpowiedź `password/forgot` celowo nie mówi, na jaki kanał poszedł kod (konto z dwoma kontaktami dostaje go kanałem MFA, a nie tym wpisanym). Makieta ResetHasla ma „Kod wysłaliśmy na +48 600 *** 412”; na PoC neutralna etykieta bez adresu (propozycja; do potwierdzenia przez Dawida, wtedy zmiana tylko tekstu).
- Rejestracja samym telefonem zależy od spike'u ZITADEL (BE-012, adres zastępczy); apka niczego tu nie zakłada.
- Nie przechowuj hasła między krokami; przy `account_not_confirmed` osoba po potwierdzeniu loguje się jeszcze raz.
