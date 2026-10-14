---
id: BE-014
title: "lib/i18n: szablony wiadomości SMS i e-mail"
area: backend
stage: 1
size: S
status: todo
depends_on: []
decisions: []
owner:
branch:
trello:
---
# BE-014 · lib/i18n: szablony wiadomości SMS i e-mail

## Cel
Jedno miejsce z treściami wszystkich wiadomości wysyłanych z backendu (kody z `auth`, powiadomienia z `notifications`) po polsku, ukraińsku i angielsku, z kontrolą długości SMS-a. Treść dostaje osoba w swoim języku (`users.locale` albo `invitations.locale`).

## Kontekst
- Stan kodu: treści kodów są tylko po polsku w `backend/src/services/auth/codes/messages.ts` (`mfaMessage`, `verifyMessage`, `existingAccountMessage`; `locale` już przechodzi przez wywołania). `LocaleSchema` (`pl`, `uk`, `en`) w `backend/src/contracts/common.ts`.
- Dokumenty: `docs/development-szczegoly.md` 3.1.12 `packages/i18n` (PL, UA, EN), 3.2 `fake-sms` (liczenie segmentów UCS-2 z ostrzeżeniem), 4.2 „Kody na prawdziwych numerach” (treść PL i UA, bez linków w SMS z kodem, ważność zgodna z konfiguracją: MFA 5 min, weryfikacja i reset 15 min); `docs/mikroserwisy.md` 5.2 „Kody” i 5.8; `mockups/STAN.md` pkt 7 (zaproszenie: „i załóż konto na ten numer”, e-mail konta technicznego: „Załóż konto tym adresem e-mail”).
- Makiety: `mockups/project/WiadomosciSms.dc.html` (zaproszenie klienta: „Stajnia Pod Lipami zaprasza Cię do EQUENOR jako klienta (koń: Luna). Pobierz aplikację: [WWW]/app …”, eskalacja: „EQUENOR: Stajnia Pod Lipami · Bella · Hala nowa · boks 4 · „Nie na padok” niepotwierdzona. Sprawdź tablet albo potwierdź w aplikacji.”, kod: „Kod EQUENOR: 482913”, e-mail zaproszenia konta technicznego), `PanelZaprosOsobe.dc.html` (podgląd SMS dla obsługi).
- Decyzje: brak (słownik zdarzeń `health_due`, `payment_overdue` według DEC-20 dochodzi w BE-036).

## Zakres
- [ ] `backend/src/lib/i18n/`: typ `Locale`, `t(locale, key, params)` z fallbackiem do `pl` i logiem ostrzeżenia, szablony jako funkcje TS (parametry typowane), wynik `{ subject?, body }` dla kanału `sms` albo `email`.
- [ ] Szablony kodów: `code.verify` (8 cyfr, 15 min), `code.mfa` (6 cyfr, 5 min), `code.reset` (8 cyfr, 15 min), `code.contact_change` (8 cyfr, 15 min), `account.exists` („Masz już konto”); SMS z kodem bez linków.
- [ ] Szablony powiadomień: zaproszenie (klient z koniem, obsługa, instruktor, konto techniczne wyświetlacza i tabletu; SMS i e-mail), `flag_unacknowledged` (eskalacja), `flag_created_by_client`, `invitation_accepted`, `invitation_expired`, `health_due`, `invoice_issued`, `payment_failed`, `payment_overdue`, `business_admin_changed`. Hala przy numerze boksu tylko przy kilku halach (parametr).
- [ ] `smsSegments(text)`: GSM-7 albo UCS-2 (polskie znaki wymuszają UCS-2: 70 znaków, w wieloczęściowym 67), wynik `{ encoding, segments }`; test: każdy szablon SMS z typowymi parametrami mieści się w ustalonym limicie (propozycja: kody 1 segment, powiadomienia ≤ 2), inaczej ostrzeżenie w teście.
- [ ] Test kompletności: każdy klucz ma `pl`, `uk`, `en`, te same parametry w każdym języku; brak pustych tekstów.
- [ ] Przenieść treści z `services/auth/codes/messages.ts` do `lib/i18n` (funkcje budujące `CodeMessage` zostają w `auth`, treść z `lib/i18n`, z językiem konta).

## Poza zakresem
- Wysyłka przez kolejki (BE-015), renderowanie i historia powiadomień (BE-036), tłumaczenia UI aplikacji (pakiety frontend, mobile, tablet).
- Format SMS Retriever i kodów powiązanych z domeną (iOS) dla apki: do ustalenia w MOB-003; zostaw miejsce na sufiks (parametr opcjonalny).

## Kryteria akceptacji
- [ ] `t('uk', 'code.mfa', { code: '482913' })` daje treść po ukraińsku z kodem i ważnością 5 min; nieznany język daje polski z ostrzeżeniem.
- [ ] Polski kod MFA ma 1 segment UCS-2; test pokazuje segmenty każdego szablonu SMS.
- [ ] Logowanie i rejestracja w `auth` wysyłają te same treści co dotąd (testy `app.test.ts` zielone), a z kontem `locale = uk` po ukraińsku.

## Testy
- `backend/src/lib/i18n/i18n.test.ts` (kompletność, segmenty, migawki treści PL), `auth`: test kodu w języku konta. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Tłumaczenia UA i EN mogą być robocze; oznacz plik komentarzem „do przeglądu przez native speakera” i nie blokuj na tym zadania.
- Kod nigdy nie trafia do logów: funkcje nie logują parametrów.
- Teksty bez objaśnień technicznych (decyzje z kanwy): krótko, jak na makiecie WiadomosciSms.
