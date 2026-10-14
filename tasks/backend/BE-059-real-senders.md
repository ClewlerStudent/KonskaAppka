---
id: BE-059
title: Prawdziwe adaptery SMS i e-mail
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-016, BE-017]
decisions: [DEC-11]
needs: [owner]
owner:
branch:
trello:
---
# BE-059 · Prawdziwe adaptery SMS i e-mail

## Cel
Kody logowania, zaproszenia i powiadomienia docierają na prawdziwe telefony i skrzynki: serwisy `sms` i `email` dostają adaptery wybranych dostawców, z nadawcą EQUENOR, rozróżnieniem błędów stałych i przejściowych oraz identyfikatorem wiadomości u dostawcy. Bez tego nie ma pilotażu, bo każde logowanie wymaga kodu.

## Kontekst
- **Stan kodu:** serwisy `sms` i `email` (BE-016, BE-017: `backend/src/services/sms/`, `backend/src/services/email/`, interfejsy `SmsSender` i `EmailSender`, adaptery `console`, `fake-sms`, Mailpit/SMTP, publikacja `sms.result` i `email.result`, kody bez logowania treści). Kit blokuje adaptery fałszywe i `console` w `APP_ENV=prod` (`backend/src/kit/env.ts`).
- **Dokumenty:** docs/mikroserwisy.md 5.8 (błąd stały bez ponowień, ostatnia próba → `failed`, DLQ tylko dla nieoznaczalnych), 5.2 „Kody”; docs/development-szczegoly.md 2.5 (SMS do Polski: nadawca, blokada krajów, limit wydatków), 2.6 (e-mail, SPF/DKIM/DMARC), 4.1 „Prawdziwe SMS w przebiegu nocnym” i „E-mail” (doręczalność do WP, Onet, Interia, o2, Gmail), 4.2 „Kody na prawdziwych numerach i skrzynkach”, 5 pkt 24.
- **Makiety:** WiadomosciSms.dc.html (treści SMS i e-maili; kod „Kod EQUENOR: 482913”).
- **Decyzje:** DEC-11 B (polski dostawca SMS, np. SMSAPI, i SMTP na PoC; lokalnie `fake-sms` i Mailpit; Sender ID EQUENOR; numery spoza PL zablokowane).
- **Dane demo:** numery i skrzynki testowe z lokalnego `.env` (poza repo).

## Zakres
- [ ] Adapter SMS wybranego dostawcy w `backend/src/services/sms/senders/` (HTTP API dostawcy, token z pliku `SMS_API_TOKEN_FILE`): nadawca `EQUENOR`, tylko numery `+48` (inne: błąd stały bez wysyłki), kodowanie i liczba segmentów (ostrzeżenie w logu przy szablonie > 1 segmentu dla kodów), klasyfikacja odpowiedzi (stały: zły numer, zablokowany kraj, brak środków jako alarm; przejściowy: limity, 5xx, czas), `provider_message_id` w `sms.result`; format kodu zgodny z SMS Retriever (Android) i `one-time-code` (iOS).
- [ ] Adapter e-mail SMTP w `backend/src/services/email/senders/` (np. `nodemailer` w dokładnej wersji): TLS, uwierzytelnienie z plików, `From: EQUENOR <no-reply@…>` z konfiguracji, nagłówki `Message-ID`, klasyfikacja błędów SMTP (5xx stały, 4xx przejściowy), `provider_message_id` z `Message-ID`.
- [ ] Limit wydatków i liczby SMS na godzinę w konfiguracji serwisu `sms` (po przekroczeniu: alarm i błąd przejściowy, kody nadal pierwsze w kolejności).
- [ ] Lista rekordów DNS do ustawienia przez Dawida (SPF, DKIM, DMARC dla domeny nadawcy) w README serwisu `email`; test, że nagłówki wysłanej wiadomości przechodzą weryfikację (na skrzynce testowej).
- [ ] Instrukcja ręcznego i nocnego testu: kody MFA, potwierdzenia konta i resetu oraz eskalacje na kartach SIM z docs/development-szczegoly.md 1.4 (czas doręczenia, nazwa nadawcy, folder spam) i formularz raportu.

## Poza zakresem
- konta u dostawców, wyjście z sandboxów, domena i DNS (Dawid i właściciel; karty „Konta i usługi”); modem SIM i stanowisko testowe (sprzęt).

## Kryteria akceptacji
- [ ] W `APP_ENV=prod` serwisy nie startują z adapterem `console` albo fałszywym; z prawdziwym startują po walidacji env.
- [ ] Numer spoza Polski daje `sms.result` `failed` bez wywołania dostawcy; błąd przejściowy daje ponowienie z brokera, a ostatnia próba `failed`.
- [ ] Kod nie pojawia się w logach serwisów (test hasła-kanarka z BE-015) ani w `sms.result`.
- [ ] [ręcznie] Kod MFA dochodzi na testowy numer i skrzynkę (konta u dostawców zakłada Dawid); czas doręczenia zapisany w raporcie testu.

## Testy
- Jednostkowe: klasyfikacja odpowiedzi dostawcy (nagrane odpowiedzi HTTP i SMTP), liczenie segmentów, blokada krajów.
- Integracyjne: adapter SMTP na Mailpit (Testcontainers), adapter SMS na atrapie HTTP dostawcy.
- Ręczne/nocne: według instrukcji z zakresu.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; README `sms` i `email`: zmienne env, sekrety, rekordy DNS.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Bez wiązania z chmurą (W7, DEC-11): adaptery za interfejsem, dostawcę wymienia konfiguracja.
- Sekrety tylko z plików albo env; nigdy w repo ani w logach.
- `sms` i `email` nadal bez bazy i bez API (W5): obraz nie może mieć zmiennych połączenia z bazą.
