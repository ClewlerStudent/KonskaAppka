---
id: BE-017
title: "Serwis email"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-008]
decisions: [DEC-11, DEC-01]
owner:
branch:
trello:
---
# BE-017 · Serwis email

## Cel
Niezależny serwis `email` wysyła e-maile z kolejek: najpierw kody od `auth` (konta techniczne tabletów i TV logują się kodem e-mailem przy każdym logowaniu), potem powiadomienia od `notifications`, i raportuje wynik zdarzeniem `email.result`. Bez tabel, roli bazy i API (W5).

## Kontekst
- Stan kodu: jak w BE-016 (jeden obraz, `start:<serwis>`, `kit/env.ts`, `kit/logger.ts`); kolejki `email.codes`, `email.notifications` i zdarzenie `email.result` z `lib/messaging` (BE-008). SH-002 dodaje Mailpit do compose (SMTP i podgląd skrzynki). Wspólny wzorzec pętli z BE-016: jeśli BE-016 już jest, wydziel go do `backend/src/kit/queue-worker.ts` i użyj w obu.
- Dokumenty: `docs/mikroserwisy.md` 5.8 (jak `sms`: kody przed powiadomieniami, błąd stały bez ponowień, ostatnia próba → `failed`, kody bez wyniku i bez treści w logach), 9.3 i 9.4 (tablet i TV: kod na skrzynkę konta technicznego, np. boksy@stajnielipowe.pl); `docs/development-szczegoly.md` 3.3 „sms i email”, 2.6 (SES), 3.2 (lokalna skrzynka, np. Mailpit).
- Decyzje: DEC-11 wariant B (SMTP przez adapter; lokalnie Mailpit; prawdziwy dostawca i SPF/DKIM/DMARC w BE-059), DEC-01.
- Dane demo: Marta (marta@stajnielipowe.pl, kod e-mailem), „Tablety Pod Lipami” (boksy@stajnielipowe.pl), „Telewizor korytarz” (tv.korytarz@stajnielipowe.pl).

## Zakres
- [ ] `backend/src/services/email/main.ts`, `env.ts`, `app.ts`; skrypty `dev:email`, `start:email`. Env: `APP_ENV`, `MESSAGING*`, `EMAIL_SENDER=console|smtp`, `SMTP_URL` (lokalnie Mailpit z SH-002), `EMAIL_FROM` (np. `EQUENOR <no-reply@…>`); `console` zabroniony w prod.
- [ ] Adapter `EmailSender` (`send({ to, subject, body }) → { providerMessageId } | { error: 'permanent' | 'transient' }`): `console`, `smtp` (np. `nodemailer`, treść tekstowa; HTML później).
- [ ] Pętla jak w `sms`: najpierw `email.codes`, potem `email.notifications`; dla powiadomień `email.result` (`notificationId`, `status`, `providerMessageId`); klasyfikacja błędów SMTP (5xx stały, 4xx i sieć przejściowe).
- [ ] Walidacja adresu (format, długość); adres zastępczy `*@phone.invalid` (konta rejestrowane telefonem, BE-012) to błąd stały bez wysyłki.
- [ ] Bez bazy (ESLint jak w `sms`), sondy na porcie probe, łagodne zatrzymanie.
- [ ] Logi: id wiadomości, wynik, zamaskowany adres (`d•••@domena`); nigdy temat ani treść wiadomości z kodem.

## Poza zakresem
- Prawdziwy dostawca, domena nadawcy, SPF/DKIM/DMARC, test doręczalności (BE-059); szablony HTML; router (BE-036).

## Kryteria akceptacji
- [ ] Wiadomość z `email.codes` dla Marty pojawia się w Mailpit z tematem z `lib/i18n`; treści nie ma w logach `email`.
- [ ] Powiadomienie wysłane dwa razy z tym samym `deduplicationId` daje jedną wysyłkę i jedno `email.result`.
- [ ] Odrzucenie 550 z serwera SMTP daje `email.result` `failed` bez ponowień; 421 daje ponowienie.
- [ ] Adres `…@phone.invalid` nie jest wysyłany.

## Testy
- `backend/src/services/email/email.test.ts` (adapter wiadomości w pamięci, `EmailSender` testowy), opcjonalnie test z Mailpit przy ustawionym `SMTP_TEST_URL`. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README (uruchomienie, Mailpit); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Docs mówią „SES”: według DEC-11 to adapter wymienny, kod bez SDK chmury.
- Kody dla kont technicznych to krytyczna ścieżka logowania tabletów: kolejkę kodów czytaj zawsze przed powiadomieniami.
- Serwis nie importuje innych serwisów; wspólny kod tylko w `kit` i `lib`.
