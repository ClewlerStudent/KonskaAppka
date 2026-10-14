---
id: BE-015
title: "auth: kody przez kolejki sms i email"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-008, BE-014]
decisions: [DEC-01]
owner:
branch:
trello: https://trello.com/c/zQEAMPD6
---
# BE-015 · auth: kody przez kolejki sms i email

## Cel
Kody (potwierdzenie konta, MFA, reset hasła, zmiana kontaktu, „Masz już konto”) wychodzą z `auth` jako gotowe wiadomości do kolejek kodów serwisów `sms` i `email`, w języku konta (W7). Dzięki temu `auth` może wystartować w prod (z ZITADEL z BE-012), bo znika ostatni adapter tylko dla dev.

## Kontekst
- Stan kodu: `CodeSender` i `CodeMessage` w `backend/src/services/auth/codes/code-sender.ts` (pole `code` tylko dla skrzynki dev), skrzynka dev `codes/dev-inbox.ts` (JSONL, `npm run dev:inbox`), wybór w `services/auth/main.ts` przez `CODE_SENDER=dev-inbox`; `env.ts` blokuje `dev-inbox` w prod. Treści: `lib/i18n` (BE-014). Kolejki `sms.codes` i `email.codes` (retencja ≤ 5 min, bez DLQ): `lib/messaging` (BE-008). Logger z redakcją pól `password`, `code`… (`backend/src/kit/logger.ts`).
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Kody” (kod nie trafia do bazy, logów ani odpowiedzi; treść w języku konta, przed pierwszym logowaniem z profilu ZITADEL; `MessageGroupId` i deduplikacja z UUID od `auth`; alarm wieku wiadomości), 5.8 (sms/email czytają kody przed powiadomieniami, bez `*.result` dla kodów); `docs/development-szczegoly.md` 4.2 (hasło-kanarek: hasło i kod nie trafiają do logów `auth`, `email`, `sms` ani do bazy).
- Decyzje: DEC-01 (broker za `lib/messaging`; w dev może zostać adapter w pamięci albo broker z compose).
- Dane demo: Damian (SMS), Marta (e-mail), konto z `locale = uk` z fabryki.

## Zakres
- [ ] `codes/queue-sender.ts`: `CodeSender` wrzucający `{ id, to, subject?, body }` do `sms.codes` albo `email.codes` (`deduplicationId` = `id` wiadomości, UUIDv7); bez pola `code` i bez `purpose` w treści wiadomości dla kolejki (purpose tylko jako atrybut do metryk).
- [ ] `CODE_SENDER=queue|dev-inbox` w `services/auth/env.ts`; `queue` wymaga konfiguracji `MESSAGING*`; `dev-inbox` dalej zabroniony w prod. Przy `APP_ENV=prod` `auth` startuje z `IDP=zitadel` i `CODE_SENDER=queue` (po BE-012).
- [ ] Wszystkie miejsca wysyłki kodów (`routes/sign-up.ts`, `routes/login.ts`, później reset i zmiana kontaktu) używają treści z `lib/i18n` w języku konta: `users.locale` po pierwszym logowaniu, wcześniej język z profilu dostawcy tożsamości; domyślnie `pl`.
- [ ] Metryki (licznik w logu na start, Prometheus w BE-058): wysłane kody wg kanału i celu, błędy wrzucenia do kolejki; błąd kolejki przy logowaniu daje 503 `not_ready` (kod nie zginął po cichu).
- [ ] Dev: skrzynka `dev-inbox` zostaje dla testów i E2E; w compose z brokerem kody czyta `fake-sms` i Mailpit (SH-002), a `npm run dev:inbox` opisuje, gdzie ich szukać.
- [ ] Test hasła-kanarka: logowanie i rejestracja z unikalnym hasłem i przechwycenie wszystkich linii logu `auth` oraz treści wiadomości w kolejce: hasła nie ma nigdzie, kodu nie ma w logach ani w odpowiedziach HTTP.

## Poza zakresem
- Serwisy `sms` i `email`, które czytają kolejki i wysyłają (BE-016, BE-017).
- Kanały konfiguracji brokera na klastrze, szyfrowanie kolejek (Dawid).

## Kryteria akceptacji
- [ ] Przy `CODE_SENDER=queue` logowanie Damiana wrzuca jedną wiadomość do `sms.codes` z numerem i treścią z kodem; Marty do `email.codes` z tematem.
- [ ] Odpowiedzi `POST /auth/v1/login` i `/sign-up` nie zawierają kodu; logi nie zawierają kodu ani hasła.
- [ ] Konto z `locale = uk` dostaje treść kodu po ukraińsku.
- [ ] `APP_ENV=prod` z `CODE_SENDER=dev-inbox` nie startuje (test `env.test.ts`).

## Testy
- `backend/src/services/auth/codes/queue-sender.test.ts` (adapter wiadomości w pamięci), rozszerzenie `app.test.ts` o wariant `queue` i test kanarka, `env.test.ts`. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; `backend/README.md` (gdzie lokalnie czytać kody przy `queue`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `notifications` nie widzi kodów (szybka ścieżka, bez historii): `auth` pisze prosto do kolejek kodów.
- Kolejka kodów nie ma DLQ: wiadomość, której nie dało się wysłać w 5 min, znika; nowy kod to „Wyślij kod ponownie” w aplikacji.
- Nie loguj obiektu wiadomości; loguj tylko `id`, kanał i cel.
